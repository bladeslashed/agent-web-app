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

  // If user is authenticated, immediately save to Firestore cloud
  if (currentUser && typeof syncStateToFirestore === 'function') {
    syncStateToFirestore(true);
  }

  // Update UI views
  renderCartItems();
  renderHistoryTab();
  updateComparatorBadges();

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
