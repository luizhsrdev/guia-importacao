import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserStatus } from '@/lib/user-server';
import AdminClient from './AdminClient';
import { getProducts } from './products/actions';
import { getSellers, getCategories as getSellerCategories } from './sellers/actions';
import { getCategories as getProductCategories } from './products/actions';

// Skeleton do Admin
function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 w-64 bg-surface rounded mb-4"></div>
          <div className="h-6 w-48 bg-surface rounded mb-8"></div>
          <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-4">
            <div className="h-12 w-32 bg-surface rounded"></div>
            <div className="h-12 w-40 bg-surface rounded"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente que busca dados
async function AdminContent() {
  const userStatus = await getCurrentUserStatus();

  // Verificar permissão
  if (!userStatus.isAdmin) {
    redirect('/');
  }

  // Buscar dados em paralelo
  const [products, sellers, productCategories, sellerCategories] = await Promise.all([
    getProducts(),
    getSellers(),
    getProductCategories(),
    getSellerCategories(),
  ]);

  return (
    <AdminClient
      products={products}
      sellers={sellers}
      productCategories={productCategories}
      sellerCategories={sellerCategories}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
