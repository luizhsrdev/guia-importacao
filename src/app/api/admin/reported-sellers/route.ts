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

    // Buscar vendedores com reports
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('id, name, status, profile_link, image_url, broken_link_reports, seller_not_responding_reports, other_reports, needs_validation')
      .or('broken_link_reports.gt.0,seller_not_responding_reports.gt.0,other_reports.gt.0')
      .order('broken_link_reports', { ascending: false });

    if (error) {
      console.error('[REPORTED SELLERS API] Erro ao buscar vendedores:', error);
      return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 });
    }

    return NextResponse.json({ sellers: sellers || [] });

  } catch (error) {
    console.error('[REPORTED SELLERS API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
