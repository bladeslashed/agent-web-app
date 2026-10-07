/**
 * Spending Analytics & Graphs Controller (Tab 3)
 * Smart Grocery & Budget Safety Tracker
 * 
 * Features:
 * 1. Category Spending Pie / Doughnut Chart
 * 2. Discount Savings Bar Graph (by Category or Month)
 * 3. Monthly Cumulative Spending Ogive Curve
 * 4. Time Period Filter (All Time, 6M, 3M, 90D, 30D)
 */

let categoryPieChartInstance = null;
let discountSavingsChartInstance = null;
let ogiveChartInstance = null;

// Category color palette for harmonious charts
const CATEGORY_COLORS = {
  'Bahan Pokok': { bg: '#38bdf8', border: '#0284c7', icon: '🌾' },
  'Makanan Instan': { bg: '#fb923c', border: '#ea580c', icon: '🍜' },
  'Bumbu & Masak': { bg: '#facc15', border: '#ca8a04', icon: '🧂' },
  'Perlengkapan Mandi': { bg: '#34d399', border: '#059669', icon: '🧼' },
  'Perlengkapan Cuci': { bg: '#818cf8', border: '#4f46e5', icon: '🧺' },
  'Camilan': { bg: '#f472b6', border: '#db2777', icon: '🍪' },
  'Lainnya': { bg: '#a78bfa', border: '#7c3aed', icon: '📦' }
};

const DEFAULT_CAT_COLOR = { bg: '#94a3b8', border: '#64748b', icon: '📦' };

/**
 * Filter transactions based on selected time window
 */
function getFilteredHistory(period = 'all') {
  if (!Array.isArray(AppState.history)) return [];
  if (period === 'all') return [...AppState.history];

  const now = Date.now();
  let cutoff = 0;

  if (period === '30d') {
    cutoff = now - (30 * 24 * 60 * 60 * 1000);
  } else if (period === '90d') {
    cutoff = now - (90 * 24 * 60 * 60 * 1000);
  } else if (period === '3m') {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    cutoff = d.getTime();
  } else if (period === '6m') {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    cutoff = d.getTime();
  }

  return AppState.history.filter(trx => (trx.timestamp || 0) >= cutoff);
}

/**
 * Main render function for Analytics Tab
 */
function renderAnalyticsTab() {
  const period = AppState.analyticsPeriod || 'all';
  const filtered = getFilteredHistory(period);

  const contentContainer = document.getElementById('analytics-content-container');
  const emptyState = document.getElementById('analytics-empty-state');
  const periodSummary = document.getElementById('filter-period-summary');

  // Update Period Summary Badge
  if (periodSummary) {
    const t = I18N[AppState.lang] || I18N.id;
    const labels = {
      'all': t.periodAllTime || 'Semua Riwayat',
      '6m': t.period6Months || '6 Bulan Terakhir',
      '3m': t.period3Months || '3 Bulan Terakhir',
      '90d': t.period90Days || '90 Hari Terakhir',
      '30d': t.period30Days || '30 Hari Terakhir'
    };
    periodSummary.textContent = labels[period] || labels.all;
  }

  // Handle empty state
  if (!filtered || filtered.length === 0) {
    if (contentContainer) contentContainer.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    updateSummaryStats([], 0, 0, {}, 0);
    destroyAllCharts();
    return;
  }

  if (contentContainer) contentContainer.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Process data for charts
  const stats = calculateAnalyticsMetrics(filtered);

  // Update KPI Cards
  updateSummaryStats(filtered, stats.totalSpend, stats.totalSaved, stats.categorySpend, stats.monthCount);

  // Ensure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js library is not yet loaded.');
    return;
  }

  // Render the 3 Charts
  renderCategoryPieChart(stats.categorySpend, stats.totalSpend);
  renderDiscountSavingsChart(filtered, stats.categorySavings, stats.monthlySavings);
  renderOgiveOrHistogramChart(stats.monthlySpendList, stats.dailySpendList);

  if (window.lucide) lucide.createIcons();
}

/**
 * Destroy chart instances to prevent memory leaks and glitchy redraws
 */
function destroyAllCharts() {
  if (categoryPieChartInstance) {
    categoryPieChartInstance.destroy();
    categoryPieChartInstance = null;
  }
  if (discountSavingsChartInstance) {
    discountSavingsChartInstance.destroy();
    discountSavingsChartInstance = null;
  }
  if (ogiveChartInstance) {
    ogiveChartInstance.destroy();
    ogiveChartInstance = null;
  }
}

/**
 * Calculate aggregated metrics from transaction history
 */
function calculateAnalyticsMetrics(transactions) {
  let totalSpend = 0;
  let totalSaved = 0;
  const categorySpend = {};
  const categorySavings = {};
  const monthlySpendMap = new Map();
  const monthlySavingsMap = new Map();
  const dailySpendMap = new Map();

  transactions.forEach(trx => {
    const spend = Number(trx.totalSpend) || 0;
    totalSpend += spend;

    // Group by Month Key (YYYY-MM)
    const dateObj = new Date(trx.timestamp || Date.now());
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = dateObj.toLocaleDateString(AppState.lang === 'en' ? 'en-US' : 'id-ID', {
      month: 'short',
      year: 'numeric'
    });

    if (!monthlySpendMap.has(monthKey)) {
      monthlySpendMap.set(monthKey, { key: monthKey, label: monthLabel, amount: 0, timestamp: dateObj.getTime() });
      monthlySavingsMap.set(monthKey, { key: monthKey, label: monthLabel, amount: 0 });
    }
    monthlySpendMap.get(monthKey).amount += spend;

    // Group by Day Key (YYYY-MM-DD)
    const dayKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    const dayLabel = dateObj.toLocaleDateString(AppState.lang === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short'
    });

    if (!dailySpendMap.has(dayKey)) {
      dailySpendMap.set(dayKey, { key: dayKey, label: dayLabel, amount: 0, count: 0, timestamp: dateObj.getTime() });
    }
    dailySpendMap.get(dayKey).amount += spend;
    dailySpendMap.get(dayKey).count += 1;

    // Process items in this transaction
    if (Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        const cat = item.category || 'Lainnya';
        const itemSpend = Number(item.subtotal) || (Number(item.finalUnitPrice || item.originalPrice || 0) * (item.qty || 1));
        
        categorySpend[cat] = (categorySpend[cat] || 0) + itemSpend;

        // Calculate discount savings
        const orig = Number(item.originalPrice) || 0;
        const finalPrice = Number(item.finalUnitPrice) || orig;
        const qty = Number(item.qty) || 1;
        const itemSavings = Math.max(0, (orig - finalPrice) * qty);

        if (itemSavings > 0) {
          totalSaved += itemSavings;
          categorySavings[cat] = (categorySavings[cat] || 0) + itemSavings;
          monthlySavingsMap.get(monthKey).amount += itemSavings;
        }
      });
    }
  });

  // Sort months chronologically
  const sortedMonths = Array.from(monthlySpendMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  const sortedMonthlySavings = Array.from(monthlySavingsMap.values()).sort((a, b) => a.key.localeCompare(b.key));

  // Sort days chronologically
  const sortedDays = Array.from(dailySpendMap.values()).sort((a, b) => a.key.localeCompare(b.key));

  return {
    totalSpend,
    totalSaved,
    categorySpend,
    categorySavings,
    monthlySpendList: sortedMonths,
    monthlySavings: sortedMonthlySavings,
    dailySpendList: sortedDays,
    monthCount: sortedMonths.length
  };
}

