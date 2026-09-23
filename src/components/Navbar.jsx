import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, 
  Heart, 
  Users, 
  User, 
  LogOut, 
  LogIn, 
  Shield, 
  Moon, 
  Sun, 
  Leaf,
  Database
} from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  const { user, logout, isFirebase } = useAuth();
  const { favorites } = useFavorites();
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdmin = user && (user.role === 'admin' || user.uid === '1');

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('verdant');
    else if (theme === 'verdant') setTheme('light');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (theme === 'verdant') return <Leaf size={16} style={{ color: '#22c55e' }} />;
    if (theme === 'light') return <Sun size={16} style={{ color: '#f59e0b' }} />;
    return <Moon size={16} />;
  };

  const getThemeLabel = () => {
    if (theme === 'verdant') return 'Verdant';
    if (theme === 'light') return 'Light';
    return 'Dark';
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <div 
        className="nav-brand" 
        style={{ cursor: 'pointer' }}
        onClick={() => onNavigate('catalog')}
      >
        <span className="brand-icon">♞</span>
        <span>The Chess Archive</span>
      </div>

      {/* Nav Links */}
      <nav className="nav-links">
        <button 
          className={`nav-item ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => onNavigate('catalog')}
        >
          <BookOpen size={16} />
          <span>Games</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'favorites' ? 'active' : ''}`}
          onClick={() => onNavigate('favorites')}
        >
          <Heart size={16} style={{ color: favorites.length > 0 ? 'var(--accent-danger)' : 'inherit' }} />
          <span>Favorites</span>
          {favorites.length > 0 && (
            <span 
              className="badge" 
              style={{ background: 'var(--accent-danger)', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px' }}
            >
              {favorites.length}
            </span>
          )}
        </button>

        <button 
          className={`nav-item ${currentView === 'community' ? 'active' : ''}`}
          onClick={() => onNavigate('community')}
        >
          <Users size={16} />
          <span>Community</span>
        </button>

        {/* Admin Link if Admin */}
        {isAdmin && (
          <button 
            className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
            style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
          >
            <Shield size={16} />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Right Controls: Theme Switcher & User Profile */}
      <div className="nav-auth">
        {/* Theme Switcher Button */}
        <button 
          className="btn-icon" 
          onClick={cycleTheme}
          title={`Current theme: ${getThemeLabel()}. Click to switch theme (Dark -> Verdant -> Light).`}
        >
          {getThemeIcon()}
        </button>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              className="user-avatar-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img 
                src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={user.displayName} 
                className="avatar-img"
              />
              <span className="avatar-label">{user.displayName || user.email.split('@')[0]}</span>
              {isAdmin && (
                <span className="badge badge-eco" style={{ fontSize: '0.65rem', padding: '1px 4px' }}>Admin</span>
              )}
            </button>

            {/* Profile Dropdown */}
            {showDropdown && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '220px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  padding: '6px',
                  zIndex: 60
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{user.displayName}</span>
                    {isAdmin && <Shield size={13} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>

                {isAdmin && (
                  <button 
                    className="nav-item" 
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', color: 'var(--accent-primary)' }}
                    onClick={() => {
                      setShowDropdown(false);
                      onNavigate('admin');
                    }}
                  >
                    <Shield size={15} />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button 
                  className="nav-item" 
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigate('profile');
                  }}
                >
                  <User size={15} />
                  <span>Edit Profile</span>
                </button>

                <button 
                  className="nav-item" 
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  onClick={() => {
                    setShowDropdown(false);
                    onNavigate('favorites');
                  }}
                >
                  <Heart size={15} />
                  <span>My Favorites ({favorites.length})</span>
                </button>

                {/* Theme Selector inside menu as well */}
                <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>Theme</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className={`badge ${theme === 'dark' ? 'badge-white-win' : 'badge-eco'}`}
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </button>
                    <button 
                      className={`badge ${theme === 'verdant' ? 'badge-white-win' : 'badge-eco'}`}
                      onClick={() => setTheme('verdant')}
                      style={{ color: '#22c55e' }}
                    >
                      Verdant
                    </button>
                    <button 
                      className={`badge ${theme === 'light' ? 'badge-white-win' : 'badge-eco'}`}
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                <button 
                  className="nav-item" 
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', color: 'var(--accent-danger)' }}
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('auth')}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
