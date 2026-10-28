/**
 * Shopping History & Checkout Transaction Controller
 * Smart Grocery & Budget Safety Tracker
 */

function saveHistoryToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, AppState.lastLocalUpdate.toString());
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(AppState.history));
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
  }
}

function saveBudgetCapToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, AppState.lastLocalUpdate.toString());
  localStorage.setItem(STORAGE_KEYS.BUDGET_CAP, AppState.budgetCap.toString());
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
  }
}

/**
 * Save user custom locations to localStorage and Firestore
 */
function saveLocationsToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, AppState.lastLocalUpdate.toString());
  localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(AppState.locations || []));
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
  }
}

/**
 * Get all available locations: default options merged with user's custom locations
 */
function getAllLocations() {
  const custom = Array.isArray(AppState.locations) ? AppState.locations : [];
  const defaults = Array.isArray(DEFAULT_LOCATIONS) ? DEFAULT_LOCATIONS : [];
  return [...new Set([...defaults, ...custom])];
}

/**
 * Add a new custom location to the options
 */
function addCustomLocation(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  if (!trimmed) return '';

  if (!AppState.locations) AppState.locations = [];
  if (!AppState.locations.includes(trimmed)) {
    AppState.locations.push(trimmed);
    saveLocationsToStorage(true);
    populateAllLocationSelects();
    renderSettingsLocationsList();
    showToast(AppState.lang === 'en' ? `Location "${trimmed}" added!` : `Lokasi "${trimmed}" berhasil ditambahkan!`, 'success');
  }
  return trimmed;
}

/**
 * Remove a custom location
 */
function removeCustomLocation(name) {
  if (!AppState.locations) return;
  AppState.locations = AppState.locations.filter(l => l !== name);
  saveLocationsToStorage(true);
  populateAllLocationSelects();
  renderSettingsLocationsList();
  showToast(AppState.lang === 'en' ? 'Location removed.' : 'Lokasi berhasil dihapus.', 'info');
}

/**
 * Populate a single <select> element with grouped location options
 */
function populateLocationSelect(selectEl, selectedValue = '') {
  if (!selectEl) return;
  const customList = Array.isArray(AppState.locations) ? AppState.locations : [];
  const defaultList = Array.isArray(DEFAULT_LOCATIONS) ? DEFAULT_LOCATIONS : [];

  let html = '';
  // Default Group
  html += `<optgroup label="${AppState.lang === 'en' ? 'Popular Supermarkets' : 'Pilihan Populer Supermarket'}">`;
  defaultList.forEach(loc => {
    html += `<option value="${escapeHtml(loc)}" ${loc === selectedValue ? 'selected' : ''}>${escapeHtml(loc)}</option>`;
  });
  html += `</optgroup>`;

  // Custom Group
  if (customList.length > 0) {
    html += `<optgroup label="${AppState.lang === 'en' ? 'Your Custom Locations' : 'Lokasi Kustom Anda'}">`;
    customList.forEach(loc => {
      html += `<option value="${escapeHtml(loc)}" ${loc === selectedValue ? 'selected' : ''}>${escapeHtml(loc)}</option>`;
    });
    html += `</optgroup>`;
  }

  // Add Custom Option
  html += `<option value="__custom__">➕ ${AppState.lang === 'en' ? 'Add New Location...' : 'Tambah Lokasi Baru...'}</option>`;

  selectEl.innerHTML = html;

  if (selectedValue && !defaultList.includes(selectedValue) && !customList.includes(selectedValue)) {
    const opt = document.createElement('option');
    opt.value = selectedValue;
    opt.textContent = selectedValue;
    opt.selected = true;
    selectEl.insertBefore(opt, selectEl.firstChild);
  }
}

/**
 * Populate both checkout and edit location selects
 */
function populateAllLocationSelects() {
  const checkoutSelect = document.getElementById('checkout-location-select');
  if (checkoutSelect) {
    const currVal = checkoutSelect.value;
    populateLocationSelect(checkoutSelect, currVal);
  }

  const editSelect = document.getElementById('edit-history-location-select');
  if (editSelect) {
    const currVal = editSelect.value;
    populateLocationSelect(editSelect, currVal);
  }
}

/**
 * Render the Locations Management Chip list in Tab 4 (Settings)
 */
