import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { retrievePaymentIntent } from '@/lib/stripeLib';
import { StripeCustomer, UserCredit } from '@/types/type';

export const dynamic = 'force-dynamic';

const creditData = { 12: 100, 30: 250, 60: 500, 96: 800 };

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_intent_id, price } = await req.json();

    if (!payment_intent_id || !price) {
      return NextResponse.json({ error: 'Missing payment_intent_id or amount' }, { status: 400 });
    }

    const payment_intent = await retrievePaymentIntent(payment_intent_id);

    const getStripeCustomer = "SELECT customer_id FROM Stripe_Customer WHERE user_id = ?";
    const stripeCustomers = await query<StripeCustomer[]>(getStripeCustomer, [userId]);

    if (stripeCustomers.length === 0) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
    }

    const customer_id = stripeCustomers[0].customer_id;

    if (payment_intent.customer === customer_id && payment_intent.status === 'succeeded') {
      const getUserCredit = "SELECT * FROM User_Credits WHERE user_id = ?";
      const userCredits = await query<UserCredit[]>(getUserCredit, [userId]);

      if (userCredits.length > 0) {
        const totalAmount = userCredits[0].amount + creditData[price];
        const updateUserCredit = "UPDATE User_Credits SET amount = ? WHERE user_id = ?";
        await query(updateUserCredit, [totalAmount, userId]);
      } else {
        const insertUserCredit = "INSERT INTO User_Credits (user_id, amount) VALUES (?, ?)";
        await query(insertUserCredit, [userId, creditData[price]]);
      }

      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}