'use client';

import { useState, useEffect, useRef } from 'react';

type SortOption = 'none' | 'price-asc' | 'price-desc' | 'alphabetical';
type Condition = 'Lacrado' | 'Seminovo' | 'Usado';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search: string;
    sortBy: SortOption;
    priceMin: number | null;
    priceMax: number | null;
    conditions: Condition[];
  }) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => {
      setShowAdvanced(false);
      setIsClosing(false);
    }, 200);
  };

  const handleToggleAdvanced = () => {
    if (showAdvanced) {
      handleCloseAdvanced();
    } else {
      setShowAdvanced(true);
    }
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
    };

    if (showAdvanced) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvanced]);

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

        {/* Campo Ordenar */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-12 pl-4 pr-10 bg-surface border border-border rounded-xl text-sm text-text-primary outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
          >
            <option value="none">Ordenar por...</option>
            <option value="price-asc">Preço: Menor → Maior</option>
            <option value="price-desc">Preço: Maior → Menor</option>
            <option value="alphabetical">Ordem Alfabética</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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

        {/* Botão Filtros Avançados */}
        <button
          onClick={handleToggleAdvanced}
          className={`h-12 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            showAdvanced ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div
          ref={advancedRef}
          className={`bg-surface border border-border rounded-xl p-4 space-y-4 overflow-hidden origin-top ${
            isClosing ? 'animate-slideUpFade' : 'animate-slideDownFade'
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
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
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
