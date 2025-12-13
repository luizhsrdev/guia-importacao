'use client';

import { useState } from 'react';
import { NEUMORPHIC_INSET, NEUMORPHIC_ELEVATED } from '@/lib/constants';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search: string;
    categories: string[];
    priceMin: number | null;
    priceMax: number | null;
  }) => void;
}

export function ProductFilters({
  onFilterChange,
}: ProductFiltersProps) {
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    onFilterChange({
      search,
      categories: [],
      priceMin: null,
      priceMax: null,
    });
  };

  const handleClear = () => {
    setSearch('');
    onFilterChange({
      search: '',
      categories: [],
      priceMin: null,
      priceMax: null,
    });
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className={`relative w-full h-12 bg-background-secondary dark:bg-surface-elevated border-[1.5px] border-transparent rounded-2xl pl-14 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary dark:focus:border-primary transition-[box-shadow] duration-200 ${NEUMORPHIC_INSET.base} ${NEUMORPHIC_INSET.focus}`}
          />
          <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-surface dark:bg-surface-elevated transition-all duration-200 ${NEUMORPHIC_ELEVATED.base}`}>
            <svg
              className="w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors duration-200"
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
        </div>

        <button
          onClick={handleSearch}
          className="h-12 px-5 sm:px-6 bg-primary text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_rgba(16,185,129,0.3),0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(52,211,153,0.25),0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4),0_2px_4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_6px_16px_rgba(52,211,153,0.35),0_2px_4px_rgba(0,0,0,0.2)] hover:bg-primary-hover active:scale-[0.97] active:shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all duration-200 flex-shrink-0"
        >
          <span className="hidden sm:inline">Buscar</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {search && (
          <button
            onClick={handleClear}
            className={`h-12 w-12 sm:w-auto sm:px-5 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-2xl text-sm font-medium bg-surface transition-all duration-200 flex-shrink-0 ${NEUMORPHIC_ELEVATED.base} ${NEUMORPHIC_ELEVATED.hover} ${NEUMORPHIC_ELEVATED.active}`}
            aria-label="Limpar busca"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>
    </div>
  );
}
