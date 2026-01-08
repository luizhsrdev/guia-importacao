'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FeatureItem } from './FeatureItem';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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
  const [isClosing, setIsClosing] = useState(false);

  // Lock body scroll when modal is open (prevents layout shift)
  useBodyScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`glass-strong rounded-xl shadow-elevation-4 w-full max-w-md p-6 ${
          isClosing ? 'animate-scaleOut' : 'animate-scaleIn'
        }`}
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent-gold/15 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Conteúdo Premium</h2>
          <p className="text-text-secondary text-sm">Acesso à Lista de Vendedores</p>
        </div>

        <div className="space-y-3 mb-6">
          <FeatureItem text="Lista Dourada de vendedores verificados" />
          <FeatureItem text="Blacklist com provas documentadas" />
          <FeatureItem text="Avaliações reais da comunidade" />
          <FeatureItem text="Acesso vitalício" />
        </div>

        <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-lg p-4 mb-6 text-center">
          <p className="text-3xl font-bold text-accent-gold mb-0.5">R$ 89,90</p>
          <p className="text-text-tertiary text-sm">Pagamento único via PIX</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-accent-gold text-background font-semibold py-3 px-6 rounded-md hover:bg-accent-gold/90 transition-colors active:scale-[0.98]"
          >
            Quero Ter Acesso
          </button>

          <button
            onClick={handleClose}
            className="w-full btn-ghost py-3 px-6 rounded-md"
          >
            Continuar no Plano Gratuito
          </button>
        </div>

        <p className="text-center text-text-tertiary text-xs mt-4">
          Garantia de 7 dias - devolvemos 100% se não ficar satisfeito
        </p>
      </div>
    </div>
  );
}
