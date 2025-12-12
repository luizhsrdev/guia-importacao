'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getProductOriginalLink } from '@/app/actions';

interface CategoryLike {
  name: string;
  slug?: string;
}

function getCategoryName(category: CategoryLike | CategoryLike[] | null | undefined): string | null {
  if (!category) return null;
  if (Array.isArray(category)) return category[0]?.name ?? null;
  return category.name;
}

interface ProductDetailModalProps {
  product: {
    id: string;
    title: string;
    price_cny: string;
    image_main: string;
    category?: CategoryLike | CategoryLike[] | null;
    condition?: string;
    has_box?: boolean;
    has_charger?: boolean;
    has_warranty?: boolean;
    observations?: string;
    affiliate_link: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRequestUpgrade: () => void;
  isPremium: boolean;
}

const CONDITION_STYLES = {
  Lacrado: 'badge-primary',
  Seminovo: 'badge-blue',
  Usado: 'badge-gold',
} as const;

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onRequestUpgrade,
  isPremium
}: ProductDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { formatPrice, currency } = useCurrency();
  const [isClosing, setIsClosing] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const handleViewSeller = async () => {
    if (!isPremium) {
      handleClose();
      setTimeout(() => {
        onRequestUpgrade();
      }, 200);
      return;
    }

    setIsLoadingLink(true);
    const result = await getProductOriginalLink(product.id);
    setIsLoadingLink(false);

    if (result.success && result.originalLink) {
      window.open(result.originalLink, '_blank');
    }
  };

  const conditionStyle = product.condition
    ? CONDITION_STYLES[product.condition as keyof typeof CONDITION_STYLES] ?? 'badge-neutral'
    : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative glass-strong rounded-xl shadow-elevation-4 w-full max-w-4xl max-md:h-screen max-md:rounded-none max-md:overflow-y-auto ${
          isClosing ? 'animate-scaleOut' : 'animate-scaleIn'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 btn-ghost p-2 rounded-md"
          aria-label="Fechar modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="flex items-center justify-center p-6 bg-background-secondary/50">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background max-w-sm shadow-elevation-2">
              <img
                src={product.image_main}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4 p-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-3 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(product.price_cny)}
              </p>
              {currency === 'BRL' && (
                <p className="text-sm text-text-tertiary mt-1">
                  ¥ {product.price_cny}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {getCategoryName(product.category) && (
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary text-sm">Categoria:</span>
                  <span className="text-text-primary text-sm">{getCategoryName(product.category)}</span>
                </div>
              )}

              {product.condition && conditionStyle && (
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary text-sm">Condição:</span>
                  <span className={conditionStyle}>{product.condition}</span>
                </div>
              )}
            </div>

            {(product.has_box || product.has_charger || product.has_warranty) && (
              <div className="bg-surface-elevated rounded-md p-4">
                <h4 className="text-text-secondary text-sm font-medium mb-2">Acompanha:</h4>
                <ul className="space-y-1.5 text-sm text-text-primary">
                  {product.has_box && (
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Caixa original
                    </li>
                  )}
                  {product.has_charger && (
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Carregador
                    </li>
                  )}
                  {product.has_warranty && (
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Garantia
                    </li>
                  )}
                </ul>
              </div>
            )}

            {product.observations && (
              <div className="bg-surface-elevated rounded-md p-4">
                <h4 className="text-text-secondary text-sm font-medium mb-2">Descrição:</h4>
                <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
                  {product.observations}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => window.open(product.affiliate_link, '_blank')}
                className="btn-primary py-3 px-6 rounded-md font-medium"
              >
                Comprar
              </button>

              <button
                onClick={handleViewSeller}
                disabled={isLoadingLink}
                className="btn-secondary py-3 px-6 rounded-md disabled:opacity-50"
              >
                {isLoadingLink ? 'Carregando...' : isPremium ? 'Perfil do Vendedor' : 'Ver Vendedor (Premium)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
