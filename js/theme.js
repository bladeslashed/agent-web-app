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
  rose: { dark: '#18050b', light: '#fff1f2' },
  'cyber-violet': { dark: '#0e051c', light: '#faf5ff' },
  'sunset-amber': { dark: '#170a02', light: '#fff7ed' },
  'ocean-deep': { dark: '#031324', light: '#f0f9ff' },
  'rose-velvet': { dark: '#18040a', light: '#fff1f2' },
  'neon-lime': { dark: '#0d1503', light: '#f7fee7' },
  'clean-minimal': { dark: '#0f172a', light: '#f8fafc' }
};

const THEME_DISPLAY_NAMES = {
  mint: 'Mint Tracker',
  midnight: 'Midnight Slate',
  emerald: 'Emerald Supermarket',
  sunset: 'Sunset Tangerine',
  violet: 'Cyberpunk Violet',
  rose: 'Rose Berry',
  'cyber-violet': 'Cyber Violet',
  'sunset-amber': 'Sunset Amber',
  'ocean-deep': 'Ocean Deep',
  'rose-velvet': 'Rose Velvet',
  'neon-lime': 'Neon Lime',
  'clean-minimal': 'Clean Minimal'
};

/**
 * Coordinated Multi-Color Presets (Harmonious Sets for 5 Roles: Brand, Header, Menu, Surface, Accent)
 */
const MULTI_COLOR_PRESETS = {
  'mint-emerald': {
    name: 'Mint Emerald',
    baseMode: 'dark',
    brand: '#2DD4BF',
    header: '#0C2B22',
    menu: '#091F18',
    surface: '#021A15',
    accent: '#10B981'
  },
  'cyber-violet': {
    name: 'Cyber Violet',
    baseMode: 'dark',
    brand: '#A855F7',
    header: '#240B40',
    menu: '#18062B',
    surface: '#0E051C',
    accent: '#06B6D4'
  },
  'sunset-amber': {
    name: 'Sunset Amber',
    baseMode: 'dark',
    brand: '#F97316',
    header: '#331505',
    menu: '#240D02',
    surface: '#170A02',
    accent: '#F59E0B'
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    baseMode: 'dark',
    brand: '#0EA5E9',
    header: '#082C4A',
    menu: '#051D33',
    surface: '#031324',
    accent: '#38BDF8'
  },
  'rose-velvet': {
    name: 'Rose Velvet',
    baseMode: 'dark',
    brand: '#F43F5E',
    header: '#360A18',
    menu: '#260510',
    surface: '#18040A',
    accent: '#FB7185'
  },
  'neon-lime': {
    name: 'Neon Lime',
    baseMode: 'dark',
    brand: '#84CC16',
    header: '#1E2C06',
    menu: '#141F03',
    surface: '#0D1503',
    accent: '#A3E635'
  },
  'clean-minimal': {
    name: 'Clean Minimal',
    baseMode: 'light',
    brand: '#0D9488',
    header: '#E2E8F0',
    menu: '#F8FAFC',
    surface: '#FFFFFF',
    accent: '#14B8A6'
  }
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
 * Convert RGB components to 6-digit Hex string
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB (0-255) to HSV { h: 0-360, s: 0-100, v: 0-100 }
 */
function rgbToHsv(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);
  return { h, s, v };
}

/**
 * Convert HSV { h: 0-360, s: 0-100, v: 0-100 } to RGB (0-255)
 */
