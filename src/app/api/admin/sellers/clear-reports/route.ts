import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

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
    const { seller_id } = body;

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 });
    }

    // Limpar contadores de reports
    const { error: updateError } = await supabase
      .from('sellers')
      .update({
        broken_link_reports: 0,
        seller_not_responding_reports: 0,
        other_reports: 0,
        needs_validation: false
      })
      .eq('id', seller_id);

    if (updateError) {
      console.error('[CLEAR SELLER REPORTS API] Erro ao atualizar vendedor:', updateError);
      return NextResponse.json({ error: 'Erro ao limpar reports' }, { status: 500 });
    }

    // Opcional: Também deletar registros individuais de reports
    const { error: deleteError } = await supabase
      .from('seller_reports')
      .delete()
      .eq('seller_id', seller_id);

    if (deleteError) {
      console.error('[CLEAR SELLER REPORTS API] Erro ao deletar reports:', deleteError);
      // Não retornar erro, pois a limpeza dos contadores já foi feita
    }

    // Revalidar cache para mostrar mudanças imediatamente
    revalidatePath('/');
    revalidatePath('/admin/reported-products');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[CLEAR SELLER REPORTS API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
