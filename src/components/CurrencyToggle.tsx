'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CurrencyToggle() {
  const { currency, cnyRate, setCurrency, setCnyRate } = useCurrency();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(cnyRate.toString());

  const handleRateSubmit = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      setCnyRate(newRate);
      setIsEditingRate(false);
    }
  };

  const handleCancel = () => {
    setTempRate(cnyRate.toString());
    setIsEditingRate(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Toggle CNY/BRL */}
      <button
        onClick={() => setCurrency(currency === 'CNY' ? 'BRL' : 'CNY')}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700
                   hover:border-primary transition-all duration-200"
      >
        <span className="text-textSecondary text-sm">Moeda:</span>
        <span className="text-primary font-bold">{currency}</span>
      </button>

      {/* Cotação (clicável para editar) */}
      {currency === 'BRL' && (
        <div className="relative">
          {!isEditingRate ? (
            <button
              onClick={() => {
                setIsEditingRate(true);
                setTempRate(cnyRate.toString());
              }}
              className="px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-700
                         hover:border-primary transition-all duration-200 text-xs
                         flex items-center gap-1"
            >
              <span className="text-textSecondary">¥1 = </span>
              <span className="text-textMain">R$ {cnyRate.toFixed(2)}</span>
              <svg className="w-3 h-3 text-textSecondary ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-expand">
              <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-primary rounded-lg">
                <span className="text-textSecondary text-xs">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRateSubmit();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  className="w-16 px-1 bg-transparent border-none text-textMain text-xs
                             focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleRateSubmit}
                className="px-3 py-1.5 bg-primary text-background rounded-lg text-xs font-medium
                           hover:bg-primary/90 transition-colors"
              >
                OK
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-textSecondary hover:text-textMain transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
