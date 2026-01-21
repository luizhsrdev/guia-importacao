import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET - Listar favoritos do usuário
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: favorites, error } = await supabase
      .from('seller_favorites')
      .select('seller_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[SELLER FAVORITES API] Erro ao buscar favoritos:', error);
      return NextResponse.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
    }

    return NextResponse.json({
      favorites: favorites?.map(f => f.seller_id) || []
    });

  } catch (error) {
    console.error('[SELLER FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Adicionar favorito
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { seller_id } = body;

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase
      .from('seller_favorites')
      .insert({
        user_id: userId,
        seller_id: seller_id
      });

    if (error) {
      console.error('[SELLER FAVORITES API] Erro ao adicionar favorito:', error);
      return NextResponse.json({ error: 'Erro ao adicionar favorito' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SELLER FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover favorito
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seller_id = searchParams.get('seller_id');

    if (!seller_id) {
      return NextResponse.json({ error: 'seller_id é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase
      .from('seller_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('seller_id', seller_id);

    if (error) {
      console.error('[SELLER FAVORITES API] Erro ao remover favorito:', error);
      return NextResponse.json({ error: 'Erro ao remover favorito' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SELLER FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
