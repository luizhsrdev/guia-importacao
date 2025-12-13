'use client';

import { useState, useEffect, useRef } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AdminLink } from './AdminLink';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-surface border border-border" />
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border hover:bg-surface-elevated transition-colors"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={handleBackdropClick}
        >
          <div
            ref={menuRef}
            className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] bg-surface border-l border-border shadow-2xl animate-slideInRight flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold text-text-primary">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-elevated transition-colors"
                aria-label="Fechar menu"
              >
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Configurações</span>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-primary">Moeda</span>
                  <button
                    onClick={() => setCurrency(currency === 'CNY' ? 'BRL' : 'CNY')}
                    className="h-9 px-4 bg-surface-elevated rounded-lg border border-border text-sm font-medium text-primary"
                  >
                    {currency}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text-primary">Tema</span>
                  <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-elevated border border-border"
                    aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                  >
                    {isDark ? (
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              <SignedOut>
                <div className="space-y-3">
                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Conta</span>
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium text-text-primary bg-surface-elevated border border-border hover:bg-surface-overlay transition-colors"
                    >
                      Entrar
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
                    >
                      Criar Conta
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="space-y-3">
                  <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Navegação</span>
                  <div onClick={() => setIsOpen(false)}>
                    <AdminLink />
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
