'use server';

import { supabase } from '../supabase';

/**
 * Busca os produtos mais visualizados
 */
export async function getTopViewedProducts(limit: number = 10) {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, view_count, card_click_count, purchase_click_count, card_ctr, purchase_ctr')
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar produtos mais visualizados:', error);
    return [];
  }

  return data || [];
}

/**
 * Busca as categorias mais selecionadas
 */
export async function getTopSelectedCategories(limit: number = 10) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('id, name, selection_count, last_selected_at')
    .order('selection_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar categorias mais selecionadas:', error);
    return [];
  }

  return data || [];
}

/**
 * Busca estatísticas gerais
 */
export async function getAnalyticsOverview() {
  const { data, error } = await supabase
    .from('products')
    .select('view_count, card_click_count, purchase_click_count');

  if (error) {
    console.error('Erro ao buscar overview de analytics:', error);
    return {
      totalViews: 0,
      totalCardClicks: 0,
      totalPurchaseClicks: 0,
      overallCardCTR: 0,
      overallPurchaseCTR: 0
    };
  }

  const totalViews = data.reduce((sum, product) => sum + (product.view_count || 0), 0);
  const totalCardClicks = data.reduce((sum, product) => sum + (product.card_click_count || 0), 0);
  const totalPurchaseClicks = data.reduce((sum, product) => sum + (product.purchase_click_count || 0), 0);
  const overallCardCTR = totalViews > 0 ? (totalCardClicks / totalViews) * 100 : 0;
  const overallPurchaseCTR = totalCardClicks > 0 ? (totalPurchaseClicks / totalCardClicks) * 100 : 0;

  return {
    totalViews,
    totalCardClicks,
    totalPurchaseClicks,
    overallCardCTR,
    overallPurchaseCTR
  };
}
