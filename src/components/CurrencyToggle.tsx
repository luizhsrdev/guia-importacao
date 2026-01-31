'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

export function CurrencyToggle() {
  const { currency, effectiveRate, loading, setCurrency } = useCurrency();

  const handleToggle = () => {
    setCurrency(currency === 'CNY' ? 'BRL' : 'CNY');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        className="group relative flex items-center gap-2 h-10 px-4 rounded-xl overflow-hidden neu-elevated"
      >
        <span className="text-text-tertiary text-xs font-medium">Moeda</span>
        <div className="relative w-8 h-5 flex items-center justify-center overflow-hidden">
          <span
            className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
              currency === 'CNY'
                ? 'translate-y-0 opacity-100'
                : '-translate-y-full opacity-0'
            }`}
          >
            CNY
          </span>
          <span
            className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
              currency === 'BRL'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-full opacity-0'
            }`}
          >
            BRL
          </span>
        </div>
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </button>

      {/* Taxa atual (somente leitura) */}
      <div className="h-10 px-3 bg-surface rounded-xl border border-border shadow-sm text-xs flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-text-tertiary">R$1 ≈</span>
        {loading ? (
          <span className="text-text-muted">...</span>
        ) : (
          <span className="text-text-primary font-medium">¥ {effectiveRate.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
