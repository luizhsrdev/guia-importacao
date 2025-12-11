'use client';

import { useState, useRef, useEffect } from 'react';

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string }>;
  onFilterChange: (filters: {
    search: string;
    categories: string[];
    priceMin: number | null;
    priceMax: number | null;
  }) => void;
}

export default function ProductFilters({
  categories,
  onFilterChange,
}: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onFilterChange({
      search,
      categories: selectedCategories,
      priceMin,
      priceMax,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setPriceMin(null);
    setPriceMax(null);
    onFilterChange({
      search: '',
      categories: [],
      priceMin: null,
      priceMax: null,
    });
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter((id) => id !== categoryId);
    setSelectedCategories(newCategories);
    onFilterChange({
      search,
      categories: newCategories,
      priceMin,
      priceMax,
    });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Linha 1: Busca + Botões */}
      <div className="flex gap-3">
        {/* Barra de Busca */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-surface border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-textMain focus:outline-none focus:border-primary"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary"
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

        {/* Botão Buscar */}
        <button
          onClick={handleSearch}
          className="px-8 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Buscar
        </button>

        {/* Botão Limpar Filtros */}
        <button
          onClick={handleClearFilters}
          className="px-6 py-3 bg-zinc-800 text-textMain rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors whitespace-nowrap"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Linha 2: Filtros (Categorias, Preço, etc) */}
      <div className="flex gap-3">
        {/* Dropdown de Categorias */}
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className="px-4 py-3 bg-surface border border-zinc-700 rounded-lg text-textMain hover:border-primary transition-colors flex items-center gap-2"
          >
            Categorias
            {selectedCategories.length > 0 && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                {selectedCategories.length}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${
                categoryDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {categoryDropdownOpen && (
            <div className="absolute z-50 mt-2 bg-surface border border-zinc-700 rounded-lg shadow-xl p-3 min-w-[200px] max-h-[300px] overflow-y-auto">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-zinc-800 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => handleCategoryToggle(cat.id, e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-textMain text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Preço (opcional, se quiser adicionar depois) */}
      </div>

      {/* Linha 3: Filtros Ativos (Pills) */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((id) => {
            const cat = categories.find((c) => c.id === id);
            return (
              cat && (
                <span
                  key={id}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30 flex items-center gap-2"
                >
                  {cat.name}
                  <button
                    onClick={() => handleCategoryToggle(id, false)}
                    className="hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              )
            );
          })}
        </div>
      )}
    </div>
  );
}
