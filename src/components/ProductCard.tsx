'use client';

import { useState } from 'react';
import ProductDetailModal from './ProductDetailModal';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface ProductCardProps {
  id: string;
  title: string;
  price_cny: string;
  image_main: string;
  image_hover?: string;
  affiliate_link: string;
  is_sold_out: boolean;
  category?: {
    name: string;
    slug?: string;
  } | null;
  condition?: string;
  observations?: string;
  original_link: string;
  has_box?: boolean;
  has_charger?: boolean;
  has_warranty?: boolean;
  isPremium: boolean;
}

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
  original_link,
  has_box,
  has_charger,
  has_warranty,
  isPremium,
}: ProductCardProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  return (
    <>
      {/* Card - Ao clicar abre modal */}
      <div
        onClick={() => setDetailModalOpen(true)}
        className="group relative block bg-surface rounded-xl overflow-hidden border border-textSecondary/20 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer"
      >
        {/* Container da Imagem com Hover Effect */}
        <div className="relative aspect-square overflow-hidden bg-background">
          {/* Imagem principal (sempre visível) */}
          <img
            src={image_main}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Imagem hover (aparece no hover) */}
          {image_hover && (
            <img
              src={image_hover}
              alt={`${title} - hover`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}

          {/* Badge de Condição */}
          {condition && (
            <div
              className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-medium ${
                condition === 'Lacrado'
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : condition === 'Seminovo'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : condition === 'Usado'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-zinc-700/80 text-textSecondary border border-zinc-600'
              }`}
            >
              {condition}
            </div>
          )}

          {/* Badge de Esgotado */}
          {is_sold_out && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="px-6 py-3 bg-danger text-white font-bold text-lg rounded-lg">
                ESGOTADO
              </span>
            </div>
          )}
        </div>

        {/* Info do Produto */}
        <div className="p-4">
          <h3 className="text-textMain font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {observations && (
            <p className="text-xs text-textSecondary truncate mb-2">
              {observations.substring(0, 50)}
              {observations.length > 50 ? '...' : ''}
            </p>
          )}
          <p className="text-primary font-bold text-lg">{price_cny}</p>
        </div>

        {/* Indicador de Link Externo */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-4 h-4 text-background"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>

      {/* Modal de Detalhes */}
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
          original_link,
        }}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onRequestUpgrade={() => {
          // NÃO fecha o modal de produto - apenas abre upgrade (sobrepõe)
          setUpgradeModalOpen(true);
        }}
        isPremium={isPremium}
      />

      {/* Modal de Upgrade Premium */}
      <PremiumUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => {
          // Apenas fecha o upgrade - produto já está aberto
          setUpgradeModalOpen(false);
        }}
        onUpgrade={() => {
          window.location.href = '/premium';
        }}
      />
    </>
  );
}
