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

  const hasFilters = search || selectedCategories.length > 0 || priceMin || priceMax;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-11 bg-surface border border-border rounded-xl pl-10 sm:pl-11 pr-3 sm:pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-surface-elevated transition-all duration-150"
          />
          <svg
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
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

        <button
          onClick={handleSearch}
          className="h-11 px-4 sm:px-6 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors duration-150 flex-shrink-0"
        >
          <span className="hidden sm:inline">Buscar</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="h-11 w-11 sm:w-auto sm:px-4 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-xl text-sm font-medium bg-surface border border-border hover:bg-surface-elevated transition-all duration-150 flex-shrink-0"
            aria-label="Limpar filtros"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3 items-start sm:items-center flex-wrap">
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className={`h-10 px-3 sm:px-4 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 touch-target ${
              selectedCategories.length > 0
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated'
            }`}
          >
            <span className="hidden sm:inline">Categorias</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {selectedCategories.length > 0 && (
              <span className="w-5 h-5 rounded-md bg-white/20 text-white text-xs flex items-center justify-center font-semibold">
                {selectedCategories.length}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-150 hidden sm:block ${
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
            <div className="absolute left-0 sm:left-auto z-50 mt-2 bg-surface border border-border rounded-xl p-2 w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[220px] max-h-[60vh] sm:max-h-[280px] overflow-y-auto modal-scroll shadow-xl">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 py-3 sm:py-2.5 px-3 cursor-pointer hover:bg-surface-elevated rounded-lg transition-colors duration-100 touch-target"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={(e) => handleCategoryToggle(cat.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-150 flex items-center justify-center">
                      {selectedCategories.includes(cat.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-text-primary text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedCategories.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return (
                cat && (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 h-8 px-3 bg-surface-elevated rounded-lg text-sm text-text-primary"
                  >
                    <span className="max-w-[120px] sm:max-w-none truncate">{cat.name}</span>
                    <button
                      onClick={() => handleCategoryToggle(id, false)}
                      className="text-text-muted hover:text-text-primary transition-colors touch-target flex items-center justify-center -mr-1"
                      aria-label={`Remover ${cat.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
