import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsersForAdmin, toggleBanUser, deleteUserAccount } from '../services/firebase';
import { Shield, ShieldAlert, UserX, UserCheck, Trash2, ArrowLeft, Users, Heart, Database, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ onBack }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsersForAdmin();
      setUsers(list);
    } catch (e) {
      setErrorMessage('Failed to load user records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.uid === '1')) {
      loadUsers();
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

  const handleToggleBan = async (targetUid) => {
    setErrorMessage('');
    setActionMessage('');
    try {
      const isNowBanned = await toggleBanUser(targetUid);
      setActionMessage(`User account successfully ${isNowBanned ? 'banned' : 'unbanned'}.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (targetUid, targetEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete the account for ${targetEmail}?`)) {
      return;
    }
    setErrorMessage('');
    setActionMessage('');
    try {
      await deleteUserAccount(targetUid);
      setActionMessage(`User account for ${targetEmail} deleted permanently.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete user.');
    }
  };

  const totalUsers = users.length;
  const bannedCount = users.filter(u => u.isBanned).length;
  const activeCount = totalUsers - bannedCount;
  const totalFavorites = users.reduce((sum, u) => sum + (u.favoritesCount || 0), 0);

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
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Admin Control Panel</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Registered Users</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalUsers}</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Users</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-success)' }}>{activeCount}</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Banned Accounts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{bannedCount}</div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Platform Favorites Saved</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{totalFavorites}</div>
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

      {/* User Management Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>User Accounts &amp; Permissions</h3>
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 10px' }} onClick={loadUsers}>
            Refresh Table
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>UID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Favorites</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isAdmin = u.uid === '1' || u.role === 'admin';

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
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{u.uid}</td>
                    <td>
                      <span className={`badge ${isAdmin ? 'badge-eco' : ''}`} style={{ borderColor: isAdmin ? 'var(--accent-primary)' : 'inherit', color: isAdmin ? 'var(--accent-primary)' : 'inherit' }}>
                        {isAdmin ? 'ADMIN' : 'USER'}
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
                      {isAdmin ? (
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
                            onClick={() => handleDelete(u.uid, u.email)}
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
    </div>
  );
}
