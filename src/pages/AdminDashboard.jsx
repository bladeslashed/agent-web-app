import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsersForAdmin, toggleBanUser, deleteUserAccount } from '../services/firebase';
import { 
  fetchCommunityHighlights, 
  deleteCommunityHighlight, 
  editCommunityHighlight, 
  togglePinHighlight 
} from '../services/highlights';
import { 
  Shield, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Trash2, 
  ArrowLeft, 
  Users, 
  Heart, 
  Sparkles, 
  Pin, 
  Edit3, 
  Check, 
  X,
  Search
} from 'lucide-react';

export default function AdminDashboard({ onBack }) {
  const { user } = useAuth();
  const [adminTab, setAdminTab] = useState('users'); // 'users' | 'highlights'
  const [users, setUsers] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editing state for highlights
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Search in admin
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, hList] = await Promise.all([
        getAllUsersForAdmin(),
        fetchCommunityHighlights()
      ]);
      setUsers(uList);
      setHighlights(hList);
    } catch (e) {
      setErrorMessage('Failed to load administrative records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.uid === '1')) {
      loadData();
    }
  }, [user]);

  if (!user || (user.role !== 'admin' && user.uid !== '1')) {
    return (
      <div className="card" style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center', padding: '36px' }}>
        <ShieldAlert size={44} style={{ color: 'var(--accent-danger)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          This administration dashboard requires administrator privileges. Please sign in with the admin account (christopher@mutiarabangsa.sch.id).
        </p>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Return</span>
        </button>
      </div>
    );
  }

  // User Actions
  const handleToggleBan = async (targetUid) => {
    setErrorMessage('');
    setActionMessage('');
    try {
      const isNowBanned = await toggleBanUser(targetUid);
      setActionMessage(`User account successfully ${isNowBanned ? 'banned' : 'unbanned'}.`);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed.');
    }
  };

  const handleDeleteUser = async (targetUid, targetEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete the account for ${targetEmail}?`)) {
      return;
    }
    setErrorMessage('');
    setActionMessage('');
    try {
      await deleteUserAccount(targetUid);
      setActionMessage(`User account for ${targetEmail} deleted permanently.`);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete user.');
    }
  };

  // Highlight Actions
  const handleTogglePinHighlight = async (hlId) => {
    try {
      const isPinned = await togglePinHighlight(hlId, user);
      setActionMessage(`Highlight pin status ${isPinned ? 'activated' : 'deactivated'}.`);
      setHighlights(prev => prev.map(h => h.id === hlId ? { ...h, isPinned } : h));
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleDeleteHighlight = async (hlId, hlTitle) => {
    if (!window.confirm(`Delete highlight "${hlTitle}" permanently?`)) return;
    try {
      await deleteCommunityHighlight(hlId, user);
      setActionMessage(`Highlight "${hlTitle}" deleted.`);
      setHighlights(prev => prev.filter(h => h.id !== hlId));
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleOpenEditHighlight = (hl) => {
    setEditingHighlight(hl);
    setEditTitle(hl.title);
    setEditDesc(hl.description);
    setEditIsPinned(!!hl.isPinned);
  };

  const handleSaveEditHighlight = async (e) => {
    e.preventDefault();
    if (!editingHighlight) return;
    try {
      const updated = await editCommunityHighlight(
        editingHighlight.id,
        { title: editTitle, description: editDesc, isPinned: editIsPinned },
        user
      );
      setHighlights(prev => prev.map(h => h.id === updated.id ? updated : h));
      setEditingHighlight(null);
      setActionMessage('Highlight successfully updated.');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const totalUsers = users.length;
  const bannedCount = users.filter(u => u.isBanned).length;
  const activeCount = totalUsers - bannedCount;
  const totalFavorites = users.reduce((sum, u) => sum + (u.favoritesCount || 0), 0);
  const totalHighlights = highlights.length;
  const totalHighlightLikes = highlights.reduce((sum, h) => sum + ((h.likes || []).length), 0);

  const filteredUsers = users.filter(u => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const filteredHighlights = highlights.filter(h => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (h.title && h.title.toLowerCase().includes(q)) ||
      (h.white && h.white.toLowerCase().includes(q)) ||
      (h.black && h.black.toLowerCase().includes(q)) ||
      (h.authorName && h.authorName.toLowerCase().includes(q)) ||
      (h.authorUsername && h.authorUsername.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Admin Control Center</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Registered Users</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>{totalUsers}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Accounts</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-success)' }}>{activeCount}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Community Highlights</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{totalHighlights}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Highlight Likes</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{totalHighlightLikes}</div>
        </div>
      </div>

      {/* Messages */}
      {actionMessage && (
        <div style={{ padding: '10px 16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '0.88rem', marginBottom: '20px' }}>
          {actionMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '10px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}

      {/* Section Switcher Tabs & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn ${adminTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => { setAdminTab('users'); setSearchFilter(''); }}
          >
            <Users size={15} />
            <span>User Accounts ({users.length})</span>
          </button>

          <button 
            className={`btn ${adminTab === 'highlights' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            onClick={() => { setAdminTab('highlights'); setSearchFilter(''); }}
          >
            <Sparkles size={15} />
            <span>Community Highlights ({highlights.length})</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder={`Filter ${adminTab}...`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
          />
        </div>
      </div>

      {/* TAB 1: USERS MANAGEMENT TABLE */}
      {adminTab === 'users' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Registered User Directory</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={loadData}>
              Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Username Handle</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Favorites</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isUserAdmin = u.uid === '1' || u.role === 'admin';

                  return (
                    <tr key={u.uid}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img 
                            src={u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            alt="" 
                            style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                        @{u.username || 'user'}
                      </td>
                      <td>
                        <span className={`badge ${isUserAdmin ? 'badge-eco' : ''}`} style={{ borderColor: isUserAdmin ? 'var(--accent-primary)' : 'inherit', color: isUserAdmin ? 'var(--accent-primary)' : 'inherit' }}>
                          {isUserAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: u.isBanned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: u.isBanned ? 'var(--accent-danger)' : 'var(--accent-success)'
                        }}>
                          {u.isBanned ? 'BANNED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{u.favoritesCount}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.joinedDate}</td>
                      <td style={{ textAlign: 'right' }}>
                        {isUserAdmin ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Primary Admin</span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button 
                              className="btn btn-secondary"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.78rem',
                                color: u.isBanned ? 'var(--accent-success)' : 'var(--accent-warning)'
                              }}
                              onClick={() => handleToggleBan(u.uid)}
                              title={u.isBanned ? 'Unban user' : 'Ban user'}
                            >
                              {u.isBanned ? <UserCheck size={13} /> : <UserX size={13} />}
                              <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                            </button>

                            <button 
                              className="btn btn-secondary"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.78rem',
                                color: 'var(--accent-danger)'
                              }}
                              onClick={() => handleDeleteUser(u.uid, u.email)}
                              title="Permanently delete user"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMMUNITY HIGHLIGHTS MODERATION */}
      {adminTab === 'highlights' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Community Highlights Moderation</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={loadData}>
              Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Highlight Title</th>
                  <th>Contributor</th>
                  <th>Game / Move</th>
                  <th>Status</th>
                  <th>Likes</th>
                  <th style={{ textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHighlights.map(hl => (
                  <tr key={hl.id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hl.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(hl.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={hl.authorPhoto || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150'} 
                          alt="" 
                          style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{hl.authorName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                            @{hl.authorUsername || 'user'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {hl.white.split(',')[0]} vs {hl.black.split(',')[0]} ({hl.year})
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>
                        <span className="badge badge-eco" style={{ padding: '1px 5px', fontSize: '0.72rem' }}>
                          Move {hl.moveNumber}: {hl.moveSan}
                        </span>
                      </div>
                    </td>
                    <td>
                      {hl.isPinned ? (
                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Pin size={11} />
                          <span>PINNED</span>
                        </span>
                      ) : (
                        <span className="badge" style={{ color: 'var(--text-muted)' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-danger)', fontWeight: 600, fontSize: '0.85rem' }}>
                        <Heart size={13} fill="currentColor" />
                        <span>{(hl.likes || []).length}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: hl.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                          onClick={() => handleTogglePinHighlight(hl.id)}
                          title="Toggle Pin"
                        >
                          <Pin size={12} />
                          <span>{hl.isPinned ? 'Unpin' : 'Pin'}</span>
                        </button>

                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleOpenEditHighlight(hl)}
                          title="Edit highlight"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>

                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-danger)' }}
                          onClick={() => handleDeleteHighlight(hl.id, hl.title)}
                          title="Delete highlight"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Highlight Edit Modal */}
      {editingHighlight && (
        <div className="modal-overlay" onClick={() => setEditingHighlight(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Moderate Community Highlight</h3>
            </div>

            <form onSubmit={handleSaveEditHighlight} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Highlight Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Commentary / Description</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  id="adminModalPinned"
                  checked={editIsPinned}
                  onChange={(e) => setEditIsPinned(e.target.checked)}
                />
                <label htmlFor="adminModalPinned" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Pin this highlight to top of Community Highlights feed
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingHighlight(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
