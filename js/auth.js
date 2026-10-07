/**
 * Firebase Authentication & Cloud Firestore Synchronizer
 * Google Sign-in & real-time document synchronization
 */

/**
 * Initialize Firebase SDK and setup authentication state listener
 */
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firestoreDb = firebase.firestore();

      // Configure Firestore settings before any operations
      try {
        firestoreDb.settings({
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true
        });
      } catch (settingsErr) {
        console.warn('Firestore settings notice:', settingsErr);
      }

      // Check for local Firestore emulator support (e.g. ?emulator=true or localhost development)
      const urlParams = new URLSearchParams(window.location.search);
      const useEmulator = urlParams.get('emulator') === 'true' || localStorage.getItem('use_firestore_emulator') === 'true';
      if (useEmulator && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        try {
          firestoreDb.useEmulator('localhost', 8080);
          console.info('Connected to local Firestore emulator at localhost:8080');
        } catch (emErr) {
          console.warn('Could not connect to Firestore emulator:', emErr);
        }
      }

      // Enable offline persistence: caches data in IndexedDB so connection issues do not block the app
      try {
        firestoreDb.enablePersistence({ synchronizeTabs: true }).catch((persistErr) => {
          if (persistErr.code === 'failed-precondition') {
            console.warn('Firestore persistence notice: multiple tabs open');
          } else if (persistErr.code === 'unimplemented') {
            console.warn('Firestore persistence not supported in this browser');
          }
        });
      } catch (persistErr) {
        console.warn('Firestore enablePersistence notice:', persistErr);
      }

      // Check for redirect sign-in results (PWA / Mobile / Redirect login fallback)
      if (firebaseAuth.getRedirectResult) {
        firebaseAuth.getRedirectResult().catch((redirectErr) => {
          console.warn('Redirect sign-in notice:', redirectErr);
        });
      }

      // Listen for auth state changes
      firebaseAuth.onAuthStateChanged(handleAuthStateChanged);
    } else {
      console.warn('Firebase SDK script not loaded yet.');
    }
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

/**
 * Handle Auth State Change (login / logout)
 */
function handleAuthStateChanged(user) {
  currentUser = user;
  updateAuthUI(user);

  if (user) {
    bindFirestoreSync(user);
    if (window.lucide) lucide.createIcons();
  } else {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }
    updateCloudStatusBadge('offline', AppState.lang === 'en' ? 'Offline (Local)' : 'Offline (Lokal)');
  }
}

/**
 * Update UI for authenticated / unauthenticated states
 */
