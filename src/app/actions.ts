'use server';

import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';
import { CacheTag } from '@/types';
import { getCurrentUserStatus } from '@/lib/user-server';

interface GetOriginalLinkResult {
  success: boolean;
  originalLink?: string;
  error?: string;
}

export async function getProductOriginalLink(productId: string): Promise<GetOriginalLinkResult> {
  const userStatus = await getCurrentUserStatus();

  if (!userStatus.isAuthenticated) {
    return { success: false, error: 'Não autenticado' };
  }

  if (!userStatus.isPremium && !userStatus.isAdmin) {
    return { success: false, error: 'Acesso premium necessário' };
  }

  const { data, error } = await supabase
    .from('products')
    .select('original_link')
    .eq('id', productId)
    .single();

  if (error || !data) {
    return { success: false, error: 'Produto não encontrado' };
  }

  return { success: true, originalLink: data.original_link };
}

export const getPublicProducts = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price_cny,
        affiliate_link,
        is_sold_out,
        image_main,
        image_hover,
        category_id,
        condition,
        has_box,
        has_charger,
        has_warranty,
        observations,
        view_count,
        card_click_count,
        purchase_click_count,
        card_ctr,
        purchase_ctr,
        category:product_categories(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data ?? [];
  },
  ['public-products-list'],
  {
    revalidate: 300,
    tags: [CacheTag.PRODUCTS],
  }
);

export async function getPublicCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }

  return data || [];
}

export const getPublicSellers = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select('*, seller_categories(id, name, slug)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vendedores:', error);
      return [];
    }

    return data ?? [];
  },
  ['public-sellers-list'],
  {
    revalidate: 300,
    tags: [CacheTag.SELLERS],
  }
);
