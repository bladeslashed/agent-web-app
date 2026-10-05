/**
 * Budget Safety Tracker & Spending Comparator Engine
 * Calculates safety limits, warnings, and month-over-month spending comparisons
 */

/**
 * Calculate spending comparison of current shopping vs previous shopping trip
 * - Red up arrow (↑): Spending increased
 * - Green down arrow (↓): Spending decreased
 * - Yellow equals sign (=): Spending equal
 * - Gray negative sign (-): No past comparison data
 */
function calculateSpendingComparison() {
  const currentCartTotal = AppState.cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  let currentSpend = 0;
  let pastSpend = null;
  let currentLabel = '';
  let pastLabel = '';

  if (currentCartTotal > 0) {
    currentSpend = currentCartTotal;
    currentLabel = AppState.lang === 'en' ? 'Active Cart' : 'Troli Aktif';
    if (AppState.history.length > 0) {
      pastSpend = AppState.history[0].totalSpend;
      pastLabel = AppState.history[0].monthName || (AppState.lang === 'en' ? 'Last Trip' : 'Bulan Lalu');
    }
  } else if (AppState.history.length > 0) {
    currentSpend = AppState.history[0].totalSpend;
    currentLabel = AppState.history[0].monthName || (AppState.lang === 'en' ? 'Latest Trip' : 'Belanja Terakhir');
    if (AppState.history.length > 1) {
      pastSpend = AppState.history[1].totalSpend;
      pastLabel = AppState.history[1].monthName || (AppState.lang === 'en' ? 'Previous' : 'Bulan Sebelumnya');
    }
  }

  // If no past comparison data exists
  if (pastSpend === null || pastSpend === undefined) {
    return {
      state: 'none',
      symbol: '-',
      currentSpend,
      pastSpend: null,
      diff: 0,
      percent: 0,
      currentLabel: currentLabel || (AppState.lang === 'en' ? 'Current' : 'Sekarang'),
      pastLabel: '-'
    };
  }

  const diff = currentSpend - pastSpend;
  const percent = pastSpend > 0 ? ((diff / pastSpend) * 100).toFixed(1) : 0;

  if (diff > 0) {
    return {
      state: 'up',
      symbol: '↑',
      currentSpend,
      pastSpend,
      diff,
      percent: Math.abs(percent),
      currentLabel,
      pastLabel
    };
  } else if (diff < 0) {
    return {
      state: 'down',
      symbol: '↓',
      currentSpend,
      pastSpend,
      diff: Math.abs(diff),
      percent: Math.abs(percent),
      currentLabel,
      pastLabel
    };
  } else {
    return {
      state: 'equal',
      symbol: '=',
      currentSpend,
      pastSpend,
      diff: 0,
      percent: 0,
      currentLabel,
      pastLabel
    };
  }
}

/**
 * Update comparator badges in Top Budget Bar, Bottom Checkout Bar, and Riwayat Tab
 */
