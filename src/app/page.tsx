import { Suspense } from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { AdminLink } from '@/components/AdminLink';
import CurrencyToggle from '@/components/CurrencyToggle';
import { HomeClient } from './HomeClient';
import { getPublicProducts, getPublicSellers } from './actions';
import { getCurrentUserStatus } from '@/lib/user-server';
import { getCategories } from '@/app/admin/products/actions';

function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
      <div className="animate-pulse">
        <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div className="h-12 w-32 bg-zinc-800 rounded-lg"></div>
          <div className="h-12 w-32 bg-zinc-800 rounded-lg"></div>
        </div>

        <div className="mb-8">
          <div className="h-8 w-64 bg-zinc-800 rounded mb-2"></div>
          <div className="h-4 w-48 bg-zinc-800 rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl h-72 border border-zinc-800"></div>
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
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">
              Planilha do Sena
            </h1>

            <div className="flex gap-4 items-center">
              <CurrencyToggle />

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-6 py-2 bg-surface border border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition-colors text-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold">
                    Sign Up
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
export const dynamic = 'force-dynamic';
