'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import cloudinary from '@/lib/cloudinary';

export interface ProductFormData {
  id?: string;
  title: string;
  price_cny: string;
  affiliate_link: string;
  original_link: string;
  category_id?: string;
  is_sold_out: boolean;
  image_main?: string;
  image_hover?: string;
}

// Função helper para upload de imagem no Cloudinary
export async function uploadImageToCloudinary(
  file: File
): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'xianyu-products',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || null);
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return null;
  }
}

// Listar todos os produtos
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
}

// Buscar um produto por ID
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }

  return data;
}

// Criar produto
export async function createProduct(formData: ProductFormData) {
  const { error } = await supabase.from('products').insert({
    title: formData.title,
    price_cny: formData.price_cny,
    affiliate_link: formData.affiliate_link,
    original_link: formData.original_link,
    category_id: formData.category_id || null,
    is_sold_out: formData.is_sold_out,
    image_main: formData.image_main || null,
    image_hover: formData.image_hover || null,
  });

  if (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// Atualizar produto
export async function updateProduct(formData: ProductFormData) {
  if (!formData.id) {
    return { success: false, error: 'ID do produto não fornecido' };
  }

  const { error } = await supabase
    .from('products')
    .update({
      title: formData.title,
      price_cny: formData.price_cny,
      affiliate_link: formData.affiliate_link,
      original_link: formData.original_link,
      category_id: formData.category_id || null,
      is_sold_out: formData.is_sold_out,
      image_main: formData.image_main || null,
      image_hover: formData.image_hover || null,
    })
    .eq('id', formData.id);

  if (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// Deletar produto
export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Erro ao deletar produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// Toggle sold out
export async function toggleSoldOut(id: string, currentStatus: boolean) {
  const { error } = await supabase
    .from('products')
    .update({ is_sold_out: !currentStatus })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// Buscar categorias
export async function getCategories() {
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
