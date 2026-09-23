import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginWithEmail, 
  signupWithEmail, 
  logoutUser, 
  getCurrentLocalUser, 
  updateUserProfile,
  isFirebaseConnected 
} from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session
    const current = getCurrentLocalUser();
    if (current) {
      setUser(current);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const loggedUser = await loginWithEmail(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (email, password, displayName) => {
    const newUser = await signupWithEmail(email, password, displayName);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updated = await updateUserProfile(user.uid, updates);
    if (updated) {
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      isFirebase: isFirebaseConnected()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
