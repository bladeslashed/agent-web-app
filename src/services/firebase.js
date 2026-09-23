// Firebase Service with seamless fallback
// Supports both live Firebase projects and instant local/demo state
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbSignUp, 
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuth,
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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Default default grandmaster avatars
export const DEFAULT_AVATARS = [
  { id: 'fischer', name: 'Bobby Fischer', url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150&auto=format&fit=crop&q=80' },
  { id: 'kasparov', name: 'Garry Kasparov', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
  { id: 'carlsen', name: 'Magnus Carlsen', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'tal', name: 'Mikhail Tal', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'capablanca', name: 'José Capablanca', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'queen', name: 'Grandmaster Queen', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'knight', name: 'Tactical Knight', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' }
];

// Pre-seeded community profiles for viewing other users
const SEED_COMMUNITY_USERS = [
  {
    uid: 'user_kasparov',
    email: 'garry@chessarchive.org',
    displayName: 'Garry K.',
    photoURL: DEFAULT_AVATARS[1].url,
    bio: '13th World Champion. Aggressive dynamic attacker. King’s Indian & Sicilian devotee.',
    joinedDate: 'Jan 2024',
    favoriteGameIds: ['g_1985_16', 'g_1990_20', 'g_1986_22', 'g_1995_10']
  },
  {
    uid: 'user_fischer',
    email: 'bobby@chessarchive.org',
    displayName: 'Robert J. Fischer',
    photoURL: DEFAULT_AVATARS[0].url,
    bio: '11th World Champion. 1. e4 best by test. Reykjavik 1972.',
    joinedDate: 'Mar 2024',
    favoriteGameIds: ['g_1972_6', 'g_1972_13', 'g_1972_1']
  },
  {
    uid: 'user_carlsen',
    email: 'magnus@chessarchive.org',
    displayName: 'Magnus C.',
    photoURL: DEFAULT_AVATARS[2].url,
    bio: 'World Champion 2013-2023. Grinding water from stones.',
    joinedDate: 'Feb 2024',
    favoriteGameIds: ['g_1972_6', 'g_1985_24', 'g_1927_1', 'g_1960_6']
  },
  {
    uid: 'user_tal',
    email: 'misha@chessarchive.org',
    displayName: 'Mikhail Tal (Magician)',
    photoURL: DEFAULT_AVATARS[3].url,
    bio: '8th World Champion. You must take your opponent into a deep dark forest.',
    joinedDate: 'Apr 2024',
    favoriteGameIds: ['g_1960_6', 'g_1960_1', 'g_1961_19']
  }
];

// Check if localStorage has users seeded
function initLocalDb() {
  if (!localStorage.getItem('tca_community_users')) {
    localStorage.setItem('tca_community_users', JSON.stringify(SEED_COMMUNITY_USERS));
  }
  if (!localStorage.getItem('tca_user_accounts')) {
    // Seed test user
    const testAccounts = [
      {
        uid: 'user_demo_gm',
        email: 'grandmaster@example.com',
        password: 'password123',
        displayName: 'Grandmaster Guest',
        photoURL: DEFAULT_AVATARS[0].url,
        bio: 'Studying classic World Championship endgames and tactics.',
        joinedDate: 'Sep 2026',
        favoriteGameIds: ['g_1972_6', 'g_1985_16', 'g_1927_1']
      }
    ];
    localStorage.setItem('tca_user_accounts', JSON.stringify(testAccounts));
  }
}

initLocalDb();

// Load custom Firebase config if saved by user
export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem('tca_firebase_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  
  // Try environment variables
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
    console.log('Firebase initialized in connected mode.');
  } catch (err) {
    console.warn('Firebase init failed, using built-in local fallback engine:', err);
  }
}

export const isFirebaseConnected = () => !!(fbAuth && fbDb);

// Authentication API with transparent fallback
export async function loginWithEmail(email, password) {
  if (isFirebaseConnected()) {
    const userCredential = await fbSignIn(fbAuth, email, password);
    return userCredential.user;
  }

  // Local fallback
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  
  if (!found) {
    throw new Error('No account found with this email address.');
  }
  if (found.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  const currentUser = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    photoURL: found.photoURL,
    bio: found.bio,
    joinedDate: found.joinedDate
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export async function signupWithEmail(email, password, displayName = '') {
  if (isFirebaseConnected()) {
    const userCredential = await fbSignUp(fbAuth, email, password);
    const user = userCredential.user;
    const defaultAvatar = DEFAULT_AVATARS[0].url;
    await fbUpdateProfile(user, { displayName: displayName || email.split('@')[0], photoURL: defaultAvatar });
    // Write profile in Firestore
    await setDoc(doc(fbDb, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: defaultAvatar,
      bio: 'Chess enthusiast studying World Championship matches.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      favoriteGameIds: []
    });
    return user;
  }

  // Local fallback
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const newUid = 'usr_' + Date.now();
  const defaultAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].url;
  const newAccount = {
    uid: newUid,
    email: email.trim(),
    password: password,
    displayName: displayName.trim() || email.split('@')[0],
    photoURL: defaultAvatar,
    bio: 'Chess enthusiast studying World Championship matches.',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
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
    photoURL: newAccount.photoURL,
    bio: newAccount.bio,
    joinedDate: newAccount.joinedDate
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export async function logoutUser() {
  if (isFirebaseConnected()) {
    await fbSignOut(fbAuth);
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
  if (isFirebaseConnected()) {
    if (fbAuth.currentUser) {
      await fbUpdateProfile(fbAuth.currentUser, { displayName, photoURL });
      await updateDoc(doc(fbDb, 'users', uid), { displayName, photoURL, bio });
    }
  }

  // Update in localStorage
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
  if (isFirebaseConnected()) {
    try {
      const snap = await getDoc(doc(fbDb, 'users', uid));
      if (snap.exists()) {
        return snap.data().favoriteGameIds || [];
      }
    } catch (e) {}
  }

  // Local fallback
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const acc = accounts.find(a => a.uid === uid);
  return acc ? (acc.favoriteGameIds || []) : [];
}

export async function toggleUserFavorite(uid, gameId) {
  if (!uid || !gameId) return [];
  
  if (isFirebaseConnected()) {
    try {
      const snap = await getDoc(doc(fbDb, 'users', uid));
      const current = snap.exists() ? (snap.data().favoriteGameIds || []) : [];
      const isFav = current.includes(gameId);
      await updateDoc(doc(fbDb, 'users', uid), {
        favoriteGameIds: isFav ? arrayRemove(gameId) : arrayUnion(gameId)
      });
      return isFav ? current.filter(id => id !== gameId) : [...current, gameId];
    } catch (e) {}
  }

  // Local fallback
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

  // Also sync in community user list
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
  if (isFirebaseConnected()) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      const list = [];
      snap.forEach(d => list.push(d.data()));
      if (list.length > 0) return list;
    } catch (e) {}
  }

  // Local fallback
  initLocalDb();
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  return community;
}

export async function getCommunityUserProfile(uid) {
  const all = await getAllCommunityProfiles();
  return all.find(u => u.uid === uid) || null;
}
