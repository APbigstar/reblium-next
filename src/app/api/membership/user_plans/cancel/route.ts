import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { updateSubscriptionEndPeriod } from '@/lib/stripeLib';
import { UserCredit, UserPlan } from '@/types/type';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_plan_id } = await req.json();

    if (!user_plan_id) {
      return NextResponse.json({ error: 'Missing user_plan_id' }, { status: 400 });
    }

    const getUserPlan = "SELECT * FROM User_Plans WHERE id = ? AND user_id = ?";
    const userPlans = await query<UserPlan[]>(getUserPlan, [user_plan_id, userId]);

    if (userPlans.length === 0) {
      return NextResponse.json({ error: 'User plan not found' }, { status: 404 });
    }

    const userPlan = userPlans[0];

    if (userPlan.is_active) {
      const subscription: any = await updateSubscriptionEndPeriod(userPlan.provider_id, true);
      const expiresAt = format(new Date(subscription.cancel_at * 1000), 'yyyy-MM-dd HH:mm:ss');

      const updateUserPlan = `
        UPDATE User_Plans 
        SET expires_at = ?, is_active = ?
        WHERE id = ?
      `;
      await query(updateUserPlan, [expiresAt, 0, user_plan_id]);

      const updateUserCredit = `
        UPDATE User_Credits 
        SET premium_status = ?
        WHERE user_id = ?
      `;
      await query(updateUserCredit, ['free', userId]);

      const getUpdatedPlan = "SELECT * FROM User_Plans WHERE id = ?";
      const updatedPlans = await query<UserPlan[]>(getUpdatedPlan, [user_plan_id]);

      if (updatedPlans.length === 0) {
        return NextResponse.json({ error: 'Failed to retrieve updated plan' }, { status: 500 });
      }

      return NextResponse.json({ success: true, result: updatedPlans[0] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}