'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Logo } from './Logo';
import type { Category, UserStatus } from '@/types';

const SWIPE_THRESHOLD = 80;

interface MenuContentProps {
  onClose: () => void;
  categories: Category[];
  onCategorySelect: (categoryId: string | null) => void;
  onTabChange: (tab: string) => void;
  userStatus: UserStatus;
  onPremiumClick: () => void;
  showExchangeRateOnHome: boolean;
  onToggleExchangeRateVisibility: () => void;
}

function MenuContent({
  onClose,
  categories,
  onCategorySelect,
  onTabChange,
  userStatus,
  onPremiumClick,
  showExchangeRateOnHome,
  onToggleExchangeRateVisibility,
}: MenuContentProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { currency, effectiveRate, loading: rateLoading, setCurrency } = useCurrency();
  const { isAdminModeActive, toggleAdminMode } = useAdminMode();
  const isDark = resolvedTheme === 'dark';
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when menu is open (prevents layout shift)
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

  const appleCategories = categories.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('apple') ||
      name.includes('iphone') ||
      name.includes('ipad') ||
      name.includes('macbook') ||
      name.includes('mac mini') ||
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
      window.location.href = '/vendedores';
      return;
    }

    onPremiumClick();
    onClose();
  };

  const handleAllProductsClick = () => {
    onCategorySelect(null);
    onTabChange('produtos');
    onClose();
  };

  const isVendedoresLocked = !userStatus.isAuthenticated || (!userStatus.isPremium && !userStatus.isAdmin);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] isolate"
      onClick={onClose}
      style={{ opacity: Math.max(0, 1 - dragY / 300) }}
    >
      <div
        ref={sheetRef}
        className={`absolute inset-x-0 bottom-0 max-h-[90vh] bg-surface rounded-t-3xl shadow-2xl flex flex-col z-[100000] safe-bottom ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        } ${dragY === 0 ? 'animate-slideInUp' : ''}`}
        style={{ transform: `translateY(${dragY}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar - drag zone */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-border-emphasis rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {/* Admin Toggle Button - only for admins */}
            {userStatus.isAdmin && (
              <button
                onClick={toggleAdminMode}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  isAdminModeActive
                    ? 'bg-red-500 active:scale-95'
                    : 'bg-red-500/10 active:scale-95'
                }`}
                aria-label={isAdminModeActive ? "Desativar modo admin" : "Ativar modo admin"}
              >
                <svg
                  className={`w-5 h-5 transition-colors ${
                    isAdminModeActive ? 'text-white' : 'text-red-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-elevated active:scale-95 transition-transform"
              aria-label="Fechar menu"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Todos Produtos */}
            <button
              onClick={handleAllProductsClick}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-text-primary">Produtos</span>
            </button>

            {/* Vendedores */}
            <button
              onClick={handleVendedoresClick}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated active:scale-95 transition-transform"
            >
              {isVendedoresLocked && (
                <span className="absolute top-2 right-2 tag-gold text-[8px] px-1.5 py-0.5">PRO</span>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-text-primary">Vendedores</span>
            </button>

            {/* Cotação */}
            <button
              onClick={() => {
                onClose();
                window.location.href = '/cotacao';
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-text-primary">Cotação</span>
            </button>

            {/* Calculadora */}
            <button
              onClick={() => {
                onClose();
                window.location.href = '/calculator';
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-text-primary">Calculadora</span>
            </button>

            {/* Ferramentas */}
            <button
              onClick={() => {
                onClose();
                window.location.href = '/tools';
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-text-primary">Ferramentas</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-5" />

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Categorias</p>

          <div className="space-y-2">
            {/* Apple Section */}
            {appleCategories.length > 0 && (
              <div className="rounded-2xl bg-surface-elevated border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('apple')}
                  className="flex items-center justify-between w-full p-4 active:bg-surface-overlay transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-text-primary">Apple</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 ${expandedSection === 'apple' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'apple' && (
                  <div className="px-4 pb-3 space-y-1 border-t border-border pt-3">
                    {appleCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="w-full py-3 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary bg-background border border-border active:scale-[0.98] transition-all text-left"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Periféricos Section */}
            {peripheralCategories.length > 0 && (
              <div className="rounded-2xl bg-surface-elevated border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('peripherals')}
                  className="flex items-center justify-between w-full p-4 active:bg-surface-overlay transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-text-primary">Periféricos</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 ${expandedSection === 'peripherals' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'peripherals' && (
                  <div className="px-4 pb-3 space-y-1 border-t border-border pt-3">
                    {peripheralCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="w-full py-3 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary bg-background border border-border active:scale-[0.98] transition-all text-left"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Outras Categorias Section */}
            {otherCategories.length > 0 && (
              <div className="rounded-2xl bg-surface-elevated border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('others')}
                  className="flex items-center justify-between w-full p-4 active:bg-surface-overlay transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-text-primary">Mais Categorias</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform duration-200 ${expandedSection === 'others' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSection === 'others' && (
                  <div className="px-4 pb-3 space-y-1 border-t border-border pt-3">
                    {otherCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="w-full py-3 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary bg-background border border-border active:scale-[0.98] transition-all text-left"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-5 py-4 bg-surface-elevated">
          {/* Exchange Rate Badge - conditionally shown */}
          {showExchangeRateOnHome && (
            <div className="mb-4 p-3 rounded-2xl bg-surface border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xs text-text-tertiary">Cotação Atual</span>
                </div>
                <div className="text-sm">
                  <span className="text-text-tertiary">R$1 ≈ </span>
                  {rateLoading ? (
                    <span className="text-text-muted">...</span>
                  ) : (
                    <span className="text-text-primary font-medium">¥ {effectiveRate.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Row */}
          <div className="flex items-center gap-3 mb-4">
            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === 'CNY' ? 'BRL' : 'CNY')}
              className="flex-1 flex items-center justify-between h-14 px-4 rounded-2xl bg-surface active:scale-[0.98] transition-transform"
            >
              <span className="text-sm text-text-secondary">Moeda de Exibição</span>
              {/* Animated Currency Toggle */}
              <div className="relative w-10 h-5 flex items-center justify-center overflow-hidden">
                <span
                  className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
                    currency === 'CNY'
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-full opacity-0'
                  }`}
                >
                  CNY
                </span>
                <span
                  className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
                    currency === 'BRL'
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-full opacity-0'
                  }`}
                >
                  BRL
                </span>
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex items-center justify-center gap-2 h-14 px-4 rounded-2xl bg-surface active:scale-95 transition-transform"
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
              {/* Theme Toggle Switch */}
              <div
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${
                  isDark ? 'bg-amber-500' : 'bg-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isDark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Exchange Rate Visibility Toggle */}
          <button
            onClick={onToggleExchangeRateVisibility}
            className="w-full flex items-center justify-between h-12 px-4 rounded-2xl bg-surface mb-4 active:scale-[0.98] transition-transform"
          >
            <span className="text-sm text-text-secondary">Sempre exibir cotação na home</span>
            <div
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${
                showExchangeRateOnHome ? 'bg-primary' : 'bg-border-emphasis'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  showExchangeRateOnHome ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Auth Button */}
          <SignedOut>
            <SignInButton mode="modal">
              <button
                onClick={onClose}
                className="w-full h-14 rounded-2xl bg-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Entrar na Conta
              </button>
            </SignInButton>
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
  showExchangeRateOnHome: boolean;
  onToggleExchangeRateVisibility: () => void;
}

export function MobileMenu({
  categories,
  onCategorySelect,
  onTabChange,
  userStatus,
  onPremiumClick,
  showExchangeRateOnHome,
  onToggleExchangeRateVisibility,
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
        className="w-10 h-10 flex items-center justify-center rounded-xl neu-elevated active:scale-95 transition-transform"
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
          showExchangeRateOnHome={showExchangeRateOnHome}
          onToggleExchangeRateVisibility={onToggleExchangeRateVisibility}
        />,
        document.body
      )}
    </>
  );
}