function updateAuthUI(user) {
  const headerAvatar = document.getElementById('auth-header-avatar');
  const headerIndicator = document.getElementById('auth-header-indicator');

  // Tab views
  const tabLoggedOut = document.getElementById('auth-tab-logged-out');
  const tabLoggedIn = document.getElementById('auth-tab-logged-in');
  const tabUserAvatar = document.getElementById('tab-user-avatar');
  const tabUserName = document.getElementById('tab-user-name');
  const tabUserEmail = document.getElementById('tab-user-email');

  // Modal views
  const modalLoggedOut = document.getElementById('modal-auth-logged-out');
  const modalLoggedIn = document.getElementById('modal-auth-logged-in');
  const modalUserAvatar = document.getElementById('modal-user-avatar');
  const modalUserName = document.getElementById('modal-user-name');
  const modalUserEmail = document.getElementById('modal-user-email');

  if (user) {
    // Header Avatar
    if (headerAvatar) {
      if (user.photoURL) {
        headerAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName || 'User'}" class="auth-header-img" referrerpolicy="no-referrer">`;
      } else {
        headerAvatar.innerHTML = `<i data-lucide="user-check"></i>`;
      }
    }
    if (headerIndicator) {
      headerIndicator.className = 'auth-sync-dot online';
      headerIndicator.title = `Tersambung: ${user.email}`;
    }

    // Tab 3
    if (tabLoggedOut) tabLoggedOut.classList.add('hidden');
    if (tabLoggedIn) tabLoggedIn.classList.remove('hidden');
    if (tabUserAvatar) {
      tabUserAvatar.src = user.photoURL || 'icons/icon-192.png';
      tabUserAvatar.referrerPolicy = 'no-referrer';
    }
    if (tabUserName) tabUserName.textContent = user.displayName || 'Pengguna Google';
    if (tabUserEmail) tabUserEmail.textContent = user.email || '';

    // Modal
    if (modalLoggedOut) modalLoggedOut.classList.add('hidden');
    if (modalLoggedIn) modalLoggedIn.classList.remove('hidden');
    if (modalUserAvatar) {
      modalUserAvatar.src = user.photoURL || 'icons/icon-192.png';
      modalUserAvatar.referrerPolicy = 'no-referrer';
    }
    if (modalUserName) modalUserName.textContent = user.displayName || 'Pengguna Google';
    if (modalUserEmail) modalUserEmail.textContent = user.email || '';
  } else {
    // Header
    if (headerAvatar) headerAvatar.innerHTML = `<i data-lucide="user"></i>`;
    if (headerIndicator) {
      headerIndicator.className = 'auth-sync-dot';
      headerIndicator.title = 'Offline / Belum Login';
    }

    // Tab 3
    if (tabLoggedOut) tabLoggedOut.classList.remove('hidden');
    if (tabLoggedIn) tabLoggedIn.classList.add('hidden');

    // Modal
    if (modalLoggedOut) modalLoggedOut.classList.remove('hidden');
    if (modalLoggedIn) modalLoggedIn.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * Login with Google OAuth popup / redirect
 */
async function loginWithGoogle() {
  if (!firebaseAuth) {
    showToast(AppState.lang === 'en' ? 'Firebase not initialized. Check internet.' : 'Firebase belum terinisialisasi. Cek koneksi internet.', 'error');
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  try {
    showToast(AppState.lang === 'en' ? 'Connecting to Google Account...' : 'Menghubungkan ke Akun Google...', 'info');
    const result = await firebaseAuth.signInWithPopup(provider);
    showToast(AppState.lang === 'en'
      ? `Signed in as ${result.user.displayName || result.user.email}!`
      : `Berhasil masuk sebagai ${result.user.displayName || result.user.email}!`, 'success');

    closeAuthModal();

    // If checkout was pending before login, automatically execute it now
    if (AppState.pendingCheckout) {
      AppState.pendingCheckout = false;
      if (typeof performCheckoutTransaction === 'function') {
        performCheckoutTransaction();
      }
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'auth/configuration-not-found') {
      const guidanceMsg = AppState.lang === 'en'
        ? 'Firebase Authentication is not activated in Firebase Console for this project. Please go to Firebase Console > Authentication > Enable Google Sign-In, or use offline mode.'
        : 'Firebase Auth belum diaktifkan di Firebase Console proyek shop-tracked. Silakan buka Firebase Console > Authentication > Aktifkan Google Sign-in, atau simpan secara offline.';
      showToast(guidanceMsg, 'error');

      const promoDesc = document.getElementById('auth-promo-desc');
      if (promoDesc) {
        promoDesc.innerHTML = `<span style="color: var(--badge-rose-text); font-weight: 700;">⚠️ Konfigurasi Diperlukan:</span> Buka Firebase Console proyek <code>${FIREBASE_CONFIG.projectId}</code> &rarr; <strong>Build &rarr; Authentication</strong> &rarr; klik <strong>Get Started</strong> dan aktifkan <strong>Google</strong> di tab <em>Sign-in method</em>.`;
      }

      // Automatically reveal offline fallback button so user is never blocked
      const offlineBtn = document.getElementById('btn-save-offline-anyway');
      if (offlineBtn) offlineBtn.classList.remove('hidden');
    } else if (error.code === 'auth/popup-blocked') {
      try {
        await firebaseAuth.signInWithRedirect(provider);
      } catch (e) {
        showToast(AppState.lang === 'en' ? 'Popup blocked by browser. Please allow popups.' : 'Jendela login terblokir. Izinkan pop-up di browser.', 'error');
      }
    } else if (error.code !== 'auth/popup-closed-by-user') {
      showToast(`Login gagal: ${error.message}`, 'error');
    }
  }
}

/**
 * Logout from Firebase
 */
async function logoutFirebase() {
  if (!firebaseAuth) return;
  try {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }
    await firebaseAuth.signOut();
    currentUser = null;
    updateAuthUI(null);
    closeAuthModal();
    showToast(AppState.lang === 'en' ? 'Signed out from Google account.' : 'Berhasil keluar dari akun Gmail.', 'info');
  } catch (error) {
    console.error('Logout error:', error);
    showToast(AppState.lang === 'en' ? 'Failed to sign out.' : 'Gagal keluar dari akun.', 'error');
  }
}

/**
 * Bind Firestore Real-Time Synchronizer for Current User
 * Guarantees that local history created before login is merged with cloud history
 * and uploaded to Firestore.
 */
function bindFirestoreSync(user) {
  if (!firestoreDb || !user) return;

  const userDocRef = firestoreDb.collection('users').doc(user.uid);

  // Set up real-time listener for Firestore document changes
  firestoreUnsubscribe = userDocRef.onSnapshot((docSnapshot) => {
    if (isRemoteSyncInProgress) return;

    const exists = typeof docSnapshot.exists === 'function' ? docSnapshot.exists() : Boolean(docSnapshot.exists);
    if (exists) {
      const data = docSnapshot.data() || {};
      let hasCartChanged = false;
      let hasHistoryChanged = false;
      let hasBudgetChanged = false;

      // Merge or update cart
      if (Array.isArray(data.cart)) {
        if (AppState.cart.length === 0 || JSON.stringify(data.cart) !== JSON.stringify(AppState.cart)) {
          if (AppState.cart.length === 0 || (data.lastUpdated && data.lastUpdated > (AppState.lastLocalUpdate || 0))) {
            AppState.cart = data.cart;
            saveCartToStorage(false);
            hasCartChanged = true;
          }
        }
      }

      // Budget Cap
      if (typeof data.budgetCap === 'number' && data.budgetCap !== AppState.budgetCap) {
        if (data.lastUpdated && data.lastUpdated > (AppState.lastLocalUpdate || 0)) {
          AppState.budgetCap = data.budgetCap;
          saveBudgetCapToStorage(false);
          hasBudgetChanged = true;
        }
      }

      // Merge History: preserve pre-login local history and sync with cloud history
      let remoteHistory = Array.isArray(data.history) ? data.history : [];
      let mergedHistory = mergeHistories(AppState.history, remoteHistory);
      const hasUnsyncedLocalHistory = AppState.history.some(loc => !remoteHistory.some(rem => rem.id === loc.id));

      if (JSON.stringify(AppState.history) !== JSON.stringify(mergedHistory)) {
        AppState.history = mergedHistory;
        saveHistoryToStorage(false);
        hasHistoryChanged = true;
      }

      // If user had local history before login that was not on Firestore, push it to cloud now!
      if (hasUnsyncedLocalHistory) {
        scheduleCloudSync();
      }

      if (hasCartChanged || hasBudgetChanged || hasHistoryChanged) {
        renderCartItems();
        renderHistoryTab();
        updateBudgetSafetyUI();
        updateComparatorBadges();
        const budgetInput = document.getElementById('input-budget-cap');
        if (budgetInput) budgetInput.value = AppState.budgetCap;
        showToast(AppState.lang === 'en' ? 'Data synced from Cloud Firestore!' : 'Data disinkronkan dari Cloud Firestore!', 'info');
      }

      updateCloudStatusBadge('synced', AppState.lang === 'en' ? 'Auto-synced' : 'Tersinkronisasi Otomatis');
    } else {
      // Document doesn't exist yet on Firestore: perform initial upload of local state
      syncStateToFirestore(true);
    }
  }, (err) => {
    console.warn('Firestore snapshot error:', err);
    handleFirestoreError(err, false);
  });
}

let cloudSyncTimer = null;
function scheduleCloudSync() {
  if (!currentUser || !firestoreDb) return;
  clearTimeout(cloudSyncTimer);
  updateCloudStatusBadge('syncing', AppState.lang === 'en' ? 'Saving...' : 'Menyimpan...');
  cloudSyncTimer = setTimeout(() => syncStateToFirestore(false), 800);
}

/**
 * Handle and Diagnose Firestore Connection or Operational Errors
 */
function handleFirestoreError(err, isImmediate = false) {
  console.warn('Firestore error diagnosed:', err);
  const errCode = (err && err.code) ? err.code : '';
  const errMsg = (err && err.message) ? err.message : String(err || '');

  let statusShort = AppState.lang === 'en' ? 'Connection Issue' : 'Koneksi Terkendala';
  let guidanceText = '';

  // 1. Backend Unreachable / Network / WebChannel Stream Drop / Offline
  if (errCode === 'unavailable' ||
      errMsg.includes('backend') ||
      errMsg.includes('offline') ||
      errMsg.includes('network') ||
      errMsg.includes('Failed to get document') ||
      errMsg.includes('Could not reach')) {
    statusShort = AppState.lang === 'en' ? 'Offline / Unreachable' : 'Offline / Server Tak Terjangkau';
    guidanceText = AppState.lang === 'en'
      ? 'Could not connect to Cloud Firestore backend. Switched to offline mode — your groceries and budget are safely saved in local storage.'
      : 'Gagal terhubung ke Cloud Firestore backend. Beralih ke mode offline — data troli dan anggaran tetap aman tersimpan di perangkat lokal.';
  }
  // 2. Database Not Provisioned / 404 in Google Cloud Console
  else if (errCode === 'not-found' || errMsg.includes('NOT_FOUND') || errMsg.includes('404')) {
    statusShort = AppState.lang === 'en' ? 'Database Not Found' : 'Database Belum Dibuat';
    guidanceText = AppState.lang === 'en'
      ? `Cloud Firestore database does not exist for project "${FIREBASE_CONFIG.projectId}". Please visit Firebase Console > Build > Firestore Database to create it.`
      : `Database Cloud Firestore belum dibuat untuk project "${FIREBASE_CONFIG.projectId}". Silakan buka Firebase Console > Build > Firestore Database lalu klik "Buat Database".`;
  }
  // 3. Security Rules Blocked Access
  else if (errCode === 'permission-denied') {
    statusShort = AppState.lang === 'en' ? 'Access Denied' : 'Izin Akses Ditolak';
    guidanceText = AppState.lang === 'en'
      ? 'Firestore security rules rejected this request. Please deploy firestore.rules using `npm run deploy`.'
      : 'Aturan keamanan Firestore menolak akses. Silakan deploy firestore.rules dengan `npm run deploy`.';
  }
  // 4. General / Other Errors
  else {
    statusShort = AppState.lang === 'en' ? 'Firestore Error' : 'Kendala Firestore';
    guidanceText = errMsg || (AppState.lang === 'en' ? 'Failed to connect to Cloud Firestore.' : 'Gagal terhubung ke Cloud Firestore.');
  }

  updateCloudStatusBadge('error', statusShort);

  if (isImmediate && guidanceText) {
    showToast(guidanceText, 'error');
  }

  // Update Auth Modal promo box if visible to inform user
  const authPromoDesc = document.getElementById('auth-promo-desc');
  if (authPromoDesc && guidanceText) {
    authPromoDesc.innerHTML = `<span style="color: var(--badge-rose-text); font-weight: 700;">⚠️ ${statusShort}:</span> ${guidanceText}`;
  }

  // Reveal offline fallback button so user is never locked out
  const offlineBtn = document.getElementById('btn-save-offline-anyway');
  if (offlineBtn) offlineBtn.classList.remove('hidden');
}

/**
 * Deep sanitize object to strip any undefined values and prevent Firestore rejection
 */
function sanitizeFirestoreData(data) {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(sanitizeFirestoreData);
  if (typeof data === 'object') {
    // Preserve Firestore FieldValue tokens like serverTimestamp
    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
      if (data instanceof firebase.firestore.FieldValue) return data;
    }
    const clean = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (val !== undefined) {
        clean[key] = sanitizeFirestoreData(val);
      }
    }
    return clean;
  }
  return data;
}

