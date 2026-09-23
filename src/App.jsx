import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GamesCatalog from './pages/GamesCatalog';
import GameReplay from './pages/GameReplay';
import Favorites from './pages/Favorites';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import DailyHighlights from './pages/DailyHighlights';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('catalog'); // 'catalog' | 'replay' | 'favorites' | 'community' | 'profile' | 'auth' | 'admin' | 'highlights' | 'settings'
  const [selectedGame, setSelectedGame] = useState(null);

  // Load all 1,756 compiled games
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/data/games.json');
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        } else {
          console.error('Failed to load games.json:', res.statusText);
        }
      } catch (err) {
        console.error('Error fetching games.json:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  const handleSelectGame = (game, initialPly = undefined) => {
    if (initialPly !== undefined) {
      setSelectedGame({ ...game, initialPly });
    } else {
      setSelectedGame(game);
    }
    setCurrentView('replay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomGame = () => {
    if (!games || games.length === 0) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    const randomGame = games[randomIndex];
    setSelectedGame(randomGame);
    setCurrentView('replay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onRandomGame={handleRandomGame}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
            <div className="brand-icon" style={{ margin: '0 auto 16px', width: '48px', height: '48px', fontSize: '1.8rem' }}>
              ♞
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Loading The Chess Archive...
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              Indexed 4,600+ World Championship games (1907 - Present)
            </div>
          </div>
        ) : (
          <>
            {currentView === 'catalog' && (
              <GamesCatalog 
                games={games}
                onSelectGame={handleSelectGame}
              />
            )}

            {currentView === 'replay' && selectedGame && (
              <GameReplay 
                game={selectedGame}
                onBack={() => setCurrentView('catalog')}
              />
            )}

            {currentView === 'highlights' && (
              <DailyHighlights 
                allGames={games}
                onSelectGame={handleSelectGame}
              />
            )}

            {currentView === 'favorites' && (
              <Favorites 
                allGames={games}
                onSelectGame={handleSelectGame}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'community' && (
              <Community 
                allGames={games}
                onSelectGame={handleSelectGame}
              />
            )}

            {currentView === 'settings' && (
              <Settings />
            )}

            {currentView === 'profile' && (
              <Profile 
                onBack={() => setCurrentView('catalog')}
                onNavigateSettings={() => handleNavigate('settings')}
              />
            )}

            {currentView === 'auth' && (
              <Auth 
                onComplete={() => setCurrentView('catalog')}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard 
                onBack={() => setCurrentView('catalog')}
              />
            )}
          </>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
          <span>♞ The Chess Archive</span>
          <span>•</span>
          <span>1,756 World Championship Games</span>
          <span>•</span>
          <span>Stockfish Evaluation</span>
        </div>
        <div>Built with Firebase Database &amp; Authentication</div>
      </footer>
    </div>
  );
}
