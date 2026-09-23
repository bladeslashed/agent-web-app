import React from 'react';
import GameCard from '../components/GameCard';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { Heart, LogIn } from 'lucide-react';

export default function Favorites({ allGames = [], onSelectGame, onNavigate }) {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  // Filter games that are in the user's favorites list
  const favoriteGames = allGames.filter(g => favorites.includes(g.id));

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}>Sign in to View Favorites</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Save games to your personal Firebase library and review them anytime with engine evaluation.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('auth')}>
          <LogIn size={16} />
          <span>Sign In / Sign Up</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          My Favorite Games
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          {favoriteGames.length} {favoriteGames.length === 1 ? 'game' : 'games'} saved to your account.
        </p>
      </div>

      {favoriteGames.length > 0 ? (
        <div className="games-grid">
          {favoriteGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onSelect={onSelectGame} 
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Heart size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '14px' }}>You haven't saved any games to your favorites yet.</p>
          <button className="btn btn-secondary" onClick={() => onNavigate('catalog')}>
            Browse World Championship Games
          </button>
        </div>
      )}
    </div>
  );
}
