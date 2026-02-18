'use client';

import { useState, useMemo } from 'react';
import SellerCard from '@/components/SellerCard';
import { SellerFilters } from '@/components/SellerFilters';
import { SellerFormModal } from '@/components/SellerFormModal';
import { useAdminMode } from '@/contexts/AdminModeContext';

type SortOption = 'none' | 'alpha-asc' | 'alpha-desc';

interface Seller {
  id: string;
  name: string;
  status: 'gold' | 'blacklist';
  category_id?: string;
  notes?: string;
  rating?: string;
  affiliate_link?: string;
  profile_link?: string;
  feedback_link?: string;
  image_url?: string;
  blacklist_reason?: string;
  proof_link?: string;
  evidence_images?: string[];
  seller_categories?: { name: string } | null;
  created_at?: string;
}

interface VendedoresClientProps {
  sellers: Seller[];
  sellerCategories: Array<{ id: string; name: string }>;
}

interface FiltersState {
  search: string;
  sortBy: SortOption;
}

export default function VendedoresClient({ sellers, sellerCategories }: VendedoresClientProps) {
  const { isAdminModeActive } = useAdminMode();
  const [filterStatus, setFilterStatus] = useState<'all' | 'gold' | 'blacklist'>('all');
  const [filters, setFilters] = useState<FiltersState>({ search: '', sortBy: 'none' });
  const [editingSellerId, setEditingSellerId] = useState<string | undefined>();
  const [showSellerFormModal, setShowSellerFormModal] = useState(false);

  const handleAddSeller = () => {
    setEditingSellerId(undefined);
    setShowSellerFormModal(true);
  };

  const handleEditSeller = (sellerId: string) => {
    setEditingSellerId(sellerId);
    setShowSellerFormModal(true);
  };

  const handleCloseSellerFormModal = () => {
    setShowSellerFormModal(false);
    setEditingSellerId(undefined);
  };

  const handleSellerFormSuccess = () => {
    window.location.reload();
  };

  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  const filteredSellers = useMemo(() => {
    let result = sellers;

    // Filtro por status (all, gold, blacklist)
    if (filterStatus !== 'all') {
      result = result.filter((s) => s.status === filterStatus);
    }

    // Filtro de busca por nome
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(searchLower));
    }

    // Ordenação alfabética
    if (filters.sortBy === 'alpha-asc') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } else if (filters.sortBy === 'alpha-desc') {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
    }

    return result;
  }, [sellers, filterStatus, filters]);

  const goldCount = useMemo(() => sellers.filter((s) => s.status === 'gold').length, [sellers]);
  const blacklistCount = useMemo(() => sellers.filter((s) => s.status === 'blacklist').length, [sellers]);

  // Contar dentro do filtro de status atual
  const totalInCurrentStatus = useMemo(() => {
    if (filterStatus === 'all') return sellers.length;
    return filterStatus === 'gold' ? goldCount : blacklistCount;
  }, [filterStatus, sellers.length, goldCount, blacklistCount]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="section-title mb-2">
          Lista de Vendedores
        </h1>

        {isAdminModeActive && (
          <button
            onClick={handleAddSeller}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500 font-medium text-sm hover:bg-red-500/20 transition-all mt-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Vendedor
          </button>
        )}
      </header>

      {/* Filtros de status (tabs) */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
        <button
          onClick={() => setFilterStatus('all')}
          className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
            filterStatus === 'all'
              ? 'bg-primary text-white shadow-glow-md'
              : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
          }`}
        >
          Todos
          <span className="ml-2 text-xs opacity-70">{sellers.length}</span>
        </button>

        <button
          onClick={() => setFilterStatus('gold')}
          className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
            filterStatus === 'gold'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-glow-primary'
              : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
          }`}
        >
          Verificados
          <span className="ml-2 text-xs opacity-70">{goldCount}</span>
        </button>

        <button
          onClick={() => setFilterStatus('blacklist')}
          className={`h-11 px-5 sm:px-6 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
            filterStatus === 'blacklist'
              ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-glow-danger'
              : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:border-border-emphasis shadow-sm'
          }`}
        >
          Blacklist
          <span className="ml-2 text-xs opacity-70">{blacklistCount}</span>
        </button>
      </div>

      {/* Barra de busca e ordenação */}
      <SellerFilters
        onFilterChange={handleFilterChange}
        totalCount={totalInCurrentStatus}
        filteredCount={filteredSellers.length}
      />

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
            {filters.search ? 'Tente outra busca' : 'Selecione outro filtro'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSellers.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              onEdit={() => handleEditSeller(seller.id)}
            />
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

      {/* Modal de Edição de Vendedor */}
      <SellerFormModal
        isOpen={showSellerFormModal}
        onClose={handleCloseSellerFormModal}
        sellerId={editingSellerId}
        categories={sellerCategories}
        onSuccess={handleSellerFormSuccess}
      />
    </div>
  );
}
