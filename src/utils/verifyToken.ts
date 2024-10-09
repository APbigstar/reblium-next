import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

export async function verifyToken(req: NextRequest): Promise<number | null> {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}