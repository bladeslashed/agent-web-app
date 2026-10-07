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
 * + Advanced User-Created Custom Themes with 2D Color Grid, Multi-Color Roles & Base Mode!
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
 * Coordinated Multi-Color Presets (Harmonious Sets for 4 Roles)
 */
const MULTI_COLOR_PRESETS = {
  'mint-emerald': {
    name: 'Mint Emerald',
    baseMode: 'dark',
    brand: '#2DD4BF',
    header: '#0C2B22',
    surface: '#021A15',
    accent: '#10B981'
  },
  'cyber-violet': {
    name: 'Cyber Violet',
    baseMode: 'dark',
    brand: '#A855F7',
    header: '#240B40',
    surface: '#0E051C',
    accent: '#06B6D4'
  },
  'sunset-amber': {
    name: 'Sunset Amber',
    baseMode: 'dark',
    brand: '#F97316',
    header: '#331505',
    surface: '#170A02',
    accent: '#F59E0B'
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    baseMode: 'dark',
    brand: '#0EA5E9',
    header: '#082C4A',
    surface: '#031324',
    accent: '#38BDF8'
  },
  'rose-velvet': {
    name: 'Rose Velvet',
    baseMode: 'dark',
    brand: '#F43F5E',
    header: '#360A18',
    surface: '#18040A',
    accent: '#FB7185'
  },
  'neon-lime': {
    name: 'Neon Lime',
    baseMode: 'dark',
    brand: '#84CC16',
    header: '#1E2C06',
    surface: '#0D1503',
    accent: '#A3E635'
  },
  'clean-minimal': {
    name: 'Clean Minimal',
    baseMode: 'light',
    brand: '#0D9488',
    header: '#CBD5E1',
    surface: '#FFFFFF',
    accent: '#14B8A6'
  }
};

/**
 * Curated 2D Color Matrix: 12 Spectrum Hues x 5 Depth Rows (60 Colors)
 */
