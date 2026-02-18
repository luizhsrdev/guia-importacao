'use client';

import { useState, useEffect, useRef } from 'react';

type SortOption = 'none' | 'alpha-asc' | 'alpha-desc';

const SORT_OPTIONS = [
  { value: 'alpha-asc' as const, label: 'A-Z', icon: '↑' },
  { value: 'alpha-desc' as const, label: 'Z-A', icon: '↓' },
];

interface SellerFiltersProps {
  onFilterChange: (filters: {
    search: string;
    sortBy: SortOption;
  }) => void;
  totalCount: number;
  filteredCount: number;
}

export function SellerFilters({ onFilterChange, totalCount, filteredCount }: SellerFiltersProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isClosingDropdown, setIsClosingDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const handleApply = () => {
    onFilterChange({ search, sortBy });
  };

  const handleClear = () => {
    setSearch('');
    setSortBy('none');
    onFilterChange({ search: '', sortBy: 'none' });
  };

  const handleCloseSortDropdown = () => {
    setIsClosingDropdown(true);
    setTimeout(() => {
      setShowSortDropdown(false);
      setIsClosingDropdown(false);
    }, 150);
  };

  // Auto-aplicar filtros quando mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      handleApply();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sortBy]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        handleCloseSortDropdown();
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const hasActiveFilters = search.length > 0 || sortBy !== 'none';

  return (
    <div className="mb-6 space-y-4">
      {/* Linha 1: Busca + Ordenar + Buscar */}
      <div className="flex gap-2 sm:gap-3">
        {/* Campo de Busca */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Buscar vendedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="w-full h-12 bg-surface border border-border rounded-xl pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Campo Ordenar - Dropdown Customizado */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => {
              if (showSortDropdown) {
                handleCloseSortDropdown();
              } else {
                setShowSortDropdown(true);
              }
            }}
            className={`h-12 pl-11 pr-9 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer w-[138px] sm:w-[140px] flex items-center justify-between ${
              sortBy !== 'none'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary focus:border-primary'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {sortBy === 'none' ? (
                'Ordenar'
              ) : (
                <>
                  {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                  <span className="text-base">
                    {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.icon}
                  </span>
                </>
              )}
            </span>
          </button>
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              sortBy !== 'none' ? 'text-primary' : 'text-text-muted'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <svg
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-200 ${
              showSortDropdown ? 'rotate-180' : ''
            } ${sortBy !== 'none' ? 'text-primary' : 'text-text-muted'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>

          {/* Dropdown Menu */}
          {showSortDropdown && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 ${
                isClosingDropdown ? 'animate-dropdownOut' : 'animate-dropdown'
              }`}
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      setSortBy('none');
                    } else {
                      setSortBy(option.value);
                    }
                    handleCloseSortDropdown();
                  }}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-colors ${
                    sortBy === option.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    <span className="text-base">{option.icon}</span>
                  </span>
                  {sortBy === option.value && (
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Buscar */}
        <button
          onClick={handleApply}
          className="h-12 px-5 sm:px-6 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all flex-shrink-0"
        >
          <span className="hidden sm:inline">Buscar</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Botão Limpar - só aparece se houver filtros ativos */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="h-12 px-4 bg-surface border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-emphasis transition-colors flex items-center gap-2"
            title="Limpar filtros"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      <p className="text-text-secondary text-sm">
        {filteredCount === totalCount
          ? `${totalCount} vendedor${totalCount !== 1 ? 'es' : ''} encontrado${totalCount !== 1 ? 's' : ''}`
          : `${filteredCount} de ${totalCount} vendedor${totalCount !== 1 ? 'es' : ''}`}
      </p>
    </div>
  );
}
