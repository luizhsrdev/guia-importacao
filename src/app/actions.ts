'use server';

import { supabase } from '@/lib/supabase';

export interface PublicProduct {
  id: string;
  title: string;
  price_cny: string;
  affiliate_link: string;
  is_sold_out: boolean;
  image_main: string;
  image_hover?: string;
  category_id?: string;
}

// Buscar produtos públicos (SEM original_link)
export async function getPublicProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, price_cny, affiliate_link, is_sold_out, image_main, image_hover, category_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
}

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

// Buscar vendedores (para usuários premium)
export async function getPublicSellers() {
  const { data, error } = await supabase
    .from('sellers')
    .select('*, seller_categories(id, name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vendedores:', error);
    return [];
  }

  return data || [];
}
