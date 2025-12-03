import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isAdmin: false });
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('clerk_id', userId)
    .single();

  return NextResponse.json({ isAdmin: user?.is_admin || false });
}
