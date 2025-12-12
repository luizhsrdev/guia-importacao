'use server';

import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

export interface PublicProduct {
  id: string;
  title: string;
  price_cny: string;
  affiliate_link: string;
  is_sold_out: boolean;
  image_main: string;
  image_hover?: string;
  category_id?: string;
  condition?: string;
  has_box?: boolean;
  has_charger?: boolean;
  has_warranty?: boolean;
  observations?: string;
  original_link?: string;
}

// Buscar produtos públicos (SEM original_link) com cache
export const getPublicProducts = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price_cny,
        affiliate_link,
        original_link,
        is_sold_out,
        image_main,
        image_hover,
        category_id,
        condition,
        has_box,
        has_charger,
        has_warranty,
        observations,
        category:product_categories(name, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data || [];
  },
  ['public-products-list'],
  {
    revalidate: 300, // 5 minutos
    tags: ['products'],
  }
);

// Buscar categorias de produtos
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

// Buscar vendedores (para usuários premium) com cache
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

    return data || [];
  },
  ['public-sellers-list'],
  {
    revalidate: 300, // 5 minutos
    tags: ['sellers'],
  }
);
