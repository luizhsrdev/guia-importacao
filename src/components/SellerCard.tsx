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
      className={`bg-surface rounded-xl p-6 border-2 transition-all hover:scale-[1.02] ${
        isGold
          ? 'border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20'
          : 'border-red-600/30 hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20'
      }`}
    >
      {/* Header: Nome + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
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
      </div>

      {/* Categoria */}
      {seller.seller_categories && (
        <div className="text-sm text-textSecondary mb-4">
          <span className="font-medium">Categoria:</span>{' '}
          {seller.seller_categories.name}
        </div>
      )}

      {/* Conteúdo condicional Gold/Blacklist */}
      {isGold ? (
        <>
          {/* Descrição em quadrado destacado (igual ao Blacklist) */}
          {seller.notes && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <h4 className="text-primary font-medium mb-2">Descrição:</h4>
              <p className="text-textSecondary text-sm leading-relaxed">
                {seller.notes}
              </p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-col gap-2 mb-4">
            {seller.profile_link && (
              <a
                href={seller.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg text-center font-medium hover:bg-primary/30 transition-all"
              >
                Ver Perfil
              </a>
            )}

            {seller.feedback_link && (
              <a
                href={seller.feedback_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-800 text-textMain border border-zinc-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-zinc-700 transition-all"
              >
                Ver Avaliações
              </a>
            )}

            {seller.affiliate_link && (
              <a
                href={seller.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-background px-4 py-2 rounded-lg text-center font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Acessar Loja
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Motivo do golpe */}
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

          {/* Link do perfil (cuidado) */}
          {seller.profile_link && (
            <a
              href={seller.profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-red-600/20 text-danger border border-red-600/30 px-4 py-2 rounded-lg text-center font-medium hover:bg-red-600/30 transition-all mb-4"
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
              className="block bg-zinc-800 text-textMain border border-zinc-700 px-4 py-2 rounded-lg text-center font-medium hover:bg-zinc-700 transition-all mb-4"
            >
              Ver Link de Prova
            </a>
          )}
        </>
      )}

      {/* FOTO PRINCIPAL (última, antes de provas) */}
      {seller.image_url && (
        <div className="mt-4">
          <h4 className="text-textSecondary text-sm font-medium mb-2">
            Foto do Vendedor:
          </h4>
          <ImageLightbox src={seller.image_url} alt={seller.name} />
        </div>
      )}

      {/* PROVAS (apenas Blacklist) */}
      {!isGold &&
        seller.evidence_images &&
        seller.evidence_images.length > 0 && (
          <div className="mt-4">
            <h4 className="text-danger text-sm font-semibold mb-2 flex items-center gap-2">
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
            <div className="grid grid-cols-3 gap-2">
              {seller.evidence_images.map((img, index) => (
                <ImageLightbox
                  key={index}
                  src={img}
                  alt={`${seller.name} - Prova ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
