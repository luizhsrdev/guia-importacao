'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
}

interface CurrencyContextType {
  currency: 'CNY' | 'BRL';
  effectiveRate: number;
  loading: boolean;
  setCurrency: (currency: 'CNY' | 'BRL') => void;
  convertToBRL: (priceCNY: number) => number;
  convertToCNY: (priceBRL: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<'CNY' | 'BRL'>('BRL');
  const [effectiveRate, setEffectiveRate] = useState<number>(1.25);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Buscar taxa da API
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        if (res.ok) {
          const data: ExchangeRateData = await res.json();
          setEffectiveRate(data.effectiveRate);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  // Carregar preferência de moeda do localStorage
  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem('currency') as 'CNY' | 'BRL' | null;
    if (savedCurrency) setCurrencyState(savedCurrency);
  }, []);

  // Salvar preferência no localStorage
  const setCurrency = (newCurrency: 'CNY' | 'BRL') => {
    setCurrencyState(newCurrency);
    if (mounted) {
      localStorage.setItem('currency', newCurrency);
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
