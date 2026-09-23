import React from 'react';
import { Heart, Play } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

export default function GameCard({ game, onSelect }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(game.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  const getResultBadge = (result) => {
    if (result === '1-0') return <span className="badge badge-white-win">1-0 White Win</span>;
    if (result === '0-1') return <span className="badge badge-black-win">0-1 Black Win</span>;
    if (result === '1/2-1/2') return <span className="badge badge-draw">½-½ Draw</span>;
    return <span className="badge badge-eco">{result}</span>;
  };

  return (
    <div className="game-card" onClick={() => onSelect(game)}>
      <div>
        <div className="game-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="game-card-year">{game.year}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Round {game.round}</span>
          </div>

          <button 
            className={`btn-icon ${fav ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={fav ? 'Remove from favorites' : 'Save to favorites'}
            style={{ width: '30px', height: '30px' }}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Players */}
        <div className="game-card-players">
          <div className="player-row">
            <div className="player-info">
              <span className="player-color-dot white" />
              <span style={{ fontWeight: game.result === '1-0' ? 600 : 400 }}>
                {game.white}
              </span>
            </div>
            {game.whiteElo && <span className="player-elo">{game.whiteElo}</span>}
          </div>

          <div className="player-row">
            <div className="player-info">
              <span className="player-color-dot black" />
              <span style={{ fontWeight: game.result === '0-1' ? 600 : 400 }}>
                {game.black}
              </span>
            </div>
            {game.blackElo && <span className="player-elo">{game.blackElo}</span>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="game-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getResultBadge(game.result)}
          {game.eco && <span className="badge badge-eco">{game.eco}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{game.moveCount} moves</span>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <Play size={12} fill="currentColor" />
          </span>
        </div>
      </div>
    </div>
  );
}
