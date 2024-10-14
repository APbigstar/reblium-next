import { NextResponse } from "next/server";
import { query } from '@/utils/db';
import { Plan } from '@/types/type';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const getActivePlans = "SELECT * FROM Plans WHERE is_active = ? && mode = ?";
    const plans = await query<Plan[]>(getActivePlans, [true, 'test']);

    return NextResponse.json({ data: plans, success: true });
  } catch (error) {
    console.error('Error fetching active plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}