/**
 * Theme & Appearance Manager
 * Smart Grocery & Budget Safety Tracker
 * 
 * Supports Built-in Visual Themes with Dark & Light Mode:
 * 1. mint (Shopping Tracker Mint Green - matches icons/shoppingtracker.png)
 * 2. midnight (Slate Blue)
 * 3. emerald (Supermarket Green)
 * 4. sunset (Tangerine Amber)
 * 5. violet (Cyberpunk Lavender)
 * 6. rose (Berry Coral)
 * + Unlimited User-Created Custom Themes with Color Grid & Hex Code options!
 */

const THEME_META_COLORS = {
  mint: { dark: '#021a15', light: '#f0fdfa' },
  midnight: { dark: '#090d16', light: '#f8fafc' },
  emerald: { dark: '#041812', light: '#f0fdf4' },
  sunset: { dark: '#170d04', light: '#fff7ed' },
  violet: { dark: '#100620', light: '#faf5ff' },
  rose: { dark: '#18050b', light: '#fff1f2' }
};

const THEME_DISPLAY_NAMES = {
  mint: 'Mint Tracker',
  midnight: 'Midnight Slate',
  emerald: 'Emerald Supermarket',
  sunset: 'Sunset Tangerine',
  violet: 'Cyberpunk Violet',
  rose: 'Rose Berry'
};

/**
 * Initialize theme and mode on page load
 */
function initTheme() {
  loadCustomThemesFromStorage();

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'mint';
  const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) || 'dark';

  AppState.theme = savedTheme;
  AppState.themeMode = savedMode;

  applyThemeToDOM(savedTheme, savedMode);
  updateThemeUI(savedTheme, savedMode);
  renderCustomThemesList();
  initCustomThemeCreatorEvents();
}

/**
 * Load Custom Themes from localStorage
 */
function loadCustomThemesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_THEMES);
    AppState.customThemes = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(AppState.customThemes)) AppState.customThemes = [];
  } catch (e) {
    console.error('Failed loading custom themes:', e);
    AppState.customThemes = [];
  }
}

/**
 * Save Custom Themes to localStorage
 */
function saveCustomThemesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(AppState.customThemes));
  } catch (e) {
    console.error('Failed saving custom themes:', e);
  }
}

/**
 * Convert Hex color to RGB object
 */
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 45, g: 212, b: 191 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Apply theme and mode data attributes to <html> and <meta theme-color>
 */
function applyThemeToDOM(theme, mode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-mode', mode);

  // Check if this is a custom theme
  const customTheme = AppState.customThemes.find(ct => ct.id === theme);
  let customStyleTag = document.getElementById('custom-theme-dynamic-styles');

  if (customTheme) {
    if (!customStyleTag) {
      customStyleTag = document.createElement('style');
      customStyleTag.id = 'custom-theme-dynamic-styles';
      document.head.appendChild(customStyleTag);
    }
    const rgb = hexToRgb(customTheme.primaryColor);
    const hex = customTheme.primaryColor;

    if (mode === 'dark') {
      customStyleTag.innerHTML = `
        [data-theme="${customTheme.id}"][data-mode="dark"] {
          --color-brand: ${hex};
          --color-brand-glow: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35);
          --border-focus: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6);
          --border-subtle: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2);
          --bg-body: #060a0f;
          --bg-app: #0a0f17;
          --bg-surface: #0f1724;
          --bg-surface-elevated: #162032;
          --bg-surface-hover: #1e2c44;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --text-subtle: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85);
        }
      `;
    } else {
      customStyleTag.innerHTML = `
        [data-theme="${customTheme.id}"][data-mode="light"] {
          --color-brand: ${hex};
          --color-brand-glow: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25);
          --border-focus: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5);
          --border-subtle: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16);
          --bg-body: #f1f5f9;
          --bg-app: #f8fafc;
          --bg-surface: #ffffff;
          --bg-surface-elevated: #f8fafc;
          --bg-surface-hover: #e2e8f0;
          --text-main: #0f172a;
          --text-muted: #475569;
          --text-subtle: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9);
        }
      `;
    }

    // Update browser theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? '#0a0f17' : '#f8fafc');
    }
  } else {
    if (customStyleTag) customStyleTag.innerHTML = '';
    // Update mobile browser address bar theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor && THEME_META_COLORS[theme] && THEME_META_COLORS[theme][mode]) {
      metaThemeColor.setAttribute('content', THEME_META_COLORS[theme][mode]);
    }
  }
}

