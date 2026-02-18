'use client';

import ImageLightbox from './ImageLightbox';
import ReportAndFavoriteMenu from './ReportAndFavoriteMenu';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useSellerFavorites } from '@/hooks/useSellerFavorites';

interface Seller {
  id: string;
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
  seller_categories?: { name: string } | null;
}

interface SellerCardProps {
  seller: Seller;
  onEdit?: () => void;
}

export default function SellerCard({ seller, onEdit }: SellerCardProps) {
  const { isAdminModeActive } = useAdminMode();
  const { toggleFavorite, isFavorite } = useSellerFavorites();
  const isGold = seller.status === 'gold';

  return (
    <div
      className={`relative bg-surface rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 group ${
        isGold
          ? 'border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-glow-primary'
          : 'border-red-500/20 hover:border-red-500/50 hover:shadow-glow-danger'
      }`}
    >
      {/* Imagem com badges sobrepostos - igual ao ProductCard */}
      <div className="relative aspect-square overflow-hidden bg-surface-elevated">
        {seller.image_url ? (
          <ImageLightbox
            src={seller.image_url}
            alt={seller.name}
            thumbnailClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated">
            <svg className="w-16 h-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}

        {/* Badge de status (Verificado/Blacklist) - top left */}
        <div className={`absolute top-3 left-3 ${isGold ? 'badge-gold' : 'badge-danger'}`}>
          {isGold ? 'Verificado' : 'Blacklist'}
        </div>

        {/* Badge de Favorito - top right */}
        {isFavorite(seller.id) && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg animate-scaleIn">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Conteúdo do card */}
      <div className="p-4 sm:p-5">
        {/* Header com nome e menu */}
        <div className={`flex items-center justify-between gap-2 ${seller.seller_categories ? 'mb-1' : 'mb-4'}`}>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary truncate flex-1 min-w-0">
            {seller.name}
          </h3>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Menu de opções */}
            {!isAdminModeActive && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ReportAndFavoriteMenu
                  itemId={seller.id}
                  itemType="seller"
                  isFavorite={isFavorite(seller.id)}
                  onToggleFavorite={async () => { await toggleFavorite(seller.id); }}
                  className="relative"
                />
              </div>
            )}

            {isAdminModeActive && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors group/edit"
                title="Editar vendedor"
              >
                <svg className="w-3.5 h-3.5 text-blue-500 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categoria do vendedor */}
        {seller.seller_categories && (
          <p className="text-xs sm:text-sm text-text-secondary mb-4">
            {seller.seller_categories.name}
          </p>
        )}

        {isGold ? (
          <>
            {seller.notes && (
              <div className="bg-surface-elevated rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                <h4 className="text-primary text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Sobre o vendedor</h4>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {seller.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:gap-2.5">
              {seller.profile_link && (
                <a
                  href={seller.profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 sm:h-11 px-4 bg-surface-elevated text-text-primary rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-border hover:bg-surface-overlay transition-colors"
                >
                  Ver Perfil
                </a>
              )}

              {seller.feedback_link && (
                <a
                  href={seller.feedback_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 sm:h-11 px-4 bg-surface-elevated text-text-secondary rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-border hover:bg-surface-overlay transition-colors"
                >
                  Ver Avaliações
                </a>
              )}

              {seller.affiliate_link && (
                <a
                  href={seller.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 sm:h-11 px-4 bg-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                  Acessar Loja
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            {seller.blacklist_reason && (
              <div className="bg-red-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                <h4 className="text-red-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Motivo da denúncia</h4>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-3">
                  {seller.blacklist_reason}
                </p>
              </div>
            )}

            {seller.profile_link && (
              <a
                href={seller.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 sm:h-11 px-4 bg-red-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors mb-2 sm:mb-3"
              >
                Ver Perfil (Cuidado!)
              </a>
            )}

            {seller.proof_link && (
              <a
                href={seller.proof_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 sm:h-11 px-4 bg-surface-elevated text-text-primary rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium border border-border hover:bg-surface-overlay transition-colors mb-3 sm:mb-4"
              >
                Ver Comprovante
              </a>
            )}

            {seller.evidence_images && seller.evidence_images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-text-secondary text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  Evidências ({seller.evidence_images.length})
                </h4>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {seller.evidence_images.map((img, index) => (
                    <ImageLightbox
                      key={index}
                      src={img}
                      alt={`Evidência ${index + 1}`}
                      thumbnailClassName="w-full aspect-square object-cover rounded-md sm:rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
