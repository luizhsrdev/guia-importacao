'use server';

import { supabase } from './supabase';

/**
 * Registra visualização de produto (card apareceu na tela)
 */
export async function trackProductView(productId: string) {
  try {
    const { error } = await supabase.rpc('increment_product_views', {
      product_id: productId
    });

    if (error) {
      console.error('Erro ao rastrear view:', error);
    }
  } catch (error) {
    console.error('Erro ao rastrear view:', error);
  }
}

/**
 * Registra clique no card (expandir, ver detalhes)
 */
export async function trackProductCardClick(productId: string) {
  try {
    const { error } = await supabase.rpc('increment_product_card_clicks', {
      product_id: productId
    });

    if (error) {
      console.error('Erro ao rastrear card click:', error);
    }
  } catch (error) {
    console.error('Erro ao rastrear card click:', error);
  }
}

/**
 * Registra clique no botão "Comprar na CSSBuy"
 */
export async function trackProductPurchaseClick(productId: string) {
  try {
    const { error } = await supabase.rpc('increment_product_purchase_clicks', {
      product_id: productId
    });

    if (error) {
      console.error('Erro ao rastrear purchase click:', error);
    }
  } catch (error) {
    console.error('Erro ao rastrear purchase click:', error);
  }
}

/**
 * Registra seleção de categoria
 */
export async function trackCategorySelection(categoryId: string) {
  try {
    console.log('[ANALYTICS] Rastreando seleção de categoria:', categoryId);

    const { data, error } = await supabase.rpc('increment_category_selections', {
      category_id: categoryId
    });

    if (error) {
      console.error('[ANALYTICS] Erro ao rastrear seleção de categoria:', {
        categoryId,
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('[ANALYTICS] Categoria rastreada com sucesso:', categoryId, data);
    }
  } catch (error) {
    console.error('[ANALYTICS] Exceção ao rastrear seleção de categoria:', error);
  }
}
