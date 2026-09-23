import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserFavorites, 
  toggleUserFavorite,
  getUserMoveFavorites,
  saveUserMoveFavorite,
  updateUserMoveFavoriteNote,
  deleteUserMoveFavorite
} from '../services/firebase';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [moveFavorites, setMoveFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAllFavs() {
      if (user && user.uid) {
        setLoading(true);
        try {
          const [gamesList, movesList] = await Promise.all([
            getUserFavorites(user.uid),
            getUserMoveFavorites(user.uid)
          ]);
          setFavorites(gamesList);
          setMoveFavorites(movesList);
        } catch (e) {
          console.error('Failed to load favorites:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setFavorites([]);
        setMoveFavorites([]);
      }
    }
    loadAllFavs();
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
      setFavorites(favorites);
      console.error('Failed to toggle favorite:', err);
      return alreadyFav;
    }
  };

  const isMoveFavorited = (gameId, plyIndex) => {
    return moveFavorites.some(m => m.gameId === gameId && m.plyIndex === plyIndex);
  };

  const getMoveFavorite = (gameId, plyIndex) => {
    return moveFavorites.find(m => m.gameId === gameId && m.plyIndex === plyIndex);
  };

  const saveMoveFavorite = async (moveFavData) => {
    if (!user) {
      alert('Please log in to bookmark moves with notes.');
      return null;
    }
    try {
      const saved = await saveUserMoveFavorite(user.uid, moveFavData);
      setMoveFavorites(prev => [saved, ...prev.filter(m => m.id !== saved.id)]);
      return saved;
    } catch (err) {
      alert(err.message || 'Failed to save move favorite.');
      return null;
    }
  };

  const updateMoveFavoriteNote = async (favId, note) => {
    if (!user) return null;
    try {
      const updated = await updateUserMoveFavoriteNote(user.uid, favId, note);
      setMoveFavorites(prev => prev.map(m => m.id === favId ? updated : m));
      return updated;
    } catch (err) {
      alert(err.message || 'Failed to update note.');
      return null;
    }
  };

  const deleteMoveFavorite = async (favId) => {
    if (!user) return false;
    try {
      await deleteUserMoveFavorite(user.uid, favId);
      setMoveFavorites(prev => prev.filter(m => m.id !== favId));
      return true;
    } catch (err) {
      alert(err.message || 'Failed to remove move bookmark.');
      return false;
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorite,
      toggleFavorite: toggle,
      moveFavorites,
      isMoveFavorited,
      getMoveFavorite,
      saveMoveFavorite,
      updateMoveFavoriteNote,
      deleteMoveFavorite,
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
