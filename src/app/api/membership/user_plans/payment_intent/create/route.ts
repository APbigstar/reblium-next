import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { subHours, compareAsc } from "date-fns";
import { User, Plan, UserPlan, StripeCustomer } from "@/types/type";
import {
  createCustomer,
  createSubscription,
  cancelSubscription,
  retrieveSubscription,
} from "@/lib/stripeLib";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(userId)

    const getEmail = "SELECT * FROM Users WHERE id = ?";
    const user = await query<User[]>(getEmail, [userId]);

    const { plan_id } = await req.json();
    if (!plan_id) {
      return NextResponse.json({ error: "Missing plan_id" }, { status: 400 });
    }

    const getPlan = "SELECT * FROM Plans WHERE id = ?";
    const plans = await query<Plan[]>(getPlan, [plan_id]);
    if (plans.length === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const plan = plans[0];

    const getUserPlans = `
      SELECT * FROM User_Plans 
      WHERE user_id = ? AND plan_id = ? AND complete = false 
      ORDER BY id DESC
    `;
    const userPlans = await query<UserPlan[]>(getUserPlans, [userId, plan_id]);

    const getStripeCustomer = "SELECT * FROM Stripe_Customer WHERE user_id = ?";
    const stripeCustomers = await query<StripeCustomer[]>(getStripeCustomer, [
      userId,
    ]);

    let customer_id: string = "";
    if (stripeCustomers.length === 0) {
      const customer = await createCustomer(user[0]?.email); // Assuming createCustomer now takes userId instead of email
      customer_id = customer.id;
      await query(
        "INSERT INTO Stripe_Customer (customer_id, user_id) VALUES (?, ?)",
        [customer_id, userId]
      );
    } else {
      customer_id = stripeCustomers[0].customer_id;
    }

    let isTrial: boolean = false;
    let clientSecret: string = "";
    const currentTime = new Date();

    if (userPlans.length === 0) {
      const subscription: any = await createSubscription(
        customer_id,
        plan.product_id.toString(),
        user[0]?.email
      );
      const { subscription_id, status, is_trial, client_secret } = subscription;
      await query(
        "INSERT INTO User_Plans (plan_id, user_id, provider_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
        [plan_id, userId, subscription_id, status, currentTime]
      );
      isTrial = is_trial;
      clientSecret = client_secret;
    } else {
      const creationTime = new Date(userPlans[0].created_at);
      const currentTimeMinusTwoHours = subHours(new Date(), 22);

      if (compareAsc(creationTime, currentTimeMinusTwoHours) < 0) {
        await cancelSubscription(userPlans[0].provider_id);
        await query("DELETE FROM User_Plans WHERE id = ?", [userPlans[0].id]);
        const subscription: any = await createSubscription(
          customer_id,
          plan.product_id,
          user[0]?.email
        );
        const { subscription_id, status, is_trial, client_secret } =
          subscription;
        await query(
          "INSERT INTO User_Plans (plan_id, user_id, provider_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
          [plan_id, userId, subscription_id, status, currentTime]
        );
        isTrial = is_trial;
        clientSecret = client_secret;
      } else {
        const subscription: any = await retrieveSubscription(
          userPlans[0].provider_id
        );
        clientSecret = subscription.latest_invoice.payment_intent.client_secret;
      }
    }

    return NextResponse.json({
      success: true,
      data: { client_secret: clientSecret, is_trial: isTrial },
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}
