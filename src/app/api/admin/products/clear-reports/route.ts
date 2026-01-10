import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('clerk_id', userId)
      .single();

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Parse body
    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
    }

    // Limpar contadores de reports
    const { error: updateError } = await supabase
      .from('products')
      .update({
        broken_link_reports: 0,
        out_of_stock_reports: 0,
        seller_not_responding_reports: 0,
        wrong_price_reports: 0,
        other_reports: 0,
        needs_validation: false
      })
      .eq('id', product_id);

    if (updateError) {
      console.error('[CLEAR REPORTS API] Erro ao atualizar produto:', updateError);
      return NextResponse.json({ error: 'Erro ao limpar reports' }, { status: 500 });
    }

    // Opcional: Também deletar registros individuais de reports
    const { error: deleteError } = await supabase
      .from('product_reports')
      .delete()
      .eq('product_id', product_id);

    if (deleteError) {
      console.error('[CLEAR REPORTS API] Erro ao deletar reports:', deleteError);
      // Não retornar erro, pois a limpeza dos contadores já foi feita
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[CLEAR REPORTS API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
