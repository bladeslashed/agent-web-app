import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { changeUserPassword, getSavedFirebaseConfig } from '../services/firebase';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Volume2, 
  Lock, 
  Database, 
  Check, 
  AlertCircle, 
  CheckCircle, 
  Moon, 
  Sun, 
  Leaf,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ success: '', error: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sound settings state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tca_sound_enabled') !== 'false';
  });

  // Custom Firebase config state
  const [customFbConfig, setCustomFbConfig] = useState(() => {
    const saved = getSavedFirebaseConfig();
    return saved ? JSON.stringify(saved, null, 2) : '';
  });
  const [configSaved, setConfigSaved] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ success: '', error: '' });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: '', error: 'New password and confirm password do not match.' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordStatus({ success: '', error: 'New password must be at least 4 characters long.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changeUserPassword(user?.uid, currentPassword, newPassword);
      setPasswordStatus({ success: 'Password changed successfully! Keep it safe.', error: '' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordStatus({ success: '', error: err.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('tca_sound_enabled', String(next));
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    try {
      if (!customFbConfig.trim()) {
        localStorage.removeItem('tca_firebase_config');
      } else {
        const parsed = JSON.parse(customFbConfig);
        localStorage.setItem('tca_firebase_config', JSON.stringify(parsed));
      }
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (e) {
      alert('Invalid JSON format. Please paste valid Firebase configuration JSON.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
        <SettingsIcon size={24} style={{ color: 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Application Settings
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* 1. VISUAL THEME CONFIGURATION */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Visual Theme</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            Choose a visual palette for The Chess Archive. Theme changes take effect instantly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {/* Dark Theme Card */}
            <div 
              onClick={() => setTheme('dark')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#111318',
                border: theme === 'dark' ? '2px solid #3b82f6' : '1px solid #242833',
                color: '#f4f4f5',
                transition: 'all 150ms ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Moon size={16} />
                  <span>Default Dark</span>
                </div>
                {theme === 'dark' && <CheckCircle size={16} style={{ color: '#3b82f6' }} />}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#090a0d', border: '1px solid #242833' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#111318', border: '1px solid #242833' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#3b82f6' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#ecefe6' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#779556' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9fa4b2', marginTop: '10px' }}>
                Sleek zinc and dark slate with olive board squares.
              </div>
            </div>

            {/* Verdant Theme Card */}
            <div 
              onClick={() => setTheme('verdant')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0b1c11',
                border: theme === 'verdant' ? '2px solid #22c55e' : '1px solid #1e452c',
                color: '#f0fdf4',
                transition: 'all 150ms ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Leaf size={16} style={{ color: '#22c55e' }} />
                  <span>Verdant</span>
                </div>
                {theme === 'verdant' && <CheckCircle size={16} style={{ color: '#22c55e' }} />}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#06110a', border: '1px solid #1e452c' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#0b1c11', border: '1px solid #1e452c' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#22c55e' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#dcfce7' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#2d6a4f' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#86efac', marginTop: '10px' }}>
                Dark-mode forest green with emerald highlights.
              </div>
            </div>

            {/* Light Theme Card */}
            <div 
              onClick={() => setTheme('light')}
              style={{
                cursor: 'pointer',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: theme === 'light' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                color: '#0f172a',
                transition: 'all 150ms ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <Sun size={16} style={{ color: '#f59e0b' }} />
                  <span>Light</span>
                </div>
                {theme === 'light' && <CheckCircle size={16} style={{ color: '#2563eb' }} />}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#f8fafc', border: '1px solid #cbd5e1' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#ffffff', border: '1px solid #cbd5e1' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#2563eb' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#f1f5f9' }} />
                <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#64748b' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>
                Clean, high-contrast daylight theme.
              </div>
            </div>
          </div>
        </div>

        {/* 2. BOARD & AUDIO SETTINGS */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Volume2 size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Board &amp; Audio Settings</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Chess Piece Set</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official Chess.com "Neo" vector graphics</div>
              </div>
              <span className="badge badge-eco" style={{ color: 'var(--accent-primary)' }}>
                Chess.com Neo (Active)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Move Sound Effects</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Play subtle click audio on chess move steps</div>
              </div>
              <button 
                className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={handleToggleSound}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. ACCOUNT SECURITY & CHANGE PASSWORD */}
        {user ? (
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Lock size={18} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Account Security</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Change your login password. Usernames are fixed per platform security policy and cannot be altered.
            </p>

            {/* Locked Username Display */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Username (Immutable)</label>
              <input 
                type="text" 
                className="input-field" 
                value={user.displayName}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            {passwordStatus.error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>
                <AlertCircle size={15} />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <CheckCircle size={15} />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="At least 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <KeyRound size={28} style={{ margin: '0 auto 10px', color: 'var(--text-muted)' }} />
            <p>Sign in to configure account security and change your password.</p>
          </div>
        )}

        {/* 4. FIREBASE DATABASE STATUS & CONFIG */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Firebase &amp; Database Config</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            The Chess Archive uses Firebase for cloud authentication and favorites storage, with an automatic resilient local fallback.
          </p>

          <form onSubmit={handleSaveFirebaseConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Custom Firebase Configuration JSON (Optional)</label>
              <textarea 
                className="input-field" 
                rows={4}
                placeholder='{ "apiKey": "...", "authDomain": "...", "projectId": "..." }'
                value={customFbConfig}
                onChange={(e) => setCustomFbConfig(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {configSaved && (
                <span style={{ color: 'var(--accent-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} />
                  <span>Config saved! Reload page to apply.</span>
                </span>
              )}
              <span />
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Save Firebase Parameters
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
