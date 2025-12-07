import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ isPremium: false, isAdmin: false });
    }

    const { data: user } = await supabase
      .from('users')
      .select('is_premium, is_admin')
      .eq('clerk_id', userId)
      .single();

    return NextResponse.json({
      isPremium: user?.is_premium || false,
      isAdmin: user?.is_admin || false,
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    return NextResponse.json({ isPremium: false, isAdmin: false });
  }
}
