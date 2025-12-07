'use client';

import ImageLightbox from './ImageLightbox';

interface Seller {
  id: string;
  name: string;
  status: 'gold' | 'blacklist';
  category_id?: string;
  notes?: string;
  rating?: string;
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
      className={`bg-surface rounded-xl p-6 border-2 transition-all hover:scale-[1.02] ${
        isGold
          ? 'border-primary/30 hover:border-primary hover:shadow-[0_8px_24px_rgba(0,255,157,0.15)]'
          : 'border-red-600/30 hover:border-red-600 hover:shadow-[0_8px_24px_rgba(220,38,38,0.15)]'
      }`}
    >
      {/* Header com nome e badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-textMain mb-2">
            {seller.name}
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isGold
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-red-600/20 text-red-400 border border-red-600/30'
            }`}
          >
            {isGold ? 'Lista Dourada' : 'Blacklist'}
          </span>
        </div>

        {/* Imagem do vendedor (se houver) */}
        {seller.image_url && (
          <img
            src={seller.image_url}
            alt={seller.name}
            className="w-20 h-20 rounded-lg object-cover border-2 border-zinc-700"
          />
        )}
      </div>

      {/* Categoria */}
      {seller.seller_categories && (
        <div className="text-sm text-textSecondary mb-4">
          <span className="font-medium">Categoria:</span>{' '}
          {seller.seller_categories.name}
        </div>
      )}

      {/* Conteúdo condicional */}
      {isGold ? (
        <>
          {/* Gold: Descrição + Rating + Links */}
          {seller.notes && (
            <div className="p-4 bg-background rounded-lg mb-4">
              <p className="text-textSecondary text-sm leading-relaxed">
                {seller.notes}
              </p>
            </div>
          )}

          {seller.rating && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg w-fit">
              <span className="text-textSecondary text-sm font-medium">Rating:</span>
              <span className="text-textMain font-medium">{seller.rating}</span>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {seller.profile_link && (
              <a
                href={seller.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] bg-primary/20 text-primary border border-primary/30
                  px-4 py-2 rounded-lg text-center font-medium hover:bg-primary/30 transition-all
                  shadow-lg shadow-primary/10 hover:shadow-primary/20"
              >
                Ver Perfil
              </a>
            )}

            {seller.feedback_link && (
              <a
                href={seller.feedback_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] bg-zinc-800 text-textMain border border-zinc-700
                  px-4 py-2 rounded-lg text-center font-medium hover:bg-zinc-700 transition-all"
              >
                Ver Avaliações
              </a>
            )}

            {seller.affiliate_link && (
              <a
                href={seller.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] bg-primary text-background border border-primary
                  px-4 py-2 rounded-lg text-center font-bold hover:bg-primary/90 transition-all
                  shadow-lg shadow-primary/20"
              >
                Link Afiliado
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Blacklist: Motivo + Provas */}
          {seller.blacklist_reason && (
            <div className="bg-red-950/20 border border-red-800 rounded-lg p-4 mb-4">
              <h4 className="text-danger font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Motivo da Blacklist:
              </h4>
              <p className="text-textSecondary text-sm leading-relaxed">
                {seller.blacklist_reason}
              </p>
            </div>
          )}

          {/* Link do perfil */}
          {seller.profile_link && (
            <a
              href={seller.profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-red-600/20 text-danger border border-red-600/30
                px-4 py-2.5 rounded-lg text-center font-medium hover:bg-red-600/30 transition-all mb-4
                shadow-lg shadow-red-600/10"
            >
              Ver Perfil (Cuidado!)
            </a>
          )}

          {/* Link de prova */}
          {seller.proof_link && (
            <a
              href={seller.proof_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-zinc-800 text-textMain border border-zinc-700
                px-4 py-2.5 rounded-lg text-center font-medium hover:bg-zinc-700 transition-all mb-4"
            >
              Ver Link de Prova
            </a>
          )}

          {/* Provas (evidence_images) */}
          {seller.evidence_images && seller.evidence_images.length > 0 && (
            <div>
              <h4 className="text-danger text-sm font-semibold mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Evidências do Golpe ({seller.evidence_images.length}):
              </h4>
              <ImageLightbox
                src={seller.evidence_images}
                alt={`${seller.name} - Evidências`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
