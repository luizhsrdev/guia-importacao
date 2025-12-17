'use client';

import ImageLightbox from './ImageLightbox';

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
}

export default function SellerCard({ seller }: SellerCardProps) {
  const isGold = seller.status === 'gold';

  return (
    <div
      className={`bg-surface rounded-2xl p-5 sm:p-6 border shadow-sm transition-all duration-300 ${
        isGold
          ? 'border-amber-500/20 hover:border-amber-500/50 hover:shadow-glow-gold'
          : 'border-red-500/20 hover:border-red-500/50 hover:shadow-glow-danger'
      }`}
    >
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

        <span className={isGold ? 'badge-gold' : 'badge-danger'}>
          {isGold ? 'Verificado' : 'Blacklist'}
        </span>
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
              <h4 className="text-amber-400 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Sobre o vendedor</h4>
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
