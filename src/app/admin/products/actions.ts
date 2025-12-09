'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
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
  base64Data: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('Iniciando upload no Cloudinary...');
    console.log('Tamanho do base64:', base64Data.length, 'caracteres');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    // Verificar se as credenciais estão configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Credenciais do Cloudinary não configuradas!');
      return {
        success: false,
        error: 'Credenciais do Cloudinary não configuradas. Verifique o .env.local'
      };
    }

    // Verificar se o base64 está no formato correto
    if (!base64Data.startsWith('data:image/')) {
      console.error('Formato de imagem inválido. Deve começar com "data:image/"');
      return {
        success: false,
        error: 'Formato de imagem inválido'
      };
    }

    console.log('Credenciais OK, enviando para Cloudinary...');

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'xianyu-products',
      resource_type: 'image',
      timeout: 60000, // 60 segundos de timeout
    });

    console.log('Upload concluído com sucesso!');
    console.log('URL:', result.secure_url);
    console.log('Tamanho:', result.bytes, 'bytes');
    console.log('Dimensões:', result.width, 'x', result.height);

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Erro detalhado ao fazer upload:');
    console.error('Tipo do erro:', error?.constructor?.name);
    console.error('Mensagem:', error instanceof Error ? error.message : error);
    if (error instanceof Error && 'http_code' in error) {
      console.error('HTTP Code:', (error as any).http_code);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : JSON.stringify(error)
    };
  }
}

// Listar todos os produtos
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:product_categories(id, name, slug)
    `)
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
  revalidateTag('products'); // Invalida cache da home
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
  revalidateTag('products'); // Invalida cache da home
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
  revalidateTag('products'); // Invalida cache da home
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
