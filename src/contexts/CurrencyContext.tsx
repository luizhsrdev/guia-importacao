'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  currency: 'CNY' | 'BRL';
  cnyRate: number;
  setCurrency: (currency: 'CNY' | 'BRL') => void;
  setCnyRate: (rate: number) => void;
  convertPrice: (priceCNY: string) => string;
  formatPrice: (priceCNY: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Estado persistido no localStorage
  const [currency, setCurrency] = useState<'CNY' | 'BRL'>('CNY');
  const [cnyRate, setCnyRate] = useState<number>(0.70); // 1 CNY = R$ 0,70
  const [mounted, setMounted] = useState(false);

  // Carregar preferências do localStorage
  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem('currency') as 'CNY' | 'BRL' | null;
    const savedRate = localStorage.getItem('cnyRate');

    if (savedCurrency) setCurrency(savedCurrency);
    if (savedRate) setCnyRate(parseFloat(savedRate));
  }, []);

  // Salvar no localStorage ao mudar
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('currency', currency);
      localStorage.setItem('cnyRate', cnyRate.toString());
    }
  }, [currency, cnyRate, mounted]);

  // Converter preço
  const convertPrice = (priceCNY: string): string => {
    const cny = parseFloat(priceCNY.replace(/[^0-9.]/g, ''));
    if (isNaN(cny)) return '0.00';

    if (currency === 'CNY') {
      return cny.toFixed(2);
    } else {
      const brl = cny * cnyRate;
      return brl.toFixed(2);
    }
  };

  // Formatar com símbolo
  const formatPrice = (priceCNY: string): string => {
    const converted = convertPrice(priceCNY);

    if (currency === 'CNY') {
      return `¥ ${converted}`;
    } else {
      return `R$ ${converted}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      cnyRate,
      setCurrency,
      setCnyRate,
      convertPrice,
      formatPrice
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
