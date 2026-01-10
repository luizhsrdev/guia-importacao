import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Tipos válidos de report
const VALID_REPORT_TYPES = ['broken_link', 'out_of_stock', 'seller_not_responding', 'wrong_price', 'other'] as const;
type ReportType = typeof VALID_REPORT_TYPES[number];

// Validação de UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Capturar IP do request
function getUserIP(request: NextRequest): string {
  // Tenta diferentes headers comuns
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    // x-forwarded-for pode conter múltiplos IPs, pegar o primeiro
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await request.json();
    const { product_id, issue_type, description } = body;

    // Validação 1: product_id é UUID válido
    if (!product_id || !isValidUUID(product_id)) {
      return NextResponse.json(
        { error: 'product_id inválido ou ausente' },
        { status: 400 }
      );
    }

    // Validação 2: issue_type está na lista permitida
    if (!issue_type || !VALID_REPORT_TYPES.includes(issue_type)) {
      return NextResponse.json(
        { error: 'issue_type inválido' },
        { status: 400 }
      );
    }

    // Validação 3: Se tipo for 'other', description é obrigatória
    if (issue_type === 'other' && (!description || description.trim().length === 0)) {
      return NextResponse.json(
        { error: 'description é obrigatória para tipo "other"' },
        { status: 400 }
      );
    }

    // Capturar user_id se autenticado (Clerk)
    const { userId } = await auth();

    // Capturar IP do usuário
    const userIp = getUserIP(request);

    console.log('[REPORT API] Novo report recebido:', {
      product_id,
      issue_type,
      user_id: userId || 'anônimo',
      user_ip: userIp
    });

    // Anti-spam: Verificar se já reportou nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: existingReports, error: checkError } = await supabase
      .from('product_reports')
      .select('*')
      .eq('product_id', product_id)
      .eq('report_type', issue_type)
      .gte('created_at', sevenDaysAgo.toISOString())
      .or(`user_id.eq.${userId || 'null'},user_ip.eq.${userIp}`);

    if (checkError) {
      console.error('[REPORT API] Erro ao verificar reports existentes:', checkError);
      // Continuar mesmo com erro na verificação
    } else if (existingReports && existingReports.length > 0) {
      console.log('[REPORT API] Report duplicado bloqueado:', {
        product_id,
        issue_type,
        user_id: userId || 'anônimo',
        user_ip: userIp
      });
      return NextResponse.json(
        {
          error: 'Você já reportou esse problema recentemente. Aguarde alguns dias antes de reportar novamente.',
          cooldown: true
        },
        { status: 429 }
      );
    }

    // Inserir registro na tabela product_reports
    const { error: insertError } = await supabase
      .from('product_reports')
      .insert({
        product_id,
        user_id: userId || null,
        user_ip: userIp,
        report_type: issue_type,
        description: description || null
      });

    if (insertError) {
      console.error('[REPORT API] Erro ao inserir report:', insertError);
      return NextResponse.json(
        { error: 'Erro ao registrar report' },
        { status: 500 }
      );
    }

    // Chamar função SQL do Supabase para atualizar contadores
    const { data, error: rpcError } = await supabase.rpc('report_product_issue', {
      p_product_id: product_id,
      p_issue_type: issue_type
    });

    if (rpcError) {
      console.error('[REPORT API] Erro ao chamar função SQL:', rpcError);
      return NextResponse.json(
        { error: 'Erro ao processar report' },
        { status: 500 }
      );
    }

    // Buscar estado atualizado do produto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('broken_link_reports, out_of_stock_reports, seller_not_responding_reports, wrong_price_reports, other_reports, is_sold_out')
      .eq('id', product_id)
      .single();

    if (fetchError || !product) {
      console.error('[REPORT API] Erro ao buscar produto:', fetchError);
      // Ainda retorna sucesso pois o report foi registrado
      return NextResponse.json({
        success: true,
        message: 'Report registrado com sucesso'
      });
    }

    console.log('[REPORT API] Report processado com sucesso:', {
      product_id,
      broken_link_reports: product.broken_link_reports,
      out_of_stock_reports: product.out_of_stock_reports,
      seller_not_responding_reports: product.seller_not_responding_reports,
      wrong_price_reports: product.wrong_price_reports,
      other_reports: product.other_reports,
      is_sold_out: product.is_sold_out
    });

    // Retornar resposta com contadores atualizados
    return NextResponse.json({
      success: true,
      broken_link_reports: product.broken_link_reports,
      out_of_stock_reports: product.out_of_stock_reports,
      seller_not_responding_reports: product.seller_not_responding_reports,
      wrong_price_reports: product.wrong_price_reports,
      other_reports: product.other_reports,
      is_sold_out: product.is_sold_out
    });

  } catch (error) {
    console.error('[REPORT API] Erro não tratado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
