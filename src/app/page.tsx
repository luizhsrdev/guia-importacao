import { Suspense } from 'react';
import { HomeWrapper } from './HomeWrapper';
import { getPublicProducts, getPublicSellers } from './actions';
import { getCurrentUserStatus } from '@/lib/user-server';
import { getCategories as getProductCategories } from '@/lib/actions/products';
import { getCategories as getSellerCategories } from '@/lib/actions/sellers';

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass-strong border-b border-border/50 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="h-8 w-40 skeleton rounded-lg" />
              <div className="hidden md:flex gap-2">
                <div className="h-9 w-24 skeleton rounded-lg" />
                <div className="h-9 w-24 skeleton rounded-lg" />
                <div className="h-9 w-16 skeleton rounded-lg" />
              </div>
            </div>
            <div className="hidden sm:flex gap-2.5">
              <div className="h-10 w-20 skeleton rounded-xl" />
              <div className="h-10 w-10 skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <div className="animate-pulse">
          <div className="mb-6">
            <div className="h-11 w-full max-w-md skeleton rounded-xl mb-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-64 sm:h-72" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function HomeContent() {
  const [products, sellers, userStatus, productCategories, sellerCategories] = await Promise.all([
    getPublicProducts(),
    getPublicSellers(),
    getCurrentUserStatus(),
    getProductCategories(),
    getSellerCategories(),
  ]);

  return (
    <HomeWrapper
      products={products}
      sellers={sellers}
      userStatus={userStatus}
      productCategories={productCategories}
      sellerCategories={sellerCategories}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

export const revalidate = 60;
