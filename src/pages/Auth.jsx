import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_USER } from '../services/firebase';
import { LogIn, UserPlus, Database, Shield, AlertCircle } from 'lucide-react';

export default function Auth({ onComplete }) {
  const { login, signup, isFirebase } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password) {
          throw new Error('Please provide both email and password.');
        }
        await signup(email, password, displayName);
      } else {
        if (!email || !password) {
          throw new Error('Please enter your email and password.');
        }
        await login(email, password);
      }
      onComplete();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click admin login
  const handleAdminLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(ADMIN_USER.email, ADMIN_USER.password);
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to sign in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 14px', width: '44px', height: '44px', fontSize: '1.6rem' }}>
            ♞
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
            {isSignUp ? 'Create your Account' : 'Sign in to The Chess Archive'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isSignUp 
              ? 'Join to save favorite World Championship games and customize your profile.' 
              : 'Enter your email credentials to access your saved games and profile.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 14px', 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 'var(--radius-sm)', 
              color: '#fca5a5', 
              fontSize: '0.85rem', 
              marginBottom: '20px' 
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div className="input-group">
              <label className="input-label">Display Name / Handle</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Mikhail T."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '42px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Switch Login / Sign Up */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Administrator Access
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* 1-Click Admin Login */}
        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
          onClick={handleAdminLogin}
        >
          <Shield size={14} />
          <span>Sign In as Admin ({ADMIN_USER.email})</span>
        </button>

        {/* Database Status Note */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Database size={12} style={{ color: isFirebase ? 'var(--accent-success)' : 'var(--accent-warning)' }} />
            {isFirebase ? 'Connected to Firebase Project' : 'Database: Firebase Local Sync Engine'}
          </span>
        </div>
      </div>
    </div>
  );
}
