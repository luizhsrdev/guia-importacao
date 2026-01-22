import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
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

    // Contar produtos com reports
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or('broken_link_reports.gt.0,out_of_stock_reports.gt.0,seller_not_responding_reports.gt.0,wrong_price_reports.gt.0,other_reports.gt.0');

    if (productError) {
      console.error('[REPORTS COUNT API] Erro ao contar reports de produtos:', productError);
      return NextResponse.json({ error: 'Erro ao buscar contagem' }, { status: 500 });
    }

    // Contar vendedores com reports
    const { count: sellerCount, error: sellerError } = await supabase
      .from('sellers')
      .select('*', { count: 'exact', head: true })
      .or('broken_link_reports.gt.0,seller_not_responding_reports.gt.0,other_reports.gt.0');

    if (sellerError) {
      console.error('[REPORTS COUNT API] Erro ao contar reports de vendedores:', sellerError);
      return NextResponse.json({ error: 'Erro ao buscar contagem' }, { status: 500 });
    }

    // Somar ambos os contadores
    const totalCount = (productCount || 0) + (sellerCount || 0);

    return NextResponse.json({ count: totalCount });

  } catch (error) {
    console.error('[REPORTS COUNT API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
