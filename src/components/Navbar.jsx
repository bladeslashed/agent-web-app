import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { 
  BookOpen, 
  Heart, 
  Users, 
  User, 
  LogOut, 
  LogIn, 
  Database,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  const { user, logout, isFirebase } = useAuth();
  const { favorites } = useFavorites();
  const [showDropdown, setShowDropdown] = useState(false);

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
      </nav>

      {/* Auth / Profile Area */}
      <div className="nav-auth">
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
            </button>

            {/* Profile Dropdown */}
            {showDropdown && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '210px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  padding: '6px',
                  zIndex: 60
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>

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

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                {/* Firebase Status Badge */}
                <div style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <Database size={13} style={{ color: isFirebase ? 'var(--accent-success)' : 'var(--accent-warning)' }} />
                  <span>{isFirebase ? 'Firebase Live' : 'Firebase Offline Sync'}</span>
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
