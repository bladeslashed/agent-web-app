/**
 * Smart Grocery & Budget Safety Tracker
 * Mobile PWA for Supermarket Shoppers & Students
 */

// ==========================================
// STATE MANAGEMENT & STORAGE KEYS
// ==========================================
const STORAGE_KEYS = {
  CART: 'smart_grocery_cart',
  BUDGET_CAP: 'smart_grocery_budget_cap',
  HISTORY: 'smart_grocery_history',
  BASELINE_ID: 'smart_grocery_baseline_id'
};

// Application State
const AppState = {
  budgetCap: 500000,
  cart: [],
  history: [],
  activeBaselineId: null,
  activeTab: 'tab-belanja',
  deferredInstallPrompt: null
};

// ==========================================
// HELPER FUNCTIONS & FORMATTERS
// ==========================================

/**
 * Format number to Indonesian Rupiah (e.g. Rp 35.000)
 */
function formatRupiah(amount) {
  const num = Math.round(Number(amount) || 0);
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Clean string for matching
 */
function normalizeName(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * F-03: Multi-tier Discount Calculator
 * Formula: final = original * (1 - d1/100) * (1 - d2/100) * ...
 * Supports formats: "25", "25%", "50+20", "50% + 20%", "30+10+5"
 */
function calculateDiscount(originalPrice, discountString) {
  const price = Math.max(0, Number(originalPrice) || 0);
  if (!discountString || !discountString.trim()) {
    return {
      originalPrice: price,
      discountString: '',
      discountPercentTotal: 0,
      discountAmount: 0,
      finalUnitPrice: price
    };
  }

  // Extract all numeric discount tiers
  const tiers = discountString
    .replace(/%/g, '')
    .split('+')
    .map(t => parseFloat(t.trim()))
    .filter(t => !isNaN(t) && t > 0);

  if (tiers.length === 0) {
    return {
      originalPrice: price,
      discountString: '',
      discountPercentTotal: 0,
      discountAmount: 0,
      finalUnitPrice: price
    };
  }

  let finalPrice = price;
  for (const rate of tiers) {
    const cappedRate = Math.min(100, Math.max(0, rate));
    finalPrice = finalPrice * (1 - cappedRate / 100);
  }

  const discountAmount = price - finalPrice;
  const effectivePercentage = price > 0 ? (discountAmount / price) * 100 : 0;

  return {
    originalPrice: price,
    discountString: tiers.join('+') + '%',
    discountPercentTotal: effectivePercentage,
    discountAmount: Math.round(discountAmount),
    finalUnitPrice: Math.round(finalPrice)
  };
}

/**
 * Show temporary toast message
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('app-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('hidden');

  if (navigator.vibrate) {
    navigator.vibrate(type === 'danger' ? [80, 50, 80] : 40);
  }

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

// ==========================================
// STORAGE PERSISTENCE
// ==========================================

function loadStateFromStorage() {
  try {
    const savedCap = localStorage.getItem(STORAGE_KEYS.BUDGET_CAP);
    if (savedCap) AppState.budgetCap = Number(savedCap);

    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) AppState.cart = JSON.parse(savedCart);

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) AppState.history = JSON.parse(savedHistory);

    const savedBaseline = localStorage.getItem(STORAGE_KEYS.BASELINE_ID);
    if (savedBaseline) AppState.activeBaselineId = savedBaseline;
  } catch (e) {
    console.error('Error loading data from localStorage', e);
  }
}

function saveCartToStorage() {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(AppState.cart));
}

function saveHistoryToStorage() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(AppState.history));
  if (AppState.activeBaselineId) {
    localStorage.setItem(STORAGE_KEYS.BASELINE_ID, AppState.activeBaselineId);
  }
}

function saveBudgetCapToStorage() {
  localStorage.setItem(STORAGE_KEYS.BUDGET_CAP, AppState.budgetCap.toString());
}

// ==========================================
// F-04: REAL-TIME PRICE COMPARATOR VS LAST MONTH
// ==========================================

/**
 * Find baseline transaction (last month or user chosen)
 */
function getBaselineTransaction() {
  if (!AppState.history || AppState.history.length === 0) return null;
  if (AppState.activeBaselineId) {
    const found = AppState.history.find(h => h.id === AppState.activeBaselineId);
    if (found) return found;
  }
  // Default: most recent history transaction
  return AppState.history[0];
}

/**
 * Compare current item price vs baseline month price
 */
function comparePriceWithLastMonth(itemName, currentUnitPrice) {
  const baseline = getBaselineTransaction();
  if (!baseline || !baseline.items) return null;

  const targetName = normalizeName(itemName);
  if (!targetName) return null;

  // Search exact or close match in baseline items
  const match = baseline.items.find(item => {
    const baselineName = normalizeName(item.name);
    return baselineName === targetName || baselineName.includes(targetName) || targetName.includes(baselineName);
  });

  if (!match) return null;

  const oldPrice = match.finalUnitPrice || match.price;
  const diff = currentUnitPrice - oldPrice;
  const percentDiff = oldPrice > 0 ? (diff / oldPrice) * 100 : 0;

  let status = 'equal';
  if (diff > 0) status = 'higher';
  else if (diff < 0) status = 'lower';

  return {
    found: true,
    baselineMonth: baseline.monthName,
    oldPrice: oldPrice,
    diff: diff,
    absDiff: Math.abs(diff),
    percentDiff: Math.abs(percentDiff).toFixed(1),
    status: status
  };
}

// ==========================================
// RENDERERS & UI UPDATES
// ==========================================

/**
 * F-05: Update Budget Safety Cap Status Bar & Warnings
 */
function updateBudgetSafetyUI() {
  const totalCart = AppState.cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const budgetCap = AppState.budgetCap;
  const remaining = budgetCap - totalCart;
  const percentage = budgetCap > 0 ? Math.min(100, Math.round((totalCart / budgetCap) * 100)) : 0;

  // Elements
  const headerBudgetLimit = document.getElementById('header-budget-limit');
  const headerCartTotal = document.getElementById('header-cart-total');
  const progressBar = document.getElementById('budget-progress-bar');
  const budgetCard = document.getElementById('budget-safety-card');
  const statusText = document.getElementById('budget-status-text');
  const remainingLabel = document.getElementById('budget-remaining-label');
  const remainingVal = document.getElementById('header-budget-remaining');
  const alertBanner = document.getElementById('budget-over-alert');
  const alertText = document.getElementById('budget-over-text');
  const navBadge = document.getElementById('nav-cart-badge');
  const cartItemCount = document.getElementById('cart-item-count');
  const footerTotalPrice = document.getElementById('footer-total-price');
  const footerItemSummary = document.getElementById('footer-item-summary');
  const footerSavedBadge = document.getElementById('footer-saved-badge');
  const checkoutFooter = document.getElementById('cart-checkout-footer');

  if (headerBudgetLimit) headerBudgetLimit.textContent = formatRupiah(budgetCap);
  if (headerCartTotal) headerCartTotal.textContent = formatRupiah(totalCart);

  // Meter Bar
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, (totalCart / budgetCap) * 100)}%`;
  }

  // Status Styling Logic
  budgetCard.classList.remove('status-safe', 'status-warning', 'status-danger');

  if (totalCart > budgetCap) {
    // Over Budget (Red)
    budgetCard.classList.add('status-danger');
    statusText.textContent = `OVER BUDGET! (${Math.round((totalCart / budgetCap) * 100)}%)`;
    remainingLabel.textContent = 'Melebihi Limit:';
    remainingVal.textContent = formatRupiah(Math.abs(remaining));
    remainingVal.style.color = '#fb7185';

    if (alertBanner && alertText) {
      alertBanner.classList.remove('hidden');
      alertText.textContent = `Belanja melebihi jatah dompet sebesar ${formatRupiah(Math.abs(remaining))}. Pertimbangkan kurangi atau ganti barang non-primer!`;
    }
  } else if (totalCart >= budgetCap * 0.8) {
    // Warning Zone (Amber: 80% - 100%)
    budgetCard.classList.add('status-warning');
    statusText.textContent = `Waspada Limit (${percentage}%)`;
    remainingLabel.textContent = 'Sisa Saldo:';
    remainingVal.textContent = formatRupiah(remaining);
    remainingVal.style.color = '#fbbf24';
    if (alertBanner) alertBanner.classList.add('hidden');
  } else {
    // Safe Zone (Green: < 80%)
    budgetCard.classList.add('status-safe');
    statusText.textContent = `Dompet Aman (${percentage}%)`;
    remainingLabel.textContent = 'Sisa Saldo:';
    remainingVal.textContent = formatRupiah(remaining);
    remainingVal.style.color = '#34d399';
    if (alertBanner) alertBanner.classList.add('hidden');
  }

  // Update Cart Toolbar & Nav Badge
  const totalItemQty = AppState.cart.reduce((qty, i) => qty + i.qty, 0);
  if (navBadge) {
    if (totalItemQty > 0) {
      navBadge.textContent = totalItemQty;
      navBadge.classList.remove('hidden');
    } else {
      navBadge.classList.add('hidden');
    }
  }

  if (cartItemCount) {
    cartItemCount.textContent = `${AppState.cart.length} Jenis Barang (${totalItemQty} total) di Troli`;
  }

  // Bottom Checkout Footer Summary
  if (checkoutFooter) {
    if (AppState.cart.length > 0) {
      checkoutFooter.classList.remove('hidden');
      if (footerTotalPrice) footerTotalPrice.textContent = formatRupiah(totalCart);
      if (footerItemSummary) footerItemSummary.textContent = `${AppState.cart.length} barang terdaftar`;

      // Calculate total savings from discounts
      const totalSavings = AppState.cart.reduce((acc, it) => {
        const discountSaving = (it.originalPrice - it.finalUnitPrice) * it.qty;
        return acc + (discountSaving > 0 ? discountSaving : 0);
      }, 0);

      if (footerSavedBadge) {
        if (totalSavings > 0) {
          footerSavedBadge.textContent = `Hemat ${formatRupiah(totalSavings)}`;
          footerSavedBadge.classList.remove('hidden');
        } else {
          footerSavedBadge.classList.add('hidden');
        }
      }
    } else {
      checkoutFooter.classList.add('hidden');
    }
  }
}

/**
 * F-01 & F-02: Render Active Grocery Cart List
 */
function renderCartItems() {
  const container = document.getElementById('grocery-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  if (!container || !emptyState) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    updateBudgetSafetyUI();
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = AppState.cart.map(item => {
    // Discount badges
    const hasDiscount = item.discountString && item.discountString.length > 0;
    const discountPill = hasDiscount 
      ? `<span class="discount-badge-pill">Diskon ${item.discountString} (Hemat ${formatRupiah((item.originalPrice - item.finalUnitPrice))})</span>`
      : '';
    const struckPrice = hasDiscount 
      ? `<span class="price-original-struck">${formatRupiah(item.originalPrice)}</span>` 
      : '';

    // Price Comparator Tag
    const comp = comparePriceWithLastMonth(item.name, item.finalUnitPrice);
    let comparatorTagHtml = '';
    if (comp) {
      if (comp.status === 'higher') {
        comparatorTagHtml = `<div class="comparator-tag higher" title="Bulan lalu: ${formatRupiah(comp.oldPrice)}">
          <span>↑ +${formatRupiah(comp.absDiff)} (+${comp.percentDiff}%) vs bln lalu</span>
        </div>`;
      } else if (comp.status === 'lower') {
        comparatorTagHtml = `<div class="comparator-tag lower" title="Bulan lalu: ${formatRupiah(comp.oldPrice)}">
          <span>↓ -${formatRupiah(comp.absDiff)} (-${comp.percentDiff}%) vs bln lalu</span>
        </div>`;
      } else {
        comparatorTagHtml = `<div class="comparator-tag equal">
          <span>= Stabil (${formatRupiah(comp.oldPrice)})</span>
        </div>`;
      }
    }

    return `
      <div class="grocery-card" data-id="${item.id}">
        <div class="card-top">
          <div class="card-item-info">
            <div class="card-item-title-row">
              <span class="card-item-name">${escapeHtml(item.name)}</span>
              <span class="card-category-badge">${escapeHtml(item.category || 'Umum')}</span>
            </div>
            
            <div class="card-price-row">
              <span class="price-final-unit">${formatRupiah(item.finalUnitPrice)} / ${item.unit}</span>
              ${struckPrice}
              ${discountPill}
            </div>

            ${comparatorTagHtml}
          </div>

          <button class="btn-delete-item" data-action="delete" data-id="${item.id}" aria-label="Hapus item">
            <i data-lucide="trash-2"></i>
          </button>
        </div>

        <div class="card-bottom">
          <!-- Stepper Kuantitas Mobile Ramah Jempol -->
          <div class="card-stepper">
            <button class="stepper-btn-sm" data-action="decrement" data-id="${item.id}" aria-label="Kurangi kuantitas">
              <i data-lucide="minus"></i>
            </button>
            <span class="stepper-qty-val">${item.qty}</span>
            <button class="stepper-btn-sm" data-action="increment" data-id="${item.id}" aria-label="Tambah kuantitas">
              <i data-lucide="plus"></i>
            </button>
          </div>
          <span class="stepper-unit-label">${item.unit}</span>

          <div class="card-subtotal">
            <span class="subtotal-label">Subtotal</span>
            <span class="subtotal-amount">${formatRupiah(item.subtotal)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }

  updateBudgetSafetyUI();
}

