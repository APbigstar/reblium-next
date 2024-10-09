import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { UserPlan } from '@/types/type';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getCurrentUserPlan = `
      SELECT plan_id, id
      FROM User_Plans 
      WHERE user_id = ? 
        AND is_active = 1 
        AND (status = 'open' OR status = 'active') 
        AND expires_at IS NULL
    `;
    
    const rows = await query<UserPlan[]>(getCurrentUserPlan, [userId]);

    if (rows.length === 0) {
      return NextResponse.json({ exists: false });
    } else {
      const planId = rows[0].plan_id;
      const userPlanId = rows[0].id;
      return NextResponse.json({ exists: true, plan: planId, userPlanId: userPlanId });
    }
  } catch (error) {
    console.error("Error executing database query:", error);
    return NextResponse.json({ error: "Error processing the request" }, { status: 500 });
  }
}