function hsvToRgb(h, s, v) {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const vNorm = Math.max(0, Math.min(100, v)) / 100;
  const c = vNorm * sNorm;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp >= 0 && hp < 1) { r1 = c; g1 = x; b1 = 0; }
  else if (hp >= 1 && hp < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (hp >= 2 && hp < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (hp >= 3 && hp < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (hp >= 4 && hp < 5) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  const m = vNorm - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

/**
 * Convert Hex color string to HSV object
 */
function hexToHsv(hex) {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSV to Hex string
 */
function hsvToHex(h, s, v) {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
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

    // Normalise colors from theme object (All 5 roles)
    const brand = customTheme.colors?.brand || customTheme.primaryColor || '#2DD4BF';
    const header = customTheme.colors?.header || '#0C2B22';
    const menu = customTheme.colors?.menu || '#091F18';
    const surface = customTheme.colors?.surface || '#021A15';
    const accent = customTheme.colors?.accent || '#10B981';

    const rgbBrand = hexToRgb(brand);
    const rgbAccent = hexToRgb(accent);
    const rgbHeader = hexToRgb(header);
    const rgbMenu = hexToRgb(menu);
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
        --color-header-bg: ${header};
        --color-menu-bg: ${menu};
        --color-menu-header-bg: rgba(${Math.min(255, rgbMenu.r + 14)}, ${Math.min(255, rgbMenu.g + 16)}, ${Math.min(255, rgbMenu.b + 22)}, 0.95);
        --color-menu-card-bg: rgba(${Math.min(255, rgbMenu.r + 20)}, ${Math.min(255, rgbMenu.g + 24)}, ${Math.min(255, rgbMenu.b + 32)}, 0.9);
        --color-menu-card-hover: rgba(${Math.min(255, rgbMenu.r + 34)}, ${Math.min(255, rgbMenu.g + 40)}, ${Math.min(255, rgbMenu.b + 52)}, 0.95);
        --color-menu-border: rgba(${rgbBrand.r}, ${rgbBrand.g}, ${rgbBrand.b}, 0.25);
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
        --color-header-bg: ${header};
        --color-menu-bg: #f8fafc;
        --color-menu-header-bg: #f1f5f9;
        --color-menu-card-bg: #ffffff;
        --color-menu-card-hover: #f1f5f9;
        --color-menu-border: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.2);
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
      menu: theme.colors?.menu || '#091F18',
      surface: theme.colors?.surface || '#021A15',
      accent: theme.colors?.accent || '#10B981'
    };
    const baseMode = theme.baseMode || theme.mode || 'dark';

    return `
      <div class="custom-theme-row ${isActive ? 'active' : ''}" data-theme-id="${theme.id}">
        <div class="custom-theme-dots" style="cursor: pointer;" onclick="setTheme('${theme.id}')" title="Warna Tema (5 Elemen)">
          <span class="ct-dot" style="background: ${colors.brand};" title="Brand"></span>
          <span class="ct-dot" style="background: ${colors.header};" title="Header"></span>
          <span class="ct-dot" style="background: ${colors.menu};" title="Menu Sidebar"></span>
          <span class="ct-dot" style="background: ${colors.surface};" title="Surface"></span>
          <span class="ct-dot" style="background: ${colors.accent};" title="Accent"></span>
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
  hsv: { h: 174, s: 79, v: 83 },
  colors: {
    brand: '#2DD4BF',
    header: '#0C2B22',
    menu: '#091F18',
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
    hsv: hexToHsv(defaultPreset.brand),
    colors: {
      brand: defaultPreset.brand,
      header: defaultPreset.header,
      menu: defaultPreset.menu,
      surface: defaultPreset.surface,
      accent: defaultPreset.accent
    }
  };

  const nameInput = document.getElementById('custom-theme-name-input');
  if (nameInput) nameInput.value = '';

  const pickerPanel = document.getElementById('picker-2d-panel');
  if (pickerPanel) pickerPanel.classList.add('collapsed');

  updateCreatorUI(true);
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
function updateCreatorUI(syncHsv = true) {
  const { colors, baseMode, activeRole, name } = customCreatorState;
  const activeColor = colors[activeRole] || colors.brand;

  if (syncHsv) {
    customCreatorState.hsv = hexToHsv(activeColor);
  }

  // 1. Update Role Pill Swatch Dots (All 5 Roles)
  const dotBrand = document.getElementById('role-dot-brand');
  const dotHeader = document.getElementById('role-dot-header');
  const dotMenu = document.getElementById('role-dot-menu');
  const dotSurface = document.getElementById('role-dot-surface');
  const dotAccent = document.getElementById('role-dot-accent');

  if (dotBrand) dotBrand.style.backgroundColor = colors.brand;
  if (dotHeader) dotHeader.style.backgroundColor = colors.header;
  if (dotMenu) dotMenu.style.backgroundColor = colors.menu;
  if (dotSurface) dotSurface.style.backgroundColor = colors.surface;
  if (dotAccent) dotAccent.style.backgroundColor = colors.accent;

  // 2. Update Role Pills Active State
  const rolePills = document.querySelectorAll('.color-role-pill');
  rolePills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-role') === activeRole);
  });

  // 3. Update Label indicating what is being edited
  const roleIndicator = document.getElementById('current-editing-role-indicator');
  const roleNames = {
    brand: 'Warna Utama (Brand)',
    header: 'Header Atas & Ombak',
    menu: 'Menu Sidebar (Drawer)',
    surface: 'Latar Aplikasi (Surface)',
    accent: 'Aksen Diskon & Ikon'
  };
  if (roleIndicator) {
    roleIndicator.textContent = `Mengedit: ${roleNames[activeRole] || 'Warna Utama'}`;
  }

  // 4. Update Hex Input and Swatch Display
  const hexInput = document.getElementById('custom-hex-input');
  const swatchDisplay = document.getElementById('custom-color-swatch-display');

  if (hexInput && document.activeElement !== hexInput) {
    hexInput.value = activeColor.toUpperCase();
  }
  if (swatchDisplay) {
    swatchDisplay.style.backgroundColor = activeColor;
  }

  // 5. Update Interactive 2D Field & Rainbow Hue Slider
  const pickerField = document.getElementById('picker-2d-field');
  const pickerCursor = document.getElementById('picker-2d-cursor');
  const hueSlider = document.getElementById('picker-hue-slider');
  const readoutText = document.getElementById('picker-readout-text');

  if (pickerField) {
    pickerField.style.backgroundColor = `hsl(${customCreatorState.hsv.h}, 100%, 50%)`;
  }
  if (pickerCursor) {
    pickerCursor.style.left = `${customCreatorState.hsv.s}%`;
    pickerCursor.style.top = `${100 - customCreatorState.hsv.v}%`;
    pickerCursor.style.backgroundColor = activeColor;
  }
  if (hueSlider && document.activeElement !== hueSlider) {
    hueSlider.value = customCreatorState.hsv.h;
  }
  if (readoutText) {
    readoutText.textContent = `HEX: ${activeColor.toUpperCase()}`;
  }

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
  const previewWave1 = document.getElementById('preview-wave-1');
  const previewWave2 = document.getElementById('preview-wave-2');
  const previewMenuStrip = document.getElementById('preview-menu-strip');
  const previewMenuIcon = document.getElementById('preview-menu-icon');
  const previewMenuSub = document.getElementById('preview-menu-sub');
  const previewSurface = document.getElementById('preview-surface-card');
  const previewPrice = document.getElementById('preview-price-tag');
  const previewDiscount = document.getElementById('preview-discount-badge');
  const previewBtn = document.getElementById('preview-btn-sample');
  const previewTitle = document.getElementById('preview-theme-title');
  const previewItemName = document.getElementById('preview-item-name');

  if (previewBox) {
    previewBox.style.setProperty('--preview-brand', colors.brand);
    previewBox.style.setProperty('--preview-header', colors.header);
    previewBox.style.setProperty('--preview-menu', colors.menu);
    previewBox.style.setProperty('--preview-surface', colors.surface);
    previewBox.style.setProperty('--preview-accent', colors.accent);
  }

  if (previewHeader) {
    previewHeader.style.backgroundColor = colors.header;
  }

  if (previewWave1) previewWave1.style.fill = colors.brand;
  if (previewWave2) previewWave2.style.fill = colors.accent;

  if (previewMenuStrip) {
    previewMenuStrip.style.backgroundColor = colors.menu;
  }

  if (previewMenuIcon) {
    previewMenuIcon.style.backgroundColor = colors.brand;
    const lum = (0.299 * hexToRgb(colors.brand).r + 0.587 * hexToRgb(colors.brand).g + 0.114 * hexToRgb(colors.brand).b) / 255;
    previewMenuIcon.style.color = lum > 0.55 ? '#021a15' : '#ffffff';
  }

  if (previewMenuSub) {
    previewMenuSub.style.color = colors.accent;
  }

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
  const randomBtn = document.getElementById('btn-randomize-color');
  const darkBtn = document.getElementById('custom-mode-dark-btn');
  const lightBtn = document.getElementById('custom-mode-light-btn');

  const togglePickerBtn = document.getElementById('toggle-color-picker-btn');
  const collapsePickerBtn = document.getElementById('picker-collapse-btn');
  const pickerPanel = document.getElementById('picker-2d-panel');
  const pickerField = document.getElementById('picker-2d-field');
  const hueSlider = document.getElementById('picker-hue-slider');

  if (openBtn) openBtn.addEventListener('click', openCustomThemeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCustomThemeModal);
  if (backdrop) backdrop.addEventListener('click', closeCustomThemeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeCustomThemeModal);

  // Toggle 2D Color Picker Field when clicking the swatch icon beside the HEX input
  if (togglePickerBtn && pickerPanel) {
    togglePickerBtn.addEventListener('click', () => {
      pickerPanel.classList.toggle('collapsed');
      if (!pickerPanel.classList.contains('collapsed')) {
        updateCreatorUI(true);
      }
    });
  }

  if (collapsePickerBtn && pickerPanel) {
    collapsePickerBtn.addEventListener('click', () => {
      pickerPanel.classList.add('collapsed');
    });
  }

  // Interactive 2D Color Field Dragging (Saturation on X, Brightness on Y)
  let isDraggingField = false;

  function handle2DFieldPointer(e) {
    if (!pickerField) return;
    const rect = pickerField.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const s = Math.round((clampedX / rect.width) * 100);
    const v = Math.round((1 - (clampedY / rect.height)) * 100);

    customCreatorState.hsv.s = s;
    customCreatorState.hsv.v = v;

    const newHex = hsvToHex(customCreatorState.hsv.h, s, v);
    customCreatorState.colors[customCreatorState.activeRole] = newHex;

    updateCreatorUI(false);
  }

  if (pickerField) {
    pickerField.addEventListener('pointerdown', (e) => {
      isDraggingField = true;
      try {
        pickerField.setPointerCapture(e.pointerId);
      } catch (err) {}
      handle2DFieldPointer(e);
    });

    pickerField.addEventListener('pointermove', (e) => {
      if (isDraggingField) {
        handle2DFieldPointer(e);
      }
    });

    const stopDragging = (e) => {
      if (isDraggingField) {
        isDraggingField = false;
        try {
          if (e.pointerId !== undefined) {
            pickerField.releasePointerCapture(e.pointerId);
          }
        } catch (err) {}
      }
    };

    pickerField.addEventListener('pointerup', stopDragging);
    pickerField.addEventListener('pointercancel', stopDragging);
  }

  // Rainbow Hue Slider (0 - 360)
  if (hueSlider) {
    hueSlider.addEventListener('input', (e) => {
      const h = parseInt(e.target.value, 10);
      customCreatorState.hsv.h = isNaN(h) ? 0 : h;
      const newHex = hsvToHex(customCreatorState.hsv.h, customCreatorState.hsv.s, customCreatorState.hsv.v);
      customCreatorState.colors[customCreatorState.activeRole] = newHex;
      updateCreatorUI(false);
    });
  }

  // Multi-Color Presets Click
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
          menu: preset.menu,
          surface: preset.surface,
          accent: preset.accent
        };
        customCreatorState.baseMode = preset.baseMode;
        if (nameInput && (!nameInput.value || Object.values(MULTI_COLOR_PRESETS).some(p => p.name === nameInput.value))) {
          nameInput.value = preset.name;
          customCreatorState.name = preset.name;
        }
        updateCreatorUI(true);
      }
    });
  });

  // Color Role Pill Selector (5 Roles)
  const rolePills = document.querySelectorAll('.color-role-pill');
  rolePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const role = pill.getAttribute('data-role');
      if (role) {
        customCreatorState.activeRole = role;
        updateCreatorUI(true);
      }
    });
  });

  // Hex Text input
  if (hexInput) {
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        customCreatorState.colors[customCreatorState.activeRole] = val;
        updateCreatorUI(true);
      }
    });
  }

  // Randomize Color Button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      customCreatorState.colors[customCreatorState.activeRole] = randomHex;
      updateCreatorUI(true);
    });
  }

  // Name input live update
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      customCreatorState.name = e.target.value.trim();
      updateLivePreviewCard();
    });
  }

  // Base Mode Toggle (Dark vs Light)
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      customCreatorState.baseMode = 'dark';
      updateCreatorUI(false);
    });
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      customCreatorState.baseMode = 'light';
      updateCreatorUI(false);
    });
  }

  // Save & Apply Custom Theme
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
