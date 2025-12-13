import { Suspense } from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { AdminLink } from '@/components/AdminLink';
import { Logo } from '@/components/Logo';
import CurrencyToggle from '@/components/CurrencyToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenu } from '@/components/MobileMenu';
import { HomeClient } from './HomeClient';
import { getPublicProducts, getPublicSellers } from './actions';
import { getCurrentUserStatus } from '@/lib/user-server';
import { getCategories } from '@/app/admin/products/actions';

function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
      <div className="animate-pulse">
        <div className="flex gap-3 mb-6 border-b border-border pb-4">
          <div className="h-10 w-24 skeleton rounded-md"></div>
          <div className="h-10 w-24 skeleton rounded-md"></div>
        </div>

        <div className="mb-6">
          <div className="h-6 w-48 skeleton rounded-md mb-2"></div>
          <div className="h-4 w-32 skeleton rounded-md"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-64 sm:h-72"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function HomeContent() {
  const [products, sellers, userStatus, categories] = await Promise.all([
    getPublicProducts(),
    getPublicSellers(),
    getCurrentUserStatus(),
    getCategories(),
  ]);

  return (
    <HomeClient
      initialProducts={products}
      initialSellers={sellers}
      userStatus={userStatus}
      categories={categories}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-strong border-b border-border safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" />

            <div className="hidden sm:flex gap-2 sm:gap-3 items-center">
              <CurrencyToggle />
              <ThemeToggle />

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-ghost px-3 sm:px-4 py-2 rounded-md text-sm">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary px-3 sm:px-4 py-2 rounded-md text-sm font-medium">
                    Criar Conta
                  </button>
                </SignUpButton>
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
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

export const revalidate = 60;
