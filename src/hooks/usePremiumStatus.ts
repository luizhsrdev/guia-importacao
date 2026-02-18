'use client';

import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';

interface CheckPremiumResponse {
  isPremium: boolean;
  isAdmin: boolean;
}

const PREMIUM_CHECK_KEY = '/api/check-premium';

// Fetcher customizado para POST
async function premiumFetcher(userId: string): Promise<CheckPremiumResponse> {
  const res = await fetch(PREMIUM_CHECK_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    return { isPremium: false, isAdmin: false };
  }

  return res.json();
}

/**
 * Hook para verificar status premium do usuário com SWR
 * - Cache automático
 * - Deduplicação de requests
 * - Só busca quando usuário está logado
 */
export function usePremiumStatus() {
  const { user, isLoaded } = useUser();

  const { data, error, isLoading } = useSWR<CheckPremiumResponse>(
    // Só busca se usuário estiver carregado e logado
    isLoaded && user ? [PREMIUM_CHECK_KEY, user.id] : null,
    () => premiumFetcher(user!.id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutos
      revalidateOnReconnect: false,
    }
  );

  // Ainda carregando se Clerk não carregou ou SWR está buscando
  const loading = !isLoaded || (isLoaded && user && isLoading);

  return {
    isPremium: data?.isPremium ?? false,
    isAdmin: data?.isAdmin ?? false,
    hasPremiumAccess: data?.isPremium || data?.isAdmin || false,
    isAuthenticated: !!user,
    loading,
    error,
  };
}
