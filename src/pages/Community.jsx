import React, { useState, useEffect } from 'react';
import { getAllCommunityProfiles } from '../services/firebase';
import { Users, Heart, Search, Play, ArrowRight } from 'lucide-react';

export default function Community({ allGames = [], onSelectGame }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getAllCommunityProfiles();
        setProfiles(list);
      } catch (e) {
        console.error('Failed to load community profiles:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = profiles.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.displayName && p.displayName.toLowerCase().includes(q)) ||
      (p.bio && p.bio.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Community Members
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Explore profiles of other chess enthusiasts, view their favorite World Championship games, and launch straight into replay.
        </p>
      </div>

      {/* Search Members */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search members by name or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Profiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filtered.map(profile => {
          const favCount = (profile.favoriteGameIds || []).length;

          return (
            <div key={profile.uid} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <img 
                    src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={profile.displayName} 
                    style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{profile.displayName}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Joined {profile.joinedDate || '2026'}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {profile.bio || 'Studying World Chess Championship games.'}
                </p>
              </div>

              {/* Action / Favorites Count */}
              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={14} style={{ color: favCount > 0 ? 'var(--accent-danger)' : 'inherit' }} />
                  <span>{favCount} saved {favCount === 1 ? 'game' : 'games'}</span>
                </span>

                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setSelectedUser(profile)}
                >
                  <span>View Favorites</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected User Modal / Favorites Viewer */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <img 
                src={selectedUser.photoURL} 
                alt={selectedUser.displayName} 
                style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedUser.displayName}'s Favorites</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedUser.bio}</div>
              </div>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', marginBottom: '20px' }}>
              {(selectedUser.favoriteGameIds || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedUser.favoriteGameIds || []).map(gameId => {
                    const foundGame = allGames.find(g => g.id === gameId);
                    if (!foundGame) return null;

                    return (
                      <div 
                        key={gameId} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedUser(null);
                          onSelectGame(foundGame);
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {foundGame.white} vs {foundGame.black}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {foundGame.year} • Round {foundGame.round} • Result: {foundGame.result}
                          </div>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          <Play size={12} fill="currentColor" />
                          <span>Replay</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                  This user hasn't favorited any games yet.
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
