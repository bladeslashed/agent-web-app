/**
 * Modal Dialogs & Bottom Sheet Controllers
 * Smart Grocery & Budget Safety Tracker
 */

function openAddModal() {
  const modal = document.getElementById('add-item-modal');
  const form = document.getElementById('item-form');
  if (form) form.reset();

  const editIdInput = document.getElementById('edit-item-id');
  if (editIdInput) editIdInput.value = '';

  const titleEl = document.getElementById('modal-sheet-title');
  if (titleEl) titleEl.textContent = AppState.lang === 'en' ? 'Add Grocery Item' : 'Tambah Barang Belanja';

  const subtitleEl = document.getElementById('modal-sheet-subtitle');
  if (subtitleEl) subtitleEl.textContent = AppState.lang === 'en' ? 'Check price & real-time multi-tier discount' : 'Cek harga & kalkulasi diskon bertumpuk instan';

  const submitLabel = document.getElementById('modal-submit-label');
  if (submitLabel) submitLabel.textContent = AppState.lang === 'en' ? 'Add to Cart' : 'Masukkan ke Troli';

  const submitIcon = document.getElementById('modal-submit-icon');
  if (submitIcon) submitIcon.setAttribute('data-lucide', 'shopping-cart');

  const chipsWrapper = document.querySelector('.quick-chips-wrapper');
  if (chipsWrapper) chipsWrapper.style.display = 'block';

  const qtyInput = document.getElementById('item-qty');
  if (qtyInput) qtyInput.value = '1';

  const breakdown = document.getElementById('modal-discount-breakdown');
  if (breakdown) breakdown.classList.add('hidden');

  const compAlert = document.getElementById('price-comparator-alert');
  if (compAlert) compAlert.classList.add('hidden');

  updateModalLiveCalculations();
  if (modal) modal.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    const nameInput = document.getElementById('item-name');
    if (nameInput) nameInput.focus();
  }, 100);
}

/**
 * Open Item Modal in EDIT Mode for an existing grocery item
 */
function openEditModal(itemId) {
  const item = AppState.cart.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('add-item-modal');
  const editIdInput = document.getElementById('edit-item-id');
  if (editIdInput) editIdInput.value = itemId;

  // Prefill form fields with existing item data
  const nameInput = document.getElementById('item-name');
  const catInput = document.getElementById('item-category');
  const unitInput = document.getElementById('item-unit');
  const priceInput = document.getElementById('item-price');
  const discInput = document.getElementById('item-discount');
  const qtyInput = document.getElementById('item-qty');

  if (nameInput) nameInput.value = item.name;
  if (catInput) catInput.value = item.category || 'Bahan Pokok';
  if (unitInput) unitInput.value = item.unit || 'pack';
  if (priceInput) priceInput.value = item.originalPrice;
  if (discInput) discInput.value = item.discountString || '';
  if (qtyInput) qtyInput.value = item.qty || 1;

  // Update Modal Title and Buttons to Edit mode
  const titleEl = document.getElementById('modal-sheet-title');
  if (titleEl) titleEl.textContent = AppState.lang === 'en' ? 'Edit Grocery Item' : 'Edit Barang Belanja';

  const subtitleEl = document.getElementById('modal-sheet-subtitle');
  if (subtitleEl) subtitleEl.textContent = AppState.lang === 'en' ? 'Modify item name, price, discount or quantity' : 'Ubah rincian barang, harga, diskon, atau jumlah';

  const submitLabel = document.getElementById('modal-submit-label');
  if (submitLabel) submitLabel.textContent = AppState.lang === 'en' ? 'Save Changes' : 'Simpan Perubahan';

  const submitIcon = document.getElementById('modal-submit-icon');
  if (submitIcon) submitIcon.setAttribute('data-lucide', 'check');

  const chipsWrapper = document.querySelector('.quick-chips-wrapper');
  if (chipsWrapper) chipsWrapper.style.display = 'none';

  updateModalLiveCalculations();
  if (modal) modal.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    if (nameInput) nameInput.focus();
  }, 100);
}

function closeAddModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) modal.classList.add('hidden');
}

function updateModalLiveCalculations() {
  const nameInput = document.getElementById('item-name');
  const priceInput = document.getElementById('item-price');
  const discountInput = document.getElementById('item-discount');
  const qtyInput = document.getElementById('item-qty');

  if (!priceInput || !discountInput || !qtyInput) return;

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

  if (breakdownCard) {
    if (discCalc.discountAmount > 0) {
      breakdownCard.classList.remove('hidden');
      if (breakdownOrig) breakdownOrig.textContent = formatRupiah(discCalc.originalPrice);
      if (breakdownDisc) breakdownDisc.textContent = `-${formatRupiah(discCalc.discountAmount)} (${discCalc.discountPercentTotal.toFixed(0)}%)`;
      if (breakdownFinal) breakdownFinal.textContent = formatRupiah(discCalc.finalUnitPrice);
    } else {
      breakdownCard.classList.add('hidden');
    }
  }

  if (liveSubtotal) {
    liveSubtotal.textContent = formatRupiah(subtotal);
  }

  // F-04: Real-time Price Comparator Feedback Box inside Modal
  const comparatorBox = document.getElementById('price-comparator-alert');
  const compArrow = document.getElementById('comp-arrow');
  const compTitle = document.getElementById('comp-title');
  const compDesc = document.getElementById('comp-desc');

  if (comparatorBox && nameInput && nameInput.value.trim() && rawPrice > 0) {
    const comp = comparePriceWithLastMonth(nameInput.value, discCalc.finalUnitPrice);
    if (comp) {
      comparatorBox.classList.remove('hidden', 'higher', 'lower', 'equal');
      comparatorBox.classList.add(comp.status);

      if (comp.status === 'higher') {
        if (compArrow) compArrow.textContent = '↑';
        if (compTitle) compTitle.textContent = `Harga Naik vs ${comp.baselineMonth}: ${formatRupiah(comp.oldPrice)}`;
        if (compDesc) compDesc.textContent = `Lebih mahal +${formatRupiah(comp.absDiff)} (+${comp.percentDiff}%) dari belanja sebelumnya.`;
      } else if (comp.status === 'lower') {
        if (compArrow) compArrow.textContent = '↓';
        if (compTitle) compTitle.textContent = `Harga Turun vs ${comp.baselineMonth}: ${formatRupiah(comp.oldPrice)}`;
        if (compDesc) compDesc.textContent = `Hemat -${formatRupiah(comp.absDiff)} (-${comp.percentDiff}%) dibanding bulan lalu!`;
      } else {
        if (compArrow) compArrow.textContent = '=';
        if (compTitle) compTitle.textContent = `Harga Stabil vs ${comp.baselineMonth}`;
        if (compDesc) compDesc.textContent = `Sama persis dengan harga bulan lalu (${formatRupiah(comp.oldPrice)}).`;
      }
    } else {
      comparatorBox.classList.add('hidden');
    }
  } else if (comparatorBox) {
    comparatorBox.classList.add('hidden');
  }
}

// Modal open/close helpers
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');

  // Reset checkout prompt state if closed without login/save
  if (!AppState.pendingCheckout) {
    const checkoutPrompt = document.getElementById('checkout-auth-prompt');
    const offlineBtn = document.getElementById('btn-save-offline-anyway');
    if (checkoutPrompt) checkoutPrompt.classList.add('hidden');
    if (offlineBtn) offlineBtn.classList.add('hidden');
  }
}

/**
 * Play checkout success sound effect: sfx/miraclei-sample_confirm_accept02_kofi_by_miraclei-364180.mp3
 */
function playCheckoutSound() {
  try {
    const audio = new Audio('sfx/miraclei-sample_confirm_accept02_kofi_by_miraclei-364180.mp3');
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('[Audio] Autoplay blocked or playback error:', err);
      });
    }
  } catch (err) {
    console.warn('[Audio] Failed to instantiate audio:', err);
  }
}

/**
 * Trigger the shopping cart SVG push animation inside popup
 */
