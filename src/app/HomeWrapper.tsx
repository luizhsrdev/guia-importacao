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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background border-b border-border safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo size="md" />

              <div className="hidden md:block">
                <HeaderNav
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
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
                <AdminLink />
                <UserButton />
              </SignedIn>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <MobileMenu
                categories={categories}
                onCategorySelect={setActiveCategory}
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
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onPremiumClick={() => setShowPremiumModal(true)}
      />

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          window.location.href = '/premium';
        }}
      />
    </main>
  );
}
