import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';

interface User {
  id: number;
  email: string;
  name: string;
  is_verified: boolean;
  profile_picture: string;
  google_id: string | null;
  facebook_id: string | null;
  apple_id: string | null;
  discord_id: string | null;
  // We're not including password or sensitive fields like verification_token
}

export async function GET(req: NextRequest) {
  try {
    // Get the user_id from the query parameters
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch user information from the database
    const users = await query<User[]>(
      `SELECT id, email, name, is_verified, profile_picture, google_id, facebook_id, apple_id, discord_id 
       FROM Users WHERE id = ?`,
      [user_id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Return the user information
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.is_verified,
      profilePicture: user.profile_picture,
      googleId: user.google_id,
      facebookId: user.facebook_id,
      appleId: user.apple_id,
      discordId: user.discord_id,
    });

  } catch (error) {
    console.error("Error fetching user information:", error);
    return NextResponse.json({ error: "Error processing the request" }, { status: 500 });
  }
}