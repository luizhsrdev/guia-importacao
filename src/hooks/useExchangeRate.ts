'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
  notes?: string;
}

const EXCHANGE_RATE_KEY = '/api/exchange-rate';

// Cache por 5 minutos, revalidar a cada 10 minutos
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 300000, // 5 minutos - evita requests duplicados
  refreshInterval: 600000, // 10 minutos - atualização automática
};

/**
 * Hook para buscar taxa de câmbio com SWR
 * - Cache automático
 * - Deduplicação de requests
 * - Stale-while-revalidate
 * - Fallback para valor padrão
 */
export function useExchangeRate() {
  const { data, error, isLoading, mutate } = useSWR<ExchangeRateData>(
    EXCHANGE_RATE_KEY,
    fetcher,
    SWR_CONFIG
  );

  return {
    data,
    effectiveRate: data?.effectiveRate ?? 1.25, // Fallback padrão
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
