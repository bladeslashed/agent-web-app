import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetLink } from '../services/firebase';
import { LogIn, UserPlus, Database, AlertCircle, KeyRound, CheckCircle, Mail, ArrowLeft } from 'lucide-react';

export default function Auth({ onComplete }) {
  const { login, signup, isFirebase } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password) {
          throw new Error('Please provide both email and password.');
        }
        await signup(email, password, displayName, username);
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccessMessage(null);
    setLoading(true);

    try {
      const res = await sendPasswordResetLink(email);
      setResetSuccessMessage(res);
    } catch (err) {
      setError(err.message || 'Could not send reset link.');
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

          {isForgotPassword ? (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
                Reset your Password
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Enter your account email address and we will dispatch a verification password reset link.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
                {isSignUp ? 'Create your Account' : 'Sign in to The Chess Archive'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isSignUp 
                  ? 'Join to save favorite World Championship games and customize your profile.' 
                  : 'Enter your email credentials to access your saved games and profile.'}
              </p>
            </>
          )}
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

        {/* Reset Password Success Message */}
        {resetSuccessMessage && (
          <div 
            style={{ 
              padding: '14px', 
              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid var(--accent-success)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.85rem', 
              marginBottom: '20px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-success)', fontWeight: 600, marginBottom: '6px' }}>
              <CheckCircle size={16} />
              <span>Password Reset Link Dispatched</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
              {resetSuccessMessage.message}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', wordBreak: 'break-all', padding: '6px 8px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
              Verification Link: <a href={resetSuccessMessage.resetLink} style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>{resetSuccessMessage.resetLink}</a>
            </div>
          </div>
        )}

        {isForgotPassword ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Account Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '42px', marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? 'Sending link...' : 'Send Reset Link to Email'}
            </button>

            <button 
              type="button"
              className="btn btn-ghost" 
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setResetSuccessMessage(null);
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </form>
        ) : (
          /* Normal Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isSignUp && (
              <>
                <div className="input-group">
                  <label className="input-label">Display Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Mikhail Tal"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Unique Handle (@username)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="misha_tal (optional, auto-generated if blank)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      style={{ paddingLeft: '28px' }}
                      maxLength={20}
                    />
                  </div>
                </div>
              </>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="input-label">Password</label>
                {!isSignUp && (
                  <button 
                    type="button"
                    style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
        )}

        {/* Switch Login / Sign Up */}
        {!isForgotPassword && (
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
        )}

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