function updateComparatorBadges() {
  const comp = calculateSpendingComparison();
  const t = I18N[AppState.lang];

  // 1. Top Budget Bar Comparator Badge
  const headerBadge = document.getElementById('header-comparator-badge');
  if (headerBadge) {
    headerBadge.className = `spending-comparator-badge comp-${comp.state}`;
    const iconEl = headerBadge.querySelector('.comp-icon');
    const labelEl = headerBadge.querySelector('.comp-label');
    if (iconEl) iconEl.textContent = comp.symbol;
    if (labelEl) {
      if (comp.state === 'none') {
        labelEl.textContent = t.compVsLastMonth;
      } else if (comp.state === 'up') {
        labelEl.textContent = `+${formatRupiah(comp.diff)} (${t.compSpendingUp})`;
      } else if (comp.state === 'down') {
        labelEl.textContent = `-${formatRupiah(comp.diff)} (${t.compSpendingDown})`;
      } else {
        labelEl.textContent = `${t.compSpendingEqual}`;
      }
    }
  }

  // 2. Bottom Checkout Bar Comparator Badge
  const footerBadge = document.getElementById('footer-comparator-badge');
  if (footerBadge) {
    footerBadge.className = `spending-comparator-badge comp-${comp.state}`;
    const iconEl = footerBadge.querySelector('.comp-icon');
    const labelEl = footerBadge.querySelector('.comp-label');
    if (iconEl) iconEl.textContent = comp.symbol;
    if (labelEl) {
      if (comp.state === 'none') {
        labelEl.textContent = t.compVsLastMonth;
      } else if (comp.state === 'up') {
        labelEl.textContent = `+${formatRupiah(comp.diff)} ${comp.symbol}`;
      } else if (comp.state === 'down') {
        labelEl.textContent = `-${formatRupiah(comp.diff)} ${comp.symbol}`;
      } else {
        labelEl.textContent = `=`;
      }
    }
  }

  // 3. Monthly Comparator Card in Riwayat Tab
  const historyBadge = document.getElementById('history-comparator-badge');
  const compCurrentVal = document.getElementById('comp-current-val');
  const compPastVal = document.getElementById('comp-past-val');
  const compLargeBadge = document.getElementById('comp-large-badge');
  const compLargeIcon = document.getElementById('comp-large-icon');
  const compSummaryText = document.getElementById('comp-summary-text');
  const compCurrentLabel = document.getElementById('comp-current-label');
  const compPastLabel = document.getElementById('comp-past-label');

  if (historyBadge) {
    historyBadge.className = `spending-comparator-badge comp-${comp.state}`;
    const iconEl = historyBadge.querySelector('.comp-icon');
    const labelEl = historyBadge.querySelector('.comp-label');
    if (iconEl) iconEl.textContent = comp.symbol;
    if (labelEl) labelEl.textContent = t.compVsLastMonth;
  }

  if (compCurrentVal) compCurrentVal.textContent = formatRupiah(comp.currentSpend);
  if (compCurrentLabel && comp.currentLabel) compCurrentLabel.textContent = comp.currentLabel;

  if (compPastVal) {
    compPastVal.textContent = comp.pastSpend !== null ? formatRupiah(comp.pastSpend) : '-';
  }
  if (compPastLabel && comp.pastLabel) compPastLabel.textContent = comp.pastLabel;

  if (compLargeBadge && compLargeIcon) {
    compLargeBadge.className = `comp-badge-large comp-${comp.state}`;
    compLargeIcon.textContent = comp.symbol;
  }

  if (compSummaryText) {
    if (comp.state === 'none') {
      compSummaryText.innerHTML = t.compSummaryNoData;
    } else if (comp.state === 'up') {
      compSummaryText.innerHTML = t.compSummaryUp(formatRupiah(comp.diff), comp.percent);
    } else if (comp.state === 'down') {
      compSummaryText.innerHTML = t.compSummaryDown(formatRupiah(comp.diff), comp.percent);
    } else {
      compSummaryText.innerHTML = t.compSummaryEqual;
    }
  }
}

/**
 * Compare an individual item price vs the most recent past shopping trip
 */
function comparePriceWithLastMonth(itemName, currentUnitPrice) {
  if (!AppState.history || AppState.history.length === 0) return null;
  const previousTrip = AppState.history[0];
  if (!previousTrip || !previousTrip.items) return null;

  const targetName = normalizeName(itemName);
  if (!targetName) return null;

  const match = previousTrip.items.find(item => {
    const prevName = normalizeName(item.name);
    return prevName === targetName || prevName.includes(targetName) || targetName.includes(prevName);
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
    baselineMonth: previousTrip.monthName,
    oldPrice: oldPrice,
    diff: diff,
    absDiff: Math.abs(diff),
    percentDiff: Math.abs(percentDiff).toFixed(1),
    status: status
  };
}

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
  if (budgetCard) {
    budgetCard.classList.remove('status-safe', 'status-warning', 'status-danger');

    if (totalCart > budgetCap) {
      // Over Budget (Red)
      budgetCard.classList.add('status-danger');
      if (statusText) statusText.textContent = `OVER BUDGET! (${Math.round((totalCart / budgetCap) * 100)}%)`;
      if (remainingLabel) remainingLabel.textContent = 'Melebihi Limit:';
      if (remainingVal) {
        remainingVal.textContent = formatRupiah(Math.abs(remaining));
        remainingVal.style.color = '#fb7185';
      }

      if (alertBanner && alertText) {
        alertBanner.classList.remove('hidden');
        alertText.textContent = `Belanja melebihi jatah dompet sebesar ${formatRupiah(Math.abs(remaining))}. Pertimbangkan kurangi atau ganti barang non-primer!`;
      }
    } else if (totalCart >= budgetCap * 0.8) {
      // Warning Zone (Amber: 80% - 100%)
      budgetCard.classList.add('status-warning');
      if (statusText) statusText.textContent = `Waspada Limit (${percentage}%)`;
      if (remainingLabel) remainingLabel.textContent = 'Sisa Saldo:';
      if (remainingVal) {
        remainingVal.textContent = formatRupiah(remaining);
        remainingVal.style.color = '#fbbf24';
      }
      if (alertBanner) alertBanner.classList.add('hidden');
    } else {
      // Safe Zone (Green: < 80%)
      budgetCard.classList.add('status-safe');
      if (statusText) statusText.textContent = `Dompet Aman (${percentage}%)`;
      if (remainingLabel) remainingLabel.textContent = 'Sisa Saldo:';
      if (remainingVal) {
        remainingVal.textContent = formatRupiah(remaining);
        remainingVal.style.color = '#34d399';
      }
      if (alertBanner) alertBanner.classList.add('hidden');
    }
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
