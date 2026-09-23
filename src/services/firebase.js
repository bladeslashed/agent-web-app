// Firebase Service with Admin Account & Clean Data Storage
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbSignUp, 
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Grandmaster avatars
export const DEFAULT_AVATARS = [
  { id: 'fischer', name: 'Bobby Fischer', url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150&auto=format&fit=crop&q=80' },
  { id: 'kasparov', name: 'Garry Kasparov', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
  { id: 'carlsen', name: 'Magnus Carlsen', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'tal', name: 'Mikhail Tal', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'capablanca', name: 'José Capablanca', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'queen', name: 'Grandmaster Queen', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'knight', name: 'Tactical Knight', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' }
];

// Admin user definition requested by the user
export const ADMIN_USER = {
  uid: '1',
  email: 'christopher@mutiarabangsa.sch.id',
  password: 'admin',
  displayName: 'admin',
  role: 'admin',
  photoURL: DEFAULT_AVATARS[0].url,
  bio: 'Lead Administrator of The Chess Archive platform.',
  joinedDate: 'Sep 2026',
  isBanned: false,
  favoriteGameIds: []
};

// Initialize DB: clean placeholder users, ensure admin exists
export function initLocalDb(forceReset = false) {
  // If forceReset or previous placeholder users exist, reset cleanly
  const existingAccounts = localStorage.getItem('tca_user_accounts');
  let accounts = [];

  if (existingAccounts && !forceReset) {
    try {
      accounts = JSON.parse(existingAccounts);
      // Clean out old placeholder dummy accounts
      accounts = accounts.filter(a => 
        a.email !== 'garry@chessarchive.org' && 
        a.email !== 'bobby@chessarchive.org' && 
        a.email !== 'magnus@chessarchive.org' && 
        a.email !== 'misha@chessarchive.org' &&
        a.email !== 'grandmaster@example.com'
      );
    } catch (e) {
      accounts = [];
    }
  }

  // Ensure Admin account is present
  const adminIndex = accounts.findIndex(a => a.uid === '1' || a.email.toLowerCase() === ADMIN_USER.email.toLowerCase());
  if (adminIndex === -1) {
    accounts.unshift(ADMIN_USER);
  } else {
    // Preserve admin properties
    accounts[adminIndex].uid = '1';
    accounts[adminIndex].displayName = 'admin';
    accounts[adminIndex].role = 'admin';
  }

  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  // Sync community users (only genuine registered accounts, excluding banned users)
  const community = accounts
    .filter(a => !a.isBanned)
    .map(a => ({
      uid: a.uid,
      email: a.email,
      displayName: a.displayName,
      photoURL: a.photoURL,
      bio: a.bio,
      joinedDate: a.joinedDate,
      role: a.role || 'user',
      favoriteGameIds: a.favoriteGameIds || []
    }));
  localStorage.setItem('tca_community_users', JSON.stringify(community));
}

initLocalDb();

// Load custom Firebase config if configured
export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem('tca_firebase_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
}

let fbApp = null;
let fbAuth = null;
let fbDb = null;

const currentConfig = getSavedFirebaseConfig();
if (currentConfig && currentConfig.apiKey && currentConfig.apiKey !== 'YOUR_API_KEY') {
  try {
    fbApp = getApps().length > 0 ? getApps()[0] : initializeApp(currentConfig);
    fbAuth = getAuth(fbApp);
    fbDb = getFirestore(fbApp);
  } catch (err) {
    console.warn('Firebase connected mode fallback:', err);
  }
}

export const isFirebaseConnected = () => !!(fbAuth && fbDb);

// Authentication API
export async function loginWithEmail(email, password) {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const found = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!found) {
    throw new Error('No account found with this email address.');
  }

  if (found.isBanned) {
    throw new Error('This account has been banned by the platform administrator.');
  }

  // Accept valid password or 'admin' for admin account
  if (found.password && found.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  const currentUser = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    role: found.role || (found.uid === '1' ? 'admin' : 'user'),
    photoURL: found.photoURL,
    bio: found.bio,
    joinedDate: found.joinedDate,
    favoriteGameIds: found.favoriteGameIds || []
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export async function signupWithEmail(email, password, displayName = '') {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  if (accounts.some(a => a.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const newUid = 'usr_' + Date.now();
  const defaultAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].url;
  const newAccount = {
    uid: newUid,
    email: email.trim(),
    password: password,
    displayName: displayName.trim() || email.split('@')[0],
    role: 'user',
    photoURL: defaultAvatar,
    bio: 'Chess enthusiast studying World Championship matches.',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    isBanned: false,
    favoriteGameIds: []
  };

  accounts.push(newAccount);
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  
  // Also register in community directory
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  community.push({
    uid: newAccount.uid,
    email: newAccount.email,
    displayName: newAccount.displayName,
    role: 'user',
    photoURL: newAccount.photoURL,
    bio: newAccount.bio,
    joinedDate: newAccount.joinedDate,
    favoriteGameIds: []
  });
  localStorage.setItem('tca_community_users', JSON.stringify(community));

  const currentUser = {
    uid: newAccount.uid,
    email: newAccount.email,
    displayName: newAccount.displayName,
    role: 'user',
    photoURL: newAccount.photoURL,
    bio: newAccount.bio,
    joinedDate: newAccount.joinedDate,
    favoriteGameIds: []
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export async function logoutUser() {
  if (isFirebaseConnected()) {
    try { await fbSignOut(fbAuth); } catch (e) {}
  }
  localStorage.removeItem('tca_active_user');
}

export function getCurrentLocalUser() {
  try {
    const raw = localStorage.getItem('tca_active_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// User Profile Updates
export async function updateUserProfile(uid, { displayName, photoURL, bio }) {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const accIndex = accounts.findIndex(a => a.uid === uid);
  if (accIndex !== -1) {
    if (displayName) accounts[accIndex].displayName = displayName;
    if (photoURL) accounts[accIndex].photoURL = photoURL;
    if (bio !== undefined) accounts[accIndex].bio = bio;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  // Update community directory
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => u.uid === uid);
  if (commIndex !== -1) {
    if (displayName) community[commIndex].displayName = displayName;
    if (photoURL) community[commIndex].photoURL = photoURL;
    if (bio !== undefined) community[commIndex].bio = bio;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  // Update active session
  const current = getCurrentLocalUser();
  if (current && current.uid === uid) {
    const updated = {
      ...current,
      displayName: displayName || current.displayName,
      photoURL: photoURL || current.photoURL,
      bio: bio !== undefined ? bio : current.bio
    };
    localStorage.setItem('tca_active_user', JSON.stringify(updated));
    return updated;
  }
  return null;
}

// Favorites Management
export async function getUserFavorites(uid) {
  if (!uid) return [];
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const acc = accounts.find(a => a.uid === uid);
  return acc ? (acc.favoriteGameIds || []) : [];
}

export async function toggleUserFavorite(uid, gameId) {
  if (!uid || !gameId) return [];
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const accIndex = accounts.findIndex(a => a.uid === uid);
  if (accIndex === -1) return [];

  let favs = accounts[accIndex].favoriteGameIds || [];
  if (favs.includes(gameId)) {
    favs = favs.filter(id => id !== gameId);
  } else {
    favs = [...favs, gameId];
  }
  accounts[accIndex].favoriteGameIds = favs;
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  // Sync active user session
  const current = getCurrentLocalUser();
  if (current && current.uid === uid) {
    current.favoriteGameIds = favs;
    localStorage.setItem('tca_active_user', JSON.stringify(current));
  }

  // Sync in community user list
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => u.uid === uid);
  if (commIndex !== -1) {
    community[commIndex].favoriteGameIds = favs;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  return favs;
}

// Community Profiles Query
export async function getAllCommunityProfiles() {
  initLocalDb();
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  return community;
}

// ================= ADMIN MANAGEMENT FUNCTIONS ================= //

export async function getAllUsersForAdmin() {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  return accounts.map(a => ({
    uid: a.uid,
    email: a.email,
    displayName: a.displayName,
    role: a.role || (a.uid === '1' ? 'admin' : 'user'),
    joinedDate: a.joinedDate,
    photoURL: a.photoURL,
    isBanned: !!a.isBanned,
    favoritesCount: (a.favoriteGameIds || []).length
  }));
}

export async function toggleBanUser(uid) {
  if (uid === '1') {
    throw new Error('Cannot ban the master administrator account.');
  }
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => a.uid === uid);
  if (index === -1) throw new Error('User not found.');

  accounts[index].isBanned = !accounts[index].isBanned;
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  // Update community visibility: if banned, remove from community directory; if unbanned, restore
  initLocalDb();
  return accounts[index].isBanned;
}

export async function deleteUserAccount(uid) {
  if (uid === '1') {
    throw new Error('Cannot delete the master administrator account.');
  }
  initLocalDb();
  let accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  accounts = accounts.filter(a => a.uid !== uid);
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  // Remove from community
  let community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  community = community.filter(u => u.uid !== uid);
  localStorage.setItem('tca_community_users', JSON.stringify(community));

  // If deleted user was active, log out
  const current = getCurrentLocalUser();
  if (current && current.uid === uid) {
    localStorage.removeItem('tca_active_user');
  }
  return true;
}
