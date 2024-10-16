import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { UserPlan } from "@/types/type";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const getCurrentUserPlan = `
      SELECT plan_id, id, created_at
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
      return NextResponse.json({
        exists: true,
        ...rows[0]
      });
    }
  } catch (error) {
    console.error("Error executing database query:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}
