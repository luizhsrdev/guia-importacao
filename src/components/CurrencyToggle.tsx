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

  return (
    <div className="flex items-center gap-3">
      {/* Toggle CNY/BRL */}
      <button
        onClick={() => setCurrency(currency === 'CNY' ? 'BRL' : 'CNY')}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700
                   hover:border-primary transition-colors"
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
                         hover:border-primary transition-colors text-xs"
            >
              <span className="text-textSecondary">¥1 = </span>
              <span className="text-textMain">R$ {cnyRate.toFixed(2)}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRateSubmit()}
                className="w-20 px-2 py-1 bg-zinc-900 border border-primary rounded text-textMain text-xs"
                autoFocus
              />
              <button
                onClick={handleRateSubmit}
                className="px-2 py-1 bg-primary text-background rounded text-xs font-bold"
              >
                OK
              </button>
              <button
                onClick={() => setIsEditingRate(false)}
                className="px-2 py-1 bg-zinc-700 text-textMain rounded text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