/**
 * Push local application state to Cloud Firestore
 */
async function syncStateToFirestore(immediate = false) {
  if (!currentUser || !firestoreDb) {
    if (immediate) {
      showToast(AppState.lang === 'en' ? 'Please log in with Google for cloud sync.' : 'Silakan login dengan Google untuk sinkronisasi cloud.', 'info');
    }
    return;
  }

  try {
    isRemoteSyncInProgress = true;
    updateCloudStatusBadge('syncing', AppState.lang === 'en' ? 'Saving to Cloud...' : 'Menyimpan ke Cloud...');

    const userDocRef = firestoreDb.collection('users').doc(currentUser.uid);
    const rawPayload = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || 'Pengguna Google',
      photoURL: currentUser.photoURL || '',
      cart: AppState.cart || [],
      budgetCap: typeof AppState.budgetCap === 'number' ? AppState.budgetCap : 500000,
      history: AppState.history || [],
      activeBaselineId: AppState.activeBaselineId || null,
      lastUpdated: Date.now(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const cleanPayload = sanitizeFirestoreData(rawPayload);

    await userDocRef.set(cleanPayload, { merge: true });
    AppState.lastLocalUpdate = Date.now();
    updateCloudStatusBadge('synced', AppState.lang === 'en' ? 'Auto-synced' : 'Tersinkronisasi Otomatis');
    if (immediate) {
      showToast(AppState.lang === 'en' ? 'Data saved to Cloud Firestore!' : 'Data berhasil disinkronkan ke Cloud Firestore!', 'success');
    }
  } catch (error) {
    console.error('Error syncing to Firestore:', error);
    handleFirestoreError(error, immediate);
  } finally {
    isRemoteSyncInProgress = false;
  }
}

function updateCloudStatusBadge(state, message) {
  const headerIndicator = document.getElementById('auth-header-indicator');
  const tabSyncText = document.getElementById('tab-sync-text');
  const tabSyncTime = document.getElementById('tab-sync-time');
  const modalSyncTime = document.getElementById('modal-sync-time');
  const tabDbBadge = document.getElementById('tab-db-badge');

  const nowTime = new Date().toLocaleTimeString(AppState.lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });

  if (headerIndicator) {
    if (state === 'syncing') {
      headerIndicator.className = 'auth-sync-dot syncing';
      headerIndicator.title = AppState.lang === 'en' ? 'Saving to Cloud...' : 'Menyimpan ke Cloud...';
    } else if (state === 'synced') {
      headerIndicator.className = 'auth-sync-dot online';
      headerIndicator.title = currentUser ? `Tersambung: ${currentUser.email}` : 'Tersinkronisasi';
    } else if (state === 'error') {
      headerIndicator.className = 'auth-sync-dot error';
      headerIndicator.title = `Koneksi Firestore: ${message}`;
    } else {
      headerIndicator.className = 'auth-sync-dot';
      headerIndicator.title = AppState.lang === 'en' ? 'Offline (Local)' : 'Offline / Belum Login';
    }
  }

  if (tabDbBadge) {
    tabDbBadge.className = `badge-db-status ${state}`;
    tabDbBadge.innerHTML = `<span class="db-dot"></span> Firestore: ${FIREBASE_CONFIG.projectId} (${message})`;
  }

  if (tabSyncText) tabSyncText.textContent = `Status: ${message}`;
  if (tabSyncTime) tabSyncTime.textContent = `${AppState.lang === 'en' ? 'At' : 'Pukul'} ${nowTime}`;
  if (modalSyncTime) {
    modalSyncTime.textContent = `${message} (${nowTime})`;
    if (state === 'error') {
      modalSyncTime.className = 'val text-rose';
    } else if (state === 'synced') {
      modalSyncTime.className = 'val text-emerald';
    } else {
      modalSyncTime.className = 'val';
    }
  }
}