/**
 * Update the 4 key summary metrics cards
 */
function updateSummaryStats(transactions, totalSpend, totalSaved, categorySpend, monthCount) {
  const elTotalSpend = document.getElementById('stat-analytics-total-spend');
  const elTrxCount = document.getElementById('stat-analytics-trx-count');
  const elTotalSaved = document.getElementById('stat-analytics-total-saved');
  const elSavingsPct = document.getElementById('stat-analytics-savings-percent');
  const elTopCat = document.getElementById('stat-analytics-top-cat');
  const elTopCatVal = document.getElementById('stat-analytics-top-cat-val');
  const elAvgMonth = document.getElementById('stat-analytics-avg-month');
  const elMonthCount = document.getElementById('stat-analytics-month-count');

  if (elTotalSpend) elTotalSpend.textContent = formatRupiah(totalSpend);
  if (elTrxCount) {
    elTrxCount.textContent = AppState.lang === 'en'
      ? `${transactions.length} Purchases`
      : `${transactions.length} Transaksi`;
  }

  if (elTotalSaved) elTotalSaved.textContent = formatRupiah(totalSaved);
  if (elSavingsPct) {
    const normalTotal = totalSpend + totalSaved;
    const pct = normalTotal > 0 ? ((totalSaved / normalTotal) * 100).toFixed(1) : 0;
    elSavingsPct.textContent = AppState.lang === 'en'
      ? `${pct}% saved from normal`
      : `${pct}% hemat dari harga normal`;
  }

  // Top category
  let topCatName = '-';
  let topCatAmount = 0;
  for (const [cat, amt] of Object.entries(categorySpend)) {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCatName = cat;
    }
  }

  if (elTopCat) elTopCat.textContent = topCatName;
  if (elTopCatVal) elTopCatVal.textContent = topCatAmount > 0 ? formatRupiah(topCatAmount) : 'Rp 0';

  // Average per month
  const safeMonths = Math.max(1, monthCount || 1);
  const avgMonthly = totalSpend / safeMonths;
  if (elAvgMonth) elAvgMonth.textContent = formatRupiah(Math.round(avgMonthly));
  if (elMonthCount) {
    elMonthCount.textContent = AppState.lang === 'en'
      ? `${monthCount} Months recorded`
      : `${monthCount} Bulan tercatat`;
  }
}

/**
 * Helper to get theme-aware chart colors and fonts
 */
function getChartThemeTokens() {
  const isLight = document.documentElement.getAttribute('data-mode') === 'light' || AppState.themeMode === 'light';
  return {
    textColor: isLight ? '#475569' : '#94a3b8',
    gridColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.07)',
    tooltipBg: isLight ? '#1e293b' : '#0f172a',
    tooltipText: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
  };
}

/**
 * 1. Render Category Spending Pie / Doughnut Chart
 */
function renderCategoryPieChart(categorySpend, totalSpend) {
  const canvas = document.getElementById('category-pie-chart');
  if (!canvas) return;

  const categories = Object.keys(categorySpend);
  if (categories.length === 0) return;

  const tokens = getChartThemeTokens();
  const labels = [];
  const data = [];
  const bgColors = [];
  const borderColors = [];

  // Sort categories by spend descending
  categories.sort((a, b) => categorySpend[b] - categorySpend[a]);

  categories.forEach(cat => {
    const val = categorySpend[cat];
    const theme = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
    labels.push(cat);
    data.push(val);
    bgColors.push(theme.bg);
    borderColors.push(theme.border);
  });

  if (categoryPieChartInstance) {
    categoryPieChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  categoryPieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 700
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: tokens.tooltipBg,
          titleColor: tokens.tooltipText,
          bodyColor: tokens.tooltipText,
          bodyFont: { family: tokens.fontFamily, size: 12 },
          titleFont: { family: tokens.fontFamily, size: 13, weight: 'bold' },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const pct = totalSpend > 0 ? ((val / totalSpend) * 100).toFixed(1) : 0;
              return ` ${formatRupiah(val)} (${pct}%)`;
            }
          }
        }
      },
      onClick: (event, elements) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const cat = labels[index];
          if (cat) {
            openAnalyticsBreakdown({ type: 'category', value: cat });
          }
        }
      },
      onHover: (event, elements) => {
        if (event.native && event.native.target) {
          event.native.target.style.cursor = elements && elements.length ? 'pointer' : 'default';
        }
      }
    }
  });

  // Render Category Breakdown list below pie chart
  renderCategoryBreakdownList(categories, categorySpend, totalSpend);
}

/**
 * Render detailed category legend breakdown rows
 */
