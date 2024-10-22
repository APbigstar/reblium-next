import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { UserPlan, UserCredit } from "@/types/type";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkUserExistingCredits =
    "SELECT amount FROM User_Credits WHERE user_id = ?";
    const userCredits = await query<UserCredit[]>(checkUserExistingCredits, [
      userId,
    ]);

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
      return NextResponse.json({ success: false });
    } else {
      return NextResponse.json({
        success: true,
        amount: userCredits[0].amount,
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

export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, premium } = await req.json();

    if (amount === undefined) {
      return NextResponse.json(
        { error: "Missing amount in request body" },
        { status: 400 }
      );
    }

    const getUserCredit =
      "SELECT amount, premium_status FROM User_Credits WHERE user_id = ? FOR UPDATE";
    const userCredits = await query<UserCredit[]>(getUserCredit, [userId]);

    let newAmount: number;
    let premiumValue: string;

    if (userCredits.length === 0) {
      if (premium === "premium" || premium === "pro") {
        const insertUserCredit =
          "INSERT INTO User_Credits (user_id, amount, premium_status) VALUES (?, ?, ?)";
        await query(insertUserCredit, [userId, amount, premium]);
        return NextResponse.json({ success: true, updatedAmount: amount });
      }
    } else {
      const currentAmount = userCredits[0].amount;

      if (premium === "") {
        newAmount = currentAmount + amount;
        premiumValue = "free";
      } else if (
        userCredits[0].premium_status === "free" &&
        (premium === "premium" || premium === "pro")
      ) {
        newAmount = currentAmount + amount;
        premiumValue = premium;
      } else {
        newAmount = currentAmount;
        premiumValue = premium;
      }

      if (newAmount < 0) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 400 }
        );
      }

      const updateUserCredit =
        "UPDATE User_Credits SET amount = ?, premium_status = ? WHERE user_id = ?";
      await query(updateUserCredit, [newAmount, premiumValue, userId]);

      return NextResponse.json({ success: true, updatedAmount: newAmount });
    }

    return NextResponse.json({ success: false, error: "No action taken" });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}
