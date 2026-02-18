'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface CurrencyContextType {
  currency: 'CNY' | 'BRL';
  effectiveRate: number;
  loading: boolean;
  setCurrency: (currency: 'CNY' | 'BRL') => void;
  convertToBRL: (priceCNY: number) => number;
  convertToCNY: (priceBRL: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<'CNY' | 'BRL'>('BRL');
  const [mounted, setMounted] = useState(false);

  // Usar hook SWR com cache automático e deduplicação
  const { effectiveRate, loading } = useExchangeRate();

  // Carregar preferência de moeda do localStorage
  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as 'CNY' | 'BRL' | null;
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Salvar preferência no localStorage
  const setCurrency = (newCurrency: 'CNY' | 'BRL') => {
    setCurrencyState(newCurrency);
    if (mounted) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    }
  };

  // Converter CNY para BRL
  const convertToBRL = (priceCNY: number): number => {
    return priceCNY / effectiveRate;
  };

  // Converter BRL para CNY
  const convertToCNY = (priceBRL: number): number => {
    return priceBRL * effectiveRate;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      effectiveRate,
      loading,
      setCurrency,
      convertToBRL,
      convertToCNY,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency deve ser usado dentro de CurrencyProvider');
  }
  return context;
}
