import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('clerk_id', userId)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { adjustment, notes } = body;

    if (typeof adjustment !== 'number' || adjustment < 0.8 || adjustment > 1) {
      return NextResponse.json(
        { error: 'Adjustment must be between 0.80 and 1.00' },
        { status: 400 }
      );
    }

    // Get current official rate
    const { data: currentRate } = await supabase
      .from('exchange_rates')
      .select('official_rate')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const officialRate = currentRate?.official_rate || 1.32;

    // Deactivate old rates
    await supabase
      .from('exchange_rates')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new rate with updated adjustment
    const { data: newRate, error } = await supabase
      .from('exchange_rates')
      .insert({
        official_rate: officialRate,
        manual_adjustment: adjustment,
        notes: notes || `Ajuste manual por admin: ${(adjustment * 100).toFixed(0)}%`,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      officialRate: newRate.official_rate,
      manualAdjustment: newRate.manual_adjustment,
      effectiveRate: newRate.effective_rate,
      updatedAt: newRate.updated_at,
    });
  } catch (error) {
    console.error('Error updating exchange rate adjustment:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rate adjustment' },
      { status: 500 }
    );
  }
}
