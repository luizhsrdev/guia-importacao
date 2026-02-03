import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CRON_SECRET = process.env.CRON_SECRET;
const EXCHANGE_API_KEY = process.env.EXCHANGE_RATE_API_KEY;

// Função principal de atualização
async function updateExchangeRate() {
  // Buscar taxa da API externa
  let officialRate = 1.32; // Fallback

  if (EXCHANGE_API_KEY) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/BRL/CNY`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (data.result === 'success') {
        officialRate = data.conversion_rate;
        console.log('[EXCHANGE RATE] Taxa obtida da API:', officialRate);
      } else {
        console.warn('[EXCHANGE RATE] API retornou erro:', data);
      }
    } catch (apiError) {
      console.error('[EXCHANGE RATE] Erro ao buscar taxa da API:', apiError);
    }
  } else {
    console.warn('[EXCHANGE RATE] EXCHANGE_RATE_API_KEY não configurada, usando fallback');
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
  const effectiveRate = officialRate * manualAdjustment;
  const now = new Date().toISOString();

  // Atualizar registro existente ou inserir novo
  if (currentRate?.id) {
    const { error } = await supabase
      .from('exchange_rates')
      .update({
        official_rate: officialRate,
        effective_rate: effectiveRate,
        notes: `Atualização automática - ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
        updated_at: now,
      })
      .eq('id', currentRate.id);

    if (error) {
      console.error('[EXCHANGE RATE] Erro ao atualizar Supabase:', error);
      throw error;
    }
  } else {
    // Inserir novo registro se não existir nenhum
    const { error } = await supabase.from('exchange_rates').insert({
      official_rate: officialRate,
      manual_adjustment: manualAdjustment,
      effective_rate: effectiveRate,
      notes: `Cotação inicial via API - ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
      is_active: true,
    });

    if (error) {
      console.error('[EXCHANGE RATE] Erro ao inserir Supabase:', error);
      throw error;
    }
  }

  return {
    success: true,
    officialRate,
    manualAdjustment,
    effectiveRate,
    updatedAt: now,
  };
}

// GET - Usado pelo Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Verificar autorização do Vercel Cron
    const authHeader = request.headers.get('authorization');

    if (CRON_SECRET) {
      if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
        console.warn('[EXCHANGE RATE] Tentativa de acesso não autorizado ao cron');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await updateExchangeRate();
    console.log('[EXCHANGE RATE] Atualização via CRON concluída:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[EXCHANGE RATE] Erro no cron de atualização:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Mantido para compatibilidade
export async function POST(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (CRON_SECRET && token !== CRON_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await updateExchangeRate();
    console.log('[EXCHANGE RATE] Atualização via POST concluída:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[EXCHANGE RATE] Erro no endpoint de atualização:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
