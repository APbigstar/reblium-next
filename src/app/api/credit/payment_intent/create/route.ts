import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { createCustomer, createPaymentIntent } from '@/lib/stripeLib';
import { StripeCustomer, User } from '@/types/type';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getEmail = "SELECT * FROM Users WHERE id = ?";
    const user = await query<User[]>(getEmail, [userId]);

    const { price } = await req.json();

    if (!price) {
      return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
    }

    const getStripeCustomer = "SELECT customer_id FROM Stripe_Customer WHERE user_id = ?";
    const stripeCustomers = await query<StripeCustomer[]>(getStripeCustomer, [userId]);

    let customer_id: string;
    if (stripeCustomers.length === 0) {
      const customer = await createCustomer(user[0]?.email);
      customer_id = customer.id;
      const insertStripeCustomer = "INSERT INTO Stripe_Customer (customer_id, user_id) VALUES (?, ?)";
      await query(insertStripeCustomer, [customer_id, userId]);
    } else {
      customer_id = stripeCustomers[0].customer_id;
    }

    const payment_intent = await createPaymentIntent(Math.round(price * 100), customer_id, user[0]?.email);

    return NextResponse.json({ 
      success: true, 
      data: { client_secret: payment_intent?.client_secret } 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}