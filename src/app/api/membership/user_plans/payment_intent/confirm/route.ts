import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { retrievePaymentIntent } from '@/lib/stripeLib';
import { UserPlan, StripeCustomer } from '@/types/type';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_intent_id } = await req.json();
    if (!payment_intent_id) {
      return NextResponse.json({ error: 'Missing payment_intent_id' }, { status: 400 });
    }

    const payment_intent = await retrievePaymentIntent(payment_intent_id);

    const getUserPlans = `
      SELECT * FROM User_Plans 
      WHERE user_id = ? 
      ORDER BY id DESC
    `;
    const userPlans = await query<UserPlan[]>(getUserPlans, [userId]);

    const getStripeCustomer = "SELECT customer_id FROM Stripe_Customer WHERE user_id = ?";
    const stripeCustomers = await query<StripeCustomer[]>(getStripeCustomer, [userId]);

    if (stripeCustomers.length === 0) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
    }

    const customer_id = stripeCustomers[0].customer_id;

    if (userPlans.length > 0 && payment_intent.customer === customer_id && payment_intent.status === 'succeeded') {
      const updateUserPlan = `
        UPDATE User_Plans 
        SET is_active = true 
        WHERE id = ?
      `;
      await query(updateUserPlan, [userPlans[0].id]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}