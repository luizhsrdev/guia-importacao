import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Top 5 produtos mais acessados (ordenar por card_ctr)
  const { data: topProducts, error: productsError } = await supabase
    .from('products')
    .select('id, title, view_count, card_click_count, purchase_click_count, card_ctr')
    .order('card_ctr', { ascending: false, nullsFirst: false })
    .limit(5);

  if (productsError) {
    console.error('Erro ao buscar top produtos:', productsError);
  }

  // Top 5 categorias mais selecionadas
  const { data: topCategories, error: categoriesError } = await supabase
    .from('product_categories')
    .select('id, name, emoji, selection_count')
    .order('selection_count', { ascending: false })
    .limit(5);

  if (categoriesError) {
    console.error('Erro ao buscar top categorias:', categoriesError);
  }

  return NextResponse.json({
    topProducts: topProducts || [],
    topCategories: topCategories || [],
  });
}
