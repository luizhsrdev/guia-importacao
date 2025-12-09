'use client';

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
}

export default function ProductCard({
  title,
  price_cny,
  image_main,
  image_hover,
  affiliate_link,
  is_sold_out,
  category,
}: ProductCardProps) {
  return (
    <a
      href={affiliate_link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block bg-surface rounded-xl overflow-hidden border border-textSecondary/20 hover:border-primary/50 transition-all hover:shadow-xl"
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

        {/* Badge de Categoria */}
        {category && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-textMain border border-primary/20">
            {category.name}
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
    </a>
  );
}
