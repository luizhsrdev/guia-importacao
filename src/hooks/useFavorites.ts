import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export function useFavorites() {
  const { isSignedIn, user } = useUser();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar favoritos do usuário
  const fetchFavorites = useCallback(async () => {
    if (!isSignedIn) {
      setFavorites([]);
      return;
    }

    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  }, [isSignedIn]);

  // Carregar favoritos quando usuário fizer login
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Adicionar favorito
  const addFavorite = useCallback(async (productId: string) => {
    if (!isSignedIn) {
      toast.error('Faça login para favoritar produtos');
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, productId]);
        toast.success('Produto adicionado aos favoritos!');
        return true;
      } else {
        toast.error('Erro ao adicionar favorito');
        return false;
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      toast.error('Erro ao adicionar favorito');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Remover favorito
  const removeFavorite = useCallback(async (productId: string) => {
    if (!isSignedIn) return false;

    setLoading(true);

    try {
      const response = await fetch(`/api/favorites?product_id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(id => id !== productId));
        toast.success('Produto removido dos favoritos');
        return true;
      } else {
        toast.error('Erro ao remover favorito');
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Toggle favorito (adicionar ou remover)
  const toggleFavorite = useCallback(async (productId: string) => {
    const isFavorited = favorites.includes(productId);

    if (isFavorited) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Verificar se produto é favorito
  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isSignedIn,
  };
}