function triggerCartPushAnimation() {
  const unit = document.getElementById('cart-pusher-unit');
  if (!unit) return;

  // Reset animation class to re-trigger CSS keyframes
  unit.classList.remove('run-animation');
  void unit.offsetWidth; // force reflow
  unit.classList.add('run-animation');

  // Also play sound effect
  playCheckoutSound();
}

/**
 * Open Checkout Success Modal with Transaction Details & Cart Animation
 */
function openCheckoutSuccessModal(trx) {
  const modal = document.getElementById('checkout-success-modal');
  if (!modal) return;

  // Populate transaction summary
  const titleEl = document.getElementById('checkout-success-trip-title');
  const totalEl = document.getElementById('checkout-success-total-val');
  const countEl = document.getElementById('checkout-success-items-count');
  const statusTag = document.getElementById('checkout-success-status-tag');
  const compPill = document.getElementById('checkout-success-comp-pill');
  const compText = document.getElementById('checkout-success-comp-text');

  if (titleEl) titleEl.textContent = trx.monthName || (AppState.lang === 'en' ? 'Shopping Trip' : 'Belanja');
  if (totalEl) totalEl.textContent = formatRupiah(trx.totalSpend);
  if (countEl) countEl.textContent = `${(trx.items || []).length} ${AppState.lang === 'en' ? 'Items' : 'Barang'}`;

  const isOver = trx.totalSpend > trx.budgetCap;
  if (statusTag) {
    statusTag.textContent = isOver
      ? (AppState.lang === 'en' ? 'Over Budget' : 'Over Budget')
      : (AppState.lang === 'en' ? 'Safe Budget' : 'Dompet Aman');
    statusTag.className = `history-status-tag ${isOver ? 'danger' : 'safe'}`;
  }

  // Monthly Comparator insight
  if (compPill && compText) {
    const comp = typeof calculateSpendingComparison === 'function'
      ? calculateSpendingComparison()
      : { state: 'none', diff: 0, percent: 0 };

    if (comp.state === 'none') {
      compPill.className = 'success-comp-pill comp-none mt-2';
      const icon = compPill.querySelector('.comp-icon');
      if (icon) icon.textContent = '-';
      compText.textContent = AppState.lang === 'en'
        ? 'First recorded shopping trip! Comparison active on next trip.'
        : 'Belanja pertama tercatat! Riwayat pembanding aktif di transaksi berikutnya.';
    } else if (comp.state === 'up') {
      compPill.className = 'success-comp-pill comp-up mt-2';
      const icon = compPill.querySelector('.comp-icon');
      if (icon) icon.textContent = '↑';
      compText.textContent = AppState.lang === 'en'
        ? `+${formatRupiah(comp.diff)} (+${comp.percent}%) vs last month`
        : `+${formatRupiah(comp.diff)} (+${comp.percent}%) dibanding bulan lalu`;
    } else if (comp.state === 'down') {
      compPill.className = 'success-comp-pill comp-down mt-2';
      const icon = compPill.querySelector('.comp-icon');
      if (icon) icon.textContent = '↓';
      compText.textContent = AppState.lang === 'en'
        ? `Saved -${formatRupiah(comp.diff)} (-${comp.percent}%) vs last month!`
        : `Hemat -${formatRupiah(comp.diff)} (-${comp.percent}%) dibanding bulan lalu!`;
    } else {
      compPill.className = 'success-comp-pill comp-equal mt-2';
      const icon = compPill.querySelector('.comp-icon');
      if (icon) icon.textContent = '=';
      compText.textContent = AppState.lang === 'en'
        ? 'Identical total spend to previous month'
        : 'Total belanja stabil persis sama dengan bulan lalu';
    }
  }

  modal.classList.remove('hidden');

  // Trigger the SVG cart push animation and sound effect
  setTimeout(() => {
    triggerCartPushAnimation();
  }, 120);

  if (window.lucide) {
    lucide.createIcons();
  }
}

function closeCheckoutSuccessModal() {
  const modal = document.getElementById('checkout-success-modal');
  if (modal) modal.classList.add('hidden');
}

