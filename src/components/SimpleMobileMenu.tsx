'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Logo } from './Logo';
import type { UserStatus } from '@/types';

const SWIPE_THRESHOLD = 80;

interface SimpleMobileMenuProps {
  userStatus: UserStatus;
  onPremiumClick: () => void;
  showExchangeRateOnHome: boolean;
  onToggleExchangeRateVisibility: () => void;
}

const ICONS = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  cotacao: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calculadora: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  ferramentas: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
    </svg>
  ),
  vendedores: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

function MenuContent({
  onClose,
  userStatus,
  onPremiumClick,
  showExchangeRateOnHome,
  onToggleExchangeRateVisibility,
}: {
  onClose: () => void;
  userStatus: UserStatus;
  onPremiumClick: () => void;
  showExchangeRateOnHome: boolean;
  onToggleExchangeRateVisibility: () => void;
}) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { effectiveRate, loading: rateLoading } = useCurrency();
  const isDark = resolvedTheme === 'dark';
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const pathname = usePathname();

  useBodyScrollLock(true);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > SWIPE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const isVendedoresLocked = !userStatus.isAuthenticated || (!userStatus.isPremium && !userStatus.isAdmin);

  const handleVendedoresClick = () => {
    if (!userStatus.isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    if (!userStatus.isPremium && !userStatus.isAdmin) {
      onPremiumClick();
      return;
    }

    router.push('/vendedores');
    onClose();
  };

  const navItems = [
    { href: '/', label: 'Produtos', icon: ICONS.home },
    { href: '/cotacao', label: 'Cotação', icon: ICONS.cotacao },
    { href: '/calculator', label: 'Calculadora', icon: ICONS.calculadora },
    { href: '/tools', label: 'Ferramentas', icon: ICONS.ferramentas },
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain p-5 space-y-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          {/* Exchange Rate */}
          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Cotação atual</p>
                <p className="text-lg font-semibold text-text-primary">
                  {rateLoading ? '...' : `R$1 ≈ ¥${effectiveRate.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider px-1 mb-3">Navegação</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <span className={isActive ? 'text-primary' : 'text-text-muted'}>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Vendedores */}
            <button
              onClick={handleVendedoresClick}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                pathname === '/vendedores'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-primary hover:bg-surface-elevated'
              }`}
            >
              <span className={pathname === '/vendedores' ? 'text-primary' : 'text-text-muted'}>{ICONS.vendedores}</span>
              <span className="font-medium">Vendedores</span>
              {isVendedoresLocked && (
                <span className="tag-gold text-[10px] px-2 py-0.5 ml-auto">Pro</span>
              )}
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider px-1 mb-3">Configurações</p>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-text-muted">
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
                <span className="font-medium text-text-primary">Tema {isDark ? 'Escuro' : 'Claro'}</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${isDark ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {/* Exchange Rate Toggle */}
            <button
              onClick={onToggleExchangeRateVisibility}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-text-muted">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
                <span className="font-medium text-text-primary">Cotação no header</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${showExchangeRateOnHome ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${showExchangeRateOnHome ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Sign In (if not authenticated) */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full p-4 rounded-xl bg-primary text-black font-semibold text-center">
                Entrar na conta
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}

export function SimpleMobileMenu({
  userStatus,
  onPremiumClick,
  showExchangeRateOnHome,
  onToggleExchangeRateVisibility,
}: SimpleMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        aria-label="Menu"
      >
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <MenuContent
          onClose={() => setIsOpen(false)}
          userStatus={userStatus}
          onPremiumClick={onPremiumClick}
          showExchangeRateOnHome={showExchangeRateOnHome}
          onToggleExchangeRateVisibility={onToggleExchangeRateVisibility}
        />,
        document.body
      )}
    </>
  );
}
