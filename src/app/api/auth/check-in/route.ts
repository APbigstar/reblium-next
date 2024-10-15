import { NextRequest, NextResponse } from 'next/server';
const loginStatusStore = new Map();

export async function GET(req: NextRequest) {
  const userIP = req.headers.get('x-forwarded-for') || req.ip;
  const isLoggedIn = loginStatusStore.get(userIP);

  if (isLoggedIn) {
    return NextResponse.json({ message: 'User is logged in', status: 'success' });
  } else {
    return NextResponse.json({ message: 'User is not logged in', status: 'fail' });
  }
}