const CHROMATIC_GRID_2D = [
  // Row 0: Soft Pastel / Tint
  ['#FECDD3', '#FED7AA', '#FEF08A', '#D9F99D', '#A7F3D0', '#99F6E4', '#BAE6FD', '#BFDBFE', '#C7D2FE', '#DDD6FE', '#F5D0FE', '#E2E8F0'],
  // Row 1: Neon / Electric Bright
  ['#FB7185', '#FB923C', '#FACC15', '#A3E635', '#34D399', '#2DD4BF', '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA', '#E879F9', '#94A3B8'],
  // Row 2: Pure Vibrant Chroma (Base)
  ['#E11D48', '#EA580C', '#CA8A04', '#65A30D', '#059669', '#0D9488', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED', '#C026D3', '#64748B'],
  // Row 3: Deep Jewel Tone
  ['#9F1239', '#9A3412', '#854D0E', '#3F6212', '#065F46', '#115E59', '#075985', '#1E40AF', '#3730A3', '#5B21B6', '#86198F', '#334155'],
  // Row 4: Midnight / Deep Carbon Tone
  ['#4C0519', '#431407', '#451A03', '#1A2E05', '#022C22', '#042F2E', '#082F49', '#172554', '#1E1B4B', '#2E1065', '#4A044E', '#0F172A']
];

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
  let c = (hex || '#2DD4BF').replace('#', '');
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
 * Darken color if too light to maintain high-contrast on light background
 */
function darkenIfTooLight(hex) {
  const rgb = hexToRgb(hex);
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  if (lum > 0.55) {
    const r = Math.max(0, Math.floor(rgb.r * 0.65));
    const g = Math.max(0, Math.floor(rgb.g * 0.65));
    const b = Math.max(0, Math.floor(rgb.b * 0.65));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return hex;
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

    // Normalise colors from theme object
    const brand = customTheme.colors?.brand || customTheme.primaryColor || '#2DD4BF';
    const header = customTheme.colors?.header || '#0C2B22';
    const surface = customTheme.colors?.surface || '#021A15';
    const accent = customTheme.colors?.accent || '#10B981';

    const rgbBrand = hexToRgb(brand);
    const rgbAccent = hexToRgb(accent);
    const rgbHeader = hexToRgb(header);
    const rgbSurface = hexToRgb(surface);

    // Light-mode contrast check
    const lightBrand = darkenIfTooLight(brand);
    const rgbLightBrand = hexToRgb(lightBrand);
    const lightAccent = darkenIfTooLight(accent);
    const rgbLightAccent = hexToRgb(lightAccent);

    // Generate comprehensive rules for BOTH dark and light modes so shifting modes never breaks
    customStyleTag.innerHTML = `
      [data-theme="${customTheme.id}"][data-mode="dark"] {
        --color-brand: ${brand};
        --color-brand-glow: rgba(${rgbBrand.r}, ${rgbBrand.g}, ${rgbBrand.b}, 0.35);
        --border-focus: rgba(${rgbBrand.r}, ${rgbBrand.g}, ${rgbBrand.b}, 0.6);
        --border-subtle: rgba(${rgbBrand.r}, ${rgbBrand.g}, ${rgbBrand.b}, 0.2);
        --bg-body: #050a0e;
        --bg-app: ${surface};
        --bg-surface: ${surface};
        --bg-surface-elevated: rgba(${Math.min(255, rgbSurface.r + 18)}, ${Math.min(255, rgbSurface.g + 20)}, ${Math.min(255, rgbSurface.b + 26)}, 0.95);
        --bg-surface-hover: rgba(${Math.min(255, rgbSurface.r + 30)}, ${Math.min(255, rgbSurface.g + 34)}, ${Math.min(255, rgbSurface.b + 42)}, 0.95);
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --text-subtle: rgba(${rgbBrand.r}, ${rgbBrand.g}, ${rgbBrand.b}, 0.85);
        --badge-emerald-text: ${accent};
        --badge-emerald-bg: rgba(${rgbAccent.r}, ${rgbAccent.g}, ${rgbAccent.b}, 0.16);
        --badge-emerald-border: rgba(${rgbAccent.r}, ${rgbAccent.g}, ${rgbAccent.b}, 0.35);
      }

      [data-theme="${customTheme.id}"][data-mode="light"] {
        --color-brand: ${lightBrand};
        --color-brand-glow: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.22);
        --border-focus: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.45);
        --border-subtle: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.16);
        --bg-body: #f1f5f9;
        --bg-app: #f8fafc;
        --bg-surface: #ffffff;
        --bg-surface-elevated: #f8fafc;
        --bg-surface-hover: #e2e8f0;
        --text-main: #0f172a;
        --text-muted: #475569;
        --text-subtle: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.9);
        --badge-emerald-text: ${lightAccent};
        --badge-emerald-bg: rgba(${rgbLightAccent.r}, ${rgbLightAccent.g}, ${rgbLightAccent.b}, 0.12);
        --badge-emerald-border: rgba(${rgbLightAccent.r}, ${rgbLightAccent.g}, ${rgbLightAccent.b}, 0.26);
      }
    `;

    // Update browser theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? surface : '#f8fafc');
    }
  } else {
    if (customStyleTag) customStyleTag.innerHTML = '';
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
 * Render list of user-created custom themes into Settings Tab with Fixed Typography Layout
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
    const colors = {
      brand: theme.colors?.brand || theme.primaryColor || '#2DD4BF',
      header: theme.colors?.header || '#0C2B22',
      surface: theme.colors?.surface || '#021A15',
      accent: theme.colors?.accent || '#10B981'
    };
    const baseMode = theme.baseMode || theme.mode || 'dark';

    return `
      <div class="custom-theme-row ${isActive ? 'active' : ''}" data-theme-id="${theme.id}">
        <div class="custom-theme-dots" style="cursor: pointer;" onclick="setTheme('${theme.id}')" title="Warna Tema">
          <span class="ct-dot" style="background: ${colors.brand};"></span>
          <span class="ct-dot" style="background: ${colors.header};"></span>
          <span class="ct-dot" style="background: ${colors.surface};"></span>
          <span class="ct-dot" style="background: ${colors.accent};"></span>
        </div>
        <div class="custom-theme-info" onclick="setTheme('${theme.id}')">
          <strong class="custom-theme-name">${escapeHtml(theme.name)}</strong>
          <div class="custom-theme-meta">
            <span class="custom-theme-base-badge">
              <i data-lucide="${baseMode === 'light' ? 'sun' : 'moon'}"></i>
              ${baseMode === 'light' ? 'Light Base' : 'Dark Base'}
            </span>
            <span>${colors.brand}</span>
          </div>
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

// Global active creator state
let customCreatorState = {
  name: '',
  baseMode: 'dark',
  activeRole: 'brand',
  colors: {
    brand: '#2DD4BF',
    header: '#0C2B22',
    surface: '#021A15',
    accent: '#10B981'
  }
};

/**
 * Open Custom Theme Creator Modal
 */
function openCustomThemeModal() {
  const modal = document.getElementById('custom-theme-modal');
  if (!modal) return;

  // Initialize with default or current preset
  const defaultPreset = MULTI_COLOR_PRESETS['mint-emerald'];
  customCreatorState = {
    name: '',
    baseMode: defaultPreset.baseMode,
    activeRole: 'brand',
    colors: { ...defaultPreset }
  };

  const nameInput = document.getElementById('custom-theme-name-input');
  if (nameInput) nameInput.value = '';

  updateCreatorUI();
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
 * Update UI controls, swatches, and live preview card in Custom Theme Creator
 */
function updateCreatorUI() {
  const { colors, baseMode, activeRole, name } = customCreatorState;
  const activeColor = colors[activeRole] || colors.brand;

  // 1. Update Role Pill Swatch Dots
  const dotBrand = document.getElementById('role-dot-brand');
  const dotHeader = document.getElementById('role-dot-header');
  const dotSurface = document.getElementById('role-dot-surface');
  const dotAccent = document.getElementById('role-dot-accent');

  if (dotBrand) dotBrand.style.backgroundColor = colors.brand;
  if (dotHeader) dotHeader.style.backgroundColor = colors.header;
  if (dotSurface) dotSurface.style.backgroundColor = colors.surface;
  if (dotAccent) dotAccent.style.backgroundColor = colors.accent;

  // 2. Update Role Pills Active State
  const rolePills = document.querySelectorAll('.color-role-pill');
  rolePills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-role') === activeRole);
  });

  // 3. Update Label indicating what is being edited
  const roleLabel = document.getElementById('current-editing-role-label');
  if (roleLabel) {
    const roleNames = {
      brand: 'Warna Utama (Brand)',
      header: 'Header & Gelombang',
      surface: 'Kartu & Latar (Surface)',
      accent: 'Aksen Diskon & Hemat'
    };
    roleLabel.textContent = `Palet Grid Warna 2D (Pilih untuk ${roleNames[activeRole] || 'Warna Utama'})`;
  }

  // 4. Update Hex Input and Native Picker
  const hexInput = document.getElementById('custom-hex-input');
  const colorPicker = document.getElementById('custom-color-picker-input');
  const swatchDisplay = document.getElementById('custom-color-swatch-display');

  if (hexInput) hexInput.value = activeColor.toUpperCase();
  if (colorPicker) colorPicker.value = activeColor;
  if (swatchDisplay) swatchDisplay.style.backgroundColor = activeColor;

  // 5. Update 2D Grid Cells Active State
  const gridCells = document.querySelectorAll('.grid-2d-cell');
  gridCells.forEach(cell => {
    const cellColor = (cell.getAttribute('data-color') || '').toLowerCase();
    cell.classList.toggle('active', cellColor === activeColor.toLowerCase());
  });

  // 6. Update Base Mode Semantic Pills (Ensures 100% visible text)
  const darkBtn = document.getElementById('custom-mode-dark-btn');
  const lightBtn = document.getElementById('custom-mode-light-btn');

  if (darkBtn && lightBtn) {
    darkBtn.classList.toggle('active', baseMode === 'dark');
    lightBtn.classList.toggle('active', baseMode === 'light');
  }

  // 7. Update Live Preview Box Card
  updateLivePreviewCard();
}

/**
 * Update the Live Preview Card with real multi-color properties
 */
function updateLivePreviewCard() {
  const { colors, baseMode, name } = customCreatorState;
  const previewBox = document.getElementById('theme-live-preview-box');
  const previewHeader = document.getElementById('preview-header');
  const previewSurface = document.getElementById('preview-surface-card');
  const previewWave1 = document.getElementById('preview-wave-1');
  const previewWave2 = document.getElementById('preview-wave-2');
  const previewPrice = document.getElementById('preview-price-tag');
  const previewDiscount = document.getElementById('preview-discount-badge');
  const previewBtn = document.getElementById('preview-btn-sample');
  const previewTitle = document.getElementById('preview-theme-title');
  const previewItemName = document.getElementById('preview-item-name');

  if (previewBox) {
    previewBox.style.setProperty('--preview-brand', colors.brand);
    previewBox.style.setProperty('--preview-header', colors.header);
    previewBox.style.setProperty('--preview-surface', colors.surface);
    previewBox.style.setProperty('--preview-accent', colors.accent);
  }

  if (previewHeader) {
    previewHeader.style.backgroundColor = colors.header;
  }

  if (previewWave1) previewWave1.style.fill = colors.brand;
  if (previewWave2) previewWave2.style.fill = colors.accent;

  if (previewSurface) {
    if (baseMode === 'dark') {
      previewSurface.style.backgroundColor = colors.surface;
      if (previewItemName) previewItemName.style.color = '#f8fafc';
    } else {
      previewSurface.style.backgroundColor = '#ffffff';
      if (previewItemName) previewItemName.style.color = '#0f172a';
    }
  }

  if (previewPrice) previewPrice.style.color = colors.accent;
  if (previewDiscount) {
    previewDiscount.style.color = colors.accent;
    previewDiscount.style.borderColor = colors.accent;
  }

  if (previewBtn) {
    previewBtn.style.backgroundColor = colors.brand;
    const lum = (0.299 * hexToRgb(colors.brand).r + 0.587 * hexToRgb(colors.brand).g + 0.114 * hexToRgb(colors.brand).b) / 255;
    previewBtn.style.color = lum > 0.55 ? '#021a15' : '#ffffff';
  }

  if (previewTitle) {
    previewTitle.textContent = name || 'Smart Grocery';
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
  const gridContainer = document.getElementById('grid-2d-matrix');

  if (openBtn) openBtn.addEventListener('click', openCustomThemeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCustomThemeModal);
  if (backdrop) backdrop.addEventListener('click', closeCustomThemeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCustomThemeModal);

  // 1. Populate 2D Chromatic Grid Matrix (12 Hues x 5 Depth Rows)
  if (gridContainer && gridContainer.children.length === 0) {
    let cellsHtml = '';
    CHROMATIC_GRID_2D.forEach((row, rowIndex) => {
      row.forEach((hexColor, colIndex) => {
        cellsHtml += `
          <button type="button" class="grid-2d-cell" 
            data-color="${hexColor}" 
            style="--cell-color: ${hexColor};" 
            title="Kedalaman ${rowIndex + 1}, Spektrum ${colIndex + 1}: ${hexColor}">
          </button>
        `;
      });
    });
    gridContainer.innerHTML = cellsHtml;

    // Delegate cell clicks
    gridContainer.addEventListener('click', (e) => {
      const cell = e.target.closest('.grid-2d-cell');
      if (!cell) return;
      const color = cell.getAttribute('data-color');
      if (color) {
        customCreatorState.colors[customCreatorState.activeRole] = color;
        updateCreatorUI();
      }
    });
  }

  // 2. Multi-Color Presets Click
  const presetCards = document.querySelectorAll('.multi-color-preset-card');
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      presetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const presetKey = card.getAttribute('data-preset');
      const preset = MULTI_COLOR_PRESETS[presetKey];
      if (preset) {
        customCreatorState.colors = {
          brand: preset.brand,
          header: preset.header,
          surface: preset.surface,
          accent: preset.accent
        };
        customCreatorState.baseMode = preset.baseMode;
        if (nameInput && (!nameInput.value || Object.values(MULTI_COLOR_PRESETS).some(p => p.name === nameInput.value))) {
          nameInput.value = preset.name;
          customCreatorState.name = preset.name;
        }
        updateCreatorUI();
      }
    });
  });

  // 3. Color Role Pill Selector
  const rolePills = document.querySelectorAll('.color-role-pill');
  rolePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const role = pill.getAttribute('data-role');
      if (role) {
        customCreatorState.activeRole = role;
        updateCreatorUI();
      }
    });
  });

  // 4. Native Color Picker input
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      customCreatorState.colors[customCreatorState.activeRole] = color;
      updateCreatorUI();
    });
  }

  // 5. Hex Text input
  if (hexInput) {
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        customCreatorState.colors[customCreatorState.activeRole] = val;
        updateCreatorUI();
      }
    });
  }

  // 6. Randomize Color Button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      customCreatorState.colors[customCreatorState.activeRole] = randomHex;
      updateCreatorUI();
    });
  }

  // 7. Name input live update
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      customCreatorState.name = e.target.value.trim();
      updateLivePreviewCard();
    });
  }

  // 8. Base Mode Toggle (Dark vs Light)
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      customCreatorState.baseMode = 'dark';
      updateCreatorUI();
    });
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      customCreatorState.baseMode = 'light';
      updateCreatorUI();
    });
  }

  // 9. Save & Apply Custom Theme
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const finalName = customCreatorState.name || `Tema ${customCreatorState.colors.brand.toUpperCase()}`;
      const newTheme = {
        id: 'custom_' + Date.now(),
        name: finalName,
        baseMode: customCreatorState.baseMode,
        primaryColor: customCreatorState.colors.brand,
        colors: { ...customCreatorState.colors },
        createdAt: Date.now()
      };

      AppState.customThemes.push(newTheme);
      saveCustomThemesToStorage();
      renderCustomThemesList();
      closeCustomThemeModal();

      // Immediately activate the new custom theme and set its base mode
      setThemeMode(customCreatorState.baseMode);
      setTheme(newTheme.id);

      if (typeof showToast === 'function') {
        showToast(AppState.lang === 'en'
          ? `Custom theme "${finalName}" created & applied!`
          : `Tema kustom "${finalName}" berhasil dibuat & diterapkan!`, 'success');
      }
    });
  }
}
