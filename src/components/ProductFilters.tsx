'use client';

import { useState, useEffect, useRef } from 'react';

type SortOption = 'none' | 'price-asc' | 'price-desc' | 'alphabetical';
type Condition = 'Lacrado' | 'Seminovo' | 'Usado';

const SORT_OPTIONS = [
  { value: 'price-asc' as const, label: 'Preço', icon: '↑' },
  { value: 'price-desc' as const, label: 'Preço', icon: '↓' },
];

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search: string;
    sortBy: SortOption;
    priceMin: number | null;
    priceMax: number | null;
    conditions: Condition[];
  }) => void;
  onAdvancedToggle?: (isOpen: boolean) => void;
}

export function ProductFilters({ onFilterChange, onAdvancedToggle }: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isClosingDropdown, setIsClosingDropdown] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const handleConditionToggle = (condition: Condition) => {
    setConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleApply = () => {
    onFilterChange({
      search,
      sortBy,
      priceMin: priceMin > 0 ? priceMin : null,
      priceMax: priceMax < 10000 ? priceMax : null,
      conditions,
    });
  };

  const handleClear = () => {
    setSearch('');
    setSortBy('none');
    setPriceMin(0);
    setPriceMax(10000);
    setConditions([]);
    onFilterChange({
      search: '',
      sortBy: 'none',
      priceMin: null,
      priceMax: null,
      conditions: [],
    });
  };

  const handleCloseAdvanced = () => {
    setIsClosing(true);
    onAdvancedToggle?.(false);
    setTimeout(() => {
      setShowAdvanced(false);
      setIsClosing(false);
    }, 350);
  };

  const handleToggleAdvanced = () => {
    if (showAdvanced) {
      handleCloseAdvanced();
    } else {
      setShowAdvanced(true);
      onAdvancedToggle?.(true);
    }
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
  }, [search, sortBy, priceMin, priceMax, conditions]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (advancedRef.current && !advancedRef.current.contains(event.target as Node)) {
        handleCloseAdvanced();
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        handleCloseSortDropdown();
      }
    };

    if (showAdvanced || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvanced, showSortDropdown]);

  return (
    <div className="mb-6 space-y-4">
      {/* Linha 1: Busca + Ordenar + Buscar */}
      <div className="flex gap-2 sm:gap-3">
        {/* Campo de Busca */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="Buscar produtos..."
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
            className={`h-12 pl-11 pr-9 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer w-[120px] sm:w-[130px] flex items-center justify-between ${
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
                    // Se clicar na opção já selecionada, desmarca
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

        {/* Botão Filtros Avançados */}
        <button
          onClick={handleToggleAdvanced}
          className={`h-12 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            showAdvanced || priceMin > 0 || priceMax < 10000 || conditions.length > 0
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Filtros</span>
        </button>

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
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div
          ref={advancedRef}
          className={`bg-surface border border-border rounded-xl p-4 space-y-4 overflow-hidden origin-top ${
            isClosing ? 'animate-collapseHeight' : 'animate-expandHeight'
          }`}
        >
          {/* Slider de Preço */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Faixa de Preço: ¥{priceMin} - ¥{priceMax}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-primary price-range-slider"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-primary price-range-slider"
              />
            </div>
          </div>

          {/* Botões Pill de Condição */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Condição do Produto
            </label>
            <div className="flex flex-wrap gap-3">
              {(['Lacrado', 'Seminovo', 'Usado'] as Condition[]).map((condition) => {
                const isSelected = conditions.includes(condition);
                return (
                  <button
                    key={condition}
                    onClick={() => handleConditionToggle(condition)}
                    className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary border-2 border-primary'
                        : 'bg-surface text-text-secondary border-2 border-transparent hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <span>{condition}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 flex-shrink-0"
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
                );
              })}
            </div>
          </div>

          {/* Botão Limpar */}
          <button
            onClick={handleClear}
            className="w-full h-10 px-4 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-emphasis transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar Todos os Filtros
          </button>
        </div>
      )}
    </div>
  );
}
