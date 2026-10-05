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

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
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
    updateCloudStatusBadge('error', AppState.lang === 'en' ? 'Connection Issue' : 'Koneksi Firestore Terkendala');
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
    const payload = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || 'Pengguna Google',
      photoURL: currentUser.photoURL || '',
      cart: AppState.cart,
      budgetCap: AppState.budgetCap,
      history: AppState.history,
      activeBaselineId: AppState.activeBaselineId,
      lastUpdated: Date.now(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await userDocRef.set(payload, { merge: true });
    AppState.lastLocalUpdate = Date.now();
    updateCloudStatusBadge('synced', AppState.lang === 'en' ? 'Auto-synced' : 'Tersinkronisasi Otomatis');
    if (immediate) {
      showToast(AppState.lang === 'en' ? 'Data saved to Cloud Firestore!' : 'Data berhasil disinkronkan ke Cloud Firestore!', 'success');
    }
  } catch (error) {
    console.error('Error syncing to Firestore:', error);
    updateCloudStatusBadge('error', AppState.lang === 'en' ? 'Sync Failed' : 'Gagal Sinkronisasi');
    if (immediate) {
      showToast(AppState.lang === 'en' ? 'Failed to sync to Cloud Firestore.' : 'Gagal sinkronisasi ke Cloud Firestore.', 'error');
    }
  } finally {
    isRemoteSyncInProgress = false;
  }
}

function updateCloudStatusBadge(state, message) {
  const headerIndicator = document.getElementById('auth-header-indicator');
  const tabSyncText = document.getElementById('tab-sync-text');
  const tabSyncTime = document.getElementById('tab-sync-time');
  const modalSyncTime = document.getElementById('modal-sync-time');

  const nowTime = new Date().toLocaleTimeString(AppState.lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });

  if (headerIndicator) {
    if (state === 'syncing') {
      headerIndicator.className = 'auth-sync-dot syncing';
    } else if (state === 'synced') {
      headerIndicator.className = 'auth-sync-dot online';
    } else {
      headerIndicator.className = 'auth-sync-dot';
    }
  }

  if (tabSyncText) tabSyncText.textContent = message;
  if (tabSyncTime) tabSyncTime.textContent = `${AppState.lang === 'en' ? 'At' : 'Pukul'} ${nowTime}`;
  if (modalSyncTime) modalSyncTime.textContent = `${message} (${nowTime})`;
}
