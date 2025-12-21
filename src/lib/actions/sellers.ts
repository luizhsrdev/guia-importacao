'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath, revalidateTag } from 'next/cache';
import cloudinary from '@/lib/cloudinary';
import { CacheTag } from '@/types';

export interface SellerFormData {
  id?: string;
  name: string;
  status: 'gold' | 'blacklist';
  category_id?: string;
  notes?: string;
  affiliate_link?: string;
  profile_link?: string;
  feedback_link?: string;
  image_url?: string;
  blacklist_reason?: string;
  proof_link?: string;
  evidence_images?: string[];
}

export async function uploadEvidenceImages(
  base64Array: string[]
): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: 'Credenciais do Cloudinary não configuradas'
      };
    }

    const uploadPromises = base64Array.map(async (base64Data) => {
      try {
        if (!base64Data.startsWith('data:image/')) {
          return null;
        }

        const result = await cloudinary.uploader.upload(base64Data, {
          folder: 'xianyu-evidence',
          resource_type: 'image',
          timeout: 60000,
        });

        return result.secure_url;
      } catch {
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter((url): url is string => url !== null);

    if (validUrls.length === 0) {
      return { success: false, error: 'Nenhuma imagem foi enviada com sucesso' };
    }

    return { success: true, urls: validUrls };
  } catch (error) {
    console.error('Erro ao fazer upload:', error instanceof Error ? error.message : error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Listar todos os vendedores
export async function getSellers() {
  const { data, error } = await supabase
    .from('sellers')
    .select('*, seller_categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vendedores:', error);
    return [];
  }

  return data || [];
}

// Buscar um vendedor por ID
export async function getSellerById(id: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar vendedor:', error);
    return null;
  }

  return data;
}

// Criar vendedor
export async function createSeller(formData: SellerFormData) {
  const { error } = await supabase.from('sellers').insert({
    name: formData.name,
    status: formData.status,
    category_id: formData.category_id || null,
    notes: formData.notes || null,
    affiliate_link: formData.affiliate_link || null,
    profile_link: formData.profile_link || null,
    feedback_link: formData.feedback_link || null,
    image_url: formData.image_url || null,
    blacklist_reason: formData.blacklist_reason || null,
    proof_link: formData.proof_link || null,
    evidence_images: formData.evidence_images || null,
  });

  if (error) {
    console.error('Erro ao criar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/vendedores');
  revalidateTag(CacheTag.SELLERS);
  return { success: true };
}

// Atualizar vendedor
export async function updateSeller(formData: SellerFormData) {
  if (!formData.id) {
    return { success: false, error: 'ID do vendedor não fornecido' };
  }

  const { error } = await supabase
    .from('sellers')
    .update({
      name: formData.name,
      status: formData.status,
      category_id: formData.category_id || null,
      notes: formData.notes || null,
      affiliate_link: formData.affiliate_link || null,
      profile_link: formData.profile_link || null,
      feedback_link: formData.feedback_link || null,
      image_url: formData.image_url || null,
      blacklist_reason: formData.blacklist_reason || null,
      proof_link: formData.proof_link || null,
      evidence_images: formData.evidence_images || null,
    })
    .eq('id', formData.id);

  if (error) {
    console.error('Erro ao atualizar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/vendedores');
  revalidateTag(CacheTag.SELLERS);
  return { success: true };
}

// Deletar vendedor
export async function deleteSeller(id: string) {
  const { error } = await supabase.from('sellers').delete().eq('id', id);

  if (error) {
    console.error('Erro ao deletar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/vendedores');
  revalidateTag(CacheTag.SELLERS);
  return { success: true };
}

// Buscar categorias
export async function getCategories() {
  const { data, error } = await supabase
    .from('seller_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }

  return data || [];
}
