import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    // Pegar seller_id da query string
    const { searchParams } = new URL(request.url);
    const seller_id = searchParams.get('seller_id');

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 });
    }

    // Buscar reports individuais do vendedor
    const { data: reports, error } = await supabase
      .from('seller_reports')
      .select('id, report_type, description, created_at, user_ip')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SELLER REPORTS API] Erro ao buscar reports:', error);
      return NextResponse.json({ error: 'Erro ao buscar reports' }, { status: 500 });
    }

    return NextResponse.json({ reports: reports || [] });

  } catch (error) {
    console.error('[SELLER REPORTS API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
