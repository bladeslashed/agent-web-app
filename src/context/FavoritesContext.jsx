import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserFavorites, toggleUserFavorite } from '../services/firebase';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFavs() {
      if (user && user.uid) {
        setLoading(true);
        try {
          const list = await getUserFavorites(user.uid);
          setFavorites(list);
        } catch (e) {
          console.error('Failed to load favorites:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setFavorites([]);
      }
    }
    loadFavs();
  }, [user]);

  const isFavorite = (gameId) => favorites.includes(gameId);

  const toggle = async (gameId) => {
    if (!user) {
      alert('Please log in with your email or demo account to save favorites to your profile.');
      return false;
    }
    // Optimistic UI update
    const alreadyFav = favorites.includes(gameId);
    const next = alreadyFav ? favorites.filter(id => id !== gameId) : [...favorites, gameId];
    setFavorites(next);

    try {
      await toggleUserFavorite(user.uid, gameId);
      return !alreadyFav;
    } catch (err) {
      // Revert if error
      setFavorites(favorites);
      console.error('Failed to toggle favorite:', err);
      return alreadyFav;
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite: toggle,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
