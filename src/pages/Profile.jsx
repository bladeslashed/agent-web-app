import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_AVATARS } from '../services/firebase';
import { User, Check, Camera, Image, ArrowLeft, Lock, ArrowRight } from 'lucide-react';

export default function Profile({ onBack, onNavigateSettings }) {
  const { user, updateProfile } = useAuth();

  const [photoURL, setPhotoURL] = useState(user ? user.photoURL : DEFAULT_AVATARS[0].url);
  const [bio, setBio] = useState(user ? (user.bio || '') : '');
  const [customUrl, setCustomUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '40px auto' }}>
        <p>Please log in to manage your profile.</p>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({
      photoURL: customUrl.trim() || photoURL,
      bio: bio.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSelectAvatar = (url) => {
    setPhotoURL(url);
    setCustomUrl('');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Profile Customization</h1>
        <div style={{ width: '80px' }} />
      </div>

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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user.displayName}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Member since {user.joinedDate || '2026'}
            </div>
          </div>
        </div>

        {/* Change Profile Pictures Gallery */}
        <div style={{ marginBottom: '28px' }}>
          <label className="input-label" style={{ marginBottom: '10px', display: 'block' }}>
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

          {/* Or custom URL */}
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

        {/* Profile Details Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Immutable Username Notice */}
          <div className="input-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="input-label">Username (Immutable)</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={11} />
                <span>Usernames cannot be changed</span>
              </span>
            </div>
            <input 
              type="text" 
              className="input-field" 
              value={user.displayName}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Bio / Chess Style</label>
            <textarea 
              className="input-field" 
              rows={3}
              placeholder="e.g. Enthusiast of dynamic tactics, Capablanca endgame technique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
            {savedSuccess ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-success)', fontSize: '0.88rem' }}>
                <Check size={16} />
                <span>Profile updated successfully!</span>
              </span>
            ) : <span />}

            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </form>

        {/* Link to Change Password in Settings */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Need to change your password?</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage security settings in the Settings tab</div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: '0.82rem' }}
            onClick={onNavigateSettings}
          >
            <span>Settings</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
