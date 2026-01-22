'use client';

import ImageLightbox from './ImageLightbox';
import ReportAndFavoriteMenu from './ReportAndFavoriteMenu';
import FavoriteBadge from './FavoriteBadge';
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
      className={`relative bg-surface rounded-2xl p-5 sm:p-6 border shadow-sm transition-all duration-300 group ${
        isGold
          ? 'border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-glow-primary'
          : 'border-red-500/20 hover:border-red-500/50 hover:shadow-glow-danger'
      }`}
    >
      {/* Menu de Três Pontos e Badge de Favorito */}
      {!isAdminModeActive && (
        <>
          <ReportAndFavoriteMenu
            itemId={seller.id}
            itemType="seller"
            isFavorite={isFavorite(seller.id)}
            onToggleFavorite={async () => { await toggleFavorite(seller.id); }}
            className="top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          />
          {isFavorite(seller.id) && <FavoriteBadge className="top-3 left-3 z-10" />}
        </>
      )}

      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-0.5 sm:mb-1 truncate">
            {seller.name}
          </h3>

          {seller.seller_categories && (
            <p className="text-xs sm:text-sm text-text-secondary">
              {seller.seller_categories.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={isGold ? 'badge-gold' : 'badge-danger'}>
            {isGold ? 'Verificado' : 'Blacklist'}
          </span>

          {isAdminModeActive && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors group/edit"
              title="Editar vendedor"
            >
              <svg className="w-3.5 h-3.5 text-red-500 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {seller.image_url && (
        <div className="mb-4 sm:mb-5">
          <ImageLightbox
            src={seller.image_url}
            alt={seller.name}
            thumbnailClassName="w-full aspect-square object-cover rounded-lg sm:rounded-xl"
          />
        </div>
      )}

      {isGold ? (
        <>
          {seller.notes && (
            <div className="bg-surface-elevated rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
              <h4 className="text-primary text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Sobre o vendedor</h4>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
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
            <div className="bg-red-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5">
              <h4 className="text-red-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Motivo da denúncia</h4>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
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
            <div className="mt-4 sm:mt-5">
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
  );
}
