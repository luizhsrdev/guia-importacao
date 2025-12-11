'use client';

import { useEffect, useRef } from 'react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
}: PremiumUpgradeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
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

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-xl border border-zinc-700 shadow-2xl
                   w-full max-w-md p-8
                   animate-scaleIn"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2">Conteúdo Premium</h2>
          <p className="text-textSecondary text-sm">Acesso à Lista de Vendedores</p>
        </div>

        {/* Benefícios */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-textMain font-semibold text-sm">Lista Dourada</h3>
              <p className="text-textSecondary text-xs">Vendedores verificados pela comunidade</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-textMain font-semibold text-sm">Blacklist</h3>
              <p className="text-textSecondary text-xs">Vendedores denunciados (+ evidências)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-textMain font-semibold text-sm">Avaliações Reais</h3>
              <p className="text-textSecondary text-xs">Análises de quem já comprou</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-textMain font-semibold text-sm">Acesso Vitalício</h3>
              <p className="text-textSecondary text-xs">Pagamento único de R$ 89,90</p>
            </div>
          </div>
        </div>

        {/* Preço */}
        <div className="bg-zinc-900/50 rounded-lg p-4 mb-6 text-center border border-zinc-800">
          <p className="text-4xl font-bold text-primary mb-1">R$ 89,90</p>
          <p className="text-textSecondary text-sm">Pagamento único via PIX</p>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-primary text-background font-bold py-3 px-6 rounded-lg
                       hover:bg-primary/90 transition-colors"
          >
            Quero Ter Acesso Seguro
          </button>

          <button
            onClick={onClose}
            className="w-full bg-transparent text-textSecondary font-medium py-3 px-6 rounded-lg
                       border border-zinc-700 hover:bg-zinc-800 hover:text-textMain transition-colors"
          >
            Não, Prefiro Continuar no Plano Gratuito
          </button>
        </div>

        {/* Garantia */}
        <p className="text-center text-xs text-textSecondary mt-4">
          Garantia de 7 dias - Se não gostar, devolvemos seu dinheiro
        </p>
      </div>
    </div>
  );
}
