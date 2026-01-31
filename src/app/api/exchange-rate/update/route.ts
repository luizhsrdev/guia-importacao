import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET || 'guia_importacao_cron_2024_secret';
const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Buscar taxa da API externa
    let officialRate = 1.32; // Fallback

    if (EXCHANGE_API_KEY) {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/BRL/CNY`
        );
        const data = await response.json();

        if (data.result === 'success') {
          officialRate = data.conversion_rate;
        } else {
          console.warn('API retornou erro:', data);
        }
      } catch (apiError) {
        console.error('Erro ao buscar taxa da API:', apiError);
      }
    } else {
      console.warn('EXCHANGE_RATE_API_KEY não configurada, usando fallback');
    }

    // Buscar ajuste manual atual
    const { data: currentRate } = await supabase
      .from('exchange_rates')
      .select('id, manual_adjustment')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const manualAdjustment = currentRate?.manual_adjustment || 0.95;

    // Atualizar registro existente ou inserir novo
    if (currentRate?.id) {
      const { error } = await supabase
        .from('exchange_rates')
        .update({
          official_rate: officialRate,
          notes: `Atualização automática - ${new Date().toLocaleString('pt-BR')}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentRate.id);

      if (error) {
        console.error('Erro ao atualizar Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Inserir novo registro se não existir nenhum
      const { error } = await supabase.from('exchange_rates').insert({
        official_rate: officialRate,
        manual_adjustment: manualAdjustment,
        notes: `Cotação inicial via API - ${new Date().toLocaleString('pt-BR')}`,
        is_active: true,
      });

      if (error) {
        console.error('Erro ao inserir Supabase:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const effectiveRate = officialRate * manualAdjustment;

    return NextResponse.json({
      success: true,
      officialRate,
      manualAdjustment,
      effectiveRate,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro no endpoint de atualização:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
