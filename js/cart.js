/**
 * Grocery Cart Logic & Rendering
 * Smart Grocery & Budget Safety Tracker
 */

/**
 * Load cart, history, budget, and language state from localStorage
 */
function loadStateFromStorage() {
  try {
    const savedCap = localStorage.getItem(STORAGE_KEYS.BUDGET_CAP);
    if (savedCap) AppState.budgetCap = Number(savedCap);

    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) AppState.cart = JSON.parse(savedCart);

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) AppState.history = JSON.parse(savedHistory);

    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG);
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      AppState.lang = savedLang;
    }
  } catch (e) {
    console.error('Error loading data from localStorage', e);
  }
}

/**
 * Save active cart to localStorage and schedule cloud sync if active
 */
function saveCartToStorage(triggerCloudSync = true) {
  AppState.lastLocalUpdate = Date.now();
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(AppState.cart));
  if (triggerCloudSync && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync();
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
    const formattedDiscount = hasDiscount ? escapeHtml(item.discountString).replace(/\+/g, ' + ') : '';
    const savingsAmount = hasDiscount ? formatRupiah(item.originalPrice - item.finalUnitPrice) : '';
    const discountPill = hasDiscount 
      ? `<span class="discount-badge-pill" title="Diskon ${escapeHtml(item.discountString)} (Hemat ${savingsAmount})">Diskon ${formattedDiscount} (Hemat ${savingsAmount})</span>`
      : '';
    const struckPrice = hasDiscount 
      ? `<span class="price-original-struck">${formatRupiah(item.originalPrice)}</span>` 
      : '';

    // Price Comparator Tag vs previous trip
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

          <div class="card-item-actions">
            <button class="btn-card-action btn-edit-item" data-action="edit" data-id="${item.id}" aria-label="Edit item" title="${AppState.lang === 'en' ? 'Edit item' : 'Ubah rincian barang'}">
              <i data-lucide="pencil"></i>
            </button>
            <button class="btn-card-action btn-delete-item" data-action="delete" data-id="${item.id}" aria-label="Hapus item" title="${AppState.lang === 'en' ? 'Delete item' : 'Hapus barang'}">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
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
