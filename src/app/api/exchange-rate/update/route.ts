import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EXCHANGE_API_URL = 'https://v6.exchangerate-api.com/v6';

export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET for automated updates
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch official rate from API
    const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'demo';
    const response = await fetch(`${EXCHANGE_API_URL}/${apiKey}/pair/BRL/CNY`);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate from API');
    }

    const apiData = await response.json();
    const officialRate = apiData.conversion_rate; // How many CNY per 1 BRL

    // Get current adjustment (keep it)
    const { data: currentRate } = await supabase
      .from('exchange_rates')
      .select('manual_adjustment, notes')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const manualAdjustment = currentRate?.manual_adjustment || 0.95;
    const notes = currentRate?.notes || 'Atualização automática via API';

    // Deactivate old rates
    await supabase
      .from('exchange_rates')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new rate
    const { data: newRate, error } = await supabase
      .from('exchange_rates')
      .insert({
        official_rate: officialRate,
        manual_adjustment: manualAdjustment,
        notes,
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
    console.error('Error updating exchange rate:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rate' },
      { status: 500 }
    );
  }
}
