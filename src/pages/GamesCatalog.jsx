import React, { useState, useMemo } from 'react';
import GameCard from '../components/GameCard';
import FilterPanel from '../components/FilterPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function GamesCatalog({ games = [], onSelectGame }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    player: '',
    year: '',
    result: '',
    lengthRange: '',
    eco: '',
    sort: 'year-asc'
  });

  // Extract list of unique years for dropdown
  const yearsList = useMemo(() => {
    const set = new Set(games.map(g => g.year));
    return Array.from(set).sort((a, b) => a - b);
  }, [games]);

  // Filter games based on criteria
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Player filter
      if (filters.player) {
        const query = filters.player.toLowerCase().trim();
        const matchWhite = game.white && game.white.toLowerCase().includes(query);
        const matchBlack = game.black && game.black.toLowerCase().includes(query);
        if (!matchWhite && !matchBlack) return false;
      }

      // Year / Decade filter
      if (filters.year) {
        if (filters.year.endsWith('s')) {
          const decadeStart = parseInt(filters.year.slice(0, 4), 10);
          if (game.year < decadeStart || game.year > decadeStart + 9) return false;
        } else {
          if (String(game.year) !== filters.year) return false;
        }
      }

      // Result filter
      if (filters.result && game.result !== filters.result) {
        return false;
      }

      // Move length filter
      if (filters.lengthRange) {
        const moves = game.moveCount || 0;
        if (filters.lengthRange === 'miniature' && moves >= 25) return false;
        if (filters.lengthRange === 'standard' && (moves < 25 || moves > 45)) return false;
        if (filters.lengthRange === 'long' && (moves <= 45 || moves > 70)) return false;
        if (filters.lengthRange === 'marathon' && moves <= 70) return false;
      }

      // ECO code filter
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

  // Reset page when filters change
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
  };

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1;
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  return (
    <div>
      {/* Title & Stats */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          World Chess Championship Games
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Explore, replay, and analyze all 1,756 official World Championship games across the 20th century.
        </p>
      </div>

      {/* Filter Component */}
      <FilterPanel 
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        totalMatches={filteredGames.length}
        yearsList={yearsList}
      />

      {/* Games Catalog Grid */}
      {paginatedGames.length > 0 ? (
        <>
          <div className="games-grid">
            {paginatedGames.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onSelect={onSelectGame} 
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '36px' }}>
            <button 
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button 
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No games found matching your search criteria.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
