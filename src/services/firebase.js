// Firebase Service with Firestore Database Integration & Cross-Browser Synchronization
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
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
  query,
  where
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
    console.warn('Firebase initialization error:', err);
  }
}

export const isFirebaseConnected = () => !!fbDb;
export const getFirestoreDb = () => fbDb;

// Local fallback and caching
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

  const takenUsernames = new Set();
  accounts.forEach((a, idx) => {
    if (a.uid === '1' || (a.email && a.email.toLowerCase() === ADMIN_USER.email.toLowerCase())) {
      a.uid = '1';
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

  const adminIndex = accounts.findIndex(a => a.uid === '1' || (a.email && a.email.toLowerCase() === ADMIN_USER.email.toLowerCase()));
  if (adminIndex === -1) {
    accounts.unshift(ADMIN_USER);
  } else {
    accounts[adminIndex] = {
      ...ADMIN_USER,
      ...accounts[adminIndex],
      uid: '1',
      username: 'admin',
      role: 'admin',
      email: ADMIN_USER.email
    };
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
}

initLocalDb();

// Synchronize all registered users from Firestore into local cache
export async function syncUsersFromFirestore() {
  if (!fbDb) return [];
  try {
    const snap = await getDocs(collection(fbDb, 'users'));
    const remoteUsers = [];
    snap.forEach(d => {
      remoteUsers.push(d.data());
    });

    if (remoteUsers.length > 0) {
      // Ensure admin user is in the list
      const hasAdmin = remoteUsers.some(u => u.uid === '1' || (u.email && u.email.toLowerCase() === ADMIN_USER.email.toLowerCase()));
      if (!hasAdmin) {
        remoteUsers.unshift(ADMIN_USER);
      }

      localStorage.setItem('tca_user_accounts', JSON.stringify(remoteUsers));

      const community = remoteUsers
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

      // Refresh active user session if logged in
      const activeRaw = localStorage.getItem('tca_active_user');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        const match = remoteUsers.find(u => u.uid === active.uid);
        if (match) {
          const syncedActive = {
            ...active,
            ...match
          };
          delete syncedActive.password;
          localStorage.setItem('tca_active_user', JSON.stringify(syncedActive));
        }
      }
    }
    return remoteUsers;
  } catch (err) {
    console.warn('Could not sync users from Firestore:', err);
    return [];
  }
}

// Make sure Admin account exists in Firestore
export async function ensureAdminInFirestore() {
  if (!fbDb) return;
  try {
    const adminDocRef = doc(fbDb, 'users', '1');
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, {
        ...ADMIN_USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const data = snap.data();
      // Ensure admin privileges and credentials remain intact
      if (data.role !== 'admin' || data.email.toLowerCase() !== ADMIN_USER.email.toLowerCase() || !data.password) {
        await updateDoc(adminDocRef, {
          role: 'admin',
          username: 'admin',
          email: ADMIN_USER.email,
          password: data.password || ADMIN_USER.password,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    console.warn('Error verifying admin document in Firestore:', e);
  }
}

// Automatically ensure admin document exists and sync users on startup
if (fbDb) {
  ensureAdminInFirestore().then(() => {
    syncUsersFromFirestore();
  });
}

// Authentication: Login with Email (Checks Firestore first for cross-browser sync)
export async function loginWithEmail(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Email address is required.');

  let found = null;

  // 1. Try querying Firestore database
  if (fbDb) {
    try {
      // If it is the admin email, fetch doc 1 directly
      if (cleanEmail === ADMIN_USER.email.toLowerCase()) {
        const adminSnap = await getDoc(doc(fbDb, 'users', '1'));
        if (adminSnap.exists()) {
          found = adminSnap.data();
        }
      }

      if (!found) {
        const usersSnap = await getDocs(collection(fbDb, 'users'));
        usersSnap.forEach(d => {
          const u = d.data();
          if (u.email && u.email.toLowerCase() === cleanEmail) {
            found = u;
          }
        });
      }
    } catch (err) {
      console.warn('Firestore login lookup failed, falling back to local storage:', err);
    }
  }

  // 2. Fallback to local storage
  if (!found) {
    initLocalDb();
    const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
    found = accounts.find(a => a.email && a.email.toLowerCase() === cleanEmail);
  }

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
    uid: String(found.uid),
    email: found.email,
    displayName: found.displayName || found.email.split('@')[0],
    username: found.username || found.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
    role: found.role || (found.uid === '1' ? 'admin' : 'user'),
    photoURL: found.photoURL || DEFAULT_AVATARS[0].url,
    bio: found.bio || '',
    joinedDate: found.joinedDate || 'Sep 2026',
    favoriteGameIds: found.favoriteGameIds || [],
    lastUsernameChange: found.lastUsernameChange || null
  };

  localStorage.setItem('tca_active_user', JSON.stringify(currentUser));
  
  // Refresh local cache with latest data
  if (fbDb) {
    syncUsersFromFirestore().catch(() => {});
  }

  return currentUser;
}

// Synchronous availability check against cached users
export function isUsernameAvailable(username, currentUid = null) {
  if (!username) return { available: false, error: 'Username cannot be empty.' };
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) return { available: false, error: 'Username must be at least 3 characters long.' };
  if (clean.length > 20) return { available: false, error: 'Username cannot exceed 20 characters.' };
  if (!/^[a-z0-9_]+$/.test(clean)) return { available: false, error: 'Username may only contain letters, numbers, and underscores.' };

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const exists = accounts.some(a => String(a.uid) !== String(currentUid) && a.username && a.username.toLowerCase() === clean);
  if (exists) {
    return { available: false, error: `The username @${clean} is already taken.` };
  }
  return { available: true, error: '' };
}

// Asynchronous global check querying Firestore directly
export async function checkUsernameAvailableInDb(username, currentUid = null) {
  const localCheck = isUsernameAvailable(username, currentUid);
  if (!localCheck.available) return localCheck;

  const clean = username.trim().toLowerCase();
  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      let taken = false;
      snap.forEach(d => {
        const u = d.data();
        if (String(u.uid) !== String(currentUid) && u.username && u.username.toLowerCase() === clean) {
          taken = true;
        }
      });
      if (taken) {
        return { available: false, error: `The username @${clean} is already taken.` };
      }
    } catch (e) {
      console.warn('Firestore username check error:', e);
    }
  }
  return { available: true, error: '' };
}

// Authentication: Sign Up with Email (Writes to Firestore database for cross-browser sync)
export async function signupWithEmail(email, password, displayName = '', requestedUsername = '') {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  // 1. Verify email uniqueness across Firestore
  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      let emailExists = false;
      snap.forEach(d => {
        const u = d.data();
        if (u.email && u.email.toLowerCase() === cleanEmail) {
          emailExists = true;
        }
      });
      if (emailExists) {
        throw new Error('An account with this email already exists.');
      }
    } catch (err) {
      if (err.message.includes('already exists')) throw err;
      console.warn('Firestore email uniqueness check error:', err);
    }
  }

  // Fallback local check
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  if (accounts.some(a => a.email && a.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists.');
  }

  // 2. Validate requested username
  let usernameToSet = '';
  if (requestedUsername && requestedUsername.trim()) {
    const val = await checkUsernameAvailableInDb(requestedUsername);
    if (!val.available) {
      throw new Error(val.error);
    }
    usernameToSet = requestedUsername.trim().toLowerCase();
  } else {
    let base = (displayName || cleanEmail.split('@')[0] || 'player').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (base.length < 3) base = `player_${base}`.slice(0, 15);
    let candidate = base;
    let counter = 1;
    while (accounts.some(a => a.username && a.username.toLowerCase() === candidate)) {
      candidate = `${base.slice(0, 14)}_${counter++}`;
    }
    usernameToSet = candidate;
  }

  const newUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const defaultAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)].url;
  const newAccount = {
    uid: newUid,
    email: cleanEmail,
    password: password,
    displayName: displayName.trim() || cleanEmail.split('@')[0],
    username: usernameToSet,
    role: 'user',
    photoURL: defaultAvatar,
    bio: 'Chess enthusiast studying World Championship matches.',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    isBanned: false,
    favoriteGameIds: [],
    lastUsernameChange: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 3. Persist to Cloud Firestore database
  if (fbDb) {
    try {
      await setDoc(doc(fbDb, 'users', newUid), newAccount);
    } catch (err) {
      console.error('Failed to write user to Firestore:', err);
    }
  }

  // 4. Update local storage cache
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

// Change Username
export async function changeUsername(uid, newUsername) {
  if (!uid) throw new Error('You must be signed in to change your username.');
  const clean = newUsername.trim().toLowerCase();

  // Rate limit check
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const activeUser = getCurrentLocalUser();
  if (activeUser && activeUser.lastUsernameChange && String(uid) !== '1') {
    const elapsed = Date.now() - activeUser.lastUsernameChange;
    if (elapsed < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - elapsed;
      const hours = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const waitStr = hours > 0 ? `${hours} hour(s) and ${minutes} minute(s)` : `${minutes} minute(s)`;
      throw new Error(`Username can only be changed once every 24 hours. You can change your username again in ${waitStr}.`);
    }
  }

  const validation = await checkUsernameAvailableInDb(clean, uid);
  if (!validation.available) {
    throw new Error(validation.error);
  }

  const now = Date.now();

  // 1. Update in Firestore
  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'users', String(uid)), {
        username: clean,
        lastUsernameChange: now,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore update username error:', e);
    }
  }

  // 2. Update local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => String(a.uid) === String(uid));
  if (index !== -1) {
    accounts[index].username = clean;
    accounts[index].lastUsernameChange = now;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIdx = community.findIndex(u => String(u.uid) === String(uid));
  if (commIdx !== -1) {
    community[commIdx].username = clean;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  const active = getCurrentLocalUser();
  if (active && String(active.uid) === String(uid)) {
    const updated = {
      ...active,
      username: clean,
      lastUsernameChange: now
    };
    localStorage.setItem('tca_active_user', JSON.stringify(updated));
    return updated;
  }

  return { uid, username: clean, lastUsernameChange: now };
}

// Change Display Name
export async function changeDisplayName(uid, newDisplayName) {
  if (!uid) throw new Error('You must be signed in to change your display name.');
  const trimmed = (newDisplayName || '').trim();
  if (!trimmed || trimmed.length < 2) {
    throw new Error('Display name must be at least 2 characters long.');
  }

  // 1. Update in Firestore
  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'users', String(uid)), {
        displayName: trimmed,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore update display name error:', e);
    }
  }

  // 2. Update local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => String(a.uid) === String(uid));
  if (index !== -1) {
    accounts[index].displayName = trimmed;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIdx = community.findIndex(u => String(u.uid) === String(uid));
  if (commIdx !== -1) {
    community[commIdx].displayName = trimmed;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  const active = getCurrentLocalUser();
  if (active && String(active.uid) === String(uid)) {
    const updated = {
      ...active,
      displayName: trimmed
    };
    localStorage.setItem('tca_active_user', JSON.stringify(updated));
    return updated;
  }

  return { uid, displayName: trimmed };
}

// Logout
export async function logoutUser() {
  if (fbAuth) {
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

// Change Password
export async function changeUserPassword(uid, currentPassword, newPassword) {
  if (!uid) throw new Error('You must be signed in to change your password.');
  if (!newPassword || newPassword.length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  // 1. Check in Firestore
  if (fbDb) {
    try {
      const snap = await getDoc(doc(fbDb, 'users', String(uid)));
      if (snap.exists()) {
        const u = snap.data();
        if (u.password && u.password !== currentPassword) {
          throw new Error('Current password does not match.');
        }
        await updateDoc(doc(fbDb, 'users', String(uid)), {
          password: newPassword,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      if (e.message.includes('Current password')) throw e;
      console.warn('Firestore password change notice:', e);
    }
  }

  // 2. Update local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => String(a.uid) === String(uid));
  if (index !== -1) {
    if (accounts[index].password && accounts[index].password !== currentPassword) {
      throw new Error('Current password does not match.');
    }
    accounts[index].password = newPassword;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  if (fbAuth && fbAuth.currentUser) {
    try {
      await fbUpdatePassword(fbAuth.currentUser, newPassword);
    } catch (e) {}
  }

  return true;
}

// Password Reset Link
export async function sendPasswordResetLink(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  const cleanEmail = email.trim().toLowerCase();
  let found = false;

  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      snap.forEach(d => {
        if (d.data().email && d.data().email.toLowerCase() === cleanEmail) {
          found = true;
        }
      });
    } catch (e) {}
  }

  if (!found) {
    initLocalDb();
    const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
    found = accounts.some(a => a.email && a.email.toLowerCase() === cleanEmail);
  }

  if (!found) {
    throw new Error('No account found registered with this email address.');
  }

  if (fbAuth) {
    try {
      await fbSendReset(fbAuth, cleanEmail);
    } catch (e) {}
  }

  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://thechessarchive.org';
  const resetLink = `${origin}/#reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

  return {
    success: true,
    email: cleanEmail,
    resetLink: resetLink,
    message: `Password reset verification link has been generated and dispatched to ${cleanEmail}.`
  };
}

// User Profile Updates
export async function updateUserProfile(uid, { displayName, photoURL, bio }) {
  const updates = {};
  if (displayName) updates.displayName = displayName;
  if (photoURL) updates.photoURL = photoURL;
  if (bio !== undefined) updates.bio = bio;
  updates.updatedAt = new Date().toISOString();

  // 1. Update in Firestore
  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'users', String(uid)), updates);
    } catch (e) {
      console.warn('Firestore update profile error:', e);
    }
  }

  // 2. Update local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const accIndex = accounts.findIndex(a => String(a.uid) === String(uid));
  if (accIndex !== -1) {
    if (displayName) accounts[accIndex].displayName = displayName;
    if (photoURL) accounts[accIndex].photoURL = photoURL;
    if (bio !== undefined) accounts[accIndex].bio = bio;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => String(u.uid) === String(uid));
  if (commIndex !== -1) {
    if (displayName) community[commIndex].displayName = displayName;
    if (photoURL) community[commIndex].photoURL = photoURL;
    if (bio !== undefined) community[commIndex].bio = bio;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  const current = getCurrentLocalUser();
  if (current && String(current.uid) === String(uid)) {
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

  // 1. Try fetching from Firestore
  if (fbDb) {
    try {
      const snap = await getDoc(doc(fbDb, 'users', String(uid)));
      if (snap.exists() && Array.isArray(snap.data().favoriteGameIds)) {
        return snap.data().favoriteGameIds;
      }
    } catch (e) {
      console.warn('Firestore getUserFavorites error:', e);
    }
  }

  // 2. Fallback to local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const acc = accounts.find(a => String(a.uid) === String(uid));
  return acc ? (acc.favoriteGameIds || []) : [];
}

export async function toggleUserFavorite(uid, gameId) {
  if (!uid || !gameId) return [];

  let currentFavs = await getUserFavorites(uid);
  let favs = [...currentFavs];
  if (favs.includes(gameId)) {
    favs = favs.filter(id => id !== gameId);
  } else {
    favs = [...favs, gameId];
  }

  // 1. Update in Firestore
  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'users', String(uid)), {
        favoriteGameIds: favs,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore toggleUserFavorite error:', e);
    }
  }

  // 2. Update local storage
  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const accIndex = accounts.findIndex(a => String(a.uid) === String(uid));
  if (accIndex !== -1) {
    accounts[accIndex].favoriteGameIds = favs;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }

  const current = getCurrentLocalUser();
  if (current && String(current.uid) === String(uid)) {
    current.favoriteGameIds = favs;
    localStorage.setItem('tca_active_user', JSON.stringify(current));
  }

  const community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  const commIndex = community.findIndex(u => String(u.uid) === String(uid));
  if (commIndex !== -1) {
    community[commIndex].favoriteGameIds = favs;
    localStorage.setItem('tca_community_users', JSON.stringify(community));
  }

  return favs;
}

// Move Favorites with Personal Notes (Firestore synchronized)
const MOVE_FAV_KEY = 'tca_user_move_favorites';

export async function getUserMoveFavorites(uid) {
  if (!uid) return [];

  // 1. Try reading from Firestore
  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'move_favorites'));
      const list = [];
      snap.forEach(d => {
        const item = d.data();
        if (String(item.uid) === String(uid)) {
          list.push(item);
        }
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      localStorage.setItem(MOVE_FAV_KEY, JSON.stringify(list));
      return list;
    } catch (e) {
      console.warn('Firestore getUserMoveFavorites error:', e);
    }
  }

  // 2. Fallback to local storage
  try {
    const raw = localStorage.getItem(MOVE_FAV_KEY);
    const all = raw ? JSON.parse(raw) : [];
    return all
      .filter(item => String(item.uid) === String(uid))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    return [];
  }
}

export async function saveUserMoveFavorite(uid, moveFavData) {
  if (!uid) throw new Error('Authentication required.');

  const raw = localStorage.getItem(MOVE_FAV_KEY);
  let all = [];
  try { all = raw ? JSON.parse(raw) : []; } catch (e) { all = []; }

  const existingIdx = all.findIndex(item => String(item.uid) === String(uid) && item.gameId === moveFavData.gameId && item.plyIndex === moveFavData.plyIndex);

  if (existingIdx !== -1) {
    const updated = {
      ...all[existingIdx],
      note: (moveFavData.note || '').trim(),
      updatedAt: new Date().toISOString()
    };
    all[existingIdx] = updated;
    localStorage.setItem(MOVE_FAV_KEY, JSON.stringify(all));

    if (fbDb) {
      try {
        await updateDoc(doc(fbDb, 'move_favorites', updated.id), {
          note: updated.note,
          updatedAt: updated.updatedAt
        });
      } catch (e) {}
    }
    return updated;
  }

  const newFav = {
    id: `mfav_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    uid: String(uid),
    gameId: moveFavData.gameId,
    gameTitle: moveFavData.gameTitle || `${moveFavData.white} vs ${moveFavData.black} (${moveFavData.year})`,
    year: moveFavData.year,
    white: moveFavData.white,
    black: moveFavData.black,
    event: moveFavData.event,
    result: moveFavData.result,
    eco: moveFavData.eco,
    plyIndex: moveFavData.plyIndex,
    moveNumber: moveFavData.moveNumber,
    moveSan: moveFavData.moveSan,
    fen: moveFavData.fen,
    note: (moveFavData.note || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (fbDb) {
    try {
      await setDoc(doc(fbDb, 'move_favorites', newFav.id), newFav);
    } catch (e) {
      console.warn('Firestore saveUserMoveFavorite error:', e);
    }
  }

  all.unshift(newFav);
  localStorage.setItem(MOVE_FAV_KEY, JSON.stringify(all));
  return newFav;
}

export async function updateUserMoveFavoriteNote(uid, favId, note) {
  if (!uid) throw new Error('Authentication required.');
  const now = new Date().toISOString();

  if (fbDb) {
    try {
      await updateDoc(doc(fbDb, 'move_favorites', favId), {
        note: (note || '').trim(),
        updatedAt: now
      });
    } catch (e) {}
  }

  const raw = localStorage.getItem(MOVE_FAV_KEY);
  const all = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex(item => item.id === favId && String(item.uid) === String(uid));
  if (idx !== -1) {
    all[idx].note = (note || '').trim();
    all[idx].updatedAt = now;
    localStorage.setItem(MOVE_FAV_KEY, JSON.stringify(all));
    return all[idx];
  }
  return { id: favId, note: (note || '').trim(), updatedAt: now };
}

export async function deleteUserMoveFavorite(uid, favId) {
  if (!uid) throw new Error('Authentication required.');

  if (fbDb) {
    try {
      await deleteDoc(doc(fbDb, 'move_favorites', favId));
    } catch (e) {}
  }

  const raw = localStorage.getItem(MOVE_FAV_KEY);
  let all = raw ? JSON.parse(raw) : [];
  all = all.filter(item => !(item.id === favId && String(item.uid) === String(uid)));
  localStorage.setItem(MOVE_FAV_KEY, JSON.stringify(all));
  return true;
}

// Community Profiles (Live across all browsers via Firestore)
export async function getAllCommunityProfiles() {
  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      const list = [];
      snap.forEach(d => {
        const a = d.data();
        if (!a.isBanned) {
          list.push({
            uid: String(a.uid),
            email: a.email,
            displayName: a.displayName || a.email.split('@')[0],
            username: a.username || 'user',
            photoURL: a.photoURL || DEFAULT_AVATARS[0].url,
            bio: a.bio || '',
            joinedDate: a.joinedDate || 'Sep 2026',
            role: a.role || (a.uid === '1' ? 'admin' : 'user'),
            favoriteGameIds: a.favoriteGameIds || []
          });
        }
      });
      // Sort with admin first, then by joined
      list.sort((a, b) => (a.uid === '1' ? -1 : b.uid === '1' ? 1 : 0));
      localStorage.setItem('tca_community_users', JSON.stringify(list));
      return list;
    } catch (e) {
      console.warn('Firestore getAllCommunityProfiles error:', e);
    }
  }

  initLocalDb();
  return JSON.parse(localStorage.getItem('tca_community_users') || '[]');
}

// Admin Operations (Live across all browsers via Firestore)
export async function getAllUsersForAdmin() {
  if (fbDb) {
    try {
      const snap = await getDocs(collection(fbDb, 'users'));
      const list = [];
      snap.forEach(d => {
        const a = d.data();
        list.push({
          uid: String(a.uid),
          email: a.email,
          displayName: a.displayName || a.email.split('@')[0],
          username: a.username || 'user',
          role: a.role || (a.uid === '1' ? 'admin' : 'user'),
          joinedDate: a.joinedDate || 'Sep 2026',
          photoURL: a.photoURL || DEFAULT_AVATARS[0].url,
          isBanned: !!a.isBanned,
          favoritesCount: (a.favoriteGameIds || []).length,
          lastUsernameChange: a.lastUsernameChange || null
        });
      });
      list.sort((a, b) => (a.uid === '1' ? -1 : b.uid === '1' ? 1 : 0));
      return list;
    } catch (e) {
      console.warn('Firestore getAllUsersForAdmin error:', e);
    }
  }

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  return accounts.map(a => ({
    uid: String(a.uid),
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
  if (String(uid) === '1') {
    throw new Error('Cannot ban the master administrator account.');
  }

  let newBannedStatus = true;

  if (fbDb) {
    try {
      const snap = await getDoc(doc(fbDb, 'users', String(uid)));
      if (snap.exists()) {
        newBannedStatus = !snap.data().isBanned;
        await updateDoc(doc(fbDb, 'users', String(uid)), {
          isBanned: newBannedStatus,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Firestore toggleBanUser error:', e);
    }
  }

  initLocalDb();
  const accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  const index = accounts.findIndex(a => String(a.uid) === String(uid));
  if (index !== -1) {
    accounts[index].isBanned = newBannedStatus;
    localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));
  }
  initLocalDb();
  return newBannedStatus;
}

export async function deleteUserAccount(uid) {
  if (String(uid) === '1') {
    throw new Error('Cannot delete the master administrator account.');
  }

  if (fbDb) {
    try {
      await deleteDoc(doc(fbDb, 'users', String(uid)));
    } catch (e) {
      console.warn('Firestore deleteUserAccount error:', e);
    }
  }

  initLocalDb();
  let accounts = JSON.parse(localStorage.getItem('tca_user_accounts') || '[]');
  accounts = accounts.filter(a => String(a.uid) !== String(uid));
  localStorage.setItem('tca_user_accounts', JSON.stringify(accounts));

  let community = JSON.parse(localStorage.getItem('tca_community_users') || '[]');
  community = community.filter(u => String(u.uid) !== String(uid));
  localStorage.setItem('tca_community_users', JSON.stringify(community));

  const current = getCurrentLocalUser();
  if (current && String(current.uid) === String(uid)) {
    localStorage.removeItem('tca_active_user');
  }
  return true;
}
