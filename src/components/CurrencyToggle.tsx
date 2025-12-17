'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

const ANIMATION_DELAY_MS = 50;

export function CurrencyToggle() {
  const { currency, cnyRate, setCurrency, setCnyRate } = useCurrency();
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(cnyRate.toString());
  const [showRateButton, setShowRateButton] = useState(currency === 'BRL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currency === 'BRL') {
      const timer = setTimeout(() => setShowRateButton(true), ANIMATION_DELAY_MS);
      return () => clearTimeout(timer);
    } else {
      setShowRateButton(false);
      setIsEditingRate(false);
    }
  }, [currency]);

  useEffect(() => {
    if (isEditingRate && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingRate]);

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

      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          currency === 'BRL' && showRateButton
            ? 'max-w-[300px] opacity-100 translate-x-0'
            : 'max-w-0 opacity-0 -translate-x-4'
        }`}
      >
        <div>
          {!isEditingRate ? (
            <button
              onClick={() => {
                setIsEditingRate(true);
                setTempRate(cnyRate.toString());
              }}
              className="group h-10 px-3 bg-surface rounded-xl border border-border shadow-sm hover:bg-surface-elevated hover:border-border-emphasis transition-all duration-200 text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="text-text-tertiary">¥1 =</span>
              <span className="text-text-primary font-medium">R$ {cnyRate.toFixed(2)}</span>
              <svg
                className="w-3.5 h-3.5 text-text-muted ml-0.5 group-hover:text-primary transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 h-10 px-3 bg-surface border border-primary rounded-xl transition-all duration-200">
              <span className="text-text-tertiary text-xs">R$</span>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRateSubmit();
                  if (e.key === 'Escape') handleCancel();
                }}
                className="w-14 px-1 bg-transparent border-none text-text-primary text-sm font-medium focus:outline-none"
              />
            </div>
            <button
              onClick={handleRateSubmit}
              className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-200"
            >
              OK
            </button>
            <button
              onClick={handleCancel}
              className="h-10 w-10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-xl active:scale-95 transition-all duration-200"
              aria-label="Cancelar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