function renderCategoryBreakdownList(categories, categorySpend, totalSpend) {
  const listEl = document.getElementById('category-breakdown-list');
  if (!listEl) return;

  listEl.innerHTML = categories.map(cat => {
    const val = categorySpend[cat] || 0;
    const pct = totalSpend > 0 ? ((val / totalSpend) * 100).toFixed(1) : 0;
    const colorInfo = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;

    return `
      <div class="cat-breakdown-row" onclick="openAnalyticsBreakdown({ type: 'category', value: '${escapeHtml(cat)}' })" title="Klik untuk melihat rincian produk kategori ${escapeHtml(cat)}">
        <div class="cat-breakdown-left">
          <span class="cat-color-dot" style="background-color: ${colorInfo.bg}"></span>
          <span>${colorInfo.icon} ${cat}</span>
        </div>
        <div class="cat-breakdown-right">
          <span class="cat-breakdown-amt">${formatRupiah(val)}</span>
          <span class="cat-breakdown-pct">${pct}%</span>
          <i data-lucide="chevron-right" class="cat-breakdown-arrow"></i>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 2. Render Discount Savings Bar Graph (Amount saved from discounts)
 */
function renderDiscountSavingsChart(transactions, categorySavings, monthlySavings) {
  const canvas = document.getElementById('discount-savings-chart');
  if (!canvas) return;

  const mode = AppState.discountChartMode || 'category';
  const tokens = getChartThemeTokens();

  let labels = [];
  let data = [];
  let cats = [];

  if (mode === 'category') {
    cats = Object.keys(categorySavings);
    if (cats.length === 0) {
      labels = [AppState.lang === 'en' ? 'No Discounts' : 'Tanpa Diskon'];
      data = [0];
    } else {
      cats.sort((a, b) => categorySavings[b] - categorySavings[a]);
      labels = cats.map(c => {
        const icon = (CATEGORY_COLORS[c] && CATEGORY_COLORS[c].icon) ? CATEGORY_COLORS[c].icon + ' ' : '';
        return icon + c;
      });
      data = cats.map(c => categorySavings[c]);
    }
  } else {
    // Mode: Month
    if (monthlySavings.length === 0) {
      labels = ['-'];
      data = [0];
    } else {
      labels = monthlySavings.map(m => m.label);
      data = monthlySavings.map(m => m.amount);
    }
  }

  if (discountSavingsChartInstance) {
    discountSavingsChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  // Create Emerald Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
  gradient.addColorStop(1, 'rgba(5, 150, 105, 0.25)');

  discountSavingsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: AppState.lang === 'en' ? 'Discounts Saved' : 'Diskon Dihemat',
        data: data,
        backgroundColor: gradient,
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 36
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 700
      },
      onClick: (event, elements) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          if (mode === 'category') {
            const cat = cats[index];
            if (cat) {
              openAnalyticsBreakdown({ type: 'discount-category', value: cat });
            }
          } else {
            const mObj = monthlySavings[index];
            if (mObj) {
              openAnalyticsBreakdown({ type: 'discount-month', value: mObj.key, label: mObj.label });
            }
          }
        }
      },
      onHover: (event, elements) => {
        if (event.native && event.native.target) {
          event.native.target.style.cursor = elements && elements.length ? 'pointer' : 'default';
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: tokens.tooltipBg,
          titleColor: tokens.tooltipText,
          bodyColor: tokens.tooltipText,
          bodyFont: { family: tokens.fontFamily, size: 12 },
          titleFont: { family: tokens.fontFamily, size: 13, weight: 'bold' },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              return AppState.lang === 'en' ? ` Saved: ${formatRupiah(val)}` : ` Hemat: ${formatRupiah(val)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: tokens.textColor,
            font: { family: tokens.fontFamily, size: 11 }
          }
        },
        y: {
          grid: {
            color: tokens.gridColor
          },
          ticks: {
            color: tokens.textColor,
            font: { family: tokens.fontFamily, size: 10 },
            callback: function(val) {
              if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Jt';
              if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
              return val;
            }
          }
        }
      }
    }
  });
}

/**
 * 3. Render Ogive (Positive & Negative) OR Histogram Chart
 * Supports both Monthly and Daily Granularity
 */
