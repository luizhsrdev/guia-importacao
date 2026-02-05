'use client';

import { useState, useEffect } from 'react';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Logo } from '@/components/Logo';
import { HeaderNav } from '@/components/HeaderNav';
import { SettingsDropdown } from '@/components/SettingsDropdown';
import { MobileMenu } from '@/components/MobileMenu';
import { HomeContent } from './HomeContent';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { AdminToggleSlider } from '@/components/AdminToggleSlider';
import { AdminReportsNotification } from '@/components/AdminReportsNotification';
import { trackCategorySelection } from '@/lib/analytics';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { PublicProduct, Seller, Category, UserStatus } from '@/types';

const EXCHANGE_RATE_VISIBILITY_KEY = 'showExchangeRateOnHome';

interface HomeWrapperProps {
  products: PublicProduct[];
  sellers: Seller[];
  userStatus: UserStatus;
  productCategories: Category[];
  sellerCategories: Array<{ id: string; name: string }>;
}

export function HomeWrapper({
  products,
  sellers,
  userStatus,
  productCategories,
  sellerCategories,
}: HomeWrapperProps) {
  const [activeTab, setActiveTab] = useState('produtos');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAdminSlider, setShowAdminSlider] = useState(false);
  const [showExchangeRateOnHome, setShowExchangeRateOnHome] = useState(true);
  const { effectiveRate, loading: rateLoading } = useCurrency();

  // Load exchange rate visibility preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem(EXCHANGE_RATE_VISIBILITY_KEY);
    if (savedPreference !== null) {
      setShowExchangeRateOnHome(savedPreference === 'true');
    }
  }, []);

  const handleToggleExchangeRateVisibility = () => {
    const newValue = !showExchangeRateOnHome;
    setShowExchangeRateOnHome(newValue);
    localStorage.setItem(EXCHANGE_RATE_VISIBILITY_KEY, String(newValue));
  };

  const handleLogoClick = () => {
    setActiveTab('produtos');
    setSelectedCategories([]);
  };

  const handleCategoryToggle = (categoryId: string | null) => {
    if (!categoryId) {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        // Desmarcar
        return prev.filter((id) => id !== categoryId);
      } else {
        // Marcar - track selection
        trackCategorySelection(categoryId);
        return [...prev, categoryId];
      }
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <AdminModeProvider
      isUserAdmin={userStatus.isAdmin}
      isUserAuthenticated={userStatus.isAuthenticated}
    >
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background border-b border-border safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo size="md" onClick={handleLogoClick} />

              <div className="hidden md:block">
                <HeaderNav
                  categories={productCategories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  userStatus={userStatus}
                  onPremiumClick={() => setShowPremiumModal(true)}
                />
              </div>
            </div>

            <div className="hidden sm:flex gap-2.5 items-center">
              {/* Exchange Rate Badge - conditionally shown with animation */}
              <div
                className={`h-10 px-3 bg-surface rounded-xl border border-border shadow-sm text-xs flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 ease-out origin-right ${
                  showExchangeRateOnHome
                    ? 'opacity-100 scale-100 translate-x-0'
                    : 'opacity-0 scale-95 translate-x-2 pointer-events-none w-0 px-0 overflow-hidden'
                }`}
              >
                <span className="text-text-tertiary">R$1 ≈</span>
                {rateLoading ? (
                  <span className="text-text-muted">...</span>
                ) : (
                  <span className="text-text-primary font-medium">¥ {effectiveRate.toFixed(2)}</span>
                )}
              </div>

              <SettingsDropdown
                showExchangeRateOnHome={showExchangeRateOnHome}
                onToggleExchangeRateVisibility={handleToggleExchangeRateVisibility}
              />

              <div className="w-px h-6 bg-border mx-1" />

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="group flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium text-text-secondary hover:text-primary neu-elevated">
                    <svg
                      className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Entrar</span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                {userStatus.isAdmin && (
                  <>
                    <button
                      onClick={() => setShowAdminSlider(true)}
                      className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center group"
                      title="Painel Admin"
                    >
                      <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <AdminReportsNotification />
                  </>
                )}
                <UserButton />
              </SignedIn>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <MobileMenu
                categories={productCategories}
                onCategorySelect={handleCategoryToggle}
                onTabChange={setActiveTab}
                userStatus={userStatus}
                onPremiumClick={() => setShowPremiumModal(true)}
                showExchangeRateOnHome={showExchangeRateOnHome}
                onToggleExchangeRateVisibility={handleToggleExchangeRateVisibility}
              />
            </div>
          </div>
        </div>
        </header>

        <HomeContent
          products={products}
          sellers={sellers}
          userStatus={userStatus}
          productCategories={productCategories}
          sellerCategories={sellerCategories}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearFilters={clearFilters}
          onPremiumClick={() => setShowPremiumModal(true)}
        />

        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            window.location.href = '/premium';
          }}
        />

        {userStatus.isAdmin && (
          <AdminToggleSlider
            isOpen={showAdminSlider}
            onClose={() => setShowAdminSlider(false)}
          />
        )}
      </main>
    </AdminModeProvider>
  );
}
