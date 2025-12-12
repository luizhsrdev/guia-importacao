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
import { HomeClient } from './HomeClient';
import { getPublicProducts, getPublicSellers } from './actions';
import { getCurrentUserStatus } from '@/lib/user-server';
import { getCategories } from '@/app/admin/products/actions';

function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
      <div className="animate-pulse">
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          <div className="h-10 w-28 skeleton rounded-md"></div>
          <div className="h-10 w-28 skeleton rounded-md"></div>
        </div>

        <div className="mb-8">
          <div className="h-7 w-56 skeleton rounded-md mb-3"></div>
          <div className="h-4 w-40 skeleton rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton rounded-lg h-72"></div>
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
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Logo size="md" />

            <div className="flex gap-3 items-center">
              <CurrencyToggle />
              <ThemeToggle />

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-ghost px-4 py-2 rounded-md text-sm">
                    Entrar
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary px-4 py-2 rounded-md text-sm font-medium">
                    Criar Conta
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <AdminLink />
                <UserButton />
              </SignedIn>
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
