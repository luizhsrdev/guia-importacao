import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Get the least used ID (prioritizing never used, then oldest last_used_at)
    const { data, error } = await supabase
      .from('chinese_ids')
      .select('id, identity_number, usage_count')
      .order('usage_count', { ascending: true })
      .order('last_used_at', { ascending: true, nullsFirst: true })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('[CHINESE-IDS] Fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Nenhum ID disponível na base' },
        { status: 404 }
      );
    }

    // Increment usage count and update last_used_at
    const { error: updateError } = await supabase
      .from('chinese_ids')
      .update({
        usage_count: data.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('[CHINESE-IDS] Update error:', updateError);
      // Continue anyway - we still want to return the ID
    }

    return NextResponse.json({
      success: true,
      data: {
        identity_number: data.identity_number,
      },
    });
  } catch (error) {
    console.error('[CHINESE-IDS] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
