'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import SellerCard from '@/components/SellerCard';
import { ProductFilters } from '@/components/ProductFilters';
import { ProductFormModal } from '@/components/ProductFormModal';
import type { PublicProduct, Seller, Category, UserStatus } from '@/types';

type SortOption = 'none' | 'price-asc' | 'price-desc' | 'alphabetical';
type Condition = 'Lacrado' | 'Seminovo' | 'Usado';

interface ProductFiltersState {
  search: string;
  sortBy: SortOption;
  priceMin: number | null;
  priceMax: number | null;
  conditions: Condition[];
}

const INITIAL_FILTERS: ProductFiltersState = {
  search: '',
  sortBy: 'none',
  priceMin: null,
  priceMax: null,
  conditions: [],
};

interface HomeContentProps {
  products: PublicProduct[];
  sellers: Seller[];
  userStatus: UserStatus;
  categories: Category[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string | null) => void;
  onClearFilters: () => void;
  onPremiumClick: () => void;
}

export function HomeContent({
  products,
  sellers,
  userStatus,
  categories,
  activeTab,
  setActiveTab,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  onPremiumClick,
}: HomeContentProps) {
  const [filterSellers, setFilterSellers] = useState<'all' | 'gold' | 'blacklist'>('all');
  const [filters, setFilters] = useState<ProductFiltersState>(INITIAL_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [showProductFormModal, setShowProductFormModal] = useState(false);

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setShowProductFormModal(true);
  };

  const handleCloseProductFormModal = () => {
    setShowProductFormModal(false);
    setEditingProductId(undefined);
  };

  const handleProductFormSuccess = () => {
    // Recarregar a página para atualizar os dados
    window.location.reload();
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!product.title.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro de categorias selecionadas
      if (selectedCategories.length > 0) {
        if (!product.category_id || !selectedCategories.includes(product.category_id)) {
          return false;
        }
      }

      // Filtro de faixa de preço
      if (filters.priceMin !== null || filters.priceMax !== null) {
        const price = parseFloat(product.price_cny.replace(/[^0-9.]/g, ''));
        if (filters.priceMin !== null && price < filters.priceMin) {
          return false;
        }
        if (filters.priceMax !== null && price > filters.priceMax) {
          return false;
        }
      }

      // Filtro de condição
      if (filters.conditions.length > 0) {
        if (!product.condition || !filters.conditions.includes(product.condition as Condition)) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    if (filters.sortBy === 'price-asc') {
      result = [...result].sort((a, b) => {
        const priceA = parseFloat(a.price_cny.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.price_cny.replace(/[^0-9.]/g, ''));
        return priceA - priceB;
      });
    } else if (filters.sortBy === 'price-desc') {
      result = [...result].sort((a, b) => {
        const priceA = parseFloat(a.price_cny.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.price_cny.replace(/[^0-9.]/g, ''));
        return priceB - priceA;
      });
    } else if (filters.sortBy === 'alphabetical') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [products, filters, selectedCategories]);

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (filterSellers === 'all') return true;
      return s.status === filterSellers;
    });
  }, [sellers, filterSellers]);

  const goldCount = useMemo(() => sellers.filter((s) => s.status === 'gold').length, [sellers]);
  const blacklistCount = useMemo(() => sellers.filter((s) => s.status === 'blacklist').length, [sellers]);

  const selectedCategoryNames = useMemo(() => {
    return selectedCategories
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter((name): name is string => name !== undefined);
  }, [selectedCategories, categories]);

  const formattedCategoryText = useMemo(() => {
    if (selectedCategoryNames.length === 0) return null;
    if (selectedCategoryNames.length === 1) return selectedCategoryNames[0];
    if (selectedCategoryNames.length === 2) {
      return `${selectedCategoryNames[0]} e ${selectedCategoryNames[1]}`;
    }
    const lastCategory = selectedCategoryNames[selectedCategoryNames.length - 1];
    const otherCategories = selectedCategoryNames.slice(0, -1).join(', ');
    return `${otherCategories} e ${lastCategory}`;
  }, [selectedCategoryNames]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      {activeTab === 'produtos' && (
        <section>
          {formattedCategoryText && (
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
                {formattedCategoryText}
              </h1>
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-text-secondary bg-surface border border-border hover:bg-surface-elevated hover:border-border-emphasis transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar Seleções
              </button>
            </div>
          )}

          <ProductFilters
            onFilterChange={setFilters}
            onAdvancedToggle={setShowAdvancedFilters}
          />

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-text-tertiary">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className={`text-center py-20 bg-surface rounded-2xl border border-border transition-all duration-[400ms] ease-out ${
                showAdvancedFilters ? 'mt-4' : 'mt-0'
              }`}
            >
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
            <div
              className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 transition-all duration-[400ms] ease-out ${
                showAdvancedFilters ? 'mt-4' : 'mt-0'
              }`}
            >
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
                  onEdit={() => handleEditProduct(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'vendedores' && (
        <section>
          <header className="mb-8 sm:mb-10">
            <h1 className="section-title mb-2">
              Lista de Vendedores
            </h1>
            <p className="text-text-secondary text-sm">
              {sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''} cadastrado{sellers.length !== 1 ? 's' : ''}
            </p>
          </header>

          <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
            <button
              onClick={() => setFilterSellers('all')}
              className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                filterSellers === 'all'
                  ? 'bg-primary text-white shadow-glow-md'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
              }`}
            >
              Todos
              <span className="ml-2 text-xs opacity-70">{sellers.length}</span>
            </button>

            <button
              onClick={() => setFilterSellers('gold')}
              className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                filterSellers === 'gold'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-glow-gold'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
              }`}
            >
              Verificados
              <span className="ml-2 text-xs opacity-70">{goldCount}</span>
            </button>

            <button
              onClick={() => setFilterSellers('blacklist')}
              className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                filterSellers === 'blacklist'
                  ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-glow-danger'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
              }`}
            >
              Blacklist
              <span className="ml-2 text-xs opacity-70">{blacklistCount}</span>
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

          <aside className="mt-10 sm:mt-12 p-5 sm:p-6 bg-gradient-to-br from-sky-500/5 to-blue-500/5 rounded-2xl border border-sky-500/20">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
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
                <h3 className="text-base font-semibold text-text-primary mb-1.5">
                  Aviso Importante
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Lista baseada em experiências da comunidade. Vendedores <span className="text-verified font-semibold">verificados</span> têm histórico positivo, mas sempre faça sua pesquisa. A <span className="text-red-500 dark:text-red-400 font-semibold">blacklist</span> contém vendedores com práticas fraudulentas reportadas.
                </p>
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* Modal de Edição de Produto */}
      <ProductFormModal
        isOpen={showProductFormModal}
        onClose={handleCloseProductFormModal}
        productId={editingProductId}
        categories={categories}
        onSuccess={handleProductFormSuccess}
      />
    </div>
  );
}
