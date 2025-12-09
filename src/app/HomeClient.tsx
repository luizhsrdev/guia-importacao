'use client';

import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import ProductCard from '@/components/ProductCard';
import SellerCard from '@/components/SellerCard';

interface HomeClientProps {
  initialProducts: any[];
  initialSellers: any[];
  userStatus: {
    isAuthenticated: boolean;
    isPremium: boolean;
    isAdmin: boolean;
  };
}

export default function HomeClient({
  initialProducts,
  initialSellers,
  userStatus,
}: HomeClientProps) {
  const [activeTab, setActiveTab] = useState('produtos');
  const [filterSellers, setFilterSellers] = useState<'all' | 'gold' | 'blacklist'>('all');

  const filteredSellers = initialSellers.filter((s) => {
    if (filterSellers === 'all') return true;
    return s.status === filterSellers;
  });

  const goldCount = initialSellers.filter((s) => s.status === 'gold').length;
  const blacklistCount = initialSellers.filter((s) => s.status === 'blacklist').length;

  return (
    <>
      {/* Navegação por Abas */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userStatus={userStatus}
        />
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        {/* Aba PRODUTOS */}
        {activeTab === 'produtos' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-textMain mb-2">
                Produtos Curados
              </h2>
              <p className="text-textSecondary">
                {initialProducts.length} produto(s) disponíveis
              </p>
            </div>

            {initialProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-textSecondary text-lg">
                  Nenhum produto disponível no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {initialProducts.map((product) => (
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba VENDEDORES */}
        {activeTab === 'vendedores' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-textMain mb-2">
                Lista de Vendedores
              </h2>
              <p className="text-textSecondary">
                {initialSellers.length} vendedores cadastrados
              </p>
            </div>

            {/* Filtros */}
            <div className="flex gap-3 mb-8 flex-wrap">
              <button
                onClick={() => setFilterSellers('all')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filterSellers === 'all'
                    ? 'bg-primary text-background shadow-lg shadow-primary/20'
                    : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
                }`}
              >
                Todos ({initialSellers.length})
              </button>

              <button
                onClick={() => setFilterSellers('gold')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filterSellers === 'gold'
                    ? 'bg-primary text-background shadow-lg shadow-primary/20'
                    : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
                }`}
              >
                Lista Dourada ({goldCount})
              </button>

              <button
                onClick={() => setFilterSellers('blacklist')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  filterSellers === 'blacklist'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
                }`}
              >
                Blacklist ({blacklistCount})
              </button>
            </div>

            {/* Grid de Vendedores */}
            {filteredSellers.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-zinc-800">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-textSecondary text-lg">
                  Nenhum vendedor encontrado nesta categoria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSellers.map((seller) => (
                  <SellerCard key={seller.id} seller={seller} />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h3 className="text-textMain font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
                Aviso Importante
              </h3>
              <p className="text-textSecondary text-sm leading-relaxed">
                Esta lista é baseada em experiências relatadas pela comunidade e
                nossa análise. A <strong>Lista Dourada</strong> contém
                vendedores com histórico positivo, mas sempre faça sua própria
                pesquisa antes de comprar. A <strong>Blacklist</strong> lista
                vendedores reportados por práticas fraudulentas - evite
                completamente estes perfis.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
