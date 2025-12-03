'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import cloudinary from '@/lib/cloudinary';

export interface SellerFormData {
  id?: string;
  name: string;
  status: 'gold' | 'blacklist';
  niche_id?: string;
  notes?: string;
  rating?: string;
  affiliate_link?: string;
  blacklist_reason?: string;
  evidence_images?: string[]; // Array de URLs
}

// Função helper para upload múltiplo de imagens no Cloudinary
export async function uploadEvidenceImages(
  files: File[]
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'xianyu-evidence',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url || '');
            }
          )
          .end(buffer);
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return '';
    }
  });

  const urls = await Promise.all(uploadPromises);
  return urls.filter((url) => url !== '');
}

// Listar todos os vendedores
export async function getSellers() {
  const { data, error } = await supabase
    .from('sellers')
    .select('*, seller_niches(name)')
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
    niche_id: formData.niche_id || null,
    notes: formData.notes || null,
    rating: formData.rating || null,
    affiliate_link: formData.affiliate_link || null,
    blacklist_reason: formData.blacklist_reason || null,
    evidence_images: formData.evidence_images || null,
  });

  if (error) {
    console.error('Erro ao criar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/sellers');
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
      niche_id: formData.niche_id || null,
      notes: formData.notes || null,
      rating: formData.rating || null,
      affiliate_link: formData.affiliate_link || null,
      blacklist_reason: formData.blacklist_reason || null,
      evidence_images: formData.evidence_images || null,
    })
    .eq('id', formData.id);

  if (error) {
    console.error('Erro ao atualizar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/sellers');
  return { success: true };
}

// Deletar vendedor
export async function deleteSeller(id: string) {
  const { error } = await supabase.from('sellers').delete().eq('id', id);

  if (error) {
    console.error('Erro ao deletar vendedor:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/sellers');
  return { success: true };
}

// Buscar nichos
export async function getNiches() {
  const { data, error } = await supabase
    .from('seller_niches')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar nichos:', error);
    return [];
  }

  return data || [];
}
