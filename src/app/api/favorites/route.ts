import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET: Listar favoritos do usuário
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[FAVORITES API] Erro ao buscar favoritos:', error);
      return NextResponse.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
    }

    // Retornar apenas array de IDs para facilitar verificação no frontend
    const favoriteIds = favorites?.map(f => f.product_id) || [];

    return NextResponse.json({ favorites: favoriteIds });

  } catch (error) {
    console.error('[FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST: Adicionar favorito
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
    }

    // Tentar inserir (unique constraint evita duplicatas)
    const { error: insertError } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        product_id: product_id
      });

    if (insertError) {
      // Se já existe, retornar sucesso silenciosamente
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json({ success: true, message: 'Já está nos favoritos' });
      }

      console.error('[FAVORITES API] Erro ao adicionar favorito:', insertError);
      return NextResponse.json({ error: 'Erro ao adicionar favorito' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Adicionado aos favoritos' });

  } catch (error) {
    console.error('[FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE: Remover favorito
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json({ error: 'product_id é obrigatório' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product_id);

    if (deleteError) {
      console.error('[FAVORITES API] Erro ao remover favorito:', deleteError);
      return NextResponse.json({ error: 'Erro ao remover favorito' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Removido dos favoritos' });

  } catch (error) {
    console.error('[FAVORITES API] Erro não tratado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
