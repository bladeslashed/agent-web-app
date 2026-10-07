/**
 * Smart Grocery & Budget Safety Tracker
 * Main Application Orchestrator & DOM Event Wiring
 * 
 * Modular Scripts Architecture:
 * - js/config.js            : Firebase credentials & AppState
 * - js/data/shelfProducts.js: Indonesian retail product database
 * - js/i18n.js              : Bilingual dictionary (ID/EN) & language switcher
 * - js/utils.js             : Formatters, discount calculator, toasts
 * - js/budget.js            : Budget cap safety, comparator calculations
 * - js/cart.js              : Cart state, persistence, and list rendering
 * - js/history.js           : History records, monthly comparator card, checkout
 * - js/shelf.js             : Supermarket shelf catalog popup & search
 * - js/auth.js              : Firebase auth, Google login, Firestore sync
 * - js/modals.js            : Bottom sheet modals & real-time calculations
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Firebase & Auth listener
  initFirebase();

  // 2. Load saved local storage state (starts blank if new user)
  loadStateFromStorage();

  // 2.5 Initialize visual theme & dark/light mode
  if (typeof initTheme === 'function') {
    initTheme();
  }

  // 3. Apply saved language (defaults to 'id', or user's preference)
  applyLanguage(AppState.lang);

  // 4. Render initial blank or stored views
  renderCartItems();
  renderHistoryTab();
  updateComparatorBadges();

  // Set Budget Cap Input value
  const budgetInput = document.getElementById('input-budget-cap');
  if (budgetInput) budgetInput.value = AppState.budgetCap;

  // 5. Navigation Tab Switching
  const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
  const tabViews = document.querySelectorAll('.tab-view');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navButtons.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const activeSection = document.getElementById(targetTab);
      if (activeSection) activeSection.classList.add('active');

      AppState.activeTab = targetTab;
      if (targetTab === 'tab-riwayat') renderHistoryTab();
      if (targetTab === 'tab-belanja') renderCartItems();
      if (targetTab === 'tab-grafik' && typeof renderAnalyticsTab === 'function') renderAnalyticsTab();
      if (window.lucide) lucide.createIcons();
    });
  });

  // 6. Language Toggle Button
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
  }

  // 7. Custom Add Item Modal
  const openModalBtn = document.getElementById('open-add-modal-btn');
  const emptyAddBtn = document.getElementById('empty-add-item-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeBackdrop = document.getElementById('close-modal-backdrop');

  if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', openAddModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if (closeBackdrop) closeBackdrop.addEventListener('click', closeAddModal);

  // 8. Supermarket Shelf Products Catalog Modal
  const openShelfBtn = document.getElementById('open-shelf-btn');
  const emptyShelfBtn = document.getElementById('empty-shelf-btn');
  const closeShelfBtn = document.getElementById('close-shelf-modal-btn');
  const closeShelfBackdrop = document.getElementById('close-shelf-backdrop');

  if (openShelfBtn) openShelfBtn.addEventListener('click', openShelfModal);
  if (emptyShelfBtn) emptyShelfBtn.addEventListener('click', openShelfModal);
  if (closeShelfBtn) closeShelfBtn.addEventListener('click', closeShelfModal);
  if (closeShelfBackdrop) closeShelfBackdrop.addEventListener('click', closeShelfModal);

  // Shelf Search Bar & Category Filter
  const shelfSearchInput = document.getElementById('shelf-search-input');
  if (shelfSearchInput) {
    shelfSearchInput.addEventListener('input', (e) => {
      AppState.shelfSearchQuery = e.target.value;
      renderShelfCatalogModal();
    });
  }

  const shelfCatBar = document.getElementById('shelf-categories-bar');
  if (shelfCatBar) {
    shelfCatBar.addEventListener('click', (e) => {
      const chip = e.target.closest('.shelf-cat-chip');
      if (!chip) return;
      const cat = chip.getAttribute('data-category');
      AppState.shelfCategoryFilter = cat;

      document.querySelectorAll('#shelf-categories-bar .shelf-cat-chip').forEach(c => {
        c.classList.toggle('active', c === chip);
      });

      renderShelfCatalogModal();
    });
  }

  // Shelf Product List Click (Add to Cart)
  const shelfProductsList = document.getElementById('shelf-products-list');
  if (shelfProductsList) {
    shelfProductsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add-shelf');
      if (!btn) return;
      const prodId = btn.getAttribute('data-shelf-id');
      if (prodId) {
        addShelfProductToCart(prodId);
      }
    });
  }

  // 9. Add Item Modal Stepper (+ / -)
  const qtyInput = document.getElementById('item-qty');
  const qtyMinus = document.getElementById('modal-qty-minus');
  const qtyPlus = document.getElementById('modal-qty-plus');

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value) || 1;
      if (cur > 1) {
        qtyInput.value = cur - 1;
        updateModalLiveCalculations();
      }
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', () => {
      const cur = parseInt(qtyInput.value) || 1;
      qtyInput.value = cur + 1;
      updateModalLiveCalculations();
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', updateModalLiveCalculations);
  }

  // 10. Modal Live Inputs (Price, Discount, Name)
  const itemPriceInput = document.getElementById('item-price');
  const itemDiscInput = document.getElementById('item-discount');
  const itemNameInput = document.getElementById('item-name');

  if (itemPriceInput) itemPriceInput.addEventListener('input', updateModalLiveCalculations);
  if (itemDiscInput) itemDiscInput.addEventListener('input', updateModalLiveCalculations);
  if (itemNameInput) itemNameInput.addEventListener('input', updateModalLiveCalculations);

  // Discount preset buttons in modal
  document.querySelectorAll('.disc-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const disc = btn.getAttribute('data-disc');
      if (itemDiscInput) {
        itemDiscInput.value = disc;
        updateModalLiveCalculations();
      }
    });
  });

  // Quick Suggestion Chips in Modal
  document.querySelectorAll('.item-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      if (itemNameInput) itemNameInput.value = btn.getAttribute('data-name');
      const catEl = document.getElementById('item-category');
      if (catEl) catEl.value = btn.getAttribute('data-cat');
      const unitEl = document.getElementById('item-unit');
      if (unitEl) unitEl.value = btn.getAttribute('data-unit');
      if (itemPriceInput) itemPriceInput.value = btn.getAttribute('data-price');
      updateModalLiveCalculations();
    });
  });

  // 11. Submit Custom Form Item (Add to Cart / Edit Cart Item)
  const itemForm = document.getElementById('item-form');
  if (itemForm) {
    itemForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = (document.getElementById('edit-item-id')?.value || '').trim();
      const name = document.getElementById('item-name').value.trim();
      const category = document.getElementById('item-category').value;
      const unit = document.getElementById('item-unit').value;
      const price = parseFloat(document.getElementById('item-price').value) || 0;
      const discountStr = document.getElementById('item-discount').value.trim();
      const qty = parseInt(document.getElementById('item-qty').value) || 1;

      if (!name || price <= 0) {
        showToast(AppState.lang === 'en' ? 'Please enter a valid product name and price!' : 'Harap masukkan nama produk dan harga yang valid!', 'danger');
        return;
      }

      const discCalc = calculateDiscount(price, discountStr);
      const subtotal = discCalc.finalUnitPrice * qty;

      if (editId) {
        // Mode Edit: Update existing item in cart
        const idx = AppState.cart.findIndex(i => i.id === editId);
        if (idx !== -1) {
          AppState.cart[idx] = {
            ...AppState.cart[idx],
            name: name,
            category: category,
            unit: unit,
            qty: qty,
            originalPrice: price,
            discountString: discCalc.discountString,
            finalUnitPrice: discCalc.finalUnitPrice,
            subtotal: subtotal
          };
          saveCartToStorage();
          renderCartItems();
          updateComparatorBadges();
          closeAddModal();
          showToast(`"${name}" ${AppState.lang === 'en' ? 'updated.' : 'berhasil diperbarui.'}`);
          return;
        }
      }

      // Mode Add: Insert new item to front of cart
      const newItem = {
        id: 'item_' + Date.now(),
        name: name,
        category: category,
        unit: unit,
        qty: qty,
        originalPrice: price,
        discountString: discCalc.discountString,
        finalUnitPrice: discCalc.finalUnitPrice,
        subtotal: subtotal
      };

      AppState.cart.unshift(newItem);
      saveCartToStorage();
      renderCartItems();
      updateComparatorBadges();
      closeAddModal();

      showToast(`"${name}" ${AppState.lang === 'en' ? 'added to cart.' : 'dimasukkan ke troli belanja.'}`);
    });
  }

  // 12. Grocery Card Actions (Edit, Increment, Decrement, Delete)
  const cartList = document.getElementById('grocery-items-list');
  if (cartList) {
    cartList.addEventListener('click', (e) => {
      const btn = e.target.closest('button');

      // Allow tapping card-item-info to edit
      if (!btn) {
        const itemInfo = e.target.closest('.card-item-info');
        if (itemInfo) {
          const card = itemInfo.closest('.grocery-card');
          if (card) {
            const cardId = card.getAttribute('data-id');
            if (cardId && typeof openEditModal === 'function') {
              openEditModal(cardId);
            }
          }
        }
        return;
      }

      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (!id || !action) return;

      const item = AppState.cart.find(i => i.id === id);
      if (!item) return;

      if (action === 'edit') {
        if (typeof openEditModal === 'function') {
          openEditModal(id);
        }
      } else if (action === 'increment') {
        item.qty += 1;
        item.subtotal = item.qty * item.finalUnitPrice;
        saveCartToStorage();
        renderCartItems();
        updateComparatorBadges();
      } else if (action === 'decrement') {
        if (item.qty > 1) {
          item.qty -= 1;
          item.subtotal = item.qty * item.finalUnitPrice;
          saveCartToStorage();
          renderCartItems();
          updateComparatorBadges();
        } else {
          // Confirm delete if qty reaches 0
          const confirmMsg = AppState.lang === 'en' ? `Remove "${item.name}" from cart?` : `Hapus "${item.name}" dari troli?`;
          if (confirm(confirmMsg)) {
            AppState.cart = AppState.cart.filter(i => i.id !== id);
            saveCartToStorage();
            renderCartItems();
            updateComparatorBadges();
            showToast(`"${item.name}" ${AppState.lang === 'en' ? 'removed from cart.' : 'dihapus dari troli.'}`);
          }
        }
      } else if (action === 'delete') {
        AppState.cart = AppState.cart.filter(i => i.id !== id);
        saveCartToStorage();
        renderCartItems();
        updateComparatorBadges();
        showToast(`"${item.name}" ${AppState.lang === 'en' ? 'deleted.' : 'dihapus.'}`);
      }
    });
  }

  // 13. Clear Cart Button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) return;
      const confirmMsg = AppState.lang === 'en' ? 'Empty all items from your cart?' : 'Kosongkan semua barang dari keranjang belanja?';
      if (confirm(confirmMsg)) {
        AppState.cart = [];
        saveCartToStorage();
        renderCartItems();
        updateComparatorBadges();
        showToast(AppState.lang === 'en' ? 'Cart emptied.' : 'Keranjang troli dikosongkan.');
      }
    });
  }

  // 14. Checkout Button (Prompts login if not signed in)
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckoutRequest);
  }

  // Offline Checkout Fallback Button in Auth Modal
  const saveOfflineBtn = document.getElementById('btn-save-offline-anyway');
  if (saveOfflineBtn) {
    saveOfflineBtn.addEventListener('click', () => {
      closeAuthModal();
      AppState.pendingCheckout = false;
      performCheckoutTransaction();
    });
  }

  // 15. History Card Click -> Detail Modal
  const historyListContainer = document.getElementById('history-list-container');
  if (historyListContainer) {
    historyListContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.history-card');
      if (card) {
        const id = card.getAttribute('data-id');
        openHistoryDetail(id);
      }
    });
  }

  // Close History Detail Modal
  const closeHistoryBtn = document.getElementById('close-history-detail-btn');
  const closeHistoryBackdrop = document.getElementById('close-history-modal-backdrop');
  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
      document.getElementById('history-detail-modal').classList.add('hidden');
    });
  }
  if (closeHistoryBackdrop) {
    closeHistoryBackdrop.addEventListener('click', () => {
      document.getElementById('history-detail-modal').classList.add('hidden');
    });
  }

  // 16. Budget Cap Settings & Preset Chips
  const saveBudgetBtn = document.getElementById('save-budget-btn');
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
      const val = parseFloat(budgetInput.value);
      if (val && val >= 10000) {
        AppState.budgetCap = val;
        saveBudgetCapToStorage();
        updateBudgetSafetyUI();
        showToast(`${AppState.lang === 'en' ? 'Budget limit set to' : 'Batas dompet berhasil disetel ke'} ${formatRupiah(val)}.`);
      } else {
        showToast(AppState.lang === 'en' ? 'Enter minimum budget of Rp 10.000' : 'Masukkan nominal anggaran minimal Rp 10.000', 'danger');
      }
    });
  }

  document.querySelectorAll('.budget-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = Number(chip.getAttribute('data-amount'));
      if (budgetInput) budgetInput.value = amt;
      AppState.budgetCap = amt;
      saveBudgetCapToStorage();
      updateBudgetSafetyUI();
      showToast(`${AppState.lang === 'en' ? 'Budget limit set:' : 'Batas dompet disetel:'} ${formatRupiah(amt)}`);
    });
  });

  // 17. Danger Actions: Reset Data
  const resetHistoryBtn = document.getElementById('reset-history-only-btn');
  const resetAllBtn = document.getElementById('reset-all-data-btn');

  if (resetHistoryBtn) {
    resetHistoryBtn.addEventListener('click', () => {
      const confirmMsg = AppState.lang === 'en'
        ? 'Delete all shopping history records?'
        : 'Yakin ingin menghapus seluruh riwayat belanja? Pembanding harga bulan lalu akan direset.';
      if (confirm(confirmMsg)) {
        AppState.history = [];
        saveHistoryToStorage();
        renderHistoryTab();
        renderCartItems();
        updateComparatorBadges();
        showToast(AppState.lang === 'en' ? 'All shopping history deleted.' : 'Semua riwayat belanja dihapus.');
      }
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      const confirmMsg = AppState.lang === 'en'
        ? 'TOTAL RESET: Clear cart, history, and reset budget cap to default?'
        : 'RESET TOTAL: Hapus keranjang, riwayat, dan kembalikan setelan anggaran ke default?';
      if (confirm(confirmMsg)) {
        localStorage.clear();
        AppState.budgetCap = 500000;
        AppState.cart = [];
        AppState.history = [];
        if (budgetInput) budgetInput.value = 500000;
        renderCartItems();
        renderHistoryTab();
        updateComparatorBadges();
        showToast(AppState.lang === 'en' ? 'All app data reset.' : 'Seluruh data aplikasi direset.');
      }
    });
  }

  // 18. Export Data JSON
  const exportBtn = document.getElementById('export-history-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const exportData = {
        budgetCap: AppState.budgetCap,
        cart: AppState.cart,
        history: AppState.history,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-grocery-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(AppState.lang === 'en' ? 'Shopping data downloaded as JSON.' : 'Data belanja berhasil diunduh sebagai JSON.');
    });
  }

  // 19. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 20. Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch(err => {
          console.log('[PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 21. PWA Install Prompt Handler (Add to Home Screen)
  const installBadge = document.getElementById('pwa-install-badge');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    AppState.deferredInstallPrompt = e;
    if (installBadge) installBadge.classList.remove('hidden');
  });

  if (installBadge) {
    installBadge.addEventListener('click', async () => {
      if (AppState.deferredInstallPrompt) {
        AppState.deferredInstallPrompt.prompt();
        const { outcome } = await AppState.deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast(AppState.lang === 'en' ? 'App installed successfully!' : 'Aplikasi berhasil dipasang!');
        }
        AppState.deferredInstallPrompt = null;
        installBadge.classList.add('hidden');
      } else {
        showToast(AppState.lang === 'en' ? 'To install: Open browser menu and select "Add to Home screen".' : 'Untuk memasang PWA: Buka menu browser lalu pilih "Tambahkan ke Layar Utama".');
      }
    });
  }

  // 22. Firebase Authentication & Cloud Sync Triggers
  const authHeaderBtn = document.getElementById('auth-btn-header');
  const closeAuthBtn = document.getElementById('close-auth-modal-btn');
  const closeAuthBackdrop = document.getElementById('close-auth-backdrop');

  if (authHeaderBtn) authHeaderBtn.addEventListener('click', () => {
    AppState.pendingCheckout = false;
    const checkoutPrompt = document.getElementById('checkout-auth-prompt');
    const offlineBtn = document.getElementById('btn-save-offline-anyway');
    if (checkoutPrompt) checkoutPrompt.classList.add('hidden');
    if (offlineBtn) offlineBtn.classList.add('hidden');
    openAuthModal();
  });
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);
  if (closeAuthBackdrop) closeAuthBackdrop.addEventListener('click', closeAuthModal);

  // Login with Google Buttons
  const loginGoogleTabBtn = document.getElementById('btn-login-google-tab');
  const loginGoogleModalBtn = document.getElementById('btn-login-google-modal');

  if (loginGoogleTabBtn) loginGoogleTabBtn.addEventListener('click', loginWithGoogle);
  if (loginGoogleModalBtn) loginGoogleModalBtn.addEventListener('click', loginWithGoogle);

  // Logout Buttons
  const logoutTabBtn = document.getElementById('btn-logout-tab');
  const logoutModalBtn = document.getElementById('modal-btn-logout');

  if (logoutTabBtn) logoutTabBtn.addEventListener('click', logoutFirebase);
  if (logoutModalBtn) logoutModalBtn.addEventListener('click', logoutFirebase);

  // Cloud Sync Buttons
  const syncTabBtn = document.getElementById('btn-sync-now-tab');
  const syncModalBtn = document.getElementById('modal-btn-sync');

  if (syncTabBtn) syncTabBtn.addEventListener('click', () => syncStateToFirestore(true));
  if (syncModalBtn) syncModalBtn.addEventListener('click', () => syncStateToFirestore(true));

  // 23. Theme & Appearance Controls
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      if (typeof toggleThemeMode === 'function') toggleThemeMode();
    });
  }

  const pillModeDark = document.getElementById('pill-mode-dark');
  const pillModeLight = document.getElementById('pill-mode-light');

  if (pillModeDark) {
    pillModeDark.addEventListener('click', () => {
      if (typeof setThemeMode === 'function') setThemeMode('dark');
    });
  }

  if (pillModeLight) {
    pillModeLight.addEventListener('click', () => {
      if (typeof setThemeMode === 'function') setThemeMode('light');
    });
  }

  const themeSwatchesGrid = document.getElementById('theme-swatches-grid');
  if (themeSwatchesGrid) {
    themeSwatchesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-swatch-card');
      if (!card) return;
      const theme = card.getAttribute('data-theme');
      if (theme && typeof setTheme === 'function') {
        setTheme(theme);
      }
    });
  }

  // 24. Checkout Success Modal Event Listeners
  const closeCheckoutSuccessBtn = document.getElementById('close-checkout-success-btn');
  const closeCheckoutSuccessBackdrop = document.getElementById('close-checkout-success-backdrop');
  const btnCloseCheckoutSuccess = document.getElementById('btn-close-checkout-success');
  const btnViewHistoryAfterCheckout = document.getElementById('btn-view-history-after-checkout');
  const replayCartAnimationBtn = document.getElementById('replay-cart-animation-btn');

  if (closeCheckoutSuccessBtn) {
    closeCheckoutSuccessBtn.addEventListener('click', closeCheckoutSuccessModal);
  }
  if (closeCheckoutSuccessBackdrop) {
    closeCheckoutSuccessBackdrop.addEventListener('click', closeCheckoutSuccessModal);
  }
  if (btnCloseCheckoutSuccess) {
    btnCloseCheckoutSuccess.addEventListener('click', closeCheckoutSuccessModal);
  }
  if (btnViewHistoryAfterCheckout) {
    btnViewHistoryAfterCheckout.addEventListener('click', () => {
      closeCheckoutSuccessModal();
      const navRiwayat = document.getElementById('nav-tab-riwayat');
      if (navRiwayat) navRiwayat.click();
    });
  }
  if (replayCartAnimationBtn) {
    replayCartAnimationBtn.addEventListener('click', () => {
      if (typeof triggerCartPushAnimation === 'function') {
        triggerCartPushAnimation();
      }
    });
  }

  // 25. Initialize Analytics Tab Events
  if (typeof initAnalyticsEvents === 'function') {
    initAnalyticsEvents();
  }

  // 26. Options Drawer (Slides smoothly from Left toward Right)
  const headerMenuBtn = document.getElementById('header-menu-btn');
  const drawerOverlay = document.getElementById('header-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerBackdrop = document.getElementById('header-drawer-backdrop');

  function openDrawer() {
    if (!drawerOverlay) return;
    drawerOverlay.classList.remove('hidden');
    // Force browser reflow to ensure smooth sliding transition
    void drawerOverlay.offsetWidth;
    drawerOverlay.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }

  function closeDrawer() {
    if (!drawerOverlay) return;
    drawerOverlay.classList.remove('active');
    setTimeout(() => {
      if (!drawerOverlay.classList.contains('active')) {
        drawerOverlay.classList.add('hidden');
      }
    }, 350);
  }

  if (headerMenuBtn) headerMenuBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // Drawer Navigation Links (Quick Tab Switching)
  const drawerNavLinks = document.querySelectorAll('.drawer-nav-link');
  drawerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.getAttribute('data-tab');
      if (targetTab) {
        const tabBtn = document.getElementById(`nav-${targetTab}`);
        if (tabBtn) {
          tabBtn.click();
        }
      }
      closeDrawer();
    });
  });

  // 27. Initialize History Edit Modal Events
  if (typeof initHistoryEditEvents === 'function') {
    initHistoryEditEvents();
  }
});


