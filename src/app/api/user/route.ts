import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { User } from "@/types/type";

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("userId", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const users = await query<User[]>(
      `SELECT id, email, name, is_verified, profile_picture, google_id, facebook_id, apple_id, discord_id, bio 
       FROM Users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Return the user information
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user information:", error);
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

    const { name, bio, profile_image } = await req.json();

    // Create an object to store only the defined fields
    const updatedFields: { [key: string]: string | null } = {};
    if (name !== undefined) updatedFields.name = name;
    if (bio !== undefined) updatedFields.bio = bio;
    if (profile_image !== undefined)
      updatedFields.profile_picture = profile_image;

    // If no fields to update, return early
    if (Object.keys(updatedFields).length === 0) {
      return NextResponse.json({ message: "No fields to update" });
    }

    // Construct the SQL query dynamically based on the fields to update
    const fields = Object.keys(updatedFields);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => updatedFields[field] ?? null);

    const sql = `UPDATE Users SET ${setClause} WHERE id = ?`;
    values.push(userId.toString());

    const result = await query(sql, values);

    return NextResponse.json({
      message: "User updated successfully",
      updatedUser: result,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}
