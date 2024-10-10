// File: app/api/avatars/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import { verifyToken } from '@/utils/verifyToken';
import { Avatar } from '@/types/type';

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
    try {
      const userId = await verifyToken(req);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const avatars = await query<Avatar[]>(
        'SELECT * FROM Avatars WHERE user_id = ? ORDER BY submission_time DESC',
        [userId]
      );
  
      // Process the avatars to parse JSON fields
      const processedAvatars = avatars.map(avatar => ({
        ...avatar,
        avatar: typeof avatar.avatar === 'string' ? JSON.parse(avatar.avatar) : avatar.avatar,
        slider_value: typeof avatar.slider_value === 'string' ? JSON.parse(avatar.slider_value) : avatar.slider_value,
        submission_time: new Date(avatar.submission_time).toISOString()
      }));
  
      return NextResponse.json(processedAvatars);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      return NextResponse.json({ error: 'Error processing the request' }, { status: 500 });
    }
  }