/**
 * F-06: Render History List Tab
 */
function renderHistoryTab() {
  const container = document.getElementById('history-list-container');
  const emptyState = document.getElementById('history-empty-state');
  const baselineLabel = document.getElementById('baseline-month-label');

  if (!container || !emptyState) return;

  const baseline = getBaselineTransaction();
  if (baselineLabel) {
    baselineLabel.textContent = baseline 
      ? `Memakai data: ${baseline.monthName} (${formatRupiah(baseline.totalSpend)})`
      : 'Belum ada acuan belanjaan sebelumnya';
  }

  if (AppState.history.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = AppState.history.map(trx => {
    const isBaseline = baseline && baseline.id === trx.id;
    const isOver = trx.totalSpend > trx.budgetCap;
    const dateFormatted = new Date(trx.timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
      <div class="history-card" data-id="${trx.id}">
        <div class="history-card-header">
          <span class="history-month-tag">${escapeHtml(trx.monthName || 'Belanja')}</span>
          <span class="history-status-tag ${isOver ? 'danger' : 'safe'}">
            ${isOver ? 'Over Budget' : 'Dompet Aman'}
          </span>
        </div>

        <div class="history-card-body">
          <span class="history-total-val">${formatRupiah(trx.totalSpend)}</span>
          <span class="history-items-count">${trx.items.length} item • ${dateFormatted}</span>
        </div>

        ${isBaseline ? `
          <div class="history-baseline-badge">
            <i data-lucide="check-circle-2"></i>
            <span>Acuan Pembanding Aktif</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
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
  const setBaselineBtn = document.getElementById('set-as-baseline-btn');

  title.textContent = trx.monthName || 'Detail Belanja';
  dateEl.textContent = `Dicatat pada: ${new Date(trx.timestamp).toLocaleString('id-ID')}`;
  totalEl.textContent = formatRupiah(trx.totalSpend);
  budgetEl.textContent = formatRupiah(trx.budgetCap);

  const isOver = trx.totalSpend > trx.budgetCap;
  statusEl.textContent = isOver ? 'Over Budget' : 'Aman';
  statusEl.className = `badge ${isOver ? 'history-status-tag danger' : 'history-status-tag safe'}`;

  itemsContainer.innerHTML = trx.items.map(item => `
    <div class="history-detail-item-row">
      <div class="item-left">
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-sub">${item.qty} ${item.unit} × ${formatRupiah(item.finalUnitPrice || item.price)}</span>
      </div>
      <span class="item-price">${formatRupiah(item.subtotal || (item.qty * (item.finalUnitPrice || item.price)))}</span>
    </div>
  `).join('');

  // Set action buttons handlers
  deleteBtn.onclick = () => {
    if (confirm(`Hapus catatan riwayat "${trx.monthName}"?`)) {
      AppState.history = AppState.history.filter(h => h.id !== trxId);
      if (AppState.activeBaselineId === trxId) {
        AppState.activeBaselineId = AppState.history.length > 0 ? AppState.history[0].id : null;
      }
      saveHistoryToStorage();
      modal.classList.add('hidden');
      renderHistoryTab();
      renderCartItems();
      showToast('Catatan riwayat berhasil dihapus.');
    }
  };

  setBaselineBtn.onclick = () => {
    AppState.activeBaselineId = trxId;
    saveHistoryToStorage();
    modal.classList.add('hidden');
    renderHistoryTab();
    renderCartItems();
    showToast(`Acuan harga diubah ke: ${trx.monthName}`);
  };

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// MODAL & LIVE INPUT CALCULATION (F-02 & F-03 & F-04)
// ==========================================

function updateModalLiveCalculations() {
  const nameInput = document.getElementById('item-name');
  const priceInput = document.getElementById('item-price');
  const discountInput = document.getElementById('item-discount');
  const qtyInput = document.getElementById('item-qty');

  const rawPrice = parseFloat(priceInput.value) || 0;
  const discountStr = discountInput.value;
  const qty = parseInt(qtyInput.value) || 1;

  // F-03: Multi-tier Discount Calculation
  const discCalc = calculateDiscount(rawPrice, discountStr);
  const subtotal = discCalc.finalUnitPrice * qty;

  // Update breakdown card in modal
  const breakdownCard = document.getElementById('modal-discount-breakdown');
  const breakdownOrig = document.getElementById('breakdown-original');
  const breakdownDisc = document.getElementById('breakdown-discount-val');
  const breakdownFinal = document.getElementById('breakdown-final-price');
  const liveSubtotal = document.getElementById('modal-live-subtotal');

  if (discCalc.discountAmount > 0) {
    breakdownCard.classList.remove('hidden');
    breakdownOrig.textContent = formatRupiah(discCalc.originalPrice);
    breakdownDisc.textContent = `-${formatRupiah(discCalc.discountAmount)} (${discCalc.discountPercentTotal.toFixed(0)}%)`;
    breakdownFinal.textContent = formatRupiah(discCalc.finalUnitPrice);
  } else {
    breakdownCard.classList.add('hidden');
  }

  if (liveSubtotal) {
    liveSubtotal.textContent = formatRupiah(subtotal);
  }

  // F-04: Real-time Price Comparator Feedback Box inside Modal
  const comparatorBox = document.getElementById('price-comparator-alert');
  const compArrow = document.getElementById('comp-arrow');
  const compTitle = document.getElementById('comp-title');
  const compDesc = document.getElementById('comp-desc');

  if (nameInput.value.trim() && rawPrice > 0) {
    const comp = comparePriceWithLastMonth(nameInput.value, discCalc.finalUnitPrice);
    if (comp) {
      comparatorBox.classList.remove('hidden', 'higher', 'lower', 'equal');
      comparatorBox.classList.add(comp.status);

      if (comp.status === 'higher') {
        compArrow.textContent = '↑';
        compTitle.textContent = `Harga Naik vs ${comp.baselineMonth}: ${formatRupiah(comp.oldPrice)}`;
        compDesc.textContent = `Lebih mahal +${formatRupiah(comp.absDiff)} (+${comp.percentDiff}%) dari belanja sebelumnya.`;
      } else if (comp.status === 'lower') {
        compArrow.textContent = '↓';
        compTitle.textContent = `Harga Turun vs ${comp.baselineMonth}: ${formatRupiah(comp.oldPrice)}`;
        compDesc.textContent = `Hemat -${formatRupiah(comp.absDiff)} (-${comp.percentDiff}%) dibanding bulan lalu!`;
      } else {
        compArrow.textContent = '=';
        compTitle.textContent = `Harga Stabil vs ${comp.baselineMonth}`;
        compDesc.textContent = `Sama persis dengan harga bulan lalu (${formatRupiah(comp.oldPrice)}).`;
      }
    } else {
      comparatorBox.classList.add('hidden');
    }
  } else {
    comparatorBox.classList.add('hidden');
  }
}

function openAddModal() {
  const modal = document.getElementById('add-item-modal');
  const form = document.getElementById('item-form');
  form.reset();
  document.getElementById('item-qty').value = '1';
  document.getElementById('modal-discount-breakdown').classList.add('hidden');
  document.getElementById('price-comparator-alert').classList.add('hidden');
  updateModalLiveCalculations();
  modal.classList.remove('hidden');

  // Focus on item name
  setTimeout(() => {
    document.getElementById('item-name').focus();
  }, 100);
}

function closeAddModal() {
  document.getElementById('add-item-modal').classList.add('hidden');
}

// ==========================================
// SAMPLE DATA GENERATOR FOR RANTAU STUDENTS
// ==========================================

function loadRantauSampleData() {
  // 1. History baseline (Bulan Lalu - e.g. Agustus 2026)
  const lastMonthHistory = {
    id: 'sample_baseline_01',
    monthName: 'Belanja Bulanan Agustus 2026',
    timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
    budgetCap: 500000,
    totalSpend: 468000,
    items: [
      { id: 'h1', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, originalPrice: 68000, finalUnitPrice: 68000, subtotal: 68000 },
      { id: 'h2', name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'liter', qty: 2, originalPrice: 32000, finalUnitPrice: 32000, subtotal: 64000 },
      { id: 'h3', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 2, originalPrice: 28000, finalUnitPrice: 28000, subtotal: 56000 },
      { id: 'h4', name: 'Mie Instan Dus', category: 'Makanan Instan', unit: 'pack', qty: 1, originalPrice: 110000, finalUnitPrice: 110000, subtotal: 110000 },
      { id: 'h5', name: 'Deterjen Bubuk 800g', category: 'Perlengkapan Cuci', unit: 'pack', qty: 2, originalPrice: 22000, finalUnitPrice: 22000, subtotal: 44000 },
      { id: 'h6', name: 'Sabun Mandi Cair', category: 'Perlengkapan Mandi', unit: 'botol', qty: 2, originalPrice: 26000, finalUnitPrice: 26000, subtotal: 52000 },
      { id: 'h7', name: 'Kopi Kapal Api Bag', category: 'Makanan Instan', unit: 'pack', qty: 2, originalPrice: 17000, finalUnitPrice: 17000, subtotal: 34000 },
      { id: 'h8', name: 'Biskuit Roma Kelapa', category: 'Camilan', unit: 'pack', qty: 4, originalPrice: 10000, finalUnitPrice: 10000, subtotal: 40000 }
    ]
  };

  // Add to history if not present
  if (!AppState.history.some(h => h.id === lastMonthHistory.id)) {
    AppState.history = [lastMonthHistory, ...AppState.history];
    AppState.activeBaselineId = lastMonthHistory.id;
    saveHistoryToStorage();
  }

  // 2. Active Cart items with discounts and price differences to test F-01 to F-05
  // - Minyak Goreng 2L: Naik ke 35.000 (Red Arrow ↑)
  // - Beras Ramos 5kg: Turun promo ke 65.000 (Green Arrow ↓)
  // - Deterjen Bubuk 800g: Diskon bertumpuk 50+20%
  // - Telur Ayam: Stabil 28.000 (=)
  AppState.cart = [
    {
      id: 'cart_' + Date.now() + '_1',
      name: 'Minyak Goreng 2L',
      category: 'Bahan Pokok',
      unit: 'liter',
      qty: 2,
      originalPrice: 36000,
      discountString: '',
      finalUnitPrice: 36000,
      subtotal: 72000
    },
    {
      id: 'cart_' + Date.now() + '_2',
      name: 'Beras Ramos 5kg',
      category: 'Bahan Pokok',
      unit: 'pack',
      qty: 1,
      originalPrice: 72000,
      discountString: '10',
      finalUnitPrice: 64800,
      subtotal: 64800
    },
    {
      id: 'cart_' + Date.now() + '_3',
      name: 'Deterjen Bubuk 800g',
      category: 'Perlengkapan Cuci',
      unit: 'pack',
      qty: 2,
      originalPrice: 24000,
      discountString: '50+20', // Diskon bertumpuk 50% + 20% = 60% diskon! Rp 9.600
      finalUnitPrice: 9600,
      subtotal: 19200
    },
    {
      id: 'cart_' + Date.now() + '_4',
      name: 'Telur Ayam 1kg',
      category: 'Bahan Pokok',
      unit: 'kg',
      qty: 2,
      originalPrice: 28000,
      discountString: '',
      finalUnitPrice: 28000,
      subtotal: 56000
    }
  ];

  saveCartToStorage();
  renderCartItems();
  renderHistoryTab();
  showToast('Sampel belanja rantau & riwayat acuan bulan lalu berhasil dimuat!');
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Load saved state
  loadStateFromStorage();

  // If new user with no cart and no history, pre-load helpful sample
  if (AppState.cart.length === 0 && AppState.history.length === 0) {
    loadRantauSampleData();
  } else {
    renderCartItems();
    renderHistoryTab();
  }

  // Set Budget Cap Input value
  const budgetInput = document.getElementById('input-budget-cap');
  if (budgetInput) budgetInput.value = AppState.budgetCap;

  // 1. Navigation Tab Switching
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
      if (window.lucide) lucide.createIcons();
    });
  });

  // 2. Open / Close Add Modal
  const openModalBtn = document.getElementById('open-add-modal-btn');
  const emptyAddBtn = document.getElementById('empty-add-item-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeBackdrop = document.getElementById('close-modal-backdrop');

  if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', openAddModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
  if (closeBackdrop) closeBackdrop.addEventListener('click', closeAddModal);

  // 3. Modal Stepper (+ / -)
  const qtyInput = document.getElementById('item-qty');
  const qtyMinus = document.getElementById('modal-qty-minus');
  const qtyPlus = document.getElementById('modal-qty-plus');

  qtyMinus.addEventListener('click', () => {
    const cur = parseInt(qtyInput.value) || 1;
    if (cur > 1) {
      qtyInput.value = cur - 1;
      updateModalLiveCalculations();
    }
  });

  qtyPlus.addEventListener('click', () => {
    const cur = parseInt(qtyInput.value) || 1;
    qtyInput.value = cur + 1;
    updateModalLiveCalculations();
  });

  qtyInput.addEventListener('input', updateModalLiveCalculations);

  // 4. Modal Live Inputs (Price, Discount, Name)
  document.getElementById('item-price').addEventListener('input', updateModalLiveCalculations);
  document.getElementById('item-discount').addEventListener('input', updateModalLiveCalculations);
  document.getElementById('item-name').addEventListener('input', updateModalLiveCalculations);

  // Discount preset buttons in modal
  document.querySelectorAll('.disc-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const disc = btn.getAttribute('data-disc');
      document.getElementById('item-discount').value = disc;
      updateModalLiveCalculations();
    });
  });

  // Quick Suggestion Chips in Modal
  document.querySelectorAll('.item-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('item-name').value = btn.getAttribute('data-name');
      document.getElementById('item-category').value = btn.getAttribute('data-cat');
      document.getElementById('item-unit').value = btn.getAttribute('data-unit');
      document.getElementById('item-price').value = btn.getAttribute('data-price');
      updateModalLiveCalculations();
    });
  });

  // 5. Submit Form Item (Add to Cart)
  const itemForm = document.getElementById('item-form');
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const unit = document.getElementById('item-unit').value;
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const discountStr = document.getElementById('item-discount').value.trim();
    const qty = parseInt(document.getElementById('item-qty').value) || 1;

    if (!name || price <= 0) {
      showToast('Harap masukkan nama produk dan harga yang valid!', 'danger');
      return;
    }

    const discCalc = calculateDiscount(price, discountStr);
    const subtotal = discCalc.finalUnitPrice * qty;

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
    closeAddModal();

    showToast(`"${name}" dimasukkan ke troli belanja.`);
  });

  // 6. Grocery Card Actions (Increment, Decrement, Delete)
  const cartList = document.getElementById('grocery-items-list');
  cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (!id || !action) return;

    const item = AppState.cart.find(i => i.id === id);
    if (!item) return;

    if (action === 'increment') {
      item.qty += 1;
      item.subtotal = item.qty * item.finalUnitPrice;
      saveCartToStorage();
      renderCartItems();
    } else if (action === 'decrement') {
      if (item.qty > 1) {
        item.qty -= 1;
        item.subtotal = item.qty * item.finalUnitPrice;
        saveCartToStorage();
        renderCartItems();
      } else {
        // Confirm delete if qty reaches 0
        if (confirm(`Hapus "${item.name}" dari troli?`)) {
          AppState.cart = AppState.cart.filter(i => i.id !== id);
          saveCartToStorage();
          renderCartItems();
          showToast(`"${item.name}" dihapus dari troli.`);
        }
      }
    } else if (action === 'delete') {
      AppState.cart = AppState.cart.filter(i => i.id !== id);
      saveCartToStorage();
      renderCartItems();
      showToast(`"${item.name}" dihapus.`);
    }
  });

  // 7. Clear Cart Button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) return;
      if (confirm('Kosongkan semua barang dari keranjang belanja?')) {
        AppState.cart = [];
        saveCartToStorage();
        renderCartItems();
        showToast('Keranjang troli dikosongkan.');
      }
    });
  }

  // 8. F-06: Checkout / Selesaikan Belanja
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) {
        showToast('Troli masih kosong!', 'danger');
        return;
      }

      const totalSpend = AppState.cart.reduce((s, i) => s + i.subtotal, 0);
      const now = new Date();
      const defaultMonthName = `Belanja ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      
      const customTitle = prompt('Beri nama riwayat transaksi ini:', defaultMonthName);
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
      // Auto set this latest transaction as baseline comparator for next shopping
      AppState.activeBaselineId = newHistoryRecord.id;
      // Empty active cart
      AppState.cart = [];

      saveHistoryToStorage();
      saveCartToStorage();
      renderCartItems();
      renderHistoryTab();

      showToast('Belanja selesai & tersimpan ke riwayat pembanding harga!');
      // Switch to history tab to view receipt
      document.getElementById('nav-tab-riwayat').click();
    });
  }

  // 9. History Card Click -> Detail Modal
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

  // 10. Budget Cap Settings & Preset Chips
  const saveBudgetBtn = document.getElementById('save-budget-btn');
  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
      const val = parseFloat(budgetInput.value);
      if (val && val >= 10000) {
        AppState.budgetCap = val;
        saveBudgetCapToStorage();
        updateBudgetSafetyUI();
        showToast(`Batas dompet berhasil disetel ke ${formatRupiah(val)}.`);
      } else {
        showToast('Masukkan nominal anggaran minimal Rp 10.000', 'danger');
      }
    });
  }

  document.querySelectorAll('.budget-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = Number(chip.getAttribute('data-amount'));
      budgetInput.value = amt;
      AppState.budgetCap = amt;
      saveBudgetCapToStorage();
      updateBudgetSafetyUI();
      showToast(`Batas dompet disetel: ${formatRupiah(amt)}`);
    });
  });

  // 11. Quick Demo / Sampel Buttons
  const quickDemoBtn = document.getElementById('quick-demo-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const historySampleBtn = document.getElementById('history-load-sample-btn');

  if (quickDemoBtn) quickDemoBtn.addEventListener('click', loadRantauSampleData);
  if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadRantauSampleData);
  if (historySampleBtn) historySampleBtn.addEventListener('click', loadRantauSampleData);

  // 12. Danger Actions: Reset
  const resetHistoryBtn = document.getElementById('reset-history-only-btn');
  const resetAllBtn = document.getElementById('reset-all-data-btn');

  if (resetHistoryBtn) {
    resetHistoryBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin menghapus seluruh riwayat belanja? Pembanding harga bulan lalu akan direset.')) {
        AppState.history = [];
        AppState.activeBaselineId = null;
        saveHistoryToStorage();
        renderHistoryTab();
        renderCartItems();
        showToast('Semua riwayat belanja dihapus.');
      }
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      if (confirm('RESET TOTAL: Hapus keranjang, riwayat, dan kembalikan setelan anggaran ke default?')) {
        localStorage.clear();
        AppState.budgetCap = 500000;
        AppState.cart = [];
        AppState.history = [];
        AppState.activeBaselineId = null;
        budgetInput.value = 500000;
        renderCartItems();
        renderHistoryTab();
        showToast('Seluruh data aplikasi direset.');
      }
    });
  }

  // 13. Export Data JSON
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
      showToast('Data belanja berhasil diunduh sebagai JSON.');
    });
  }

  // 14. Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 15. Register PWA Service Worker
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

  // 16. PWA Install Prompt Handler (Add to Home Screen)
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
          showToast('Aplikasi berhasil dipasang!');
        }
        AppState.deferredInstallPrompt = null;
        installBadge.classList.add('hidden');
      } else {
        showToast('Untuk memasang PWA: Buka menu browser lalu pilih "Tambahkan ke Layar Utama".');
      }
    });
  }
});
