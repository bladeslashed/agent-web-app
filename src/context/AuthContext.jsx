import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginWithEmail, 
  signupWithEmail, 
  logoutUser, 
  getCurrentLocalUser, 
  updateUserProfile,
  changeUsername as fbChangeUsername,
  changeDisplayName as fbChangeDisplayName,
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

  const signup = async (email, password, displayName, requestedUsername) => {
    const newUser = await signupWithEmail(email, password, displayName, requestedUsername);
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
    return updated;
  };

  const changeUsername = async (newUsername) => {
    if (!user) return;
    const updated = await fbChangeUsername(user.uid, newUsername);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  const changeDisplayName = async (newDisplayName) => {
    if (!user) return;
    const updated = await fbChangeDisplayName(user.uid, newDisplayName);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      changeUsername,
      changeDisplayName,
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
