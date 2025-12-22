import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get('sort') || 'card_ctr';

  let query = supabase
    .from('products')
    .select('id, title, price_cny, image_main, affiliate_link, view_count, card_click_count, purchase_click_count, card_ctr, purchase_ctr, created_at')
    .eq('is_sold_out', false);

  // Aplicar ordenação
  switch (sort) {
    case 'card_ctr':
      query = query.order('card_ctr', { ascending: false, nullsFirst: false });
      break;
    case 'purchase_ctr':
      query = query.order('purchase_ctr', { ascending: false, nullsFirst: false });
      break;
    case 'views':
      query = query.order('view_count', { ascending: false });
      break;
    case 'card_clicks':
      query = query.order('card_click_count', { ascending: false });
      break;
    case 'purchase_clicks':
      query = query.order('purchase_click_count', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('price_cny', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price_cny', { ascending: false });
      break;
    default:
      query = query.order('card_ctr', { ascending: false, nullsFirst: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products });
}
