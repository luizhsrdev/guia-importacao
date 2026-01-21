import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export function useSellerFavorites() {
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
      const response = await fetch('/api/seller-favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos de vendedores:', error);
    }
  }, [isSignedIn]);

  // Carregar favoritos quando usuário fizer login
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Adicionar favorito
  const addFavorite = useCallback(async (sellerId: string) => {
    if (!isSignedIn) {
      toast.error('Faça login para favoritar vendedores');
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/seller-favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, sellerId]);
        toast.success('Vendedor adicionado aos favoritos!');
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
  const removeFavorite = useCallback(async (sellerId: string) => {
    if (!isSignedIn) return false;

    setLoading(true);

    try {
      const response = await fetch(`/api/seller-favorites?seller_id=${sellerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(id => id !== sellerId));
        toast.success('Vendedor removido dos favoritos');
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
  const toggleFavorite = useCallback(async (sellerId: string) => {
    const isFavorited = favorites.includes(sellerId);

    if (isFavorited) {
      return await removeFavorite(sellerId);
    } else {
      return await addFavorite(sellerId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Verificar se vendedor é favorito
  const isFavorite = useCallback((sellerId: string) => {
    return favorites.includes(sellerId);
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
