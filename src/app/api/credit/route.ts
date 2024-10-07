import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';

interface UserCredit {
  amount: number;
}

interface UserPlan {
  plan_id: number;
  id: number;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const checkUserExistingCredits = "SELECT amount FROM User_Credits WHERE user_id = ?";
    const userCredits = await query<UserCredit[]>(checkUserExistingCredits, [user_id]);

    const getCurrentUserPlan = `
      SELECT plan_id, id, created_at
      FROM User_Plans 
      WHERE user_id = ? 
        AND is_active = 1 
        AND (status = 'open' OR status = 'active') 
        AND expires_at IS NULL
    `;
    const userPlans = await query<UserPlan[]>(getCurrentUserPlan, [user_id]);

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