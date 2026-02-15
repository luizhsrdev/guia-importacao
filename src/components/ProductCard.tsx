'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useFavorites } from '@/hooks/useFavorites';
import { trackProductView, trackProductCardClick, trackProductPurchaseClick } from '@/lib/analytics';
import ProductDetailModal from './ProductDetailModal';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import ExchangeRateBadge from './ExchangeRateBadge';

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
  const router = useRouter();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdminModeActive } = useAdminMode();
  const { toggleFavorite, isFavorite, isSignedIn } = useFavorites();
  const viewTracked = useRef(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

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

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
        setShowReportMenu(false);
      }
    };

    if (showOptionsMenu || showReportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu, showReportMenu]);

  // Abrir menu de report e fechar menu principal
  const handleOpenReportMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(false);
    setShowReportMenu(true);
  };

  // Selecionar tipo de report e abrir modal de confirmação
  const handleSelectReportType = (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReportType(type);
    setShowReportMenu(false);
    setShowConfirmModal(true);
  };

  // Confirmar e enviar report
  const handleConfirmReport = async () => {
    if (!selectedReportType || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          report_type: selectedReportType,
          description: selectedReportType === 'other' ? reportDescription : null,
        }),
      });

      if (response.ok) {
        toast.success('Obrigado pelo report!');
        setShowConfirmModal(false);
        setSelectedReportType(null);
        setReportDescription('');
      } else if (response.status === 429) {
        const data = await response.json();
        toast.error(data.error || 'Você já reportou esse problema recentemente.');
      } else {
        toast.error('Erro ao enviar report. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar report:', error);
      toast.error('Erro ao enviar report. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar report
  const handleCancelReport = () => {
    setShowConfirmModal(false);
    setSelectedReportType(null);
    setReportDescription('');
  };

  // Favoritar produto
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptionsMenu(false);
    await toggleFavorite(id);
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

          {/* Badge de Favorito */}
          {isFavorite(id) && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg animate-scaleIn">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
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

          <ExchangeRateBadge priceCNY={price_cny} className="mb-2" />

          <div className="mb-2 hidden sm:block min-h-[2.5rem]">
            {observations && (
              <p className="text-[11px] sm:text-xs text-text-muted line-clamp-2 overflow-hidden leading-tight">
                {observations}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end mt-auto">
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

        {/* Menu de Três Pontos - Não aparece no modo admin */}
        {!isAdminModeActive && !is_sold_out && (
          <div
            ref={optionsMenuRef}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de Três Pontos */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(!showOptionsMenu);
                setShowReportMenu(false);
              }}
              className="w-8 h-8 rounded-lg bg-surface-elevated/90 backdrop-blur-sm border border-border hover:border-border-emphasis transition-all flex items-center justify-center"
              title="Opções"
            >
              <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {/* Dropdown: Opções Principais */}
            {showOptionsMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-44 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-dropdown z-10">
                <button
                  onClick={handleToggleFavorite}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  {isFavorite(id) ? (
                    <>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>Remover favorito</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Favoritar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleOpenReportMenu}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-surface-elevated transition-colors border-t border-border"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Reportar</span>
                </button>
              </div>
            )}

            {/* Dropdown: Opções de Report */}
            {showReportMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-dropdown z-10">
                <div className="px-4 py-2 bg-surface-elevated border-b border-border">
                  <p className="text-xs font-medium text-text-primary">Qual o problema?</p>
                </div>
                <button
                  onClick={(e) => handleSelectReportType('out_of_stock', e)}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  Item Esgotado
                </button>
                <button
                  onClick={(e) => handleSelectReportType('broken_link', e)}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  Link Quebrado/Não Funciona
                </button>
                <button
                  onClick={(e) => handleSelectReportType('seller_not_responding', e)}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  Vendedor não responde
                </button>
                <button
                  onClick={(e) => handleSelectReportType('wrong_price', e)}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  Preço diferente
                </button>
                <button
                  onClick={(e) => handleSelectReportType('other', e)}
                  className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors border-t border-border"
                >
                  Outro motivo
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Modal de Confirmação de Report */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          onClick={handleCancelReport}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md m-4 border border-border animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Confirmar Report</h3>
                  <p className="text-sm text-text-muted">Tem certeza que deseja reportar este anúncio?</p>
                </div>
              </div>

              {selectedReportType === 'other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Descreva o problema:
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Digite aqui o motivo do report..."
                    className="w-full h-24 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
                    maxLength={500}
                  />
                  <p className="text-xs text-text-muted mt-1 text-right">
                    {reportDescription.length}/500
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancelReport}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-emphasis transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReport}
                  disabled={isSubmitting || (selectedReportType === 'other' && !reportDescription.trim())}
                  className="flex-1 px-4 py-2.5 bg-red-500 rounded-lg text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    'Confirmar Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => router.push('/premium')}
      />
    </>
  );
}
