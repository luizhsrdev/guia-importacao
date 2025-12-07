import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import AdminLink from '@/components/AdminLink';
import ProductCard from '@/components/ProductCard';
import { getPublicProducts } from './actions';

export default async function Home() {
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">
              Planilha do Sena
            </h1>

            <div className="flex gap-4 items-center">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Título e Contador */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-textMain mb-2">
            Produtos Curados
          </h2>
          <p className="text-textSecondary">
            {products.length} produto(s) disponíveis
          </p>
        </div>

        {/* Grid de Produtos */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-textSecondary text-lg">
              Nenhum produto disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price_cny={product.price_cny}
                image_main={product.image_main}
                image_hover={product.image_hover}
                affiliate_link={product.affiliate_link}
                is_sold_out={product.is_sold_out}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
