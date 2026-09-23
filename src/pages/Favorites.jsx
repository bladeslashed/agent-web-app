import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { Heart, LogIn, Play, Trash2, ArrowLeft } from 'lucide-react';

export default function Favorites({ allGames = [], onSelectGame, onNavigate }) {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  // Find all games that match the user's favorites array
  const favoriteGames = allGames.filter(g => 
    favorites.includes(g.id) || favorites.includes(g.filename)
  );

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <Heart size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}>Sign in to View Favorites</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Save games to your personal archive and review them anytime with engine evaluation.
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('auth')}>
          <LogIn size={16} />
          <span>Sign In / Sign Up</span>
        </button>
      </div>
    );
  }

  const getResultBadge = (result) => {
    if (result === '1-0') return <span className="badge badge-white-win">1-0 White Win</span>;
    if (result === '0-1') return <span className="badge badge-black-win">0-1 Black Win</span>;
    if (result === '1/2-1/2') return <span className="badge badge-draw">½-½ Draw</span>;
    return <span className="badge badge-eco">{result}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            My Favorite Games
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {favoriteGames.length} {favoriteGames.length === 1 ? 'game' : 'games'} saved to your account.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => onNavigate('catalog')}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>
      </div>

      {favoriteGames.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {favoriteGames.map(game => (
            <div 
              key={game.id} 
              className="game-list-row"
              onClick={() => onSelectGame(game)}
            >
              <div className="game-row-left">
                <div className="game-row-meta">
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{game.year}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rnd {game.round}</span>
                </div>

                <div className="game-row-players">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <span className="player-color-dot white" />
                    <span style={{ fontWeight: game.result === '1-0' ? 600 : 400 }}>{game.white}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <span className="player-color-dot black" />
                    <span style={{ fontWeight: game.result === '0-1' ? 600 : 400 }}>{game.black}</span>
                  </div>
                </div>
              </div>

              <div className="game-row-right">
                {getResultBadge(game.result)}
                {game.eco && <span className="badge badge-eco">{game.eco}</span>}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {game.moveCount} moves
                </span>

                <button 
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGame(game);
                  }}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Replay</span>
                </button>

                <button 
                  className="btn-icon"
                  style={{ color: 'var(--accent-danger)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(game.id);
                  }}
                  title="Remove from favorites"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Heart size={38} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '6px', fontWeight: 500 }}>
            You haven't saved any games to your favorites yet.
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Click the heart icon on any game in the catalog to save it here.
          </p>
          <button className="btn btn-secondary" onClick={() => onNavigate('catalog')}>
            Explore Championship Games
          </button>
        </div>
      )}
    </div>
  );
}
