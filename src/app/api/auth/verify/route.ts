import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';

interface User {
  id: number;
  email: string;
  is_verified: boolean;
  verification_token: string | null;
  verification_code: string | null;
}

export async function POST(req: NextRequest) {
  const { token, code } = await req.json() as { token?: string; code?: string };

  try {
    let queryStr: string;
    let params: (string | undefined)[];

    if (token) {
      queryStr = 'SELECT * FROM Users WHERE verification_token = ?';
      params = [token];
    } else if (code) {
      queryStr = 'SELECT * FROM Users WHERE verification_code = ?';
      params = [code];
    } else {
      return NextResponse.json({ error: 'Verification token or code is required' }, { status: 400 });
    }

    const users = await query<User[]>(queryStr, params);

    if (users.length === 0) {
      return NextResponse.json(
        { error: code ? 'Invalid or expired verification code' : 'Invalid verification token' },
        { status: 400 }
      );
    }

    const user = users[0];

    await query(
      'UPDATE Users SET is_verified = true, verification_token = NULL, verification_code = NULL WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({ message: 'Email verified successfully. You can now log in.', success: true });
  } catch (error) {
    console.error('Error during verification:', error);
    return NextResponse.json({ error: 'Error processing the request' }, { status: 500 });
  }
}