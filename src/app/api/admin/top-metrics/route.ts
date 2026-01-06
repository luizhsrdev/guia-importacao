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
    console.error('[API TOP METRICS] Erro ao buscar top produtos:', productsError);
  } else {
    console.log('[API TOP METRICS] Top produtos encontrados:', topProducts?.length || 0);
  }

  // Top 5 categorias mais selecionadas
  const { data: topCategories, error: categoriesError } = await supabase
    .from('product_categories')
    .select('id, name, selection_count')
    .order('selection_count', { ascending: false, nullsFirst: false })
    .limit(5);

  if (categoriesError) {
    console.error('[API TOP METRICS] Erro ao buscar top categorias:', categoriesError);
  } else {
    console.log('[API TOP METRICS] Top categorias encontradas:', topCategories?.length || 0);
    console.log('[API TOP METRICS] Categorias:', JSON.stringify(topCategories, null, 2));
  }

  return NextResponse.json({
    topProducts: topProducts || [],
    topCategories: topCategories || [],
  });
}
