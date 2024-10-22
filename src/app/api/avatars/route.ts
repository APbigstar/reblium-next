// File: app/api/avatars/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { Avatar } from "@/types/type";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const avatars = await query<Avatar[]>(
      "SELECT * FROM Avatars WHERE user_id = ? ORDER BY submission_time DESC",
      [userId]
    );

    return NextResponse.json(avatars);
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { avatarName } = await req.json();
    const addAvatarQuery = "INSERT INTO Avatars (name, user_id) VALUES (?, ?)";
    const result = await query<Avatar[]>(addAvatarQuery, [avatarName, userId]);

    console.log(result);

    return NextResponse.json({ success: true, insertedId: result.insertId });
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, image, avatar, rename } = await req.json(); // Added rename parameter

    if (rename) {
      // Handle renaming avatar
      const renameAvatarQuery = "UPDATE Avatars SET name = ? WHERE id = ?";
      await query(renameAvatarQuery, [rename, id]);
      return NextResponse.json({ success: true, message: "Updated Avatar Name Successfully !" });
    }

    // Existing update logic for image and avatar
    const updateUserAvatar =
      "UPDATE Avatars SET image = ?, avatar = ?, submission_time = ? WHERE id = ?";
    await query(updateUserAvatar, [image, avatar, new Date(), id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { error: "Error processing the request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); 
    const id = searchParams.get("id"); 
    
    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // First, delete from User_Chat_Setting where avatar_id and user_id match
    const deleteAvatarChatSettingQuery = 'DELETE FROM User_Chat_Setting WHERE avatar_id = ? AND user_id = ?';
    await query(deleteAvatarChatSettingQuery, [id, userId]);

    // Then, delete from Avatar table by avatarId
    const deleteAvatarQuery = 'DELETE FROM Avatars WHERE id = ?';
    await query(deleteAvatarQuery, [id]);

    // Return success response
    return NextResponse.json({ message: 'Avatar deleted successfully!', success: true });

  } catch (error) {
    console.error('Error executing database query:', error);
    return NextResponse.json(
      { error: 'Error processing the request', details: error.message },
      { status: 500 }
    );
  }
}
