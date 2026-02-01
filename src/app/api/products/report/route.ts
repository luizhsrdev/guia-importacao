import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Tipos válidos de report
const VALID_REPORT_TYPES = ['broken_link', 'out_of_stock', 'seller_not_responding', 'wrong_price', 'other'] as const;
type ReportType = typeof VALID_REPORT_TYPES[number];

// Validação de UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(request: NextRequest) {
  try {
    // Parse do body
    const body = await request.json();

    // Suportar tanto camelCase quanto snake_case
    const productId = body.productId || body.product_id;
    const issueType = body.issueType || body.report_type;

    console.log('[REPORT API] Recebido:', { productId, issueType });

    // Validação 1: productId é UUID válido
    if (!productId || !isValidUUID(productId)) {
      return NextResponse.json(
        { error: 'productId inválido ou ausente' },
        { status: 400 }
      );
    }

    // Validação 2: issueType está na lista permitida
    if (!issueType || !VALID_REPORT_TYPES.includes(issueType as ReportType)) {
      return NextResponse.json(
        { error: 'issueType inválido', validTypes: VALID_REPORT_TYPES },
        { status: 400 }
      );
    }

    // Chamar função SQL do Supabase para atualizar contadores
    const { data, error: rpcError } = await supabase.rpc('report_product_issue', {
      p_product_id: productId,
      p_issue_type: issueType
    });

    if (rpcError) {
      console.error('[REPORT API] Erro ao chamar RPC:', rpcError);
      return NextResponse.json(
        { error: 'Erro ao processar report', details: rpcError.message },
        { status: 500 }
      );
    }

    console.log('[REPORT API] Sucesso:', data);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('[REPORT API] Erro não tratado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
