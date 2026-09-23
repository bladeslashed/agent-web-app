import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  LogIn, 
  Play, 
  Trash2, 
  ArrowLeft, 
  Bookmark, 
  Edit3, 
  Check, 
  X, 
  FileText 
} from 'lucide-react';

export default function Favorites({ allGames = [], onSelectGame, onNavigate }) {
  const { user } = useAuth();
  const { 
    favorites, 
    toggleFavorite, 
    moveFavorites, 
    updateMoveFavoriteNote, 
    deleteMoveFavorite 
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('games'); // 'games' | 'moves'
  const [editingFavId, setEditingFavId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

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
          Save games and bookmarked moves with notes to your personal archive.
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

  const handleStartEditNote = (fav) => {
    setEditingFavId(fav.id);
    setEditNoteText(fav.note || '');
  };

  const handleSaveEditNote = async (favId) => {
    await updateMoveFavoriteNote(favId, editNoteText);
    setEditingFavId(null);
  };

  const handleReplayMove = (moveFav) => {
    const matched = allGames.find(g => g.id === moveFav.gameId);
    if (matched) {
      onSelectGame(matched, moveFav.plyIndex);
    } else {
      // Fallback synthetic game object
      const fallbackGame = {
        id: moveFav.gameId,
        year: moveFav.year,
        event: moveFav.event,
        white: moveFav.white,
        black: moveFav.black,
        result: moveFav.result || '*',
        eco: moveFav.eco || '',
        moves: ''
      };
      onSelectGame(fallbackGame, moveFav.plyIndex);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            My Personal Archive
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {favoriteGames.length} saved games • {moveFavorites.length} bookmarked moves with notes
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => onNavigate('catalog')}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'games' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('games')}
        >
          <Heart size={15} fill={activeTab === 'games' ? 'currentColor' : 'none'} />
          <span>Saved Games ({favoriteGames.length})</span>
        </button>
        <button
          className={`btn ${activeTab === 'moves' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('moves')}
        >
          <Bookmark size={15} fill={activeTab === 'moves' ? 'currentColor' : 'none'} />
          <span>Bookmarked Moves &amp; Notes ({moveFavorites.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED GAMES */}
      {activeTab === 'games' && (
        favoriteGames.length > 0 ? (
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
        )
      )}

      {/* TAB 2: BOOKMARKED MOVES & NOTES */}
      {activeTab === 'moves' && (
        moveFavorites.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {moveFavorites.map(fav => {
              const isEditing = editingFavId === fav.id;

              return (
                <div 
                  key={fav.id}
                  className="card"
                  style={{ padding: '16px 20px', transition: 'all 120ms ease' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-eco" style={{ fontSize: '0.9rem', padding: '4px 10px', fontWeight: 700 }}>
                        {fav.moveSan}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                          {fav.white} vs {fav.black} ({fav.year})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {fav.event || 'World Championship'} • Ply {fav.plyIndex + 1} • Saved {new Date(fav.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        onClick={() => handleReplayMove(fav)}
                        title="Replay game from this exact move"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>Replay from Move</span>
                      </button>

                      <button 
                        className="btn-icon"
                        style={{ color: 'var(--accent-danger)' }}
                        onClick={() => {
                          if (window.confirm('Delete this move bookmark and study note?')) {
                            deleteMoveFavorite(fav.id);
                          }
                        }}
                        title="Delete move bookmark"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Study Note Section */}
                  <div style={{ marginTop: '12px', padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <FileText size={12} />
                        Study Note &amp; Commentary
                      </span>

                      {!isEditing && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', height: '26px' }}
                          onClick={() => handleStartEditNote(fav)}
                        >
                          <Edit3 size={12} />
                          <span>Edit Note</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                        <textarea 
                          className="input-field" 
                          rows={3} 
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          placeholder="Add your analysis, ideas, or reminders for this move..."
                          style={{ fontSize: '0.85rem' }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => setEditingFavId(null)}
                          >
                            <X size={12} />
                            <span>Cancel</span>
                          </button>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                            onClick={() => handleSaveEditNote(fav.id)}
                          >
                            <Check size={12} />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.88rem', color: fav.note ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: fav.note ? 'normal' : 'italic', lineHeight: 1.5 }}>
                        {fav.note || 'No notes added yet for this move. Click "Edit Note" to record your personal analysis.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Bookmark size={38} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '1.1rem', marginBottom: '6px', fontWeight: 500 }}>
              You haven't bookmarked any specific moves yet.
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px' }}>
              When analyzing any championship game, click the <strong>Bookmark Move</strong> button to save key tactical shots, sacrifices, and endgame maneuvers with personal notes.
            </p>
            <button className="btn btn-secondary" onClick={() => onNavigate('catalog')}>
              Explore Games &amp; Bookmark Moves
            </button>
          </div>
        )
      )}
    </div>
  );
}
