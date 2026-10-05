/**
 * Internationalization (I18N) Dictionary & Language Switching
 * Bilingual Support: Bahasa Indonesia (ID) & English (EN)
 */

const I18N = {
  id: {
    langCode: 'EN', // Indicator shows what clicking toggles TO
    brandSubtitle: 'Budget Safety Tracker Rantau',
    budgetCapLabel: 'Batas Dompet',
    cartTotalLabel: 'Total Keranjang',
    budgetSafe: 'Dompet Aman',
    budgetWarning: 'Waspada Limit',
    budgetOver: 'OVER BUDGET!',
    remainingSafe: 'Sisa Saldo:',
    remainingOver: 'Melebihi Limit:',
    shelfBtn: 'Katalog Rak',
    clearCart: 'Reset',
    addItemBtn: 'Tambah Item ke Troli',
    emptyCartTitle: 'Troli Masih Kosong',
    emptyCartDesc: 'Mulai berhemat dengan mencatat barang belanjaan atau pilih langsung dari produk rak supermarket retail!',
    emptyAddBtn: 'Catat Manual',
    emptyShelfBtn: 'Pilih dari Rak Supermarket',
    footerTotal: 'Total Belanja:',
    finishShopping: 'Selesaikan Belanja',
    historySectionTitle: 'Riwayat & Perbandingan',
    historySectionSubtitle: 'Perbandingan pengeluaran belanja bulanan otomatis',
    compCardTitle: 'Perbandingan Pengeluaran',
    compPeriodLabel: 'Tren Belanja vs Bulan Lalu',
    compCurrentLabel: 'Belanja Sekarang',
    compPastLabel: 'Bulan Lalu',
    compVsLastMonth: 'vs Bulan Lalu',
    compSpendingUp: 'Pengeluaran Naik',
    compSpendingDown: 'Pengeluaran Hemat',
    compSpendingEqual: 'Sama Stabil',
    compSummaryNoData: 'Belum ada riwayat belanja bulan sebelumnya sebagai acuan komparasi.',
    compSummaryUp: (diff, pct) => `Pengeluaran naik <strong>+${diff} (+${pct}%)</strong> dibanding bulan lalu. Waspada pembengkakan jatah!`,
    compSummaryDown: (diff, pct) => `Hebat! Berhasil hemat <strong>-${diff} (-${pct}%)</strong> dibanding pengeluaran bulan lalu.`,
    compSummaryEqual: 'Total pengeluaran stabil persis sama dengan belanja sebelumnya.',
    emptyHistoryTitle: 'Belum Ada Riwayat Belanja',
    emptyHistoryDesc: 'Selesaikan belanja pertama Anda di tab Belanja untuk mulai melihat riwayat transaksi dan perbandingan pengeluaran antar bulan.',
    shelfModalTitle: 'Katalog Rak Supermarket',
    shelfModalSubtitle: 'Harga retail Indomaret, Alfamart, Hypermart & Super Indo',
    shelfSearchPlaceholder: 'Cari produk rak (cth: Minyak, Beras, Telur)...',
    catAll: 'Semua',
    catStaples: 'Bahan Pokok',
    catInstant: 'Mie & Makanan',
    catDrinks: 'Minuman & Susu',
    catBath: 'Mandi & Rawat',
    catClean: 'Cuci & Rumah',
    catSnacks: 'Camilan',
    tabBelanja: 'Troli Belanja',
    tabRiwayat: 'Riwayat',
    tabAnggaran: 'Anggaran & Akun',
    authTitle: 'Akun & Sinkronisasi Cloud',
    authSubtitle: 'Tersambung ke Firebase Firestore (shop-tracked)',
    authPromoTitle: 'Simpan Aman di Cloud',
    authPromoDesc: 'Login dengan Gmail agar seluruh daftar troli belanja, batas anggaran, dan riwayat perbandingan harga selalu aman tersimpan di Google Cloud Firestore.',
    checkoutPromptTitle: 'Simpan Riwayat ke Cloud',
    checkoutPromptDesc: 'Masuk dengan Gmail agar riwayat belanja ini otomatis tersimpan di Cloud Firebase Anda.',
    googleLoginModal: 'Masuk dengan Google (Gmail)',
    saveOffline: 'Simpan di Perangkat Saja (Offline)',
    syncNow: 'Sinkronkan Data Sekarang',
    logout: 'Keluar dari Akun',
    budgetSettingsTitle: 'Akun & Pengaturan Anggaran',
    budgetSettingsSubtitle: 'Sinkronisasi cloud Firebase & kendali dompet belanja',
    budgetSafetyCardTitle: 'Batas Anggaran Bulanan',
    budgetSafetyCardDesc: 'Batas maksimal uang saku atau belanja bulanan',
    saveBudgetBtn: 'Simpan Setelan Anggaran',
    emptyCartToast: 'Troli belanja masih kosong!',
    promptLoginToast: 'Silakan masuk dengan Gmail untuk menyimpan riwayat belanja ke cloud.',
    savedOfflineToast: 'Belanja tersimpan di perangkat ini (offline).',
    checkoutSavedCloudToast: 'Belanja tersimpan & otomatis disinkronkan ke Cloud Firestore!',
    deleteHistoryConfirm: (title) => `Hapus catatan riwayat "${title}"?`,
    deleteHistorySuccess: 'Catatan riwayat berhasil dihapus.',
    checkoutSuccessTitle: 'Belanja Berhasil Disimpan!',
    checkoutSuccessSub: 'Keranjang belanja telah dipindahkan ke riwayat',
    checkoutSuccessPill: 'Transaksi Selesai',
    checkoutSuccessViewHist: 'Lihat Riwayat Belanja',
    checkoutSuccessClose: 'Selesai & Tutup',
    themeSettingsTitle: 'Tema & Tampilan Aplikasi',
    themeSettingsSubtitle: '5 palet warna dengan varian Mode Gelap & Mode Terang',
    modeSelectorLabel: 'Pilih Mode Tampilan',
    modeDarkText: 'Mode Gelap',
    modeLightText: 'Mode Terang',
    paletteSelectorLabel: 'Pilih Palet Warna'
  },
  en: {
    langCode: 'ID', // Clicking toggles back to Indonesian
    brandSubtitle: 'Smart Student Budget Tracker',
    budgetCapLabel: 'Budget Limit',
    cartTotalLabel: 'Cart Total',
    budgetSafe: 'Safe Budget',
    budgetWarning: 'Approaching Limit',
    budgetOver: 'OVER BUDGET!',
    remainingSafe: 'Remaining:',
    remainingOver: 'Over Limit By:',
    shelfBtn: 'Shelf Catalog',
    clearCart: 'Reset',
    addItemBtn: 'Add Item to Cart',
    emptyCartTitle: 'Your Cart is Empty',
    emptyCartDesc: 'Start tracking grocery items manually or pick directly from Indonesian retail supermarket shelves!',
    emptyAddBtn: 'Add Manually',
    emptyShelfBtn: 'Pick from Supermarket Shelves',
    footerTotal: 'Cart Total:',
    finishShopping: 'Finish Shopping',
    historySectionTitle: 'History & Comparisons',
    historySectionSubtitle: 'Automatic month-over-month grocery spending comparisons',
    compCardTitle: 'Spending Comparison',
    compPeriodLabel: 'Spending Trend vs Last Month',
    compCurrentLabel: 'Current Spend',
    compPastLabel: 'Last Month',
    compVsLastMonth: 'vs Last Month',
    compSpendingUp: 'Spending Up',
    compSpendingDown: 'Spending Down',
    compSpendingEqual: 'Spending Equal',
    compSummaryNoData: 'No previous shopping history available yet for spending comparison.',
    compSummaryUp: (diff, pct) => `Spending increased by <strong>+${diff} (+${pct}%)</strong> compared to last month. Watch your pocket!`,
    compSummaryDown: (diff, pct) => `Great job! You saved <strong>-${diff} (-${pct}%)</strong> compared to your previous trip.`,
    compSummaryEqual: 'Total spending is exactly the same as your previous trip.',
    emptyHistoryTitle: 'No Shopping History Yet',
    emptyHistoryDesc: 'Complete your first shopping trip in the Cart tab to start viewing history records and monthly spending comparisons.',
    shelfModalTitle: 'Supermarket Shelf Catalog',
    shelfModalSubtitle: 'Retail shelf prices from Indomaret, Alfamart & Super Indo',
    shelfSearchPlaceholder: 'Search shelf items (e.g., Oil, Rice, Eggs)...',
    catAll: 'All',
    catStaples: 'Staples',
    catInstant: 'Noodles & Food',
    catDrinks: 'Drinks & Milk',
    catBath: 'Bath & Care',
    catClean: 'Laundry & Home',
    catSnacks: 'Snacks',
    tabBelanja: 'Grocery Cart',
    tabRiwayat: 'History',
    tabAnggaran: 'Budget & Account',
    authTitle: 'Account & Cloud Sync',
    authSubtitle: 'Connected to Firebase Firestore (shop-tracked)',
    authPromoTitle: 'Secure Cloud Storage',
    authPromoDesc: 'Sign in with Gmail so your grocery cart, budget limits, and price comparison history are always safely backed up to Google Cloud Firestore.',
    checkoutPromptTitle: 'Save History to Cloud',
    checkoutPromptDesc: 'Sign in with Gmail so this shopping receipt is automatically saved to your Firebase Cloud database.',
    googleLoginModal: 'Sign in with Google (Gmail)',
    saveOffline: 'Save Locally Only (Offline)',
    syncNow: 'Sync Data Now',
    logout: 'Sign Out',
    budgetSettingsTitle: 'Account & Budget Settings',
    budgetSettingsSubtitle: 'Firebase cloud sync & monthly budget cap',
    budgetSafetyCardTitle: 'Safety Budget Cap',
    budgetSafetyCardDesc: 'Maximum spending limit for this trip',
    saveBudgetBtn: 'Save Budget Limit',
    emptyCartToast: 'Your shopping cart is empty!',
    promptLoginToast: 'Please sign in with Google to save your shopping history to the cloud.',
    savedOfflineToast: 'Shopping trip saved to this device (offline).',
    checkoutSavedCloudToast: 'Shopping receipt successfully saved to Cloud Firestore!',
    deleteHistoryConfirm: (title) => `Delete shopping record "${title}"?`,
    deleteHistorySuccess: 'Shopping record deleted successfully.',
    checkoutSuccessTitle: 'Purchase Completed & Saved!',
    checkoutSuccessSub: 'Grocery cart has been saved to your history',
    checkoutSuccessPill: 'Trip Completed',
    checkoutSuccessViewHist: 'View in History',
    checkoutSuccessClose: 'Finish & Close',
    themeSettingsTitle: 'App Theme & Appearance',
    themeSettingsSubtitle: '5 color palettes with Dark & Light mode variants',
    modeSelectorLabel: 'Select Display Mode',
    modeDarkText: 'Dark Mode',
    modeLightText: 'Light Mode',
    paletteSelectorLabel: 'Select Color Palette'
  }
};

