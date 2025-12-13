'use client';

import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import ProductCard from '@/components/ProductCard';
import SellerCard from '@/components/SellerCard';
import ProductFilters from '@/components/ProductFilters';
import type { PublicProduct, Seller, Category, UserStatus } from '@/types';

interface ProductFiltersState {
  search: string;
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
}

const INITIAL_FILTERS: ProductFiltersState = {
  search: '',
  categories: [],
  priceMin: null,
  priceMax: null,
};

interface HomeClientProps {
  initialProducts: PublicProduct[];
  initialSellers: Seller[];
  userStatus: UserStatus;
  categories: Category[];
}

export function HomeClient({
  initialProducts,
  initialSellers,
  userStatus,
  categories,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('produtos');
  const [filterSellers, setFilterSellers] = useState<'all' | 'gold' | 'blacklist'>('all');
  const [filters, setFilters] = useState<ProductFiltersState>(INITIAL_FILTERS);

  const filteredProducts = initialProducts.filter((product) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!product.title.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filters.categories.length > 0) {
      if (!product.category_id || !filters.categories.includes(product.category_id)) {
        return false;
      }
    }

    if (filters.priceMin !== null || filters.priceMax !== null) {
      const price = parseFloat(product.price_cny.replace(/[^0-9.]/g, ''));
      if (filters.priceMin !== null && price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax !== null && price > filters.priceMax) {
        return false;
      }
    }

    return true;
  });

  const filteredSellers = initialSellers.filter((s) => {
    if (filterSellers === 'all') return true;
    return s.status === filterSellers;
  });

  const goldCount = initialSellers.filter((s) => s.status === 'gold').length;
  const blacklistCount = initialSellers.filter((s) => s.status === 'blacklist').length;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-6">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userStatus={userStatus}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {activeTab === 'produtos' && (
          <section>
            <ProductFilters
              categories={categories}
              onFilterChange={setFilters}
            />

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-text-tertiary">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-elevated flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium mb-1">
                  Nenhum produto encontrado
                </p>
                <p className="text-text-muted text-sm">
                  Tente ajustar os filtros de busca
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price_cny={product.price_cny}
                    image_main={product.image_main}
                    image_hover={product.image_hover}
                    affiliate_link={product.affiliate_link}
                    is_sold_out={product.is_sold_out}
                    category={product.category}
                    condition={product.condition}
                    observations={product.observations}
                    has_box={product.has_box}
                    has_charger={product.has_charger}
                    has_warranty={product.has_warranty}
                    isPremium={userStatus.isPremium}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'vendedores' && (
          <section>
            <header className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">
                Lista de Vendedores
              </h1>
              <p className="text-text-secondary">
                {initialSellers.length} vendedor{initialSellers.length !== 1 ? 'es' : ''} cadastrado{initialSellers.length !== 1 ? 's' : ''}
              </p>
            </header>

            <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
              <button
                onClick={() => setFilterSellers('all')}
                className={`h-10 px-4 sm:px-5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                  filterSellers === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated'
                }`}
              >
                Todos
                <span className="ml-1.5 sm:ml-2 text-xs opacity-60">{initialSellers.length}</span>
              </button>

              <button
                onClick={() => setFilterSellers('gold')}
                className={`h-10 px-4 sm:px-5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                  filterSellers === 'gold'
                    ? 'bg-amber-500 text-white'
                    : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated'
                }`}
              >
                Verificados
                <span className="ml-1.5 sm:ml-2 text-xs opacity-60">{goldCount}</span>
              </button>

              <button
                onClick={() => setFilterSellers('blacklist')}
                className={`h-10 px-4 sm:px-5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
                  filterSellers === 'blacklist'
                    ? 'bg-red-500 text-white'
                    : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated'
                }`}
              >
                Blacklist
                <span className="ml-1.5 sm:ml-2 text-xs opacity-60">{blacklistCount}</span>
              </button>
            </div>

            {filteredSellers.length === 0 ? (
              <div className="text-center py-20 bg-surface rounded-2xl border border-border">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-elevated flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium mb-1">
                  Nenhum vendedor encontrado
                </p>
                <p className="text-text-muted text-sm">
                  Selecione outro filtro
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredSellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            )}

            <aside className="mt-10 p-5 bg-surface rounded-2xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-text-primary mb-1">
                    Aviso Importante
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Lista baseada em experiências da comunidade. Vendedores <span className="text-amber-400 font-medium">verificados</span> têm histórico positivo, mas sempre faça sua pesquisa. A <span className="text-red-400 font-medium">blacklist</span> contém vendedores com práticas fraudulentas reportadas.
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </>
  );
}
