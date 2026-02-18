'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import { fetcher } from '@/lib/fetcher';

interface FavoritesResponse {
  favorites: string[];
}

const FAVORITES_KEY = '/api/favorites';

export function useFavorites() {
  const { isSignedIn } = useUser();

  // SWR para buscar favoritos com cache automático
  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(
    isSignedIn ? FAVORITES_KEY : null, // Só busca se estiver logado
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
    }
  );

  // Memoizar favorites para evitar re-renders desnecessários
  const favorites = useMemo(() => data?.favorites ?? [], [data?.favorites]);

  // Adicionar favorito com optimistic update
  const addFavorite = useCallback(async (productId: string) => {
    if (!isSignedIn) {
      toast.error('Faça login para favoritar produtos');
      return false;
    }

    // Optimistic update
    const previousData = data;
    mutate({ favorites: [...favorites, productId] }, false);

    try {
      const response = await fetch(FAVORITES_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        toast.success('Produto adicionado aos favoritos!');
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
  const removeFavorite = useCallback(async (productId: string) => {
    if (!isSignedIn) return false;

    // Optimistic update
    const previousData = data;
    mutate({ favorites: favorites.filter(id => id !== productId) }, false);

    try {
      const response = await fetch(`${FAVORITES_KEY}?product_id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Produto removido dos favoritos');
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
  const toggleFavorite = useCallback(async (productId: string) => {
    const isFavorited = favorites.includes(productId);
    return isFavorited ? removeFavorite(productId) : addFavorite(productId);
  }, [favorites, addFavorite, removeFavorite]);

  // Verificar se produto é favorito
  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
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
