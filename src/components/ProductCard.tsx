'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { trackProductView, trackProductCardClick, trackProductPurchaseClick } from '@/lib/analytics';
import ProductDetailModal from './ProductDetailModal';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface CategoryLike {
  name: string;
  slug?: string;
}

interface ProductCardProps {
  id: string;
  title: string;
  price_cny: string;
  image_main: string;
  image_hover?: string;
  affiliate_link: string;
  is_sold_out: boolean;
  category?: CategoryLike | CategoryLike[] | null;
  condition?: string;
  observations?: string;
  has_box?: boolean;
  has_charger?: boolean;
  has_warranty?: boolean;
  isPremium: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showMetrics?: boolean;
  view_count?: number;
  card_click_count?: number;
  purchase_click_count?: number;
  card_ctr?: number;
  purchase_ctr?: number;
}

const CONDITION_STYLES = {
  Lacrado: 'tag-primary',
  Seminovo: 'tag-blue',
  Usado: 'tag-gold',
  Aberto: 'tag-neutral',
  'Com Defeito': 'tag-danger',
} as const;

export default function ProductCard({
  id,
  title,
  price_cny,
  image_main,
  image_hover,
  affiliate_link,
  is_sold_out,
  category,
  condition,
  observations,
  has_box,
  has_charger,
  has_warranty,
  isPremium,
  onEdit,
  onDelete,
  showMetrics = false,
  view_count = 0,
  card_click_count = 0,
  purchase_click_count = 0,
  card_ctr = 0,
  purchase_ctr = 0,
}: ProductCardProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { formatPrice } = useCurrency();
  const { isAdminModeActive } = useAdminMode();
  const viewTracked = useRef(false);

  // Rastrear visualização (apenas 1x por sessão)
  useEffect(() => {
    if (!viewTracked.current && id) {
      trackProductView(id);
      viewTracked.current = true;
    }
  }, [id]);

  const conditionStyle = condition
    ? CONDITION_STYLES[condition as keyof typeof CONDITION_STYLES] ?? 'tag-neutral'
    : null;

  // Rastrear clique no card (ao expandir)
  const handleCardClick = () => {
    trackProductCardClick(id);
    setDetailModalOpen(true);
  };

  // Determinar cor do CTR
  const getCTRColor = (ctr: number) => {
    if (ctr >= 10) return 'text-emerald-500';
    if (ctr >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative bg-surface rounded-2xl overflow-hidden border border-border cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-border-emphasis transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-surface-elevated">
          <img
            src={image_main}
            alt={title}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none"
          />

          {image_hover && (
            <img
              src={image_hover}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 select-none"
            />
          )}

          {condition && conditionStyle && (
            <div className={`absolute top-3 left-3 ${conditionStyle}`}>
              {condition}
            </div>
          )}

          {is_sold_out && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center">
              <span className="tag-danger">
                Esgotado
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-3 sm:p-4 flex flex-col">
          <h3 className="text-text-primary font-medium mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm leading-snug tracking-tight">
            {title}
          </h3>

          <div className="mb-2 hidden sm:block min-h-[2.5rem]">
            {observations && (
              <p className="text-[11px] sm:text-xs text-text-muted line-clamp-2 overflow-hidden leading-tight">
                {observations}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <p className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight">
              {formatPrice(price_cny)}
            </p>

            {isAdminModeActive && (onEdit || onDelete) && (
              <div className="flex items-center gap-1.5">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors group/edit"
                    title="Editar produto"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-500 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors group/delete"
                    title="Deletar produto"
                  >
                    <svg className="w-3.5 h-3.5 text-red-500 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Seção de Métricas (apenas quando showMetrics ativo) */}
          {showMetrics && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              {/* Linha 1: Contadores */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-text-muted">
                <div className="flex items-center gap-1" title="Visualizações">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{view_count}</span>
                </div>
                <div className="flex items-center gap-1" title="Cliques no Card">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span>{card_click_count}</span>
                </div>
                <div className="flex items-center gap-1" title="Cliques para Compra">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{purchase_click_count}</span>
                </div>
              </div>

              {/* Linha 2: CTRs */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div>
                  <span className="text-text-muted">Card: </span>
                  <span className={`font-semibold ${getCTRColor(card_ctr)}`}>
                    {card_ctr.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Compra: </span>
                  <span className={`font-semibold ${getCTRColor(purchase_ctr)}`}>
                    {purchase_ctr.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      <ProductDetailModal
        product={{
          id,
          title,
          price_cny,
          image_main,
          category,
          condition,
          has_box,
          has_charger,
          has_warranty,
          observations,
          affiliate_link,
        }}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onRequestUpgrade={() => {
          setUpgradeModalOpen(true);
        }}
        isPremium={isPremium}
      />

      <PremiumUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => {
          setUpgradeModalOpen(false);
        }}
        onUpgrade={() => {
          window.location.href = '/premium';
        }}
      />
    </>
  );
}
