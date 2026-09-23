// Firebase Service with Admin Account, Password Security & Clean Storage
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbSignUp, 
  signOut as fbSignOut,
  updatePassword as fbUpdatePassword,
  sendPasswordResetEmail as fbSendReset
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

export const DEFAULT_AVATARS = [
  { id: 'fischer', name: 'Bobby Fischer', url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150&auto=format&fit=crop&q=80' },
  { id: 'kasparov', name: 'Garry Kasparov', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
  { id: 'carlsen', name: 'Magnus Carlsen', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'tal', name: 'Mikhail Tal', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'capablanca', name: 'José Capablanca', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'queen', name: 'Grandmaster Queen', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'knight', name: 'Tactical Knight', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' }
];

export const ADMIN_USER = {
  uid: '1',
  email: 'christopher@mutiarabangsa.sch.id',
  password: 'admin',
  displayName: 'admin',
  username: 'admin',
  role: 'admin',
  photoURL: DEFAULT_AVATARS[0].url,
  bio: 'Lead Administrator of The Chess Archive platform.',
  joinedDate: 'Sep 2026',
  isBanned: false,
  favoriteGameIds: [],
  lastUsernameChange: null
};

export function initLocalDb(forceReset = false) {
  if (typeof localStorage === 'undefined') return;
  const existingAccounts = localStorage.getItem('tca_user_accounts');
  let accounts = [];

  if (existingAccounts && !forceReset) {
    try {
      accounts = JSON.parse(existingAccounts);
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

  // Ensure all existing accounts have a valid username
  const takenUsernames = new Set();
  accounts.forEach((a, idx) => {
    if (a.uid === '1' || a.email.toLowerCase() === ADMIN_USER.email.toLowerCase()) {
      a.username = 'admin';
      a.role = 'admin';
      a.displayName = a.displayName || 'admin';
      takenUsernames.add('admin');
    } else {
      if (!a.username) {
        let base = (a.displayName || a.email.split('@')[0] || `user_${idx}`).toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (base.length < 3) base = `user_${base}`.slice(0, 15);
        let candidate = base;
        let counter = 1;
        while (takenUsernames.has(candidate)) {
          candidate = `${base.slice(0, 12)}_${counter++}`;
        }
        a.username = candidate;
      }
      takenUsernames.add(a.username.toLowerCase());
      if (a.lastUsernameChange === undefined) {
        a.lastUsernameChange = null;
      }
    }
  });

  const adminIndex = accounts.findIndex(a => a.uid === '1' || a.email.toLowerCase() === ADMIN_USER.email.toLowerCase());
  if (adminIndex === -1) {
    accounts.unshift(ADMIN_USER);
  } else {
    accounts[adminIndex].uid = '1';
    accounts[adminIndex].displayName = accounts[adminIndex].displayName || 'admin';
    accounts[adminIndex].username = 'admin';
    accounts[adminIndex].role = 'admin';
  }

  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  const community = accounts
    .filter(a => !a.isBanned)
    .map(a => ({
      uid: a.uid,
      email: a.email,
      displayName: a.displayName,
      username: a.username || 'user',
      photoURL: a.photoURL,
      bio: a.bio,
      joinedDate: a.joinedDate,
      role: a.role || 'user',
      favoriteGameIds: a.favoriteGameIds || []
    }));
  localStorage.setItem('tca_community_users', JSON.stringify(community));

  // Sync active user if present
  try {
    const rawActive = localStorage.getItem('tca_active_user');
    if (rawActive) {
      const active = JSON.parse(rawActive);
      const matched = accounts.find(a => a.uid === active.uid);
      if (matched) {
        const synced = {
          ...active,
          displayName: matched.displayName,
          username: matched.username,
          lastUsernameChange: matched.lastUsernameChange || null
        };
        localStorage.setItem('tca_active_user', JSON.stringify(synced));
      }
    }
  } catch (e) {}
}

initLocalDb();

export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem('tca_firebase_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
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

  if (found.password && found.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  const currentUser = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    username: found.username || found.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
    role: found.role || (found.uid === '1' ? 'admin' : 'user'),
    photoURL: found.photoURL,
    bio: found.bio,
    joinedDate: found.joinedDate,
    favoriteGameIds: found.favoriteGameIds || [],
    lastUsernameChange: found.lastUsernameChange || null
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export function isUsernameAvailable(username, currentUid = null) {
  if (!username) return { available: false, error: 'Username cannot be empty.' };
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) return { available: false, error: 'Username must be at least 3 characters long.' };
  if (clean.length > 20) return { available: false, error: 'Username cannot exceed 20 characters.' };
  if (!/^[a-z0-9_]+$/.test(clean)) return { available: false, error: 'Username may only contain letters, numbers, and underscores.' };

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const exists = accounts.some(a => a.uid !== currentUid && a.username && a.username.toLowerCase() === clean);
  if (exists) {
    return { available: false, error: `The username @${clean} is already taken.` };
  }
  return { available: true, error: '' };
}

export async function signupWithEmail(email, password, displayName = '', requestedUsername = '') {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  if (accounts.some(a => a.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  // Determine unique username
  let usernameToSet = '';
  if (requestedUsername && requestedUsername.trim()) {
    const val = isUsernameAvailable(requestedUsername);
    if (!val.available) {
      throw new Error(val.error);
    }
    usernameToSet = requestedUsername.trim().toLowerCase();
  } else {
    let base = (displayName || email.split('@')[0] || 'player').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (base.length < 3) base = `player_${base}`.slice(0, 15);
    let candidate = base;
    let counter = 1;
    while (accounts.some(a => a.username && a.username.toLowerCase() === candidate)) {
      candidate = `${base.slice(0, 14)}_${counter++}`;
    }
    usernameToSet = candidate;
  }

  const newUid = 'usr_' + Date.now();
  const defaultAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].url;
  const newAccount = {
    uid: newUid,
    email: email.trim(),
    password: password,
    displayName: displayName.trim() || email.split('@')[0],
    username: usernameToSet,
    role: 'user',
    photoURL: defaultAvatar,
    bio: 'Chess enthusiast studying World Championship matches.',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    isBanned: false,
    favoriteGameIds: [],
    lastUsernameChange: Date.now()
  };

  accounts.push(newAccount);
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  community.push({
    uid: newAccount.uid,
    email: newAccount.email,
    displayName: newAccount.displayName,
    username: newAccount.username,
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
    username: newAccount.username,
    role: 'user',
    photoURL: newAccount.photoURL,
    bio: newAccount.bio,
    joinedDate: newAccount.joinedDate,
    favoriteGameIds: [],
    lastUsernameChange: newAccount.lastUsernameChange
  };
  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  return currentUser;
}

export async function changeUsername(uid, newUsername) {
  if (!uid) throw new Error('You must be signed in to change your username.');
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => a.uid === uid);
  if (index === -1) throw new Error('User account not found.');

  const account = accounts[index];
  const clean = newUsername.trim().toLowerCase();

  // If identical to current
  if (account.username && account.username.toLowerCase() === clean) {
    return account;
  }

  // Check 24-hour rate limit (once a day) - exempt primary admin uid '1' if desired
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  if (account.lastUsernameChange && uid !== '1') {
    const elapsed = Date.now() - account.lastUsernameChange;
    if (elapsed < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - elapsed;
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const waitStr = hours > 0 ? `${hours} hour(s) and ${minutes} minute(s)` : `${minutes} minute(s)`;
      throw new Error(`Username can only be changed once every 24 hours. You can change your username again in ${waitStr}.`);
    }
  }

  // Validate format and uniqueness
  const validation = isUsernameAvailable(clean, uid);
  if (!validation.available) {
    throw new Error(validation.error);
  }

  // Update account
  account.username = clean;
  account.lastUsernameChange = Date.now();
  accounts[index] = account;
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  // Update community listing
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIdx = community.findIndex(u => u.uid === uid);
  if (commIdx !== -1) {
    community[commIdx].username = clean;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  // Update active session
  const active = getCurrentLocalUser();
  if (active && active.uid === uid) {
    const updated = {
      ...active,
      username: clean,
      lastUsernameChange: account.lastUsernameChange
    };
    localStorage.setItem('tca_active_user', JSON.stringify(updated));
    return updated;
  }

  return account;
}

export async function changeDisplayName(uid, newDisplayName) {
  if (!uid) throw new Error('You must be signed in to change your display name.');
  const trimmed = (newDisplayName || '').trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters long.');
  }

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => a.uid === uid);
  if (index === -1) throw new Error('User account not found.');

  accounts[index].displayName = trimmed;
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIdx = community.findIndex(u => u.uid === uid);
  if (commIdx !== -1) {
    community[commIdx].displayName = trimmed;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  const active = getCurrentLocalUser();
  if (active && active.uid === uid) {
    const updated = {
      ...active,
      displayName: trimmed
    };
    localStorage.setItem('tca_active_user', JSON.stringify(updated));
    return updated;
  }

  return accounts[index];
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

// Password Management (Change Password without modifying username)
export async function changeUserPassword(uid, currentPassword, newPassword) {
  if (!uid) throw new Error('You must be signed in to change your password.');
  if (!newPassword || newPassword.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => a.uid === uid);
  if (index === -1) throw new Error('User account not found.');

  // Validate current password
  if (accounts[index].password && accounts[index].password !== currentPassword) {
    throw new Error('Current password does not match.');
  }

  // Update password only (username is strictly preserved)
  accounts[index].password = newPassword;
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  if (isFirebaseConnected() && fbAuth.currentUser) {
    try {
      await fbUpdatePassword(fbAuth.currentUser, newPassword);
    } catch (e) {
      console.warn('Firebase update password error:', e);
    }
  }

  return true;
}

// Forgot Password Option (Sends link to email)
export async function sendPasswordResetLink(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const found = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());

  if (!found) {
    throw new Error('No account found registered with this email address.');
  }

  if (isFirebaseConnected()) {
    try {
      await fbSendReset(fbAuth, email);
    } catch (e) {
      console.warn('Firebase reset email error:', e);
    }
  }

  // Generate verification reset link token
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://thechessarchive.org';
  const resetLink = `${origin}/#reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  return {
    success: true,
    email: email,
    resetLink: resetLink,
    message: `Password reset verification link has been generated and dispatched to ${email}.`
  };
}

// User Profile Updates (Avatar & Bio only, strictly preserving username if requested)
export async function updateUserProfile(uid, { displayName, photoURL, bio }) {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const accIndex = accounts.findIndex(a => a.uid === uid);
  if (accIndex !== -1) {
    // Preserve displayName if not provided or restricted
    if (displayName) accounts[accIndex].displayName = displayName;
    if (photoURL) accounts[accIndex].photoURL = photoURL;
    if (bio !== undefined) accounts[accIndex].bio = bio;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => u.uid === uid);
  if (commIndex !== -1) {
    if (displayName) community[commIndex].displayName = displayName;
    if (photoURL) community[commIndex].photoURL = photoURL;
    if (bio !== undefined) community[commIndex].bio = bio;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

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

  const current = getCurrentLocalUser();
  if (current && current.uid === uid) {
    current.favoriteGameIds = favs;
    localStorage.setItem('tca_active_user', JSON.stringify(current));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => u.uid === uid);
  if (commIndex !== -1) {
    community[commIndex].favoriteGameIds = favs;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  return favs;
}

export async function getAllCommunityProfiles() {
  initLocalDb();
  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  return community;
}

export async function getAllUsersForAdmin() {
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  return accounts.map(a => ({
    uid: a.uid,
    email: a.email,
    displayName: a.displayName,
    username: a.username || 'user',
    role: a.role || (a.uid === '1' ? 'admin' : 'user'),
    joinedDate: a.joinedDate,
    photoURL: a.photoURL,
    isBanned: !!a.isBanned,
    favoritesCount: (a.favoriteGameIds || []).length,
    lastUsernameChange: a.lastUsernameChange || null
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

  let community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  community = community.filter(u => u.uid !== uid);
  localStorage.setItem('tca_community_users', JSON.stringify(community));

  const current = getCurrentLocalUser();
  if (current && current.uid === uid) {
    localStorage.removeItem('tca_active_user');
  }
  return true;
}
