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
      {/* LINHA 1: Nome + Categoria + Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-textMain mb-1 truncate">
            {seller.name}
          </h3>

          {/* Categoria */}
          {seller.seller_categories && (
            <div className="text-sm text-textSecondary">
              {seller.seller_categories.name}
            </div>
          )}
        </div>

        {/* Badge Gold/Blacklist */}
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-4 whitespace-nowrap ${
            isGold
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-red-600/20 text-red-400 border border-red-600/30'
          }`}
        >
          {isGold ? 'Lista Dourada' : 'Blacklist'}
        </span>
      </div>

      {/* FOTO DO VENDEDOR (quadrada, centralizada) */}
      {seller.image_url && (
        <div className="mb-4">
          <ImageLightbox
            src={seller.image_url}
            alt={seller.name}
            thumbnailClassName="w-full aspect-square object-cover rounded-lg"
          />
        </div>
      )}

      {/* CONTEÚDO CONDICIONAL (Gold vs Blacklist) */}
      {isGold ? (
        <>
          {/* Descrição Gold */}
          {seller.notes && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
              <h4 className="text-primary font-medium mb-2">Descrição:</h4>
              <p className="text-textSecondary text-sm leading-relaxed">
                {seller.notes}
              </p>
            </div>
          )}

          {/* Links Gold */}
          <div className="flex flex-col gap-2">
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
          {/* Motivo Blacklist */}
          {seller.blacklist_reason && (
            <div className="bg-red-950/20 border border-red-800 rounded-lg p-4 mb-4">
              <h4 className="text-red-400 font-medium mb-2">Motivo:</h4>
              <p className="text-textSecondary text-sm leading-relaxed">
                {seller.blacklist_reason}
              </p>
            </div>
          )}

          {/* Link Blacklist */}
          {seller.profile_link && (
            <a
              href={seller.profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg text-center font-medium hover:bg-red-600/30 transition-all mb-4"
            >
              Ver Perfil (Cuidado!)
            </a>
          )}

          {/* Link de prova adicional */}
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

          {/* Provas Blacklist */}
          {seller.evidence_images && seller.evidence_images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-textSecondary text-sm font-medium mb-2">
                Provas do Golpe:
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {seller.evidence_images.map((img, index) => (
                  <ImageLightbox
                    key={index}
                    src={img}
                    alt={`Prova ${index + 1}`}
                    thumbnailClassName="w-full aspect-square object-cover rounded-lg"
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
