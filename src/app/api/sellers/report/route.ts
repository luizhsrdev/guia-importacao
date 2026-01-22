import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

const VALID_REPORT_TYPES = ['broken_link', 'seller_not_responding', 'other'] as const;

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json();
    const { seller_id, report_type, description } = body;

    // Validações
    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 });
    }

    if (!report_type || !VALID_REPORT_TYPES.includes(report_type)) {
      return NextResponse.json({ error: 'report_type inválido' }, { status: 400 });
    }

    if (report_type === 'other' && !description) {
      return NextResponse.json({ error: 'Descrição é obrigatória para "Outro motivo"' }, { status: 400 });
    }

    // Pegar user_id do Clerk (opcional - usuários não autenticados podem reportar)
    const { userId } = await auth();

    // Pegar IP do usuário
    const userIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

    // Verificar anti-spam: mesmo user_id ou IP não pode reportar o mesmo tipo no mesmo vendedor em 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: existingReports } = await supabase
      .from('seller_reports')
      .select('*')
      .eq('seller_id', seller_id)
      .eq('report_type', report_type)
      .gte('created_at', sevenDaysAgo.toISOString())
      .or(`user_id.eq.${userId || 'null'},user_ip.eq.${userIp}`);

    if (existingReports && existingReports.length > 0) {
      return NextResponse.json(
        { error: 'Você já reportou este problema recentemente. Aguarde 7 dias para reportar novamente.' },
        { status: 429 }
      );
    }

    // Inserir report
    const { error: insertError } = await supabase
      .from('seller_reports')
      .insert({
        seller_id,
        user_id: userId || null,
        user_ip: userIp,
        report_type,
        description: description || null
      });

    if (insertError) {
      console.error('[SELLER REPORT API] Erro ao inserir report:', insertError);
      return NextResponse.json({ error: 'Erro ao criar report' }, { status: 500 });
    }

    // Incrementar contador usando função SQL
    const { error: rpcError } = await supabase.rpc('report_seller_issue', {
      p_seller_id: seller_id,
      p_issue_type: report_type
    });

    if (rpcError) {
      console.error('[SELLER REPORT API] Erro ao incrementar contador:', rpcError);
      // Não retorna erro porque o report já foi criado
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SELLER REPORT API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