/**
 * Apply current language translation to DOM elements
 */
function applyLanguage(lang) {
  if (!I18N[lang]) lang = 'id';
  AppState.lang = lang;
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
  const t = I18N[lang];

  // Update header indicator (shows toggle target)
  const langIndicator = document.getElementById('lang-indicator');
  if (langIndicator) langIndicator.textContent = t.langCode;

  // Header labels
  const brandSub = document.querySelector('.brand-subtitle');
  if (brandSub) brandSub.textContent = t.brandSubtitle;

  const headerBudgetCapLabel = document.getElementById('header-budget-cap-label');
  if (headerBudgetCapLabel) headerBudgetCapLabel.textContent = t.budgetCapLabel;

  const headerCartTotalLabel = document.getElementById('header-cart-total-label');
  if (headerCartTotalLabel) headerCartTotalLabel.textContent = t.cartTotalLabel;

  // Toolbar & Buttons
  const labelShelfBtn = document.getElementById('label-shelf-btn');
  if (labelShelfBtn) labelShelfBtn.textContent = t.shelfBtn;

  const labelClearCart = document.getElementById('label-clear-cart');
  if (labelClearCart) labelClearCart.textContent = t.clearCart;

  const labelAddItemBtn = document.getElementById('label-add-item-btn');
  if (labelAddItemBtn) labelAddItemBtn.textContent = t.addItemBtn;

  // Empty cart
  const emptyCartTitle = document.getElementById('empty-cart-title');
  if (emptyCartTitle) emptyCartTitle.textContent = t.emptyCartTitle;

  const emptyCartDesc = document.getElementById('empty-cart-desc');
  if (emptyCartDesc) emptyCartDesc.textContent = t.emptyCartDesc;

  const labelEmptyAdd = document.getElementById('label-empty-add');
  if (labelEmptyAdd) labelEmptyAdd.textContent = t.emptyAddBtn;

  const labelEmptyShelf = document.getElementById('label-empty-shelf');
  if (labelEmptyShelf) labelEmptyShelf.textContent = t.emptyShelfBtn;

  // Footer Checkout
  const labelFooterTotal = document.getElementById('label-footer-total');
  if (labelFooterTotal) labelFooterTotal.textContent = t.footerTotal;

  const labelCheckoutBtn = document.getElementById('label-checkout-btn');
  if (labelCheckoutBtn) labelCheckoutBtn.textContent = t.finishShopping;

  // History Tab
  const histSectionTitle = document.getElementById('history-section-title');
  if (histSectionTitle) histSectionTitle.textContent = t.historySectionTitle;

  const histSectionSubtitle = document.getElementById('history-section-subtitle');
  if (histSectionSubtitle) histSectionSubtitle.textContent = t.historySectionSubtitle;

  const compCardTitle = document.getElementById('comp-card-title');
  if (compCardTitle) compCardTitle.textContent = t.compCardTitle;

  const compPeriodLabel = document.getElementById('comp-period-label');
  if (compPeriodLabel) compPeriodLabel.textContent = t.compPeriodLabel;

  const compCurrentLabel = document.getElementById('comp-current-label');
  if (compCurrentLabel) compCurrentLabel.textContent = t.compCurrentLabel;

  const compPastLabel = document.getElementById('comp-past-label');
  if (compPastLabel) compPastLabel.textContent = t.compPastLabel;

  const emptyHistTitle = document.getElementById('empty-history-title');
  if (emptyHistTitle) emptyHistTitle.textContent = t.emptyHistoryTitle;

  const emptyHistDesc = document.getElementById('empty-history-desc');
  if (emptyHistDesc) emptyHistDesc.textContent = t.emptyHistoryDesc;

  // Shelf Modal
  const shelfModalTitle = document.getElementById('shelf-modal-title');
  if (shelfModalTitle) shelfModalTitle.textContent = t.shelfModalTitle;

  const shelfModalSubtitle = document.getElementById('shelf-modal-subtitle');
  if (shelfModalSubtitle) shelfModalSubtitle.textContent = t.shelfModalSubtitle;

  const shelfSearchInput = document.getElementById('shelf-search-input');
  if (shelfSearchInput) shelfSearchInput.placeholder = t.shelfSearchPlaceholder;

  // Shelf Categories
  const catAll = document.getElementById('cat-all');
  if (catAll) catAll.textContent = t.catAll;
  const catStaples = document.getElementById('cat-staples');
  if (catStaples) catStaples.textContent = t.catStaples;
  const catInstant = document.getElementById('cat-instant');
  if (catInstant) catInstant.textContent = t.catInstant;
  const catDrinks = document.getElementById('cat-drinks');
  if (catDrinks) catDrinks.textContent = t.catDrinks;
  const catBath = document.getElementById('cat-bath');
  if (catBath) catBath.textContent = t.catBath;
  const catClean = document.getElementById('cat-clean');
  if (catClean) catClean.textContent = t.catClean;
  const catSnacks = document.getElementById('cat-snacks');
  if (catSnacks) catSnacks.textContent = t.catSnacks;

  // Auth Modal
  const authModalTitle = document.getElementById('auth-modal-title');
  if (authModalTitle) authModalTitle.textContent = t.authTitle;

  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  if (authModalSubtitle) authModalSubtitle.textContent = t.authSubtitle;

  const checkoutPromptTitle = document.getElementById('checkout-prompt-title');
  if (checkoutPromptTitle) checkoutPromptTitle.textContent = t.checkoutPromptTitle;

  const checkoutPromptDesc = document.getElementById('checkout-prompt-desc');
  if (checkoutPromptDesc) checkoutPromptDesc.textContent = t.checkoutPromptDesc;

  const authPromoTitle = document.getElementById('auth-promo-title');
  if (authPromoTitle) authPromoTitle.textContent = t.authPromoTitle;

  const authPromoDesc = document.getElementById('auth-promo-desc');
  if (authPromoDesc) authPromoDesc.textContent = t.authPromoDesc;

  const labelGoogleLogin = document.getElementById('label-google-login-modal');
  if (labelGoogleLogin) labelGoogleLogin.textContent = t.googleLoginModal;

  const labelSaveOffline = document.getElementById('label-save-offline');
  if (labelSaveOffline) labelSaveOffline.textContent = t.saveOffline;

  const labelModalSync = document.getElementById('label-modal-sync-btn');
  if (labelModalSync) labelModalSync.textContent = t.syncNow;

  const labelModalLogout = document.getElementById('label-modal-logout-btn');
  if (labelModalLogout) labelModalLogout.textContent = t.logout;

  // Bottom Navigation
  const navBelanjaLabel = document.querySelector('#nav-tab-belanja .nav-label');
  if (navBelanjaLabel) navBelanjaLabel.textContent = t.tabBelanja;
  const navRiwayatLabel = document.querySelector('#nav-tab-riwayat .nav-label');
  if (navRiwayatLabel) navRiwayatLabel.textContent = t.tabRiwayat;
  const navAnggaranLabel = document.querySelector('#nav-tab-anggaran .nav-label');
  if (navAnggaranLabel) navAnggaranLabel.textContent = t.tabAnggaran;

  // Checkout Success Modal
  const checkoutSuccessHeading = document.getElementById('checkout-success-heading');
  if (checkoutSuccessHeading) checkoutSuccessHeading.textContent = t.checkoutSuccessTitle;
  const checkoutSuccessSub = document.getElementById('checkout-success-sub');
  if (checkoutSuccessSub) checkoutSuccessSub.textContent = t.checkoutSuccessSub;
  const checkoutSuccessPillText = document.getElementById('checkout-success-pill-text');
  if (checkoutSuccessPillText) checkoutSuccessPillText.textContent = t.checkoutSuccessPill;
  const labelViewHistCheckout = document.getElementById('label-view-history-checkout');
  if (labelViewHistCheckout) labelViewHistCheckout.textContent = t.checkoutSuccessViewHist;
  const labelCloseCheckout = document.getElementById('label-close-checkout-success');
  if (labelCloseCheckout) labelCloseCheckout.textContent = t.checkoutSuccessClose;

  // Theme & Appearance Card
  const themeCardTitle = document.getElementById('theme-card-title');
  if (themeCardTitle) themeCardTitle.textContent = t.themeSettingsTitle;
  const themeCardSubtitle = document.getElementById('theme-card-subtitle');
  if (themeCardSubtitle) themeCardSubtitle.textContent = t.themeSettingsSubtitle;
  const labelModeSelector = document.getElementById('label-mode-selector');
  if (labelModeSelector) labelModeSelector.textContent = t.modeSelectorLabel;
  const labelModeDarkText = document.getElementById('label-mode-dark-text');
  if (labelModeDarkText) labelModeDarkText.textContent = t.modeDarkText;
  const labelModeLightText = document.getElementById('label-mode-light-text');
  if (labelModeLightText) labelModeLightText.textContent = t.modeLightText;
  const labelPaletteSelector = document.getElementById('label-palette-selector');
  if (labelPaletteSelector) labelPaletteSelector.textContent = t.paletteSelectorLabel;

  // Refresh dynamic UI views
  if (typeof updateBudgetSafetyUI === 'function') updateBudgetSafetyUI();
  if (typeof updateComparatorBadges === 'function') updateComparatorBadges();
  if (typeof renderHistoryTab === 'function') renderHistoryTab();
  if (window.lucide) lucide.createIcons();
}

/**
 * Toggle between Indonesian and English
 */
function toggleLanguage() {
  const nextLang = AppState.lang === 'id' ? 'en' : 'id';
  applyLanguage(nextLang);
  if (typeof showToast === 'function') {
    showToast(nextLang === 'en' ? 'Language switched to English' : 'Bahasa dialihkan ke Bahasa Indonesia', 'info');
  }
}
