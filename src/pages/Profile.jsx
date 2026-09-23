import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_AVATARS, isUsernameAvailable } from '../services/firebase';
import { User, Check, Camera, Image, ArrowLeft, Clock, AtSign, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Profile({ onBack, onNavigateSettings }) {
  const { user, updateProfile, changeUsername, changeDisplayName } = useAuth();

  const [photoURL, setPhotoURL] = useState(user ? user.photoURL : DEFAULT_AVATARS[0].url);
  const [bio, setBio] = useState(user ? (user.bio || '') : '');
  const [customUrl, setCustomUrl] = useState('');
  
  // Display name state (can change whenever)
  const [displayName, setDisplayName] = useState(user ? (user.displayName || '') : '');
  
  // Username state (unique, once every 24 hours)
  const [username, setUsername] = useState(user ? (user.username || '') : '');
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'available' | 'taken' | 'invalid'
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setPhotoURL(user.photoURL || DEFAULT_AVATARS[0].url);
      setBio(user.bio || '');
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <p>Please log in to manage your profile.</p>
      </div>
    );
  }

  // 24-hour rate limit calculation
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const lastChange = user.lastUsernameChange || null;
  const isCooldown = lastChange && (Date.now() - lastChange < COOLDOWN_MS) && user.uid !== '1';
  
  let remainingText = '';
  if (isCooldown) {
    const remainingMs = COOLDOWN_MS - (Date.now() - lastChange);
    const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
    const mins = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    remainingText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} minute(s)`;
  }

  // Check username live
  const handleUsernameChange = (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);

    if (!clean) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    if (clean === (user.username || '').toLowerCase()) {
      setUsernameStatus({ state: 'idle', message: 'Current username' });
      return;
    }

    const res = isUsernameAvailable(clean, user.uid);
    if (res.available) {
      setUsernameStatus({ state: 'available', message: `@${clean} is available` });
    } else {
      setUsernameStatus({ state: 'taken', message: res.error });
    }
  };

  // Save General Profile (Avatar, Bio, and Display Name - allowed whenever)
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      if (displayName.trim() && displayName.trim() !== user.displayName) {
        await changeDisplayName(displayName.trim());
      }
      await updateProfile({
        photoURL: customUrl.trim() || photoURL,
        bio: bio.trim()
      });
      setStatusMessage({ type: 'success', text: 'Profile & Display Name updated successfully!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  // Save Unique Username (once every 24 hours)
  const handleSaveUsername = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (isCooldown) {
      setStatusMessage({ 
        type: 'error', 
        text: `Username can only be changed once a day. You can change your username again in ${remainingText}.` 
      });
      return;
    }

    if (username.trim().toLowerCase() === (user.username || '').toLowerCase()) {
      setStatusMessage({ type: 'info', text: 'This is already your active username.' });
      return;
    }

    setUsernameLoading(true);
    try {
      await changeUsername(username.trim().toLowerCase());
      setStatusMessage({ type: 'success', text: `Username successfully updated to @${username.trim().toLowerCase()}! Next change available in 24 hours.` });
      setUsernameStatus({ state: 'idle', message: '' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update username.' });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSelectAvatar = (url) => {
    setPhotoURL(url);
    setCustomUrl('');
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Profile &amp; Identity</h1>
        <div style={{ width: '80px' }} />
      </div>

      {statusMessage.text && (
        <div 
          style={{ 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '0.88rem',
            backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
            color: statusMessage.type === 'success' ? 'var(--accent-success)' : '#fca5a5'
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="card" style={{ padding: '32px' }}>
        {/* Current Avatar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={customUrl || photoURL} 
              alt="Avatar" 
              style={{ width: '84px', height: '84px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-focus)' }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--text-main)',
                color: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-full)',
                padding: '4px',
                display: 'flex'
              }}
            >
              <Camera size={14} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user.displayName}</h2>
              {user.username && (
                <span className="badge badge-eco" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  @{user.username}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Member since {user.joinedDate || '2026'}
            </div>
          </div>
        </div>

        {/* SECTION 1: USERNAME (UNIQUE & 24H RATE LIMIT) */}
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '28px', backgroundColor: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AtSign size={16} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Unique Username Handle</h3>
            </div>
            
            {isCooldown ? (
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <Clock size={11} />
                <span>Next change in {remainingText}</span>
              </span>
            ) : (
              <span className="badge badge-eco" style={{ fontSize: '0.72rem', color: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}>
                Change Available
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Your username must be unique across the entire platform. To ensure identity stability, usernames can be changed <strong>once every 24 hours</strong>.
          </p>

          <form onSubmit={handleSaveUsername}>
            <div className="input-group" style={{ marginBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  @
                </span>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  disabled={isCooldown || usernameLoading}
                  maxLength={20}
                  style={{ 
                    paddingLeft: '32px',
                    borderColor: usernameStatus.state === 'available' ? 'var(--accent-success)' : (usernameStatus.state === 'taken' ? 'var(--accent-danger)' : undefined),
                    opacity: isCooldown ? 0.75 : 1
                  }}
                  required
                />
              </div>

              {/* Live Status Message */}
              {usernameStatus.message && (
                <div style={{ 
                  fontSize: '0.78rem', 
                  marginTop: '6px',
                  color: usernameStatus.state === 'available' ? 'var(--accent-success)' : (usernameStatus.state === 'taken' ? 'var(--accent-danger)' : 'var(--text-muted)')
                }}>
                  {usernameStatus.message}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                3-20 characters: letters, numbers, and underscores only.
              </span>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                disabled={isCooldown || usernameLoading || username.toLowerCase() === (user.username || '').toLowerCase() || usernameStatus.state === 'taken'}
              >
                {usernameLoading ? 'Saving...' : 'Update Username'}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: DISPLAY NAME & GENERAL PROFILE (CHANGE WHENEVER) */}
        <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="input-label" style={{ fontWeight: 600 }}>Display Name</label>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} />
                <span>Editable anytime with no cooldown</span>
              </span>
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Grandmaster Garry"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              This is the friendly name displayed on your profile, game comments, and community list.
            </span>
          </div>

          {/* Change Profile Pictures Gallery */}
          <div>
            <label className="input-label" style={{ marginBottom: '10px', display: 'block', fontWeight: 600 }}>
              Select Profile Picture (Grandmaster Avatars)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '12px' }}>
              {DEFAULT_AVATARS.map((av) => {
                const isSelected = photoURL === av.url && !customUrl;
                return (
                  <div 
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.url)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      transition: 'all 150ms ease'
                    }}
                    title={av.name}
                  >
                    <img 
                      src={av.url} 
                      alt={av.name} 
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {av.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom URL */}
            <div style={{ marginTop: '16px' }}>
              <label className="input-label" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                Or paste custom avatar image URL
              </label>
              <div style={{ position: 'relative' }}>
                <Image size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://example.com/my-photo.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>Bio / Chess Style</label>
            <textarea 
              className="input-field" 
              rows={3}
              placeholder="e.g. Enthusiast of dynamic tactics, Fischer's attacking style, Capablanca endgame technique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
