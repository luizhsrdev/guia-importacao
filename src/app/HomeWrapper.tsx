'use client';

import { useState } from 'react';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { Logo } from '@/components/Logo';
import { HeaderNav } from '@/components/HeaderNav';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenu } from '@/components/MobileMenu';
import { AdminLink } from '@/components/AdminLink';
import { HomeContent } from './HomeContent';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { AdminToggleSlider } from '@/components/AdminToggleSlider';
import type { PublicProduct, Seller, Category, UserStatus } from '@/types';

interface HomeWrapperProps {
  products: PublicProduct[];
  sellers: Seller[];
  userStatus: UserStatus;
  categories: Category[];
}

export function HomeWrapper({
  products,
  sellers,
  userStatus,
  categories,
}: HomeWrapperProps) {
  const [activeTab, setActiveTab] = useState('produtos');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAdminSlider, setShowAdminSlider] = useState(false);

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
        // Marcar
        return [...prev, categoryId];
      }
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <AdminModeProvider>
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background border-b border-border safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo size="md" onClick={handleLogoClick} />

              <div className="hidden md:block">
                <HeaderNav
                  categories={categories}
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
              <CurrencyToggle />
              <ThemeToggle />

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
                  <button
                    onClick={() => setShowAdminSlider(true)}
                    className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center group"
                    title="Painel Admin"
                  >
                    <svg className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <UserButton />
              </SignedIn>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <MobileMenu
                categories={categories}
                onCategorySelect={handleCategoryToggle}
                onTabChange={setActiveTab}
                userStatus={userStatus}
                onPremiumClick={() => setShowPremiumModal(true)}
              />
            </div>
          </div>
        </div>
        </header>

        <HomeContent
          products={products}
          sellers={sellers}
          userStatus={userStatus}
          categories={categories}
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
