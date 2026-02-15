'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { ProductFormModal } from '@/components/ProductFormModal';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useSuggestionNudge } from '@/hooks/useSuggestionNudge';
import type { PublicProduct, Category, UserStatus } from '@/types';

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
  userStatus: UserStatus;
  productCategories: Category[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string | null) => void;
  onClearFilters: () => void;
  onPremiumClick: () => void;
}

export function HomeContent({
  products,
  userStatus,
  productCategories,
  activeTab,
  setActiveTab,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  onPremiumClick,
}: HomeContentProps) {
  const { isAdminModeActive } = useAdminMode();
  const { favorites } = useFavorites();
  const { triggerZeroResultsNudge } = useSuggestionNudge();
  const zeroResultsTriggeredRef = useRef<string | null>(null);
  const [filters, setFilters] = useState<ProductFiltersState>(INITIAL_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [showProductFormModal, setShowProductFormModal] = useState(false);

  const handleAddProduct = () => {
    setEditingProductId(undefined);
    setShowProductFormModal(true);
  };

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

    // Separar favoritos e não-favoritos
    const favoriteProducts = result.filter(p => favorites.includes(p.id));
    const nonFavoriteProducts = result.filter(p => !favorites.includes(p.id));

    // Função para ordenar um array de produtos
    const sortProducts = (arr: typeof result) => {
      if (filters.sortBy === 'price-asc') {
        return [...arr].sort((a, b) => {
          const priceA = parseFloat(a.price_cny.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price_cny.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
      } else if (filters.sortBy === 'price-desc') {
        return [...arr].sort((a, b) => {
          const priceA = parseFloat(a.price_cny.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price_cny.replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
      } else if (filters.sortBy === 'alphabetical') {
        return [...arr].sort((a, b) => a.title.localeCompare(b.title));
      }
      return arr;
    };

    // Ordenar favoritos e não-favoritos separadamente
    const sortedFavorites = sortProducts(favoriteProducts);
    const sortedNonFavorites = sortProducts(nonFavoriteProducts);

    // Juntar: favoritos primeiro, depois não-favoritos
    return [...sortedFavorites, ...sortedNonFavorites];
  }, [products, filters, selectedCategories, favorites]);

  const selectedCategoryNames = useMemo(() => {
    return selectedCategories
      .map((id) => productCategories.find((c) => c.id === id)?.name)
      .filter((name): name is string => name !== undefined);
  }, [selectedCategories, productCategories]);

  // Zero results nudge trigger
  useEffect(() => {
    // Only trigger if there's a search query and zero results
    if (
      filters.search.trim().length >= 3 &&
      filteredProducts.length === 0 &&
      activeTab === 'produtos'
    ) {
      // Don't trigger again for the same search
      if (zeroResultsTriggeredRef.current !== filters.search) {
        zeroResultsTriggeredRef.current = filters.search;
        // Small delay to ensure the user sees the zero results first
        const timer = setTimeout(() => {
          triggerZeroResultsNudge(filters.search);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [filters.search, filteredProducts.length, activeTab, triggerZeroResultsNudge]);

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

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-tertiary">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {isAdminModeActive && (
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500 font-medium text-sm hover:bg-red-500/20 transition-all mt-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Produto
              </button>
            )}
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
                  view_count={product.view_count}
                  card_click_count={product.card_click_count}
                  purchase_click_count={product.purchase_click_count}
                  card_ctr={product.card_ctr}
                  purchase_ctr={product.purchase_ctr}
                  showMetrics={isAdminModeActive}
                />
              ))}
            </div>
          )}
        </section>
      )}


      {/* Modal de Edição de Produto */}
      <ProductFormModal
        isOpen={showProductFormModal}
        onClose={handleCloseProductFormModal}
        productId={editingProductId}
        categories={productCategories}
        onSuccess={handleProductFormSuccess}
      />
    </div>
  );
}
