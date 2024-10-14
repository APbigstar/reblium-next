import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { modifySubscription, updateSubscriptionEndPeriod } from '@/lib/stripeLib';
import { Plan, UserPlan } from '@/types/type';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_plan_id, plan_id } = await req.json();

    if (!user_plan_id || !plan_id) {
      return NextResponse.json({ error: 'Missing plan_id or user_plan_id' }, { status: 400 });
    }

    const getPlan = "SELECT * FROM Plans WHERE id = ?";
    const plans = await query<Plan[]>(getPlan, [plan_id]);
    if (plans.length === 0) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    const plan = plans[0];

    const getUserPlan = "SELECT * FROM User_Plans WHERE id = ?";
    const userPlans = await query<UserPlan[]>(getUserPlan, [user_plan_id]);
    if (userPlans.length === 0) {
      return NextResponse.json({ error: 'User plan not found' }, { status: 404 });
    }
    const userPlan = userPlans[0];

    if (userPlan.plan_id !== plan.id) {
      await modifySubscription(userPlan.provider_id, plan.product_id);
      const updateUserPlan = `
        UPDATE User_Plans 
        SET plan_id = ?, expires_at = NULL 
        WHERE id = ?
      `;
      await query(updateUserPlan, [plan.id, user_plan_id]);
    } else {
      await updateSubscriptionEndPeriod(userPlan.provider_id, false);
      const updateExpires = `
        UPDATE User_Plans 
        SET expires_at = NULL 
        WHERE id = ?
      `;
      await query(updateExpires, [user_plan_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}