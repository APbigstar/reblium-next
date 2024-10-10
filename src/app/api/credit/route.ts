import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { UserPlan, UserCredit } from '@/types/type';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkUserExistingCredits = "SELECT amount FROM User_Credits WHERE user_id = ?";
    const userCredits = await query<UserCredit[]>(checkUserExistingCredits, [userId]);

    const getCurrentUserPlan = `
      SELECT plan_id, id, created_at
      FROM User_Plans 
      WHERE user_id = ? 
        AND is_active = 1 
        AND (status = 'open' OR status = 'active') 
        AND expires_at IS NULL
    `;
    const userPlans = await query<UserPlan[]>(getCurrentUserPlan, [userId]);

    if (userCredits.length === 0) {
      return NextResponse.json({ exists: false });
    } else {
      const creditAmount = userCredits[0].amount;
      if (userPlans.length > 0) {
        return NextResponse.json({
          exists: true,
          amount: creditAmount,
          createdAt: userPlans[0].created_at,
        });
      } else {
        return NextResponse.json({ exists: true, amount: creditAmount });
      }
    }
  } catch (error) {
    console.error("Error executing database query:", error);
    return NextResponse.json({ error: "Error processing the request" }, { status: 500 });
  }
}