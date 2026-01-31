import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Return default values on any error (table doesn't exist, no data, etc.)
      return NextResponse.json({
        officialRate: 1.32,
        manualAdjustment: 0.95,
        effectiveRate: 1.254,
        updatedAt: new Date().toISOString(),
        notes: 'Taxa padrão',
      });
    }

    return NextResponse.json({
      officialRate: data.official_rate,
      manualAdjustment: data.manual_adjustment,
      effectiveRate: data.effective_rate,
      updatedAt: data.updated_at,
      notes: data.notes,
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Return default values on any error
    return NextResponse.json({
      officialRate: 1.32,
      manualAdjustment: 0.95,
      effectiveRate: 1.254,
      updatedAt: new Date().toISOString(),
      notes: 'Taxa padrão (fallback)',
    });
  }
}
