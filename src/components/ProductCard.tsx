'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
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
}: ProductCardProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { formatPrice } = useCurrency();

  const conditionStyle = condition
    ? CONDITION_STYLES[condition as keyof typeof CONDITION_STYLES] ?? 'tag-neutral'
    : null;

  return (
    <>
      <article
        onClick={() => setDetailModalOpen(true)}
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

          <p className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight mt-auto">
            {formatPrice(price_cny)}
          </p>
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
