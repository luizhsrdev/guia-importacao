'use client';

import { useEffect, useRef } from 'react';

interface ProductDetailModalProps {
  product: {
    id: string;
    title: string;
    price_cny: string;
    image_main: string;
    category?: { name: string; slug?: string } | null;
    condition?: string;
    has_box?: boolean;
    has_charger?: boolean;
    has_warranty?: boolean;
    observations?: string;
    affiliate_link: string;
    original_link: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRequestUpgrade: () => void; // Callback para abrir popup premium
  isPremium: boolean;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onRequestUpgrade,
  isPremium
}: ProductDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Bloquear scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fechar ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleViewSeller = () => {
    if (isPremium) {
      window.open(product.original_link, '_blank');
    } else {
      onRequestUpgrade(); // Abre popup premium
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-surface rounded-xl border border-zinc-700 shadow-2xl
                   w-full max-w-4xl
                   max-md:h-screen max-md:rounded-none max-md:overflow-y-auto
                   animate-scaleIn"
      >
        {/* Botão X - Canto Superior Direito */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-textSecondary hover:text-textMain
                     transition-colors bg-zinc-900/80 rounded-full p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Layout Horizontal - Desktop / Vertical - Mobile */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Coluna Esquerda - Imagem */}
          <div className="flex items-center justify-center p-6 bg-zinc-900/30">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 max-w-xs shadow-lg">
              <img
                src={product.image_main}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Coluna Direita - Informações */}
          <div className="flex flex-col justify-between space-y-4 py-6 pr-6 pl-3">
            {/* 1. TOPO: Nome/Título + Preço */}
            <div>
              <h3 className="text-2xl font-bold text-textMain mb-2 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-3xl font-bold text-primary">{product.price_cny}</p>
            </div>

            {/* 2. DESCRIÇÃO (Observações) */}
            {product.observations && (
              <div className="bg-zinc-900/50 rounded-lg p-3">
                <h4 className="text-textSecondary text-xs uppercase tracking-wide mb-2">
                  Descrição
                </h4>
                <p className="text-textMain text-sm leading-relaxed">
                  {product.observations}
                </p>
              </div>
            )}

            {/* 3. CATEGORIA + CONDIÇÃO */}
            <div className="space-y-2">
              {product.category && (
                <div className="flex items-center gap-2">
                  <span className="text-textSecondary text-sm">Categoria:</span>
                  <span className="text-textMain font-medium">{product.category.name}</span>
                </div>
              )}

              {product.condition && (
                <div className="flex items-center gap-2">
                  <span className="text-textSecondary text-sm">Condição:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${product.condition === 'Lacrado' ? 'bg-primary/20 text-primary border border-primary/30' :
                      product.condition === 'Seminovo' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      product.condition === 'Usado' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-zinc-700/80 text-textSecondary border border-zinc-600'}`}>
                    {product.condition}
                  </span>
                </div>
              )}
            </div>

            {/* 4. CHECKBOXES (Sem emojis) */}
            <div className="bg-zinc-900/50 rounded-lg p-3 space-y-1.5 text-sm text-textMain">
              <div>{product.has_box ? 'Com' : 'Sem'} caixa original</div>
              <div>{product.has_charger ? 'Com' : 'Sem'} carregador</div>
              <div>{product.has_warranty ? 'Com' : 'Sem'} garantia</div>
            </div>

            {/* 5. BOTÕES */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => window.open(product.affiliate_link, '_blank')}
                className="w-full bg-primary text-background font-medium py-3 px-6 rounded-lg
                           hover:bg-primary/90 transition-colors"
              >
                Comprar
              </button>

              <button
                onClick={handleViewSeller}
                className="w-full bg-zinc-800 text-textMain font-medium py-3 px-6 rounded-lg
                           border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                Perfil do Vendedor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
