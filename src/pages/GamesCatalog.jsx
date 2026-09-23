import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import FilterPanel from '../components/FilterPanel';
import { useFavorites } from '../context/FavoritesContext';
import { 
  Play, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Eye, 
  Calendar, 
  Hash, 
  Award,
  ArrowRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export default function GamesCatalog({ games = [], onSelectGame }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [activePreviewGame, setActivePreviewGame] = useState(null);

  const [filters, setFilters] = useState({
    player: '',
    year: '',
    result: '',
    lengthRange: '',
    eco: '',
    sort: 'year-asc'
  });

  // Extract unique years
  const yearsList = useMemo(() => {
    const set = new Set(games.map(g => g.year));
    return Array.from(set).sort((a, b) => a - b);
  }, [games]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      if (filters.player) {
        const query = filters.player.toLowerCase().trim();
        const matchWhite = game.white && game.white.toLowerCase().includes(query);
        const matchBlack = game.black && game.black.toLowerCase().includes(query);
        if (!matchWhite && !matchBlack) return false;
      }

      if (filters.year) {
        if (filters.year.endsWith('s')) {
          const decadeStart = parseInt(filters.year.slice(0, 4), 10);
          if (game.year < decadeStart || game.year > decadeStart + 9) return false;
        } else {
          if (String(game.year) !== filters.year) return false;
        }
      }

      if (filters.result && game.result !== filters.result) {
        return false;
      }

      if (filters.lengthRange) {
        const moves = game.moveCount || 0;
        if (filters.lengthRange === 'miniature' && moves >= 25) return false;
        if (filters.lengthRange === 'standard' && (moves < 25 || moves > 45)) return false;
        if (filters.lengthRange === 'long' && (moves <= 45 || moves > 70)) return false;
        if (filters.lengthRange === 'marathon' && moves <= 70) return false;
      }

      if (filters.eco) {
        const ecoQuery = filters.eco.toUpperCase().trim();
        if (!game.eco || !game.eco.toUpperCase().startsWith(ecoQuery)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sort === 'year-asc') return a.year - b.year || a.id.localeCompare(b.id);
      if (filters.sort === 'year-desc') return b.year - a.year || b.id.localeCompare(a.id);
      if (filters.sort === 'moves-desc') return (b.moveCount || 0) - (a.moveCount || 0);
      if (filters.sort === 'moves-asc') return (a.moveCount || 0) - (b.moveCount || 0);
      return 0;
    });
  }, [games, filters]);

  // Reset pagination on filter change
  const handleResetFilters = () => {
    setFilters({
      player: '',
      year: '',
      result: '',
      lengthRange: '',
      eco: '',
      sort: 'year-asc'
    });
    setCurrentPage(1);
    setPageInput('1');
  };

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1;

  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  // Automatically select first game on current page for preview if none selected
  useEffect(() => {
    if (paginatedGames.length > 0) {
      if (!activePreviewGame || !paginatedGames.some(g => g.id === activePreviewGame.id)) {
        setActivePreviewGame(paginatedGames[0]);
      }
    } else {
      setActivePreviewGame(null);
    }
  }, [paginatedGames]);

  // Compute final position board state for the active preview game
  const finalPositionState = useMemo(() => {
    if (!activePreviewGame) return null;
    try {
      const chess = new Chess();
      const cleanMoves = (activePreviewGame.moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ');
      chess.loadPgn(cleanMoves);
      const history = chess.history({ verbose: true });
      const lastMove = history.length > 0 ? history[history.length - 1] : null;

      return {
        board: chess.board(),
        fen: chess.fen(),
        lastMove: lastMove ? { from: lastMove.from, to: lastMove.to, san: lastMove.san } : null
      };
    } catch (err) {
      // Return default start position if parsing error
      const chess = new Chess();
      return { board: chess.board(), fen: chess.fen(), lastMove: null };
    }
  }, [activePreviewGame]);

  const handlePageChange = (newPage) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      handlePageChange(p);
    }
  };

  // Generate dotted slider page markers (cluster of ~15 dots around current page)
  const dotPages = useMemo(() => {
    const dots = [];
    const maxDots = 15;
    if (totalPages <= maxDots) {
      for (let i = 1; i <= totalPages; i++) dots.push(i);
    } else {
      const half = Math.floor(maxDots / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxDots - 1);
      if (end - start < maxDots - 1) {
        start = Math.max(1, end - maxDots + 1);
      }
      for (let i = start; i <= end; i++) dots.push(i);
    }
    return dots;
  }, [totalPages, currentPage]);

  const getResultBadge = (result) => {
    if (result === '1-0') return <span className="badge badge-white-win">1-0 White Win</span>;
    if (result === '0-1') return <span className="badge badge-black-win">0-1 Black Win</span>;
    if (result === '1/2-1/2') return <span className="badge badge-draw">½-½ Draw</span>;
    return <span className="badge badge-eco">{result}</span>;
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          World Chess Championship Games
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          1,756 archived games. Scroll through match games with live final position preview on the left.
        </p>
      </div>

      {/* Filter Component */}
      <FilterPanel 
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
          setPageInput('1');
        }}
        onReset={handleResetFilters}
        totalMatches={filteredGames.length}
        yearsList={yearsList}
      />

      {/* Split-View: Left Final Position Preview + Right Scrollable List */}
      <div className="catalog-split-layout">
        {/* Left Side: Final Position Preview Card */}
        <div className="preview-sticky-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Final Position Preview
            </span>
            {activePreviewGame && (
              <span className="badge badge-eco">
                {activePreviewGame.moveCount} moves
              </span>
            )}
          </div>

          {/* Chessboard Preview */}
          <div className="preview-board-wrap">
            {finalPositionState && (
              <ChessBoard 
                boardState={finalPositionState.board}
                lastMove={finalPositionState.lastMove}
              />
            )}
          </div>

          {/* Preview Game Metadata */}
          {activePreviewGame ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {activePreviewGame.event} • Round {activePreviewGame.round} ({activePreviewGame.year})
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', lineHeight: 1.3 }}>
                  {activePreviewGame.white} vs {activePreviewGame.black}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {getResultBadge(activePreviewGame.result)}
                {activePreviewGame.eco && <span className="badge badge-eco">{activePreviewGame.eco}</span>}
                {activePreviewGame.site && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activePreviewGame.site}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => onSelectGame(activePreviewGame)}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Replay Full Game</span>
                </button>

                <button 
                  className={`btn-icon ${isFavorite(activePreviewGame.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(activePreviewGame.id)}
                  title={isFavorite(activePreviewGame.id) ? 'Remove favorite' : 'Save favorite'}
                >
                  <Heart size={16} fill={isFavorite(activePreviewGame.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              Hover or click any game on the right to preview final position.
            </div>
          )}
        </div>

        {/* Right Side: Scrollable Games List */}
        <div>
          {paginatedGames.length > 0 ? (
            <div className="games-list-scrollable">
              {paginatedGames.map(game => {
                const isSelected = activePreviewGame && activePreviewGame.id === game.id;
                const fav = isFavorite(game.id);

                return (
                  <div 
                    key={game.id}
                    className={`game-list-row ${isSelected ? 'active-row' : ''}`}
                    onMouseEnter={() => setActivePreviewGame(game)}
                    onClick={() => setActivePreviewGame(game)}
                    onDoubleClick={() => onSelectGame(game)}
                  >
                    <div className="game-row-left">
                      {/* Meta badge */}
                      <div className="game-row-meta">
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{game.year}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rnd {game.round}</span>
                      </div>

                      {/* Players */}
                      <div className="game-row-players">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                          <span className="player-color-dot white" />
                          <span style={{ fontWeight: game.result === '1-0' ? 600 : 400 }}>{game.white}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                          <span className="player-color-dot black" />
                          <span style={{ fontWeight: game.result === '0-1' ? 600 : 400 }}>{game.black}</span>
                        </div>
                      </div>
                    </div>

                    <div className="game-row-right">
                      {getResultBadge(game.result)}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {game.moveCount}m
                      </span>

                      {/* Favorite Button */}
                      <button 
                        className={`btn-icon ${fav ? 'active' : ''}`}
                        style={{ width: '28px', height: '28px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(game.id);
                        }}
                        title={fav ? 'Remove favorite' : 'Save favorite'}
                      >
                        <Heart size={13} fill={fav ? 'currentColor' : 'none'} />
                      </button>

                      {/* Replay action */}
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectGame(game);
                        }}
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1rem', marginBottom: '12px' }}>No games found matching your search criteria.</p>
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                Clear filters
              </button>
            </div>
          )}

          {/* Dotted Slider & Direct Page Jump Navigation */}
          {filteredGames.length > 0 && (
            <div className="dotted-pagination-container">
              {/* Prev / Dotted Track / Next */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  style={{ opacity: currentPage === 1 ? 0.4 : 1, padding: '6px 12px' }}
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                {/* Dotted Slider Track */}
                <div className="dotted-slider-track" title={`Page ${currentPage} of ${totalPages}`}>
                  {dotPages.map(page => (
                    <div 
                      key={page}
                      className={`slider-dot ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                      title={`Go to page ${page}`}
                    />
                  ))}
                </div>

                <button 
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  style={{ opacity: currentPage === totalPages ? 0.4 : 1, padding: '6px 12px' }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Direct Jump to Page Input */}
              <form onSubmit={handlePageInputSubmit} className="direct-page-jump">
                <span style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                <span style={{ color: 'var(--border-focus)' }}>|</span>
                <span style={{ color: 'var(--text-secondary)' }}>Go to page:</span>
                <input 
                  type="number" 
                  min="1" 
                  max={totalPages} 
                  className="input-field" 
                  style={{ width: '64px', padding: '4px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                  Jump
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
