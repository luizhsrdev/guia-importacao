'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AdminLink } from './AdminLink';
import { Logo } from './Logo';
import type { Category, UserStatus } from '@/types';

const ICONS = {
  notebooks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  vendedores: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  calculator: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  peripherals: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  more: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

interface MenuContentProps {
  onClose: () => void;
  categories: Category[];
  onCategorySelect: (categoryId: string | null) => void;
  onTabChange: (tab: string) => void;
  userStatus: UserStatus;
  onPremiumClick: () => void;
}

function MenuContent({
  onClose,
  categories,
  onCategorySelect,
  onTabChange,
  userStatus,
  onPremiumClick,
}: MenuContentProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const appleCategories = categories.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('apple') ||
      name.includes('iphone') ||
      name.includes('ipad') ||
      name.includes('macbook') ||
      name.includes('airpods') ||
      (name.includes('watch') && name.includes('apple'))
    );
  });

  const peripheralCategories = categories.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('teclado') ||
      name.includes('mouse') ||
      name.includes('headset') ||
      name.includes('fone') ||
      name.includes('monitor') ||
      name.includes('periférico') ||
      name.includes('periferico') ||
      name.includes('acessório') ||
      name.includes('acessorio')
    );
  });

  const otherCategories = categories.filter(
    (c) => !appleCategories.includes(c) && !peripheralCategories.includes(c)
  );

  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect(categoryId);
    onTabChange('produtos');
    onClose();
  };

  const handleVendedoresClick = () => {
    if (!userStatus.isAuthenticated) {
      window.location.href = '/sign-in';
      return;
    }

    if (userStatus.isPremium || userStatus.isAdmin) {
      onTabChange('vendedores');
      onClose();
      return;
    }

    onPremiumClick();
    onClose();
  };

  const isVendedoresLocked = !userStatus.isAuthenticated || (!userStatus.isPremium && !userStatus.isAdmin);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[99999] isolate"
      onClick={onClose}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-surface border-r border-border shadow-2xl animate-slideInLeft flex flex-col z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {/* Notebooks / Apple */}
            {appleCategories.length > 0 && (
              <div className="mb-2">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  {ICONS.notebooks}
                  Apple
                </button>
                <div className="ml-8 space-y-0.5">
                  {appleCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="block w-full py-2 px-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vendedores */}
            <button
              onClick={handleVendedoresClick}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors"
            >
              {ICONS.vendedores}
              Vendedores
              {isVendedoresLocked && (
                <span className="tag-gold text-[9px] px-1.5 h-4 ml-auto">Pro</span>
              )}
            </button>

            {/* Calculadora */}
            <a
              href="/calculadora"
              onClick={onClose}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors"
            >
              {ICONS.calculator}
              Calculadora
            </a>

            {/* Periféricos */}
            {peripheralCategories.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-text-primary">
                  {ICONS.peripherals}
                  Periféricos
                </div>
                <div className="ml-8 space-y-0.5">
                  {peripheralCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="block w-full py-2 px-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mais */}
            {otherCategories.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2.5 px-3 text-sm font-medium text-text-primary">
                  {ICONS.more}
                  Mais
                </div>
                <div className="ml-8 space-y-0.5">
                  {otherCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="block w-full py-2 px-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <SignedIn>
              <div onClick={onClose} className="pt-2">
                <AdminLink />
              </div>
            </SignedIn>
          </nav>

          <div className="h-px bg-border mx-3" />

          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between py-2 px-3">
              <span className="text-sm text-text-secondary">Moeda</span>
              <button
                onClick={() => setCurrency(currency === 'CNY' ? 'BRL' : 'CNY')}
                className="h-8 px-3 bg-surface-elevated rounded-lg border border-border text-sm font-medium text-primary"
              >
                {currency}
              </button>
            </div>

            <div className="flex items-center justify-between py-2 px-3">
              <span className="text-sm text-text-secondary">Tema</span>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-elevated border border-border"
                aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {isDark ? (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <SignedOut>
            <div className="p-3 pt-0">
              <SignInButton mode="modal">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                >
                  Entrar
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}

interface MobileMenuProps {
  categories: Category[];
  onCategorySelect: (categoryId: string | null) => void;
  onTabChange: (tab: string) => void;
  userStatus: UserStatus;
  onPremiumClick: () => void;
}

export function MobileMenu({
  categories,
  onCategorySelect,
  onTabChange,
  userStatus,
  onPremiumClick,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

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

      {isOpen && createPortal(
        <MenuContent
          onClose={() => setIsOpen(false)}
          categories={categories}
          onCategorySelect={onCategorySelect}
          onTabChange={onTabChange}
          userStatus={userStatus}
          onPremiumClick={onPremiumClick}
        />,
        document.body
      )}
    </>
  );
}
