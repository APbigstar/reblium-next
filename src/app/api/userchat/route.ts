// File: app/api/avatars/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { Avatar } from "@/types/type";
import { writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";

// Helper function to save uploaded file
async function saveFile(file: File, userId: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename using userId and timestamp
  const filename = `logo-${userId}-${Date.now()}${path.extname(file.name)}`;
  const filepath = path.join(process.cwd(), 'public/uploads', filename);
  
  await writeFile(filepath, buffer);
  return filename;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const avatarId = searchParams.get("avatarId");

    const userId = await verifyToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!avatarId) {
      return NextResponse.json(
        { error: "Avatar ID is missing" },
        { status: 400 }
      );
    }

    const chatQuery =
      "SELECT * FROM User_Chat_Setting WHERE avatar_id = ? AND user_id = ?";
    const chat = await query<Avatar[]>(chatQuery, [avatarId, userId]);

    if (chat.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ data: chat[0], success: true });
  } catch (error) {
    console.error("Error fetching avatar:", error);
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

    console.log("formData-------------------------")
    const formData = await req.formData();
    console.log("formData++++++++", formData)
    const avatarId = formData.get('avatarId') as string;
    const prompts = formData.get('prompts') as string;
    const welcomeMessage = formData.get('welcomeMessage') as string;
    const logoFile = formData.get('logo') as File | null;

    let logoFilename = null;
    if (logoFile) {
      logoFilename = await saveFile(logoFile, userId.toString()); // Convert userId to string
    }

    // First check if record exists
    const checkExistingQuery =
      "SELECT id, logo FROM User_Chat_Setting WHERE user_id = ? AND avatar_id = ?";
    const existingRecord = await query<{ id: number, logo: string | null }[]>(checkExistingQuery, [
      userId,
      avatarId,
    ]);

    let result;
    
    if (existingRecord && existingRecord.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE User_Chat_Setting 
        SET prompts = ?, 
            welcome_message = ?,
            created_at = ?,
            logo = COALESCE(?, logo)
        WHERE user_id = ? AND avatar_id = ?
      `;
      result = await query(updateQuery, [
        prompts,
        welcomeMessage,
        new Date(),
        logoFilename,
        userId,
        avatarId,
      ]);

      return NextResponse.json({
        success: true,
        message: "Chat Data updated successfully",
        id: existingRecord[0].id,
        logo: logoFilename || existingRecord[0].logo
      });
    } else {
      const insertQuery = `
        INSERT INTO User_Chat_Setting 
        (user_id, prompts, avatar_id, welcome_message, created_at, logo) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      result = await query<{ insertId?: number }>(insertQuery, [
        userId,
        prompts,
        avatarId,
        welcomeMessage,
        new Date(),
        logoFilename
      ]);

      return NextResponse.json({
        success: true,
        message: "Chat Data created successfully",
        insertedId: result.insertId,
        logo: logoFilename
      });
    }
  } catch (error) {
    console.error("Error handling chat settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
