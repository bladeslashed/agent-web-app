/**
 * General Utilities & Calculation Helpers
 * Smart Grocery & Budget Safety Tracker
 */

/**
 * Format number to Indonesian Rupiah currency string (e.g. Rp 35.000)
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
 * Escape HTML to prevent XSS in dynamic rendering
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
