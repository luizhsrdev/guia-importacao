'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { fetcher } from '@/lib/fetcher';

interface FavoritesResponse {
  favorites: string[];
}

const SELLER_FAVORITES_KEY = '/api/seller-favorites';

export function useSellerFavorites() {
  const { isSignedIn } = useUser();

  // SWR para buscar favoritos com cache automático
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(
    isSignedIn ? SELLER_FAVORITES_KEY : null, // Só busca se estiver logado
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
    }
  );

  // Memoizar favorites para evitar re-renders desnecessários
  const favorites = useMemo(() => data?.favorites ?? [], [data?.favorites]);

  // Adicionar favorito com optimistic update
  const addFavorite = useCallback(async (sellerId: string) => {
    if (!isSignedIn) {
      toast.error('Faça login para favoritar vendedores');
      return false;
    }

    // Optimistic update
    const previousData = data;
    mutate({ favorites: [...favorites, sellerId] }, false);

    try {
      const response = await fetch(SELLER_FAVORITES_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId }),
      });

      if (response.ok) {
        toast.success('Vendedor adicionado aos favoritos!');
        mutate(); // Revalidar
        return true;
      }

      // Rollback em caso de erro
      mutate(previousData, false);
      toast.error('Erro ao adicionar favorito');
      return false;
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      mutate(previousData, false);
      toast.error('Erro ao adicionar favorito');
      return false;
    }
  }, [isSignedIn, data, favorites, mutate]);

  // Remover favorito com optimistic update
  const removeFavorite = useCallback(async (sellerId: string) => {
    if (!isSignedIn) return false;

    // Optimistic update
    const previousData = data;
    mutate({ favorites: favorites.filter(id => id !== sellerId) }, false);

    try {
      const response = await fetch(`${SELLER_FAVORITES_KEY}?seller_id=${sellerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Vendedor removido dos favoritos');
        mutate(); // Revalidar
        return true;
      }

      // Rollback em caso de erro
      mutate(previousData, false);
      toast.error('Erro ao remover favorito');
      return false;
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      mutate(previousData, false);
      toast.error('Erro ao remover favorito');
      return false;
    }
  }, [isSignedIn, data, favorites, mutate]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (sellerId: string) => {
    const isFavorited = favorites.includes(sellerId);
    return isFavorited ? removeFavorite(sellerId) : addFavorite(sellerId);
  }, [favorites, addFavorite, removeFavorite]);

  // Verificar se vendedor é favorito
  const isFavorite = useCallback((sellerId: string) => {
    return favorites.includes(sellerId);
  }, [favorites]);

  return {
    favorites,
    loading: isLoading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isSignedIn,
  };
}