/**
 * Update UI icons, pills, and swatch cards to match current theme
 */
function updateThemeUI(theme, mode) {
  // 1. Update Header & Drawer Quick Toggle Icon
  const modeBtnIcon = document.getElementById('mode-toggle-icon');
  if (modeBtnIcon) {
    const targetIcon = mode === 'dark' ? 'sun' : 'moon';
    modeBtnIcon.setAttribute('data-lucide', targetIcon);
  }

  const drawerModeIcon = document.getElementById('drawer-mode-icon');
  if (drawerModeIcon) {
    drawerModeIcon.setAttribute('data-lucide', mode === 'dark' ? 'sun' : 'moon');
  }

  const drawerModeDesc = document.getElementById('drawer-mode-state-desc');
  if (drawerModeDesc) {
    drawerModeDesc.textContent = mode === 'dark'
      ? (AppState.lang === 'en' ? 'Dark Mode (Active)' : 'Mode Gelap (Aktif)')
      : (AppState.lang === 'en' ? 'Light Mode (Active)' : 'Mode Terang (Aktif)');
  }

  // 2. Update Settings Tab Mode Segmented Pills
  const pillDark = document.getElementById('pill-mode-dark');
  const pillLight = document.getElementById('pill-mode-light');

  if (pillDark) pillDark.classList.toggle('active', mode === 'dark');
  if (pillLight) pillLight.classList.toggle('active', mode === 'light');

  // 3. Update Settings Tab Built-in Theme Swatches
  const swatchCards = document.querySelectorAll('.theme-swatch-card');
  swatchCards.forEach(card => {
    const cardTheme = card.getAttribute('data-theme');
    card.classList.toggle('active', cardTheme === theme);
  });

  // 4. Update Custom Theme Cards Active State
  const customCards = document.querySelectorAll('.custom-theme-row');
  customCards.forEach(card => {
    const cardId = card.getAttribute('data-theme-id');
    card.classList.toggle('active', cardId === theme);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Change the active color theme
 */
function setTheme(themeName) {
  const isCustom = AppState.customThemes.some(ct => ct.id === themeName);
  if (!THEME_META_COLORS[themeName] && !isCustom) return;

  AppState.theme = themeName;
  localStorage.setItem(STORAGE_KEYS.THEME, themeName);

  applyThemeToDOM(themeName, AppState.themeMode);
  updateThemeUI(themeName, AppState.themeMode);

  let displayName = THEME_DISPLAY_NAMES[themeName] || themeName;
  if (isCustom) {
    const ct = AppState.customThemes.find(t => t.id === themeName);
    if (ct) displayName = ct.name;
  }

  const msg = AppState.lang === 'en'
    ? `Theme set to: ${displayName}`
    : `Tema diganti ke: ${displayName}`;

  if (typeof showToast === 'function') {
    showToast(msg);
  }

  if (typeof renderAnalyticsTab === 'function' && AppState.activeTab === 'tab-grafik') {
    renderAnalyticsTab();
  }
}

/**
 * Change the active theme mode ('dark' or 'light')
 */
function setThemeMode(mode) {
  if (mode !== 'dark' && mode !== 'light') return;

  AppState.themeMode = mode;
  localStorage.setItem(STORAGE_KEYS.MODE, mode);

  applyThemeToDOM(AppState.theme, mode);
  updateThemeUI(AppState.theme, mode);

  const modeName = mode === 'dark'
    ? (AppState.lang === 'en' ? 'Dark Mode' : 'Mode Gelap')
    : (AppState.lang === 'en' ? 'Light Mode' : 'Mode Terang');

  if (typeof showToast === 'function') {
    showToast(`${modeName} ${AppState.lang === 'en' ? 'activated' : 'diaktifkan'}`);
  }

  if (typeof renderAnalyticsTab === 'function' && AppState.activeTab === 'tab-grafik') {
    renderAnalyticsTab();
  }
}

/**
 * Toggle between Dark and Light mode
 */
function toggleThemeMode() {
  const nextMode = AppState.themeMode === 'dark' ? 'light' : 'dark';
  setThemeMode(nextMode);
}

/**
 * Render list of user-created custom themes into Settings Tab
 */
function renderCustomThemesList() {
  const container = document.getElementById('custom-themes-container');
  const section = document.getElementById('custom-themes-section');
  if (!container || !section) return;

  if (AppState.customThemes.length === 0) {
    section.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  section.classList.remove('hidden');
  container.innerHTML = AppState.customThemes.map(theme => {
    const isActive = AppState.theme === theme.id;
    return `
      <div class="custom-theme-row ${isActive ? 'active' : ''}" data-theme-id="${theme.id}">
        <div class="swatch-preview-dots" style="cursor: pointer;" onclick="setTheme('${theme.id}')">
          <span class="swatch-dot" style="background: ${theme.primaryColor};"></span>
        </div>
        <div class="swatch-info" style="cursor: pointer;" onclick="setTheme('${theme.id}')">
          <strong class="swatch-name">${escapeHtml(theme.name)}</strong>
          <span class="swatch-desc">${theme.primaryColor} • ${theme.mode === 'light' ? 'Light Base' : 'Dark Base'}</span>
        </div>
        <div class="custom-theme-actions">
          <button type="button" class="btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}" onclick="setTheme('${theme.id}')">
            ${isActive ? (AppState.lang === 'en' ? 'Active' : 'Aktif') : (AppState.lang === 'en' ? 'Apply' : 'Pakai')}
          </button>
          <button type="button" class="btn-card-action btn-delete-item" onclick="deleteCustomTheme('${theme.id}')" title="Hapus Tema Kustom">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

/**
 * Delete a user-created custom theme
 */
function deleteCustomTheme(id) {
  const target = AppState.customThemes.find(t => t.id === id);
  if (!target) return;

  const confirmMsg = AppState.lang === 'en'
    ? `Delete custom theme "${target.name}"?`
    : `Hapus tema kustom "${target.name}"?`;

  if (confirm(confirmMsg)) {
    AppState.customThemes = AppState.customThemes.filter(t => t.id !== id);
    saveCustomThemesToStorage();

    if (AppState.theme === id) {
      setTheme('mint');
    }

    renderCustomThemesList();
    if (typeof showToast === 'function') {
      showToast(AppState.lang === 'en' ? 'Custom theme deleted' : 'Tema kustom dihapus');
    }
  }
}

/**
 * Open Custom Theme Creator Modal
 */
function openCustomThemeModal() {
  const modal = document.getElementById('custom-theme-modal');
  if (!modal) return;

  // Reset inputs
  const nameInput = document.getElementById('custom-theme-name-input');
  const hexInput = document.getElementById('custom-hex-input');
  const colorPicker = document.getElementById('custom-color-picker-input');

  if (nameInput) nameInput.value = '';
  if (hexInput) hexInput.value = '#2DD4BF';
  if (colorPicker) colorPicker.value = '#2dd4bf';

  updateCustomThemePreview('#2dd4bf', 'dark', 'Tema Kustom Baru');
  modal.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();
}

/**
 * Close Custom Theme Creator Modal
 */
function closeCustomThemeModal() {
  const modal = document.getElementById('custom-theme-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Update Live Preview inside Custom Theme Creator
 */
function updateCustomThemePreview(color, mode, name) {
  const previewBox = document.getElementById('theme-live-preview-box');
  const previewHeader = document.getElementById('preview-header');
  const previewBtn = document.getElementById('preview-btn-sample');
  const previewPrice = document.getElementById('preview-price-tag');
  const previewTitle = document.getElementById('preview-theme-title');
  const swatchDisplay = document.getElementById('custom-color-swatch-display');

  if (previewBox) {
    previewBox.style.setProperty('--preview-brand', color);
  }
  if (previewHeader) {
    previewHeader.style.backgroundColor = color;
  }
  if (previewBtn) {
    previewBtn.style.backgroundColor = color;
  }
  if (previewPrice) {
    previewPrice.style.color = color;
  }
  if (previewTitle && name) {
    previewTitle.textContent = name;
  }
  if (swatchDisplay) {
    swatchDisplay.style.backgroundColor = color;
  }
}

/**
 * Initialize Event Listeners for Custom Theme Creator
 */
function initCustomThemeCreatorEvents() {
  const openBtn = document.getElementById('open-custom-theme-btn');
  const closeBtn = document.getElementById('close-custom-theme-btn');
  const backdrop = document.getElementById('close-custom-theme-backdrop');
  const cancelBtn = document.getElementById('btn-cancel-custom-theme');
  const saveBtn = document.getElementById('btn-save-custom-theme');
  const nameInput = document.getElementById('custom-theme-name-input');
  const hexInput = document.getElementById('custom-hex-input');
  const colorPicker = document.getElementById('custom-color-picker-input');
  const randomBtn = document.getElementById('btn-randomize-color');
  const darkBtn = document.getElementById('custom-mode-dark-btn');
  const lightBtn = document.getElementById('custom-mode-light-btn');

  let currentCustomColor = '#2dd4bf';
  let currentCustomMode = 'dark';

  if (openBtn) openBtn.addEventListener('click', openCustomThemeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCustomThemeModal);
  if (backdrop) backdrop.addEventListener('click', closeCustomThemeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCustomThemeModal);

  // Color Grid Cells Selection
  const gridCells = document.querySelectorAll('.color-grid-cell');
  gridCells.forEach(cell => {
    cell.addEventListener('click', () => {
      gridCells.forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
      const color = cell.getAttribute('data-color');
      currentCustomColor = color;
      if (hexInput) hexInput.value = color.toUpperCase();
      if (colorPicker) colorPicker.value = color;
      updateCustomThemePreview(color, currentCustomMode, nameInput ? nameInput.value || 'Smart Grocery' : 'Smart Grocery');
    });
  });

  // Native Color Picker input
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      currentCustomColor = color;
      if (hexInput) hexInput.value = color.toUpperCase();
      gridCells.forEach(c => c.classList.toggle('active', c.getAttribute('data-color').toLowerCase() === color.toLowerCase()));
      updateCustomThemePreview(color, currentCustomMode, nameInput ? nameInput.value || 'Smart Grocery' : 'Smart Grocery');
    });
  }

  // Hex Text input
  if (hexInput) {
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        currentCustomColor = val;
        if (colorPicker) colorPicker.value = val;
        gridCells.forEach(c => c.classList.toggle('active', c.getAttribute('data-color').toLowerCase() === val.toLowerCase()));
        updateCustomThemePreview(val, currentCustomMode, nameInput ? nameInput.value || 'Smart Grocery' : 'Smart Grocery');
      }
    });
  }

  // Randomize Color Button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      currentCustomColor = randomHex;
      if (hexInput) hexInput.value = randomHex.toUpperCase();
      if (colorPicker) colorPicker.value = randomHex;
      updateCustomThemePreview(randomHex, currentCustomMode, nameInput ? nameInput.value || 'Smart Grocery' : 'Smart Grocery');
    });
  }

  // Name input live update
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      updateCustomThemePreview(currentCustomColor, currentCustomMode, e.target.value || 'Smart Grocery');
    });
  }

  // Base Mode Toggle
  if (darkBtn && lightBtn) {
    darkBtn.addEventListener('click', () => {
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
      currentCustomMode = 'dark';
      updateCustomThemePreview(currentCustomColor, 'dark', nameInput ? nameInput.value : '');
    });

    lightBtn.addEventListener('click', () => {
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
      currentCustomMode = 'light';
      updateCustomThemePreview(currentCustomColor, 'light', nameInput ? nameInput.value : '');
    });
  }

  // Save Custom Theme
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : `Tema ${currentCustomColor.toUpperCase()}`;
      const newTheme = {
        id: 'custom_' + Date.now(),
        name: name,
        primaryColor: currentCustomColor,
        mode: currentCustomMode,
        createdAt: Date.now()
      };

      AppState.customThemes.push(newTheme);
      saveCustomThemesToStorage();
      renderCustomThemesList();
      closeCustomThemeModal();

      // Immediately activate the new custom theme
      setThemeMode(currentCustomMode);
      setTheme(newTheme.id);

      if (typeof showToast === 'function') {
        showToast(AppState.lang === 'en' ? `Custom theme "${name}" created & applied!` : `Tema kustom "${name}" berhasil dibuat & diterapkan!`, 'success');
      }
    });
  }
}