function renderSettingsLocationsList() {
  const container = document.getElementById('settings-locations-chips');
  if (!container) return;

  const defaultList = Array.isArray(DEFAULT_LOCATIONS) ? DEFAULT_LOCATIONS : [];
  const customList = Array.isArray(AppState.locations) ? AppState.locations : [];

  let html = '';
  // Custom locations first with delete button
  customList.forEach(loc => {
    html += `
      <div class="location-chip is-custom">
        <i data-lucide="map-pin"></i>
        <span>${escapeHtml(loc)}</span>
        <button type="button" class="location-chip-remove" data-location="${escapeHtml(loc)}" title="Hapus lokasi kustom ini" aria-label="Hapus lokasi">
          <i data-lucide="x"></i>
        </button>
      </div>
    `;
  });

  // Default locations
  defaultList.forEach(loc => {
    html += `
      <div class="location-chip">
        <i data-lucide="map-pin"></i>
        <span>${escapeHtml(loc)}</span>
      </div>
    `;
  });

  container.innerHTML = html;

  // Add click listeners to remove custom locations
  container.querySelectorAll('.location-chip-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const loc = btn.getAttribute('data-location');
      const confirmMsg = AppState.lang === 'en'
        ? `Remove custom location "${loc}"?`
        : `Hapus lokasi kustom "${loc}"?`;
      if (confirm(confirmMsg)) {
        removeCustomLocation(loc);
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

/**
 * Wire Settings Tab Add Location Input & Button
 */
function initSettingsLocationsEvents() {
  const addBtn = document.getElementById('btn-add-location-settings');
  const inputEl = document.getElementById('input-new-location-settings');

  if (addBtn && inputEl) {
    addBtn.addEventListener('click', () => {
      const val = inputEl.value.trim();
      if (!val) {
        showToast(AppState.lang === 'en' ? 'Please enter a location name' : 'Masukkan nama lokasi', 'warning');
        return;
      }
      addCustomLocation(val);
      inputEl.value = '';
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
      }
    });
  }
}

/**
 * Merge local history with cloud history, avoiding duplicate IDs
 * and ensuring deleted records are never resurrected.
 */
function mergeHistories(localHist, remoteHist) {
  const map = new Map();
  const deletedSet = new Set(AppState.deletedHistoryIds || []);

  if (Array.isArray(remoteHist)) {
    remoteHist.forEach(item => {
      if (item && item.id && !deletedSet.has(item.id)) map.set(item.id, item);
    });
  }
  if (Array.isArray(localHist)) {
    localHist.forEach(item => {
      if (item && item.id && !deletedSet.has(item.id)) map.set(item.id, item);
    });
  }
  return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * F-06: Render History List Tab
 */
function renderHistoryTab() {
  const container = document.getElementById('history-list-container');
  const emptyState = document.getElementById('history-empty-state');

  if (!container || !emptyState) return;

  if (AppState.history.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    updateComparatorBadges();
    return;
  }

  emptyState.classList.add('hidden');
  const locale = AppState.lang === 'en' ? 'en-US' : 'id-ID';

  container.innerHTML = AppState.history.map(trx => {
    const isOver = trx.totalSpend > trx.budgetCap;
    const dateFormatted = new Date(trx.timestamp).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const locationName = trx.location || (AppState.lang === 'en' ? 'General Store' : 'Lokasi Umum');

    const statusLabel = isOver
      ? (AppState.lang === 'en' ? 'Over Budget' : 'Over Budget')
      : (AppState.lang === 'en' ? 'Safe Budget' : 'Dompet Aman');

    return `
      <div class="history-card" data-id="${trx.id}">
        <div class="history-card-header">
          <span class="history-month-tag">${escapeHtml(trx.monthName || (AppState.lang === 'en' ? 'Shopping Trip' : 'Belanja'))}</span>
          <span class="history-status-tag ${isOver ? 'danger' : 'safe'}">
            ${statusLabel}
          </span>
        </div>

        <div class="history-card-meta">
          <span class="history-location-tag" title="Lokasi Belanja: ${escapeHtml(locationName)}">
            <i data-lucide="map-pin"></i>
            <span class="history-location-text">${escapeHtml(locationName)}</span>
          </span>
          <span class="history-date-subtext">
            <i data-lucide="calendar"></i>
            <span>${dateFormatted}</span>
          </span>
        </div>

        <div class="history-card-body">
          <span class="history-total-val">${formatRupiah(trx.totalSpend)}</span>
          <span class="history-items-count">${(trx.items || []).length} item</span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }

  updateComparatorBadges();
}

/**
 * Open History Detail Modal
 */
function openHistoryDetail(trxId) {
  const trx = AppState.history.find(h => h.id === trxId);
  if (!trx) return;

  const modal = document.getElementById('history-detail-modal');
  const title = document.getElementById('history-modal-title');
  const dateEl = document.getElementById('history-modal-date');
  const totalEl = document.getElementById('history-modal-total');
  const budgetEl = document.getElementById('history-modal-budget');
  const statusEl = document.getElementById('history-modal-status');
  const itemsContainer = document.getElementById('history-modal-items');
  const deleteBtn = document.getElementById('delete-this-history-btn');

  const locale = AppState.lang === 'en' ? 'en-US' : 'id-ID';
  const formattedDateTime = new Date(trx.timestamp).toLocaleString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedDateOnly = new Date(trx.timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  title.textContent = trx.monthName || (AppState.lang === 'en' ? 'Shopping Detail' : 'Detail Belanja');
  dateEl.textContent = `${AppState.lang === 'en' ? 'Recorded at:' : 'Dicatat pada:'} ${formattedDateTime}`;
  totalEl.textContent = formatRupiah(trx.totalSpend);
  budgetEl.textContent = formatRupiah(trx.budgetCap);

  const locValEl = document.getElementById('history-modal-location-val');
  const dateValEl = document.getElementById('history-modal-date-val');
  if (locValEl) locValEl.textContent = trx.location || (AppState.lang === 'en' ? 'General Store' : 'Lokasi Umum');
  if (dateValEl) dateValEl.textContent = formattedDateOnly;

  const isOver = trx.totalSpend > trx.budgetCap;
  statusEl.textContent = isOver ? 'Over Budget' : (AppState.lang === 'en' ? 'Safe' : 'Aman');
  statusEl.className = `badge ${isOver ? 'history-status-tag danger' : 'history-status-tag safe'}`;

  itemsContainer.innerHTML = (trx.items || []).map(item => `
    <div class="history-detail-item-row">
      <div class="item-left">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-sub">${item.qty} ${item.unit} × ${formatRupiah(item.finalUnitPrice || item.price)}</span>
      </div>
      <span class="item-price">${formatRupiah(item.subtotal || (item.qty * (item.finalUnitPrice || item.price)))}</span>
    </div>
  `).join('');

  // Edit transaction handler
  const editBtn = document.getElementById('edit-this-history-btn');
  if (editBtn) {
    editBtn.onclick = () => {
      openHistoryEditModal(trxId);
    };
  }

  // Delete transaction handler
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      const confirmMsg = AppState.lang === 'en'
        ? `Delete shopping record "${trx.monthName}"?`
        : `Hapus catatan riwayat "${trx.monthName}"?`;
      if (confirm(confirmMsg)) {
        if (!AppState.deletedHistoryIds.includes(trxId)) {
          AppState.deletedHistoryIds.push(trxId);
          localStorage.setItem(STORAGE_KEYS.DELETED_HISTORY, JSON.stringify(AppState.deletedHistoryIds));
        }
        AppState.history = AppState.history.filter(h => h.id !== trxId);
        saveHistoryToStorage();
        if (currentUser && typeof syncStateToFirestore === 'function') {
          syncStateToFirestore(false);
        }
        modal.classList.add('hidden');
        renderHistoryTab();
        renderCartItems();
        if (typeof renderAnalyticsTab === 'function') renderAnalyticsTab();
        showToast(AppState.lang === 'en' ? 'History record deleted.' : 'Catatan riwayat berhasil dihapus.');
      }
    };
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

/**
 * Open Checkout Modal allowing user to select Date and Location
 */
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast(AppState.lang === 'en' ? 'Cart is empty!' : 'Troli belanja masih kosong!', 'danger');
    return;
  }

  const modal = document.getElementById('checkout-modal');
  if (!modal) {
    // Fallback if modal not present in DOM
    confirmCheckoutTransaction();
    return;
  }

  const totalSpend = AppState.cart.reduce((s, i) => s + i.subtotal, 0);
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const localDatetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Default Trip Title
  const defaultTitle = AppState.lang === 'en'
    ? `Shopping ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : `Belanja ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  const titleInput = document.getElementById('checkout-trip-title');
  const dateInput = document.getElementById('checkout-trip-date');
  const totalDisplay = document.getElementById('checkout-modal-total-display');
  const itemsCount = document.getElementById('checkout-modal-items-count');
  const statusBadge = document.getElementById('checkout-modal-status-badge');
  const locationSelect = document.getElementById('checkout-location-select');
  const customBox = document.getElementById('checkout-custom-location-box');
  const customInput = document.getElementById('checkout-custom-location-input');

  if (titleInput) titleInput.value = defaultTitle;
  if (dateInput) dateInput.value = localDatetime;
  if (totalDisplay) totalDisplay.textContent = formatRupiah(totalSpend);
  if (itemsCount) {
    itemsCount.textContent = `${AppState.cart.length} ${AppState.lang === 'en' ? 'items in cart' : 'barang di troli'}`;
  }

  const isOver = totalSpend > AppState.budgetCap;
  if (statusBadge) {
    statusBadge.textContent = isOver
      ? (AppState.lang === 'en' ? 'Over Budget' : 'Over Budget')
      : (AppState.lang === 'en' ? 'Safe Budget' : 'Dompet Aman');
    statusBadge.className = `badge ${isOver ? 'danger' : 'safe'}`;
  }

  if (customBox) customBox.classList.add('hidden');
  if (customInput) customInput.value = '';

  if (locationSelect) {
    populateLocationSelect(locationSelect, DEFAULT_LOCATIONS[0]);
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    if (titleInput) titleInput.select();
  }, 100);
}

/**
 * Close Checkout Modal
 */
function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Confirm and save checkout transaction to history & Firebase
 */
function confirmCheckoutTransaction() {
  if (AppState.cart.length === 0) {
    showToast(AppState.lang === 'en' ? 'Cart is empty!' : 'Troli masih kosong!', 'danger');
    closeCheckoutModal();
    return;
  }

  const titleInput = document.getElementById('checkout-trip-title');
  const dateInput = document.getElementById('checkout-trip-date');
  const locationSelect = document.getElementById('checkout-location-select');
  const customBox = document.getElementById('checkout-custom-location-box');
  const customInput = document.getElementById('checkout-custom-location-input');

  const now = new Date();
  const defaultMonthName = AppState.lang === 'en'
    ? `Shopping ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : `Belanja ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  const finalTitle = (titleInput && titleInput.value.trim()) || defaultMonthName;

  // 1. Transaction Date & Timestamp (Picked by user)
  let finalTimestamp = Date.now();
  if (dateInput && dateInput.value) {
    const parsed = new Date(dateInput.value).getTime();
    if (!isNaN(parsed)) finalTimestamp = parsed;
  }
  const locale = AppState.lang === 'en' ? 'en-US' : 'id-ID';
  const finalFormattedDate = new Date(finalTimestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // 2. Transaction Location (Picked or customized by user)
  let finalLocation = 'Lotte Mart Grocery - Puri Indah';
  if (customBox && !customBox.classList.contains('hidden') && customInput && customInput.value.trim()) {
    finalLocation = addCustomLocation(customInput.value.trim());
  } else if (locationSelect) {
    if (locationSelect.value === '__custom__') {
      if (customInput && customInput.value.trim()) {
        finalLocation = addCustomLocation(customInput.value.trim());
      } else {
        const prompted = prompt(AppState.lang === 'en' ? 'Enter new store location:' : 'Masukkan nama lokasi supermarket baru:', 'Lotte Mart Grocery - Puri Indah');
        if (prompted && prompted.trim()) {
          finalLocation = addCustomLocation(prompted.trim());
        }
      }
    } else {
      finalLocation = locationSelect.value || finalLocation;
    }
  }

  const totalSpend = AppState.cart.reduce((s, i) => s + i.subtotal, 0);

  const newHistoryRecord = {
    id: 'trx_' + Date.now(),
    monthName: finalTitle,
    timestamp: finalTimestamp,
    date: finalFormattedDate,
    location: finalLocation,
    budgetCap: AppState.budgetCap,
    totalSpend: totalSpend,
    items: [...AppState.cart]
  };

  // Add to history and sort chronologically (newest first)
  AppState.history.unshift(newHistoryRecord);
  AppState.history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Empty active cart
  AppState.cart = [];

  // Save to storage
  saveHistoryToStorage();
  saveCartToStorage();

  // Save to Cloud Firestore
  if (currentUser && typeof syncStateToFirestore === 'function') {
    syncStateToFirestore(false);
  }

  // Update UI views
  renderCartItems();
  renderHistoryTab();
  updateComparatorBadges();
  if (typeof renderAnalyticsTab === 'function') renderAnalyticsTab();

  closeCheckoutModal();

  showToast(AppState.lang === 'en'
    ? 'Shopping trip saved to history and comparator!'
    : 'Belanja selesai & tersimpan ke riwayat pembanding!');

  // Trigger Checkout Success Popup Modal with Cart SVG Animation & Sound Effect
  if (typeof openCheckoutSuccessModal === 'function') {
    openCheckoutSuccessModal(newHistoryRecord);
  } else {
    const navRiwayat = document.getElementById('nav-tab-riwayat');
    if (navRiwayat) navRiwayat.click();
  }
}

/**
 * Wrapper for checkout execution
 */
function performCheckoutTransaction() {
  openCheckoutModal();
}

/**
 * Handle checkout button click: prompt user to login to save to cloud,
 * or allow saving offline directly.
 */
function handleCheckoutRequest() {
  if (AppState.cart.length === 0) {
    showToast(AppState.lang === 'en' ? 'Cart is empty!' : 'Troli belanja masih kosong!', 'danger');
    return;
  }

  if (!currentUser) {
    // Prompt user to login with Google to save to cloud
    AppState.pendingCheckout = true;
    const checkoutPrompt = document.getElementById('checkout-auth-prompt');
    const offlineBtn = document.getElementById('btn-save-offline-anyway');

    if (checkoutPrompt) checkoutPrompt.classList.remove('hidden');
    if (offlineBtn) offlineBtn.classList.remove('hidden');

    if (typeof openAuthModal === 'function') {
      openAuthModal();
    }
  } else {
    // User already authenticated: open checkout modal directly
    openCheckoutModal();
  }
}

/**
 * Initialize Checkout Modal Event Listeners
 */
function initCheckoutModalEvents() {
  const closeBtn = document.getElementById('close-checkout-modal-btn');
  const backdrop = document.getElementById('close-checkout-modal-backdrop');
  const cancelBtn = document.getElementById('btn-cancel-checkout');
  const confirmBtn = document.getElementById('btn-confirm-checkout');
  const toggleCustomBtn = document.getElementById('btn-toggle-custom-location-checkout');
  const saveCustomBtn = document.getElementById('btn-save-custom-location-checkout');
  const customBox = document.getElementById('checkout-custom-location-box');
  const customInput = document.getElementById('checkout-custom-location-input');
  const locationSelect = document.getElementById('checkout-location-select');

  if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);
  if (backdrop) backdrop.addEventListener('click', closeCheckoutModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCheckoutModal);
  if (confirmBtn) confirmBtn.addEventListener('click', confirmCheckoutTransaction);

  if (toggleCustomBtn && customBox) {
    toggleCustomBtn.addEventListener('click', () => {
      customBox.classList.toggle('hidden');
      if (!customBox.classList.contains('hidden') && customInput) {
        customInput.focus();
      }
    });
  }

  if (locationSelect && customBox) {
    locationSelect.addEventListener('change', () => {
      if (locationSelect.value === '__custom__') {
        customBox.classList.remove('hidden');
        if (customInput) customInput.focus();
      } else {
        customBox.classList.add('hidden');
      }
    });
  }

  if (saveCustomBtn && customInput) {
    saveCustomBtn.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (!val) {
        showToast(AppState.lang === 'en' ? 'Please enter a location name' : 'Masukkan nama lokasi', 'warning');
        return;
      }
      addCustomLocation(val);
      if (locationSelect) {
        populateLocationSelect(locationSelect, val);
      }
      if (customBox) customBox.classList.add('hidden');
      customInput.value = '';
    });
  }
}

// ====================================================================
// HISTORY FULL EDITING CONTROLLER (Edit date, budget, name, items)
// ====================================================================

let currentEditingTrx = null;
let editingItems = [];

/**
 * Open History Full Edit Modal
 */
function openHistoryEditModal(trxId) {
  const trx = AppState.history.find(h => h.id === trxId);
  if (!trx) return;

  currentEditingTrx = trx;
  editingItems = JSON.parse(JSON.stringify(trx.items || []));

  const modal = document.getElementById('history-edit-modal');
  const idEl = document.getElementById('edit-history-id');
  const nameEl = document.getElementById('edit-history-name');
  const dateEl = document.getElementById('edit-history-date');
  const budgetEl = document.getElementById('edit-history-budget');

  if (idEl) idEl.value = trx.id;
  if (nameEl) nameEl.value = trx.monthName || '';
  if (budgetEl) budgetEl.value = trx.budgetCap || 500000;

  if (dateEl) {
    const d = new Date(trx.timestamp || Date.now());
    const pad = n => String(n).padStart(2, '0');
    dateEl.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const locationSelect = document.getElementById('edit-history-location-select');
  const customBox = document.getElementById('edit-custom-location-box');
  const customInput = document.getElementById('edit-custom-location-input');

  if (locationSelect) {
    populateLocationSelect(locationSelect, trx.location || DEFAULT_LOCATIONS[0]);
  }
  if (customBox) customBox.classList.add('hidden');
  if (customInput) customInput.value = '';

  renderHistoryEditItems();
  updateHistoryEditSummary();

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

/**
 * Close History Full Edit Modal
 */
function closeHistoryEditModal() {
  const modal = document.getElementById('history-edit-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Render Itemized Editable Rows in History Edit Modal
 */
function renderHistoryEditItems() {
  const container = document.getElementById('edit-history-items-container');
  if (!container) return;

  const categories = ['Bahan Pokok', 'Makanan Instan', 'Camilan', 'Bumbu & Masak', 'Perlengkapan Mandi', 'Perlengkapan Cuci', 'Minuman', 'Lainnya'];
  const units = ['pcs', 'pack', 'kg', 'liter', 'botol', 'kaleng', 'dus', 'sachet'];

  container.innerHTML = editingItems.map((item, idx) => {
    const subtotal = item.subtotal || (item.qty * (item.finalUnitPrice || item.originalPrice || 0));
    const saving = ((item.originalPrice || 0) - (item.finalUnitPrice || 0)) * item.qty;

    return `
      <div class="history-edit-item-row" data-idx="${idx}">
        <div class="edit-item-top-row">
          <input type="text" class="form-input edit-item-name-input" value="${escapeHtml(item.name || '')}" placeholder="Nama Barang" onchange="updateHistoryItemField(${idx}, 'name', this.value)">
          <button type="button" class="edit-item-delete-btn" onclick="deleteHistoryEditItem(${idx})" title="Hapus Barang">
            <i data-lucide="trash-2"></i>
          </button>
        </div>

        <div class="edit-item-fields-grid">
          <div>
            <label class="form-label text-xs">Kategori</label>
            <select class="form-select" onchange="updateHistoryItemField(${idx}, 'category', this.value)">
              ${categories.map(cat => `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Jumlah</label>
            <input type="number" class="form-input" min="1" value="${item.qty || 1}" onchange="updateHistoryItemField(${idx}, 'qty', this.value)">
          </div>

          <div>
            <label class="form-label text-xs">Satuan</label>
            <select class="form-select" onchange="updateHistoryItemField(${idx}, 'unit', this.value)">
              ${units.map(u => `<option value="${u}" ${item.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Harga Satuan Asli (Rp)</label>
            <input type="number" class="form-input" min="0" step="500" value="${item.originalPrice || 0}" onchange="updateHistoryItemField(${idx}, 'originalPrice', this.value)">
          </div>

          <div style="grid-column: span 2;">
            <label class="form-label text-xs">Diskon (cth: 50+20 atau 20%)</label>
            <input type="text" class="form-input" value="${escapeHtml(item.discountString || '')}" placeholder="Kosongkan jika tanpa diskon" onchange="updateHistoryItemField(${idx}, 'discountString', this.value)">
          </div>
        </div>

        <div class="edit-item-subtotal-bar">
          <span>Subtotal: <strong id="edit-item-subtotal-${idx}">${formatRupiah(subtotal)}</strong></span>
          ${saving > 0 ? `<span class="badge-emerald-subtle">Hemat ${formatRupiah(saving)}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/**
 * Update Individual Field of Item in History Edit Modal
 */
function updateHistoryItemField(idx, field, value) {
  if (!editingItems[idx]) return;

  if (field === 'qty') {
    editingItems[idx].qty = Math.max(1, parseInt(value, 10) || 1);
  } else if (field === 'originalPrice') {
    editingItems[idx].originalPrice = Math.max(0, parseInt(value, 10) || 0);
  } else if (field === 'discountString') {
    editingItems[idx].discountString = value.trim();
  } else {
    editingItems[idx][field] = value;
  }

  // Recalculate discount & subtotal for this item
  const orig = editingItems[idx].originalPrice || 0;
  const discStr = editingItems[idx].discountString || '';
  const calc = calculateDiscount(orig, discStr);

  editingItems[idx].finalUnitPrice = calc.finalUnitPrice;
  editingItems[idx].subtotal = calc.finalUnitPrice * editingItems[idx].qty;

  renderHistoryEditItems();
  updateHistoryEditSummary();
}

/**
 * Delete Item from History Edit
 */
function deleteHistoryEditItem(idx) {
  if (editingItems.length <= 1) {
    showToast(AppState.lang === 'en' ? 'Transaction must contain at least 1 item' : 'Transaksi harus memiliki minimal 1 barang', 'warning');
    return;
  }
  editingItems.splice(idx, 1);
  renderHistoryEditItems();
  updateHistoryEditSummary();
}

/**
 * Add New Item to History Edit
 */
function addHistoryEditItem() {
  editingItems.push({
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: AppState.lang === 'en' ? 'New Item' : 'Barang Baru',
    category: 'Bahan Pokok',
    qty: 1,
    unit: 'pcs',
    originalPrice: 10000,
    discountString: '',
    finalUnitPrice: 10000,
    subtotal: 10000
  });
  renderHistoryEditItems();
  updateHistoryEditSummary();
}

/**
 * Update Live Calculation Summary Card in History Edit Modal
 */
function updateHistoryEditSummary() {
  const totalEl = document.getElementById('edit-history-calc-total');
  const savingsEl = document.getElementById('edit-history-calc-savings');
  const statusEl = document.getElementById('edit-history-calc-status');
  const budgetInput = document.getElementById('edit-history-budget');

  const budget = budgetInput ? parseInt(budgetInput.value, 10) || 500000 : 500000;

  const total = editingItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const totalSavings = editingItems.reduce((acc, it) => {
    const s = ((it.originalPrice || 0) - (it.finalUnitPrice || 0)) * (it.qty || 1);
    return acc + (s > 0 ? s : 0);
  }, 0);

  if (totalEl) totalEl.textContent = formatRupiah(total);
  if (savingsEl) savingsEl.textContent = formatRupiah(totalSavings);

  if (statusEl) {
    const isOver = total > budget;
    statusEl.textContent = isOver
      ? (AppState.lang === 'en' ? `Over (+${formatRupiah(total - budget)})` : `Over (+${formatRupiah(total - budget)})`)
      : (AppState.lang === 'en' ? 'Safe Budget' : 'Dompet Aman');
    statusEl.className = isOver ? 'badge danger' : 'badge safe';
  }
}

/**
 * Save History Edit Changes
 */
function saveHistoryEdit() {
  if (!currentEditingTrx) return;

  const nameInput = document.getElementById('edit-history-name');
  const dateInput = document.getElementById('edit-history-date');
  const budgetInput = document.getElementById('edit-history-budget');
  const locationSelect = document.getElementById('edit-history-location-select');
  const customBox = document.getElementById('edit-custom-location-box');
  const customInput = document.getElementById('edit-custom-location-input');

  const updatedName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : currentEditingTrx.monthName;
  const updatedBudget = budgetInput ? Math.max(0, parseInt(budgetInput.value, 10) || 0) : currentEditingTrx.budgetCap;

  let updatedTimestamp = currentEditingTrx.timestamp;
  if (dateInput && dateInput.value) {
    const parsedDate = new Date(dateInput.value).getTime();
    if (!isNaN(parsedDate)) updatedTimestamp = parsedDate;
  }

  let updatedLocation = currentEditingTrx.location || DEFAULT_LOCATIONS[0];
  if (customBox && !customBox.classList.contains('hidden') && customInput && customInput.value.trim()) {
    updatedLocation = addCustomLocation(customInput.value.trim());
  } else if (locationSelect) {
    if (locationSelect.value === '__custom__') {
      if (customInput && customInput.value.trim()) {
        updatedLocation = addCustomLocation(customInput.value.trim());
      }
    } else {
      updatedLocation = locationSelect.value || updatedLocation;
    }
  }

  const locale = AppState.lang === 'en' ? 'en-US' : 'id-ID';
  const updatedDate = new Date(updatedTimestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const updatedTotal = editingItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);

  // Apply changes to existing record
  currentEditingTrx.monthName = updatedName;
  currentEditingTrx.timestamp = updatedTimestamp;
  currentEditingTrx.date = updatedDate;
  currentEditingTrx.location = updatedLocation;
  currentEditingTrx.budgetCap = updatedBudget;
  currentEditingTrx.items = editingItems;
  currentEditingTrx.totalSpend = updatedTotal;

  // Re-sort history chronologically
  AppState.history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Persist to storage
  saveHistoryToStorage();

  // Silently sync to Firestore in background
  if (currentUser && typeof syncStateToFirestore === 'function') {
    syncStateToFirestore(false);
  }

  // Refresh UI
  renderHistoryTab();
  updateComparatorBadges();
  if (typeof renderAnalyticsTab === 'function') {
    renderAnalyticsTab();
  }

  // Update open detail modal
  openHistoryDetail(currentEditingTrx.id);

  closeHistoryEditModal();
  showToast(AppState.lang === 'en' ? 'Shopping record updated!' : 'Catatan riwayat belanja berhasil diperbarui!', 'success');
}

/**
 * Initialize Event Listeners for History Edit
 */
function initHistoryEditEvents() {
  const closeBtn = document.getElementById('close-history-edit-btn');
  const cancelBtn = document.getElementById('btn-cancel-history-edit');
  const backdrop = document.getElementById('close-history-edit-backdrop');
  const addBtn = document.getElementById('btn-add-item-history-edit');
  const saveBtn = document.getElementById('btn-save-history-edit');
  const budgetInput = document.getElementById('edit-history-budget');
  const toggleCustomBtn = document.getElementById('btn-toggle-custom-location-edit');
  const saveCustomBtn = document.getElementById('btn-save-custom-location-edit');
  const customBox = document.getElementById('edit-custom-location-box');
  const customInput = document.getElementById('edit-custom-location-input');
  const locationSelect = document.getElementById('edit-history-location-select');

  if (closeBtn) closeBtn.addEventListener('click', closeHistoryEditModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeHistoryEditModal);
  if (backdrop) backdrop.addEventListener('click', closeHistoryEditModal);
  if (addBtn) addBtn.addEventListener('click', addHistoryEditItem);
  if (saveBtn) saveBtn.addEventListener('click', saveHistoryEdit);
  if (budgetInput) budgetInput.addEventListener('input', updateHistoryEditSummary);

  if (toggleCustomBtn && customBox) {
    toggleCustomBtn.addEventListener('click', () => {
      customBox.classList.toggle('hidden');
      if (!customBox.classList.contains('hidden') && customInput) {
        customInput.focus();
      }
    });
  }

  if (locationSelect && customBox) {
    locationSelect.addEventListener('change', () => {
      if (locationSelect.value === '__custom__') {
        customBox.classList.remove('hidden');
        if (customInput) customInput.focus();
      } else {
        customBox.classList.add('hidden');
      }
    });
  }

  if (saveCustomBtn && customInput) {
    saveCustomBtn.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (!val) {
        showToast(AppState.lang === 'en' ? 'Please enter a location name' : 'Masukkan nama lokasi', 'warning');
        return;
      }
      addCustomLocation(val);
      if (locationSelect) {
        populateLocationSelect(locationSelect, val);
      }
      if (customBox) customBox.classList.add('hidden');
      customInput.value = '';
    });
  }
}

