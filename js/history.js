/**
 * Shopping History & Checkout Transaction Controller
 * Smart Grocery & Budget Safety Tracker
 */

function saveHistoryToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(AppState.history));
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
  }
}

function saveBudgetCapToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.BUDGET_CAP, AppState.budgetCap.toString());
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
  }
}

/**
 * Merge local history with cloud history, avoiding duplicate IDs
 * and ensuring history created before login is preserved and uploaded to cloud.
 */
function mergeHistories(localHist, remoteHist) {
  const map = new Map();
  if (Array.isArray(remoteHist)) {
    remoteHist.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
  }
  if (Array.isArray(localHist)) {
    localHist.forEach(item => {
      if (item && item.id) map.set(item.id, item);
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

        <div class="history-card-body">
          <span class="history-total-val">${formatRupiah(trx.totalSpend)}</span>
          <span class="history-items-count">${(trx.items || []).length} item • ${dateFormatted}</span>
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
  title.textContent = trx.monthName || (AppState.lang === 'en' ? 'Shopping Detail' : 'Detail Belanja');
  dateEl.textContent = `${AppState.lang === 'en' ? 'Recorded at:' : 'Dicatat pada:'} ${new Date(trx.timestamp).toLocaleString(locale)}`;
  totalEl.textContent = formatRupiah(trx.totalSpend);
  budgetEl.textContent = formatRupiah(trx.budgetCap);

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
        AppState.history = AppState.history.filter(h => h.id !== trxId);
        saveHistoryToStorage();
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
 * Execute checkout transaction, saving to local history and cloud
 */
function performCheckoutTransaction() {
  if (AppState.cart.length === 0) {
    showToast(AppState.lang === 'en' ? 'Cart is empty!' : 'Troli masih kosong!', 'danger');
    return;
  }

  const totalSpend = AppState.cart.reduce((s, i) => s + i.subtotal, 0);
  const now = new Date();
  const defaultMonthName = AppState.lang === 'en'
    ? `Shopping ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : `Belanja ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  const promptMsg = AppState.lang === 'en'
    ? 'Enter a title or note for this shopping trip:'
    : 'Beri nama riwayat transaksi ini:';

  const customTitle = prompt(promptMsg, defaultMonthName);
  if (customTitle === null) return; // user cancelled

  const newHistoryRecord = {
    id: 'trx_' + Date.now(),
    monthName: customTitle.trim() || defaultMonthName,
    timestamp: Date.now(),
    budgetCap: AppState.budgetCap,
    totalSpend: totalSpend,
    items: [...AppState.cart]
  };

  // Add to front of history
  AppState.history.unshift(newHistoryRecord);

  // Empty active cart
  AppState.cart = [];

  // Save locally
  saveHistoryToStorage();
  saveCartToStorage();

  // If user is authenticated, save to Firestore cloud silently in background (no sync toast)
  if (currentUser && typeof syncStateToFirestore === 'function') {
    syncStateToFirestore(false);
  }

  // Update UI views
  renderCartItems();
  renderHistoryTab();
  updateComparatorBadges();
  if (typeof renderAnalyticsTab === 'function') renderAnalyticsTab();

  showToast(AppState.lang === 'en'
    ? 'Shopping trip saved to history and comparator!'
    : 'Belanja selesai & tersimpan ke riwayat pembanding!');

  // Trigger Checkout Success Popup Modal with Cart SVG Animation & Sound Effect
  if (typeof openCheckoutSuccessModal === 'function') {
    openCheckoutSuccessModal(newHistoryRecord);
  } else {
    // Fallback: switch directly to history tab
    const navRiwayat = document.getElementById('nav-tab-riwayat');
    if (navRiwayat) navRiwayat.click();
  }
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
    // User already authenticated: execute checkout directly
    performCheckoutTransaction();
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

  const updatedName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : currentEditingTrx.monthName;
  const updatedBudget = budgetInput ? Math.max(0, parseInt(budgetInput.value, 10) || 0) : currentEditingTrx.budgetCap;

  let updatedTimestamp = currentEditingTrx.timestamp;
  if (dateInput && dateInput.value) {
    const parsedDate = new Date(dateInput.value).getTime();
    if (!isNaN(parsedDate)) updatedTimestamp = parsedDate;
  }

  const updatedTotal = editingItems.reduce((acc, it) => acc + (it.subtotal || 0), 0);

  // Apply changes to existing record
  currentEditingTrx.monthName = updatedName;
  currentEditingTrx.timestamp = updatedTimestamp;
  currentEditingTrx.budgetCap = updatedBudget;
  currentEditingTrx.items = editingItems;
  currentEditingTrx.totalSpend = updatedTotal;

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

  if (closeBtn) closeBtn.addEventListener('click', closeHistoryEditModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeHistoryEditModal);
  if (backdrop) backdrop.addEventListener('click', closeHistoryEditModal);
  if (addBtn) addBtn.addEventListener('click', addHistoryEditItem);
  if (saveBtn) saveBtn.addEventListener('click', saveHistoryEdit);
  if (budgetInput) budgetInput.addEventListener('input', updateHistoryEditSummary);
}

