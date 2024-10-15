import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/utils/db';
import { User } from '@/types/type';

const loginStatusStore = new Map();

export async function POST(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in the environment variables');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  try {
    const { email, password } = await req.json();

    const users = await query<User[]>('SELECT * FROM Users WHERE email = ?', [email]);

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const user = users[0];

    if (!user.is_verified) {
      return NextResponse.json({ error: 'Please verify your email before signing in' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userIP = req.headers.get('x-forwarded-for') || req.ip;
    const normalizedIP = userIP === '::1' ? 'localhost' : userIP; // Normalize localhost IP

    console.log(normalizedIP)
    loginStatusStore.set(normalizedIP, true);    

    return NextResponse.json({ message: 'Sign-in successful', token, userId: user.id, email: user.email });
  } catch (error) {
    console.error('Error during sign-in:', error);
    return NextResponse.json({ error: 'Error processing the request' }, { status: 500 });
  }
}