function renderOgiveOrHistogramChart(monthlySpendList, dailySpendList) {
  const canvas = document.getElementById('ogive-chart');
  if (!canvas) return;

  const tokens = getChartThemeTokens();

  // Determine which data series to plot based on granularity
  const isDaily = AppState.ogiveGranularity === 'daily';
  const dataList = isDaily ? (dailySpendList || []) : (monthlySpendList || []);

  if (!dataList || dataList.length === 0) return;

  const isHistogram = AppState.ogiveDisplayType === 'histogram';

  // Update card title & subtitle dynamically
  const titleEl = document.getElementById('chart-ogive-title');
  const subEl = document.getElementById('chart-ogive-sub');
  const iconEl = document.getElementById('chart-ogive-icon');

  if (titleEl) {
    if (isHistogram) {
      titleEl.textContent = isDaily
        ? (AppState.lang === 'en' ? 'Daily Spending Histogram' : 'Histogram Pengeluaran Harian')
        : (AppState.lang === 'en' ? 'Monthly Spending Histogram' : 'Histogram Pengeluaran Bulanan');
    } else {
      titleEl.textContent = isDaily
        ? (AppState.lang === 'en' ? 'Daily Ogive Curves (Positive & Negative)' : 'Kurva Ogive Harian (Positif & Negatif)')
        : (AppState.lang === 'en' ? 'Monthly Ogive Curves (Positive & Negative)' : 'Kurva Ogive Bulanan (Positif & Negatif)');
    }
  }

  if (subEl) {
    if (isHistogram) {
      subEl.textContent = isDaily
        ? (AppState.lang === 'en' ? 'Distribution and frequency of daily shopping amounts' : 'Distribusi frekuensi nominal belanja per hari')
        : (AppState.lang === 'en' ? 'Distribution and frequency of monthly shopping amounts' : 'Distribusi frekuensi nominal belanja per bulan');
    } else {
      subEl.textContent = AppState.lang === 'en'
        ? 'Ascending cumulative spend vs. descending remaining budget countdown'
        : 'Akumulasi total belanja vs. countdown sisa pengeluaran periode';
    }
  }

  if (iconEl) {
    iconEl.setAttribute('data-lucide', isHistogram ? 'bar-chart-2' : 'trending-up');
    if (window.lucide) lucide.createIcons();
  }

  const labels = dataList.map(d => d.label);
  const rawAmounts = dataList.map(d => d.amount);
  const totalPeriodSpend = rawAmounts.reduce((a, b) => a + b, 0);

  if (ogiveChartInstance) {
    ogiveChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');

  if (isHistogram) {
    // ----------------------------------------------------
    // HISTOGRAM MODE: Contiguous distribution bars
    // ----------------------------------------------------
    const barGradient = ctx.createLinearGradient(0, 0, 0, 220);
    barGradient.addColorStop(0, 'rgba(45, 212, 191, 0.85)');
    barGradient.addColorStop(1, 'rgba(13, 148, 136, 0.45)');

    ogiveChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: isDaily
            ? (AppState.lang === 'en' ? 'Daily Spend' : 'Pengeluaran Harian')
            : (AppState.lang === 'en' ? 'Monthly Spend' : 'Pengeluaran Bulanan'),
          data: rawAmounts,
          backgroundColor: barGradient,
          borderColor: '#14b8a6',
          borderWidth: 1.5,
          borderRadius: 4,
          categoryPercentage: 1.0,
          barPercentage: 0.94
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const targetItem = dataList[index];
            if (targetItem) {
              openAnalyticsBreakdown({
                type: isDaily ? 'daily' : 'monthly-item',
                value: targetItem.key,
                label: targetItem.label
              });
            }
          }
        },
        onHover: (event, elements) => {
          if (event.native && event.native.target) {
            event.native.target.style.cursor = elements && elements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: tokens.textColor,
              font: { family: tokens.fontFamily, size: 11, weight: '700' },
              boxWidth: 12
            }
          },
          tooltip: {
            backgroundColor: tokens.tooltipBg,
            titleColor: tokens.tooltipText,
            bodyColor: tokens.tooltipText,
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                return ` ${formatRupiah(val)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: tokens.gridColor },
            ticks: { color: tokens.textColor, font: { family: tokens.fontFamily, size: 11 } }
          },
          y: {
            grid: { color: tokens.gridColor },
            ticks: {
              color: tokens.textColor,
              font: { family: tokens.fontFamily, size: 10 },
              callback: function(val) {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Jt';
                if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
                return val;
              }
            }
          }
        }
      }
    });

  } else {
    // ----------------------------------------------------
    // OGIVE MODE: Positive (Ascending) & Negative (Descending)
    // ----------------------------------------------------
    const positiveOgive = [];
    const negativeOgive = [];

    let runningAsc = 0;
    for (let i = 0; i < rawAmounts.length; i++) {
      runningAsc += rawAmounts[i];
      positiveOgive.push(runningAsc);

      // Negative Ogive: Remaining cumulative sum from point i to the end
      // N(i) = sum(rawAmounts[i ... n]) = totalPeriodSpend - positiveOgive[i-1]
      let rem = 0;
      for (let j = i; j < rawAmounts.length; j++) {
        rem += rawAmounts[j];
      }
      negativeOgive.push(rem);
    }

    // Gradient under positive curve
    const posGradient = ctx.createLinearGradient(0, 0, 0, 240);
    posGradient.addColorStop(0, 'rgba(45, 212, 191, 0.35)');
    posGradient.addColorStop(0.7, 'rgba(45, 212, 191, 0.08)');
    posGradient.addColorStop(1, 'rgba(45, 212, 191, 0.0)');

    ogiveChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: AppState.lang === 'en' ? 'Positive Ogive (Cumulative Spend)' : 'Ogive (+) Kumulatif Naik',
            data: positiveOgive,
            borderColor: '#10b981',
            borderWidth: 3,
            backgroundColor: posGradient,
            fill: true,
            tension: 0.35,
            pointRadius: 4.5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2.5
          },
          {
            label: AppState.lang === 'en' ? 'Negative Ogive (Remaining Spend)' : 'Ogive (-) Kumulatif Turun (Sisa)',
            data: negativeOgive,
            borderColor: '#f43f5e',
            borderWidth: 2.5,
            borderDash: [5, 4],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#f43f5e',
            pointBorderWidth: 2
          },
          {
            label: isDaily
              ? (AppState.lang === 'en' ? 'Daily Spend' : 'Belanja Hari Ini')
              : (AppState.lang === 'en' ? 'Monthly Spend' : 'Belanja Bulan Ini'),
            data: rawAmounts,
            type: 'bar',
            backgroundColor: 'rgba(148, 163, 184, 0.18)',
            borderColor: 'rgba(148, 163, 184, 0.35)',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 20,
            order: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        animation: { duration: 750, easing: 'easeOutQuart' },
        onClick: (event, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const targetItem = dataList[index];
            if (targetItem) {
              openAnalyticsBreakdown({
                type: isDaily ? 'daily' : 'monthly-item',
                value: targetItem.key,
                label: targetItem.label
              });
            }
          }
        },
        onHover: (event, elements) => {
          if (event.native && event.native.target) {
            event.native.target.style.cursor = elements && elements.length ? 'pointer' : 'default';
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: tokens.textColor,
              font: { family: tokens.fontFamily, size: 10.5, weight: '600' },
              boxWidth: 12,
              padding: 8
            }
          },
          tooltip: {
            backgroundColor: tokens.tooltipBg,
            titleColor: tokens.tooltipText,
            bodyColor: tokens.tooltipText,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const val = context.raw || 0;
                if (context.datasetIndex === 0) {
                  return AppState.lang === 'en'
                    ? ` Ogive (+) Cumulative: ${formatRupiah(val)}`
                    : ` Ogive (+) Kumulatif Naik: ${formatRupiah(val)}`;
                } else if (context.datasetIndex === 1) {
                  return AppState.lang === 'en'
                    ? ` Ogive (-) Remaining: ${formatRupiah(val)}`
                    : ` Ogive (-) Sisa Periode: ${formatRupiah(val)}`;
                } else {
                  return isDaily
                    ? ` Belanja Hari Ini: ${formatRupiah(val)}`
                    : ` Belanja Bulan Ini: ${formatRupiah(val)}`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: tokens.gridColor },
            ticks: { color: tokens.textColor, font: { family: tokens.fontFamily, size: 11 } }
          },
          y: {
            grid: { color: tokens.gridColor },
            ticks: {
              color: tokens.textColor,
              font: { family: tokens.fontFamily, size: 10 },
              callback: function(val) {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Jt';
                if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
                return val;
              }
            }
          }
        }
      }
    });
  }
}

/**
 * Multi-Month Realistic Sample Generator for testing charts
 */
function loadMultiMonthSampleData() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const samples = [
    {
      id: 'sample_trx_1',
      monthName: AppState.lang === 'en' ? 'July Grocery Stock' : 'Belanja Kos Juli',
      timestamp: now - (92 * dayMs),
      budgetCap: 500000,
      totalSpend: 382000,
      items: [
        { id: 's1', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, originalPrice: 75000, discountString: '10', finalUnitPrice: 67500, subtotal: 67500 },
        { id: 's2', name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'liter', qty: 2, originalPrice: 38000, discountString: '20', finalUnitPrice: 30400, subtotal: 60800 },
        { id: 's3', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 2, originalPrice: 31000, discountString: '', finalUnitPrice: 31000, subtotal: 62000 },
        { id: 's4', name: 'Mie Goreng Dus', category: 'Makanan Instan', unit: 'pack', qty: 1, originalPrice: 120000, discountString: '15', finalUnitPrice: 102000, subtotal: 102000 },
        { id: 's5', name: 'Sabun Mandi Pack', category: 'Perlengkapan Mandi', unit: 'pack', qty: 1, originalPrice: 42000, discountString: '25', finalUnitPrice: 31500, subtotal: 31500 },
        { id: 's6', name: 'Biskuit Roma Kelapa', category: 'Camilan', unit: 'pack', qty: 4, originalPrice: 16000, discountString: '50+20', finalUnitPrice: 6400, subtotal: 25600 },
        { id: 's7', name: 'Garam & Kecap Manis', category: 'Bumbu & Masak', unit: 'botol', qty: 2, originalPrice: 16300, discountString: '', finalUnitPrice: 16300, subtotal: 32600 }
      ]
    },
    {
      id: 'sample_trx_2',
      monthName: AppState.lang === 'en' ? 'August Mid-Month' : 'Belanja Kos Agustus',
      timestamp: now - (63 * dayMs),
      budgetCap: 500000,
      totalSpend: 428000,
      items: [
        { id: 's8', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, originalPrice: 75000, discountString: '', finalUnitPrice: 75000, subtotal: 75000 },
        { id: 's9', name: 'Deterjen Bubuk 1.8kg', category: 'Perlengkapan Cuci', unit: 'pack', qty: 1, originalPrice: 38000, discountString: '20', finalUnitPrice: 30400, subtotal: 30400 },
        { id: 's10', name: 'Pembersih Lantai', category: 'Perlengkapan Cuci', unit: 'botol', qty: 1, originalPrice: 22000, discountString: '10', finalUnitPrice: 19800, subtotal: 19800 },
        { id: 's11', name: 'Susu UHT Cokelat 1L', category: 'Makanan Instan', unit: 'pcs', qty: 3, originalPrice: 20000, discountString: '50+20', finalUnitPrice: 8000, subtotal: 24000 },
        { id: 's12', name: 'Kopi Kapal Api Bag', category: 'Makanan Instan', unit: 'pack', qty: 2, originalPrice: 28000, discountString: '', finalUnitPrice: 28000, subtotal: 56000 },
        { id: 's13', name: 'Daging Ayam Fillet', category: 'Bahan Pokok', unit: 'kg', qty: 2, originalPrice: 52000, discountString: '10', finalUnitPrice: 46800, subtotal: 93600 },
        { id: 's14', name: 'Keripik Kentang', category: 'Camilan', unit: 'pack', qty: 3, originalPrice: 18000, discountString: '20', finalUnitPrice: 14400, subtotal: 43200 },
        { id: 's15', name: 'Pasta Gigi & Sikat', category: 'Perlengkapan Mandi', unit: 'pack', qty: 2, originalPrice: 22000, discountString: '50', finalUnitPrice: 11000, subtotal: 22000 },
        { id: 's16', name: 'Bawang Merah & Putih', category: 'Bumbu & Masak', unit: 'kg', qty: 1, originalPrice: 34000, discountString: '', finalUnitPrice: 34000, subtotal: 34000 },
        { id: 's17', name: 'Tisu Toilet 4-Roll', category: 'Lainnya', unit: 'pack', qty: 1, originalPrice: 30000, discountString: '', finalUnitPrice: 30000, subtotal: 30000 }
      ]
    },
    {
      id: 'sample_trx_3',
      monthName: AppState.lang === 'en' ? 'September Essentials' : 'Belanja Kos September',
      timestamp: now - (31 * dayMs),
      budgetCap: 500000,
      totalSpend: 395000,
      items: [
        { id: 's18', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, originalPrice: 74000, discountString: '10', finalUnitPrice: 66600, subtotal: 66600 },
        { id: 's19', name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'liter', qty: 1, originalPrice: 36000, discountString: '', finalUnitPrice: 36000, subtotal: 36000 },
        { id: 's20', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 2, originalPrice: 29000, discountString: '', finalUnitPrice: 29000, subtotal: 58000 },
        { id: 's21', name: 'Nugget Ayam 500g', category: 'Makanan Instan', unit: 'pack', qty: 2, originalPrice: 48000, discountString: '25', finalUnitPrice: 36000, subtotal: 72000 },
        { id: 's22', name: 'Pewangi Pakaian', category: 'Perlengkapan Cuci', unit: 'pack', qty: 2, originalPrice: 24000, discountString: '50+20', finalUnitPrice: 9600, subtotal: 19200 },
        { id: 's23', name: 'Sabun Cuci Piring', category: 'Perlengkapan Cuci', unit: 'pack', qty: 2, originalPrice: 17000, discountString: '', finalUnitPrice: 17000, subtotal: 34000 },
        { id: 's24', name: 'Wafer Cokelat Kaleng', category: 'Camilan', unit: 'kaleng', qty: 1, originalPrice: 38000, discountString: '30', finalUnitPrice: 26600, subtotal: 26600 },
        { id: 's25', name: 'Bumbu Racik Instan', category: 'Bumbu & Masak', unit: 'pack', qty: 6, originalPrice: 4500, discountString: '', finalUnitPrice: 4500, subtotal: 27000 },
        { id: 's26', name: 'Shampo Anti Ketombe', category: 'Perlengkapan Mandi', unit: 'botol', qty: 1, originalPrice: 32000, discountString: '20', finalUnitPrice: 25600, subtotal: 25600 },
        { id: 's27', name: 'Kantong Sampah Roll', category: 'Lainnya', unit: 'pack', qty: 2, originalPrice: 15000, discountString: '', finalUnitPrice: 15000, subtotal: 30000 }
      ]
    },
    {
      id: 'sample_trx_4',
      monthName: AppState.lang === 'en' ? 'October Fresh Market' : 'Belanja Kos Oktober',
      timestamp: now - (5 * dayMs),
      budgetCap: 500000,
      totalSpend: 310000,
      items: [
        { id: 's28', name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, originalPrice: 74000, discountString: '10', finalUnitPrice: 66600, subtotal: 66600 },
        { id: 's29', name: 'Telur Ayam 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 2, originalPrice: 28500, discountString: '', finalUnitPrice: 28500, subtotal: 57000 },
        { id: 's30', name: 'Mie Instan Kuah 10pcs', category: 'Makanan Instan', unit: 'pack', qty: 1, originalPrice: 35000, discountString: '', finalUnitPrice: 35000, subtotal: 35000 },
        { id: 's31', name: 'Sabun Mandi Refill 450ml', category: 'Perlengkapan Mandi', unit: 'pack', qty: 2, originalPrice: 28000, discountString: '50+20', finalUnitPrice: 11200, subtotal: 22400 },
        { id: 's32', name: 'Deterjen Cair Matic', category: 'Perlengkapan Cuci', unit: 'pack', qty: 1, originalPrice: 36000, discountString: '20', finalUnitPrice: 28800, subtotal: 28800 },
        { id: 's33', name: 'Camilan Kacang & Keripik', category: 'Camilan', unit: 'pack', qty: 3, originalPrice: 17000, discountString: '15', finalUnitPrice: 14450, subtotal: 43350 },
        { id: 's34', name: 'Kecap & Sambal Botol', category: 'Bumbu & Masak', unit: 'botol', qty: 2, originalPrice: 18000, discountString: '', finalUnitPrice: 18000, subtotal: 36000 },
        { id: 's35', name: 'Spons Cuci & Plastik Wrap', category: 'Lainnya', unit: 'pcs', qty: 1, originalPrice: 20850, discountString: '', finalUnitPrice: 20850, subtotal: 20850 }
      ]
    }
  ];

  AppState.history = samples;
  saveHistoryToStorage();
  renderHistoryTab();
  updateComparatorBadges();
  renderAnalyticsTab();

  showToast(AppState.lang === 'en'
    ? 'Sample multi-month shopping data loaded successfully!'
    : 'Data sampel belanja 4 bulan berhasil dimuat!');
}

/**
 * Active breakdown modal state
 */
let currentBreakdownConfig = null;

/**
 * Open Analytics Breakdown Bottom Sheet Modal
 */
function openAnalyticsBreakdown(config) {
  const modal = document.getElementById('analytics-breakdown-modal');
  if (!modal) return;

  currentBreakdownConfig = config;
  const searchInput = document.getElementById('analytics-breakdown-search-input');
  if (searchInput) searchInput.value = '';

  renderBreakdownContent('');
  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

/**
 * Close Analytics Breakdown Bottom Sheet Modal
 */
function closeAnalyticsBreakdown() {
  const modal = document.getElementById('analytics-breakdown-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Open History Detail Modal from inside Breakdown Modal
 */
function openHistoryDetailFromBreakdown(trxId) {
  closeAnalyticsBreakdown();
  if (typeof openHistoryDetail === 'function') {
    openHistoryDetail(trxId);
  }
}

/**
 * Render Breakdown Content based on currentBreakdownConfig and search query
 */
function renderBreakdownContent(searchQuery = '') {
  if (!currentBreakdownConfig) return;

  const titleEl = document.getElementById('analytics-breakdown-title');
  const subEl = document.getElementById('analytics-breakdown-subtitle');
  const iconWrap = document.getElementById('analytics-breakdown-icon-wrap');
  const iconEl = document.getElementById('analytics-breakdown-icon');
  const statTotal = document.getElementById('breakdown-stat-total');
  const statSaved = document.getElementById('breakdown-stat-saved');
  const statCount = document.getElementById('breakdown-stat-count');
  const contentEl = document.getElementById('analytics-breakdown-content');

  const period = AppState.analyticsPeriod || 'all';
  const transactions = getFilteredHistory(period);
  const q = (searchQuery || '').trim().toLowerCase();

  let title = 'Rincian Transaksi & Produk';
  let subtitle = 'Semua transaksi dan produk yang berkontribusi';
  let iconName = 'layers';
  let iconBgClass = 'bg-brand';

  // Filter function for items
  let itemFilter = (item, trx) => true;

  if (currentBreakdownConfig.type === 'all') {
    title = AppState.lang === 'en' ? 'All Purchases & Products' : 'Rincian Seluruh Transaksi & Produk';
    subtitle = AppState.lang === 'en' ? 'Every purchase and product in the selected period' : 'Daftar semua belanjaan dan produk pada periode terpilih';
    iconName = 'credit-card';
    iconBgClass = 'bg-brand';
    itemFilter = () => true;
  } else if (currentBreakdownConfig.type === 'discounts' || currentBreakdownConfig.type === 'discount-all') {
    title = AppState.lang === 'en' ? 'Discount Savings Breakdown' : 'Rincian Penghematan Diskon';
    subtitle = AppState.lang === 'en' ? 'All items and purchases with promo discounts' : 'Produk dan transaksi yang mendapatkan potongan harga promo';
    iconName = 'tag';
    iconBgClass = 'bg-emerald';
    itemFilter = (item) => {
      const orig = Number(item.originalPrice) || 0;
      const finalP = Number(item.finalUnitPrice) || orig;
      return (orig - finalP) > 0 || !!item.discountString;
    };
  } else if (currentBreakdownConfig.type === 'category') {
    const cat = currentBreakdownConfig.value || 'Semua';
    title = AppState.lang === 'en' ? `Category: ${cat}` : `Kategori: ${cat}`;
    subtitle = AppState.lang === 'en' ? `Purchased products under "${cat}"` : `Produk yang dibeli dalam kategori "${cat}"`;
    iconName = 'pie-chart';
    iconBgClass = 'bg-amber';
    itemFilter = (item) => (item.category || 'Lainnya') === cat;
  } else if (currentBreakdownConfig.type === 'top-cat') {
    const stats = calculateAnalyticsMetrics(transactions);
    let topCatName = '-';
    let topCatAmount = 0;
    for (const [c, amt] of Object.entries(stats.categorySpend)) {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        topCatName = c;
      }
    }
    title = AppState.lang === 'en' ? `Top Category: ${topCatName}` : `Kategori Terbesar: ${topCatName}`;
    subtitle = AppState.lang === 'en' ? `Largest spending category in selected period` : `Kategori pengeluaran terbesar pada periode ini`;
    iconName = 'pie-chart';
    iconBgClass = 'bg-amber';
    itemFilter = (item) => (item.category || 'Lainnya') === topCatName;
  } else if (currentBreakdownConfig.type === 'monthly') {
    title = AppState.lang === 'en' ? 'Monthly Purchases Breakdown' : 'Rincian Belanja per Bulan';
    subtitle = AppState.lang === 'en' ? 'Timeline of monthly transactions and goods' : 'Rincian transaksi belanja dan barang tiap bulan';
    iconName = 'trending-up';
    iconBgClass = 'bg-indigo';
    itemFilter = () => true;
  } else if (currentBreakdownConfig.type === 'discount-category') {
    const cat = currentBreakdownConfig.value || 'Semua';
    title = AppState.lang === 'en' ? `Discounts in: ${cat}` : `Diskon Kategori: ${cat}`;
    subtitle = AppState.lang === 'en' ? `Discounted items under category "${cat}"` : `Produk berdiskon di bawah kategori "${cat}"`;
    iconName = 'tag';
    iconBgClass = 'bg-emerald';
    itemFilter = (item) => {
      const matchCat = (item.category || 'Lainnya') === cat;
      const orig = Number(item.originalPrice) || 0;
      const finalP = Number(item.finalUnitPrice) || orig;
      return matchCat && ((orig - finalP) > 0 || !!item.discountString);
    };
  } else if (currentBreakdownConfig.type === 'discount-month') {
    const mLabel = currentBreakdownConfig.label || currentBreakdownConfig.value || '';
    title = AppState.lang === 'en' ? `Discounts in: ${mLabel}` : `Diskon Bulan: ${mLabel}`;
    subtitle = AppState.lang === 'en' ? `Discounts and promo savings during ${mLabel}` : `Penghematan diskon belanja pada ${mLabel}`;
    iconName = 'calendar';
    iconBgClass = 'bg-emerald';
    itemFilter = (item, trx) => {
      const d = new Date(trx.timestamp || Date.now());
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const matchMonth = mKey === currentBreakdownConfig.value || trx.monthName === currentBreakdownConfig.value;
      const orig = Number(item.originalPrice) || 0;
      const finalP = Number(item.finalUnitPrice) || orig;
      return matchMonth && ((orig - finalP) > 0 || !!item.discountString);
    };
  } else if (currentBreakdownConfig.type === 'monthly-item') {
    const mLabel = currentBreakdownConfig.label || currentBreakdownConfig.value || '';
    title = AppState.lang === 'en' ? `Purchases in: ${mLabel}` : `Belanja Bulan: ${mLabel}`;
    subtitle = AppState.lang === 'en' ? `All items bought in ${mLabel}` : `Seluruh barang yang dibeli pada ${mLabel}`;
    iconName = 'calendar';
    iconBgClass = 'bg-indigo';
    itemFilter = (item, trx) => {
      const d = new Date(trx.timestamp || Date.now());
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mKey === currentBreakdownConfig.value || trx.monthName === currentBreakdownConfig.value;
    };
  } else if (currentBreakdownConfig.type === 'daily') {
    const dLabel = currentBreakdownConfig.label || currentBreakdownConfig.value || '';
    title = AppState.lang === 'en' ? `Purchases on: ${dLabel}` : `Belanja Tanggal: ${dLabel}`;
    subtitle = AppState.lang === 'en' ? `All items bought on this date` : `Seluruh barang yang dibeli pada tanggal ini`;
    iconName = 'calendar';
    iconBgClass = 'bg-brand';
    itemFilter = (item, trx) => {
      const d = new Date(trx.timestamp || Date.now());
      const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dKey === currentBreakdownConfig.value;
    };
  }

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (iconEl) iconEl.setAttribute('data-lucide', iconName);
  if (iconWrap) {
    iconWrap.className = `icon-circle ${iconBgClass}`;
  }

  // Filter transactions and items
  let totalMatchingSpend = 0;
  let totalMatchingSaved = 0;
  let totalMatchingProducts = 0;
  const matchingTrxList = [];

  transactions.forEach(trx => {
    if (!Array.isArray(trx.items)) return;

    const matchingItems = trx.items.filter(item => {
      if (!itemFilter(item, trx)) return false;
      if (q) {
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const catMatch = (item.category || '').toLowerCase().includes(q);
        const storeMatch = (trx.monthName || '').toLowerCase().includes(q);
        return nameMatch || catMatch || storeMatch;
      }
      return true;
    });

    if (matchingItems.length > 0) {
      let trxSpend = 0;
      let trxSaved = 0;

      matchingItems.forEach(item => {
        const orig = Number(item.originalPrice) || 0;
        const finalP = Number(item.finalUnitPrice) || orig;
        const qty = Number(item.qty) || 1;
        const itemSubtotal = Number(item.subtotal) || (finalP * qty);
        const itemSavings = Math.max(0, (orig - finalP) * qty);

        trxSpend += itemSubtotal;
        trxSaved += itemSavings;
        totalMatchingProducts += qty;
      });

      totalMatchingSpend += trxSpend;
      totalMatchingSaved += trxSaved;

      matchingTrxList.push({
        trx,
        items: matchingItems,
        trxSpend,
        trxSaved
      });
    }
  });

  // Update Summary Stats Chips
  if (statTotal) statTotal.textContent = formatRupiah(totalMatchingSpend);
  if (statSaved) statSaved.textContent = formatRupiah(totalMatchingSaved);
  if (statCount) {
    statCount.textContent = `${totalMatchingProducts} ${AppState.lang === 'en' ? 'Items' : 'Produk'} / ${matchingTrxList.length} Trx`;
  }

  // Render cards
  if (!contentEl) return;

  if (matchingTrxList.length === 0) {
    contentEl.innerHTML = `
      <div class="breakdown-empty-state">
        <i data-lucide="inbox"></i>
        <h4>${AppState.lang === 'en' ? 'No Matching Items Found' : 'Tidak Ada Data Produk Ditemukan'}</h4>
        <p>${q ? (AppState.lang === 'en' ? 'Try searching with another keyword.' : 'Coba kata kunci pencarian lain.') : (AppState.lang === 'en' ? 'No items in this period.' : 'Belum ada produk untuk periode ini.')}</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const locale = AppState.lang === 'en' ? 'en-US' : 'id-ID';

  contentEl.innerHTML = matchingTrxList.map(({ trx, items, trxSpend, trxSaved }) => {
    const dateFormatted = new Date(trx.timestamp || Date.now()).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return `
      <div class="breakdown-trx-card">
        <div class="breakdown-trx-header" onclick="openHistoryDetailFromBreakdown('${trx.id}')" title="Klik untuk membuka detail riwayat transaksi">
          <div class="breakdown-trx-meta">
            <span class="breakdown-trx-date"><i data-lucide="calendar"></i> ${dateFormatted}</span>
            <span class="breakdown-trx-badge">${escapeHtml(trx.monthName || (AppState.lang === 'en' ? 'Trip' : 'Belanja'))}</span>
          </div>
          <div class="breakdown-trx-total-wrap">
            <span class="breakdown-trx-sum">${formatRupiah(trxSpend)}</span>
            <span class="breakdown-detail-btn">${AppState.lang === 'en' ? 'Detail' : 'Detail'} <i data-lucide="chevron-right"></i></span>
          </div>
        </div>

        <div class="breakdown-items-list">
          ${items.map(item => {
            const cat = item.category || 'Lainnya';
            const catColor = CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR;
            const orig = Number(item.originalPrice) || 0;
            const finalP = Number(item.finalUnitPrice) || orig;
            const qty = Number(item.qty) || 1;
            const itemSubtotal = Number(item.subtotal) || (finalP * qty);
            const itemSavings = Math.max(0, (orig - finalP) * qty);

            return `
              <div class="breakdown-item-row">
                <div class="breakdown-item-left">
                  <span class="breakdown-item-icon">${catColor.icon || '📦'}</span>
                  <div class="breakdown-item-info">
                    <strong class="breakdown-item-name">${escapeHtml(item.name)}</strong>
                    <div class="breakdown-item-tags">
                      <span class="breakdown-item-cat-badge" style="background:${catColor.bg}22; color:${catColor.border}; border-color:${catColor.border}55;">
                        ${escapeHtml(cat)}
                      </span>
                      <span class="breakdown-item-calc">
                        ${qty} ${escapeHtml(item.unit || 'pcs')} × ${formatRupiah(finalP)}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="breakdown-item-right">
                  <strong class="breakdown-item-subtotal">${formatRupiah(itemSubtotal)}</strong>
                  ${itemSavings > 0 ? `
                    <span class="breakdown-saving-pill" title="Diskon: ${escapeHtml(item.discountString || '')}">
                      <i data-lucide="tag"></i> Hemat ${formatRupiah(itemSavings)}
                    </span>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

window.openAnalyticsBreakdown = openAnalyticsBreakdown;
window.closeAnalyticsBreakdown = closeAnalyticsBreakdown;
window.openHistoryDetailFromBreakdown = openHistoryDetailFromBreakdown;

/**
 * Initialize event listeners for the Analytics Tab
 */
function initAnalyticsEvents() {
  // Period filter pills
  const periodContainer = document.getElementById('analytics-period-filters');
  if (periodContainer) {
    periodContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.period-pill');
      if (!pill) return;
      const period = pill.getAttribute('data-period');
      if (!period) return;

      AppState.analyticsPeriod = period;

      periodContainer.querySelectorAll('.period-pill').forEach(p => {
        p.classList.toggle('active', p === pill);
      });

      renderAnalyticsTab();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-analytics-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderAnalyticsTab();
      showToast(AppState.lang === 'en' ? 'Charts refreshed!' : 'Grafik disegarkan!');
    });
  }

  // 4 Top Key Metric Summary Cards Click Triggers (Breakdown)
  const cardTotalSpend = document.getElementById('stat-card-total-spend');
  const cardTotalSaved = document.getElementById('stat-card-total-saved');
  const cardTopCat = document.getElementById('stat-card-top-cat');
  const cardAvgMonth = document.getElementById('stat-card-avg-month');

  if (cardTotalSpend) {
    cardTotalSpend.addEventListener('click', () => openAnalyticsBreakdown({ type: 'all' }));
  }
  if (cardTotalSaved) {
    cardTotalSaved.addEventListener('click', () => openAnalyticsBreakdown({ type: 'discounts' }));
  }
  if (cardTopCat) {
    cardTopCat.addEventListener('click', () => openAnalyticsBreakdown({ type: 'top-cat' }));
  }
  if (cardAvgMonth) {
    cardAvgMonth.addEventListener('click', () => openAnalyticsBreakdown({ type: 'monthly' }));
  }

  // Breakdown modal close handlers & live search
  const closeBreakdownBtn = document.getElementById('close-analytics-breakdown-btn');
  const closeBreakdownBackdrop = document.getElementById('close-analytics-breakdown-backdrop');
  const breakdownSearchInput = document.getElementById('analytics-breakdown-search-input');

  if (closeBreakdownBtn) {
    closeBreakdownBtn.addEventListener('click', closeAnalyticsBreakdown);
  }
  if (closeBreakdownBackdrop) {
    closeBreakdownBackdrop.addEventListener('click', closeAnalyticsBreakdown);
  }
  if (breakdownSearchInput) {
    breakdownSearchInput.addEventListener('input', (e) => {
      renderBreakdownContent(e.target.value);
    });
  }

  // Bar chart mode toggle (category vs month)
  const toggleCat = document.getElementById('toggle-disc-cat');
  const toggleMonth = document.getElementById('toggle-disc-month');

  if (toggleCat) {
    toggleCat.addEventListener('click', () => {
      AppState.discountChartMode = 'category';
      toggleCat.classList.add('active');
      if (toggleMonth) toggleMonth.classList.remove('active');
      renderAnalyticsTab();
    });
  }

  if (toggleMonth) {
    toggleMonth.addEventListener('click', () => {
      AppState.discountChartMode = 'month';
      toggleMonth.classList.add('active');
      if (toggleCat) toggleCat.classList.remove('active');
      renderAnalyticsTab();
    });
  }

  // Ogive Granularity Toggles (Bulanan vs Harian)
  const granMonthly = document.getElementById('toggle-gran-monthly');
  const granDaily = document.getElementById('toggle-gran-daily');

  if (granMonthly && granDaily) {
    granMonthly.addEventListener('click', () => {
      AppState.ogiveGranularity = 'monthly';
      granMonthly.classList.add('active');
      granDaily.classList.remove('active');
      renderAnalyticsTab();
    });

    granDaily.addEventListener('click', () => {
      AppState.ogiveGranularity = 'daily';
      granDaily.classList.add('active');
      granMonthly.classList.remove('active');
      renderAnalyticsTab();
    });
  }

  // Ogive vs Histogram Display Mode Toggles
  const typeOgive = document.getElementById('toggle-type-ogive');
  const typeHistogram = document.getElementById('toggle-type-histogram');

  if (typeOgive && typeHistogram) {
    typeOgive.addEventListener('click', () => {
      AppState.ogiveDisplayType = 'ogive';
      typeOgive.classList.add('active');
      typeHistogram.classList.remove('active');
      renderAnalyticsTab();
    });

    typeHistogram.addEventListener('click', () => {
      AppState.ogiveDisplayType = 'histogram';
      typeHistogram.classList.add('active');
      typeOgive.classList.remove('active');
      renderAnalyticsTab();
    });
  }

  // Load sample button in empty state
  const loadSampleBtn = document.getElementById('load-sample-analytics-btn');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', loadMultiMonthSampleData);
  }
}
