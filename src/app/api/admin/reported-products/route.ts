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

    // Buscar produtos com reports
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, image_main, broken_link_reports, out_of_stock_reports, seller_not_responding_reports, wrong_price_reports, other_reports, is_sold_out, needs_validation')
      .or('broken_link_reports.gt.0,out_of_stock_reports.gt.0,seller_not_responding_reports.gt.0,wrong_price_reports.gt.0,other_reports.gt.0')
      .order('broken_link_reports', { ascending: false });

    if (error) {
      console.error('[REPORTED PRODUCTS API] Erro ao buscar produtos:', error);
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });

  } catch (error) {
    console.error('[REPORTED PRODUCTS API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
