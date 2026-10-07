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
 * Coordinated Multi-Color Presets (Harmonious Dual-Mode Sets for 5 Roles: Brand, Header, Menu, Surface, Accent)
 */
const MULTI_COLOR_PRESETS = {
  'mint-emerald': {
    name: 'Mint Emerald',
    dark: {
      brand: '#2DD4BF',
      header: '#0C2B22',
      menu: '#091F18',
      surface: '#021A15',
      accent: '#10B981'
    },
    light: {
      brand: '#0D9488',
      header: '#CCFBF1',
      menu: '#FFFFFF',
      surface: '#F0FDFA',
      accent: '#059669'
    }
  },
  'cyber-violet': {
    name: 'Cyber Violet',
    dark: {
      brand: '#A855F7',
      header: '#240B40',
      menu: '#18062B',
      surface: '#0E051C',
      accent: '#06B6D4'
    },
    light: {
      brand: '#9333EA',
      header: '#F3E8FF',
      menu: '#FFFFFF',
      surface: '#FAF5FF',
      accent: '#0284C7'
    }
  },
  'sunset-amber': {
    name: 'Sunset Amber',
    dark: {
      brand: '#F97316',
      header: '#331505',
      menu: '#240D02',
      surface: '#170A02',
      accent: '#F59E0B'
    },
    light: {
      brand: '#EA580C',
      header: '#FFEDD5',
      menu: '#FFFFFF',
      surface: '#FFF7ED',
      accent: '#D97706'
    }
  },
  'ocean-deep': {
    name: 'Ocean Deep',
    dark: {
      brand: '#0EA5E9',
      header: '#082C4A',
      menu: '#051D33',
      surface: '#031324',
      accent: '#38BDF8'
    },
    light: {
      brand: '#0284C7',
      header: '#E0F2FE',
      menu: '#FFFFFF',
      surface: '#F0F9FF',
      accent: '#0369A1'
    }
  },
  'rose-velvet': {
    name: 'Rose Velvet',
    dark: {
      brand: '#F43F5E',
      header: '#360A18',
      menu: '#260510',
      surface: '#18040A',
      accent: '#FB7185'
    },
    light: {
      brand: '#E11D48',
      header: '#FFE4E6',
      menu: '#FFFFFF',
      surface: '#FFF1F2',
      accent: '#BE123C'
    }
  },
  'neon-lime': {
    name: 'Neon Lime',
    dark: {
      brand: '#84CC16',
      header: '#1E2C06',
      menu: '#141F03',
      surface: '#0D1503',
      accent: '#A3E635'
    },
    light: {
      brand: '#65A30D',
      header: '#ECFCCB',
      menu: '#FFFFFF',
      surface: '#F7FEE7',
      accent: '#4D7C0F'
    }
  },
  'clean-minimal': {
    name: 'Clean Minimal',
    dark: {
      brand: '#0D9488',
      header: '#1E293B',
      menu: '#1E293B',
      surface: '#0F172A',
      accent: '#14B8A6'
    },
    light: {
      brand: '#0D9488',
      header: '#E2E8F0',
      menu: '#F8FAFC',
      surface: '#FFFFFF',
      accent: '#0F766E'
    }
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

    // Extract dark mode colors (from modes.dark, or fallback to root colors)
    const darkColors = customTheme.modes?.dark || customTheme.colors || {
      brand: customTheme.primaryColor || '#2DD4BF',
      header: '#0C2B22',
      menu: '#091F18',
      surface: '#021A15',
      accent: '#10B981'
    };

    // Extract light mode colors (from modes.light, or fallback to smart light derivations)
    const lightColors = customTheme.modes?.light || {
      brand: darkenIfTooLight(darkColors.brand),
      header: '#CCFBF1',
      menu: '#FFFFFF',
      surface: '#F0FDFA',
      accent: darkenIfTooLight(darkColors.accent)
    };

    const rgbDarkBrand = hexToRgb(darkColors.brand);
    const rgbDarkAccent = hexToRgb(darkColors.accent);
    const rgbDarkHeader = hexToRgb(darkColors.header);
    const rgbDarkMenu = hexToRgb(darkColors.menu);
    const rgbDarkSurface = hexToRgb(darkColors.surface);

    const rgbLightBrand = hexToRgb(lightColors.brand);
    const rgbLightAccent = hexToRgb(lightColors.accent);
    const rgbLightHeader = hexToRgb(lightColors.header);
    const rgbLightMenu = hexToRgb(lightColors.menu);
    const rgbLightSurface = hexToRgb(lightColors.surface);

    // Compute surface and menu elevations for Dark Mode
    const darkElevated = `rgba(${Math.min(255, rgbDarkSurface.r + 18)}, ${Math.min(255, rgbDarkSurface.g + 20)}, ${Math.min(255, rgbDarkSurface.b + 26)}, 0.95)`;
    const darkHover = `rgba(${Math.min(255, rgbDarkSurface.r + 30)}, ${Math.min(255, rgbDarkSurface.g + 34)}, ${Math.min(255, rgbDarkSurface.b + 42)}, 0.95)`;
    const darkMenuHeader = `rgba(${Math.min(255, rgbDarkMenu.r + 14)}, ${Math.min(255, rgbDarkMenu.g + 16)}, ${Math.min(255, rgbDarkMenu.b + 22)}, 0.95)`;
    const darkMenuCard = `rgba(${Math.min(255, rgbDarkMenu.r + 20)}, ${Math.min(255, rgbDarkMenu.g + 24)}, ${Math.min(255, rgbDarkMenu.b + 32)}, 0.9)`;
    const darkMenuHover = `rgba(${Math.min(255, rgbDarkMenu.r + 34)}, ${Math.min(255, rgbDarkMenu.g + 40)}, ${Math.min(255, rgbDarkMenu.b + 52)}, 0.95)`;

    // Compute surface and menu elevations for Light Mode
    const lightElevated = `rgba(${Math.max(0, rgbLightSurface.r - 8)}, ${Math.max(0, rgbLightSurface.g - 8)}, ${Math.max(0, rgbLightSurface.b - 8)}, 0.95)`;
    const lightHover = `rgba(${Math.max(0, rgbLightSurface.r - 18)}, ${Math.max(0, rgbLightSurface.g - 18)}, ${Math.max(0, rgbLightSurface.b - 18)}, 0.95)`;
    const lightMenuHeader = `rgba(${Math.max(0, rgbLightMenu.r - 8)}, ${Math.max(0, rgbLightMenu.g - 8)}, ${Math.max(0, rgbLightMenu.b - 8)}, 0.95)`;
    const lightMenuCard = lightColors.menu;
    const lightMenuHover = `rgba(${Math.max(0, rgbLightMenu.r - 14)}, ${Math.max(0, rgbLightMenu.g - 14)}, ${Math.max(0, rgbLightMenu.b - 14)}, 0.95)`;

    // Generate comprehensive rules for BOTH dark and light modes so shifting modes never breaks
    customStyleTag.innerHTML = `
      [data-theme="${customTheme.id}"][data-mode="dark"] {
        --color-brand: ${darkColors.brand};
        --color-brand-glow: rgba(${rgbDarkBrand.r}, ${rgbDarkBrand.g}, ${rgbDarkBrand.b}, 0.35);
        --border-focus: rgba(${rgbDarkBrand.r}, ${rgbDarkBrand.g}, ${rgbDarkBrand.b}, 0.6);
        --border-subtle: rgba(${rgbDarkBrand.r}, ${rgbDarkBrand.g}, ${rgbDarkBrand.b}, 0.2);
        --bg-body: #050a0e;
        --bg-app: ${darkColors.surface};
        --bg-surface: ${darkColors.surface};
        --bg-surface-elevated: ${darkElevated};
        --bg-surface-hover: ${darkHover};
        --color-header-bg: ${darkColors.header};
        --color-menu-bg: ${darkColors.menu};
        --color-menu-header-bg: ${darkMenuHeader};
        --color-menu-card-bg: ${darkMenuCard};
        --color-menu-card-hover: ${darkMenuHover};
        --color-menu-border: rgba(${rgbDarkBrand.r}, ${rgbDarkBrand.g}, ${rgbDarkBrand.b}, 0.25);
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --text-subtle: rgba(${rgbDarkBrand.r}, ${rgbDarkBrand.g}, ${rgbDarkBrand.b}, 0.85);
        --badge-emerald-text: ${darkColors.accent};
        --badge-emerald-bg: rgba(${rgbDarkAccent.r}, ${rgbDarkAccent.g}, ${rgbDarkAccent.b}, 0.16);
        --badge-emerald-border: rgba(${rgbDarkAccent.r}, ${rgbDarkAccent.g}, ${rgbDarkAccent.b}, 0.35);
      }

      [data-theme="${customTheme.id}"][data-mode="light"] {
        --color-brand: ${lightColors.brand};
        --color-brand-glow: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.22);
        --border-focus: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.45);
        --border-subtle: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.16);
        --bg-body: #f1f5f9;
        --bg-app: ${lightColors.surface};
        --bg-surface: ${lightColors.surface};
        --bg-surface-elevated: ${lightElevated};
        --bg-surface-hover: ${lightHover};
        --color-header-bg: ${lightColors.header};
        --color-menu-bg: ${lightColors.menu};
        --color-menu-header-bg: ${lightMenuHeader};
        --color-menu-card-bg: ${lightMenuCard};
        --color-menu-card-hover: ${lightMenuHover};
        --color-menu-border: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.2);
        --text-main: #0f172a;
        --text-muted: #475569;
        --text-subtle: rgba(${rgbLightBrand.r}, ${rgbLightBrand.g}, ${rgbLightBrand.b}, 0.9);
        --badge-emerald-text: ${lightColors.accent};
        --badge-emerald-bg: rgba(${rgbLightAccent.r}, ${rgbLightAccent.g}, ${rgbLightAccent.b}, 0.12);
        --badge-emerald-border: rgba(${rgbLightAccent.r}, ${rgbLightAccent.g}, ${rgbLightAccent.b}, 0.26);
      }
    `;

    // Update browser theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? darkColors.surface : lightColors.surface);
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
 * Render list of user-created custom themes into Settings Tab with Fixed Typography Layout & Dual-Mode Dots
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
    const darkColors = theme.modes?.dark || theme.colors || {
      brand: theme.primaryColor || '#2DD4BF',
      header: '#0C2B22',
      menu: '#091F18',
      surface: '#021A15',
      accent: '#10B981'
    };
    const lightColors = theme.modes?.light || {
      brand: darkenIfTooLight(darkColors.brand),
      header: '#CCFBF1',
      menu: '#FFFFFF',
      surface: '#F0FDFA',
      accent: darkenIfTooLight(darkColors.accent)
    };

    return `
      <div class="custom-theme-row ${isActive ? 'active' : ''}" data-theme-id="${theme.id}">
        <div class="custom-theme-dots custom-theme-dual-dots" onclick="setTheme('${theme.id}')" title="Klik untuk menerapkan tema (Mode Gelap & Terang)">
          <div class="ct-dots-row" title="Palet Mode Gelap">
            <span class="ct-mode-tag">D</span>
            <span class="ct-dot" style="background: ${darkColors.brand};" title="Brand (Dark)"></span>
            <span class="ct-dot" style="background: ${darkColors.header};" title="Header (Dark)"></span>
            <span class="ct-dot" style="background: ${darkColors.menu};" title="Menu (Dark)"></span>
            <span class="ct-dot" style="background: ${darkColors.surface};" title="Surface (Dark)"></span>
            <span class="ct-dot" style="background: ${darkColors.accent};" title="Accent (Dark)"></span>
          </div>
          <div class="ct-dots-row" title="Palet Mode Terang">
            <span class="ct-mode-tag">L</span>
            <span class="ct-dot" style="background: ${lightColors.brand};" title="Brand (Light)"></span>
            <span class="ct-dot" style="background: ${lightColors.header};" title="Header (Light)"></span>
            <span class="ct-dot" style="background: ${lightColors.menu};" title="Menu (Light)"></span>
            <span class="ct-dot" style="background: ${lightColors.surface};" title="Surface (Light)"></span>
            <span class="ct-dot" style="background: ${lightColors.accent};" title="Accent (Light)"></span>
          </div>
        </div>
        <div class="custom-theme-info" onclick="setTheme('${theme.id}')">
          <strong class="custom-theme-name">${escapeHtml(theme.name)}</strong>
          <div class="custom-theme-meta">
            <span class="custom-theme-base-badge">
              <i data-lucide="sun-moon"></i>
              Dual Mode
            </span>
            <span>${darkColors.brand} / ${lightColors.brand}</span>
          </div>
        </div>
        <div class="custom-theme-actions">
          <button type="button" class="btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}" onclick="setTheme('${theme.id}')">
            ${isActive ? (AppState.lang === 'en' ? 'Active' : 'Aktif') : (AppState.lang === 'en' ? 'Apply' : 'Pakai')}
          </button>
          <button type="button" class="btn-card-action btn-edit-theme" onclick="editCustomTheme('${theme.id}')" title="Edit Tema Kustom">
            <i data-lucide="pencil"></i>
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
 * Edit an existing user-created custom theme
 */
function editCustomTheme(id) {
  openCustomThemeModal(id);
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

// Global active creator state supporting dual-mode (Dark & Light)
let customCreatorState = {
  editingThemeId: null,
  name: '',
  activeMode: 'dark',
  activeRole: 'brand',
  hsv: { h: 174, s: 79, v: 83 },
  modes: {
    dark: {
      brand: '#2DD4BF',
      header: '#0C2B22',
      menu: '#091F18',
      surface: '#021A15',
      accent: '#10B981'
    },
    light: {
      brand: '#0D9488',
      header: '#CCFBF1',
      menu: '#FFFFFF',
      surface: '#F0FDFA',
      accent: '#059669'
    }
  }
};

/**
 * Open Custom Theme Creator Modal (Supports both Creating and Editing)
 */
function openCustomThemeModal(themeIdToEdit = null) {
  const modal = document.getElementById('custom-theme-modal');
  if (!modal) return;

  const modalTitle = document.getElementById('custom-theme-modal-title');
  const modalSub = document.getElementById('custom-theme-modal-sub');
  const saveBtnText = document.getElementById('btn-save-custom-theme-text');
  const nameInput = document.getElementById('custom-theme-name-input');

  if (themeIdToEdit) {
    // Edit Mode: Load existing custom theme
    const existing = AppState.customThemes.find(t => t.id === themeIdToEdit);
    if (!existing) return;

    const darkColors = existing.modes?.dark || existing.colors || {
      brand: existing.primaryColor || '#2DD4BF',
      header: '#0C2B22',
      menu: '#091F18',
      surface: '#021A15',
      accent: '#10B981'
    };
    const lightColors = existing.modes?.light || {
      brand: darkenIfTooLight(darkColors.brand),
      header: '#CCFBF1',
      menu: '#FFFFFF',
      surface: '#F0FDFA',
      accent: darkenIfTooLight(darkColors.accent)
    };

    customCreatorState = {
      editingThemeId: existing.id,
      name: existing.name || '',
      activeMode: AppState.themeMode || 'dark',
      activeRole: 'brand',
      hsv: hexToHsv(darkColors.brand),
      modes: {
        dark: { ...darkColors },
        light: { ...lightColors }
      }
    };

    if (modalTitle) modalTitle.textContent = AppState.lang === 'en' ? 'Edit Custom Theme' : 'Edit Tema Kustom';
    if (modalSub) modalSub.textContent = AppState.lang === 'en'
      ? 'Modify color palettes for both Dark and Light modes'
      : 'Ubah nama dan palet warna untuk Mode Gelap dan Mode Terang';
    if (saveBtnText) saveBtnText.textContent = AppState.lang === 'en' ? 'Save Changes' : 'Simpan Perubahan';
    if (nameInput) nameInput.value = existing.name || '';
  } else {
    // Create Mode: Initialize with default preset
    const defaultPreset = MULTI_COLOR_PRESETS['mint-emerald'];
    customCreatorState = {
      editingThemeId: null,
      name: '',
      activeMode: AppState.themeMode || 'dark',
      activeRole: 'brand',
      hsv: hexToHsv(defaultPreset.dark.brand),
      modes: {
        dark: { ...defaultPreset.dark },
        light: { ...defaultPreset.light }
      }
    };

    if (modalTitle) modalTitle.textContent = AppState.lang === 'en' ? 'Custom Theme Creator' : 'Pembuat Tema Kustom';
    if (modalSub) modalSub.textContent = AppState.lang === 'en'
      ? 'Customize colors for buttons, waves, sidebar, and cards'
      : 'Atur warna tombol, ombak, menu sidebar, dan kartu sesuka Anda';
    if (saveBtnText) saveBtnText.textContent = AppState.lang === 'en' ? 'Save & Apply' : 'Simpan & Terapkan';
    if (nameInput) nameInput.value = '';
  }

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
  const { modes, activeMode, activeRole, name } = customCreatorState;
  const currentModeColors = modes[activeMode] || modes.dark;
  const activeColor = currentModeColors[activeRole] || currentModeColors.brand;

  if (syncHsv) {
    customCreatorState.hsv = hexToHsv(activeColor);
  }

  // 1. Update Role Pill Swatch Dots for the currently selected mode
  const dotBrand = document.getElementById('role-dot-brand');
  const dotHeader = document.getElementById('role-dot-header');
  const dotMenu = document.getElementById('role-dot-menu');
  const dotSurface = document.getElementById('role-dot-surface');
  const dotAccent = document.getElementById('role-dot-accent');

  if (dotBrand) dotBrand.style.backgroundColor = currentModeColors.brand;
  if (dotHeader) dotHeader.style.backgroundColor = currentModeColors.header;
  if (dotMenu) dotMenu.style.backgroundColor = currentModeColors.menu;
  if (dotSurface) dotSurface.style.backgroundColor = currentModeColors.surface;
  if (dotAccent) dotAccent.style.backgroundColor = currentModeColors.accent;

  // 2. Update Role Pills Active State
  const rolePills = document.querySelectorAll('.color-role-pill');
  rolePills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-role') === activeRole);
  });

  // 3. Update Mode Switcher Pills & Indicators
  const darkBtn = document.getElementById('custom-mode-dark-btn');
  const lightBtn = document.getElementById('custom-mode-light-btn');
  const activeModePill = document.getElementById('active-mode-indicator-pill');

  if (darkBtn && lightBtn) {
    darkBtn.classList.toggle('active', activeMode === 'dark');
    lightBtn.classList.toggle('active', activeMode === 'light');
  }

  if (activeModePill) {
    activeModePill.textContent = activeMode === 'dark' ? 'Mengedit: Mode Gelap' : 'Mengedit: Mode Terang';
  }

  // 4. Update Current Role Indicator Label
  const roleIndicator = document.getElementById('current-editing-role-indicator');
  const roleNames = {
    brand: 'Warna Utama (Brand)',
    header: 'Header Atas & Ombak',
    menu: 'Menu Sidebar (Drawer)',
    surface: 'Latar Aplikasi (Surface)',
    accent: 'Aksen Diskon & Ikon'
  };
  if (roleIndicator) {
    const modeLabel = activeMode === 'dark' ? 'Mode Gelap' : 'Mode Terang';
    roleIndicator.textContent = `Mengedit: ${roleNames[activeRole] || 'Warna Utama'} (${modeLabel})`;
  }

  // 5. Update Hex Input and Swatch Display
  const hexInput = document.getElementById('custom-hex-input');
  const swatchDisplay = document.getElementById('custom-color-swatch-display');

  if (hexInput && document.activeElement !== hexInput) {
    hexInput.value = activeColor.toUpperCase();
  }
  if (swatchDisplay) {
    swatchDisplay.style.backgroundColor = activeColor;
  }

  // 6. Update Interactive 2D Field & Rainbow Hue Slider
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

  // 7. Update Live Preview Box Card
  updateLivePreviewCard();
}

/**
 * Update the Live Preview Card with real multi-color properties for the active mode
 */
function updateLivePreviewCard() {
  const { modes, activeMode, name } = customCreatorState;
  const currentColors = modes[activeMode] || modes.dark;

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
    previewBox.style.setProperty('--preview-brand', currentColors.brand);
    previewBox.style.setProperty('--preview-header', currentColors.header);
    previewBox.style.setProperty('--preview-menu', currentColors.menu);
    previewBox.style.setProperty('--preview-surface', currentColors.surface);
    previewBox.style.setProperty('--preview-accent', currentColors.accent);
  }

  if (previewHeader) {
    previewHeader.style.backgroundColor = currentColors.header;
  }

  if (previewWave1) previewWave1.style.fill = currentColors.brand;
  if (previewWave2) previewWave2.style.fill = currentColors.accent;

  if (previewMenuStrip) {
    previewMenuStrip.style.backgroundColor = currentColors.menu;
  }

  if (previewMenuIcon) {
    previewMenuIcon.style.backgroundColor = currentColors.brand;
    const lum = (0.299 * hexToRgb(currentColors.brand).r + 0.587 * hexToRgb(currentColors.brand).g + 0.114 * hexToRgb(currentColors.brand).b) / 255;
    previewMenuIcon.style.color = lum > 0.55 ? '#021a15' : '#ffffff';
  }

  if (previewMenuSub) {
    previewMenuSub.style.color = currentColors.accent;
  }

  if (previewSurface) {
    previewSurface.style.backgroundColor = currentColors.surface;
    if (previewItemName) {
      previewItemName.style.color = activeMode === 'dark' ? '#f8fafc' : '#0f172a';
    }
  }

  if (previewPrice) previewPrice.style.color = currentColors.accent;
  if (previewDiscount) {
    previewDiscount.style.color = currentColors.accent;
    previewDiscount.style.borderColor = currentColors.accent;
  }

  if (previewBtn) {
    previewBtn.style.backgroundColor = currentColors.brand;
    const lum = (0.299 * hexToRgb(currentColors.brand).r + 0.587 * hexToRgb(currentColors.brand).g + 0.114 * hexToRgb(currentColors.brand).b) / 255;
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

  if (openBtn) openBtn.addEventListener('click', () => openCustomThemeModal(null));
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
    customCreatorState.modes[customCreatorState.activeMode][customCreatorState.activeRole] = newHex;

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
      customCreatorState.modes[customCreatorState.activeMode][customCreatorState.activeRole] = newHex;
      updateCreatorUI(false);
    });
  }

  // Multi-Color Presets Click: Populates BOTH Dark and Light mode palettes
  const presetCards = document.querySelectorAll('.multi-color-preset-card');
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      presetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const presetKey = card.getAttribute('data-preset');
      const preset = MULTI_COLOR_PRESETS[presetKey];
      if (preset) {
        customCreatorState.modes = {
          dark: { ...preset.dark },
          light: { ...preset.light }
        };
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
        customCreatorState.modes[customCreatorState.activeMode][customCreatorState.activeRole] = val;
        updateCreatorUI(true);
      }
    });
  }

  // Randomize Color Button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      customCreatorState.modes[customCreatorState.activeMode][customCreatorState.activeRole] = randomHex;
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

  // Mode Switcher (Dark Mode vs Light Mode) inside Creator Modal
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      customCreatorState.activeMode = 'dark';
      updateCreatorUI(true);
    });
  }

  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      customCreatorState.activeMode = 'light';
      updateCreatorUI(true);
    });
  }

  // Save & Apply Custom Theme (Handles both Creating and Updating)
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const finalName = customCreatorState.name || `Tema ${customCreatorState.modes.dark.brand.toUpperCase()}`;

      if (customCreatorState.editingThemeId) {
        // Editing Existing Theme
        const existingIndex = AppState.customThemes.findIndex(t => t.id === customCreatorState.editingThemeId);
        if (existingIndex !== -1) {
          AppState.customThemes[existingIndex].name = finalName;
          AppState.customThemes[existingIndex].modes = {
            dark: { ...customCreatorState.modes.dark },
            light: { ...customCreatorState.modes.light }
          };
          AppState.customThemes[existingIndex].colors = { ...customCreatorState.modes.dark }; // fallback
          AppState.customThemes[existingIndex].updatedAt = Date.now();
        }
        saveCustomThemesToStorage();
        renderCustomThemesList();
        closeCustomThemeModal();

        // If currently applied theme is the one edited, re-apply styles to DOM immediately
        if (AppState.theme === customCreatorState.editingThemeId) {
          applyThemeToDOM(AppState.theme, AppState.themeMode);
        }

        if (typeof showToast === 'function') {
          showToast(AppState.lang === 'en'
            ? `Custom theme "${finalName}" updated!`
            : `Tema kustom "${finalName}" berhasil diperbarui!`, 'success');
        }
      } else {
        // Creating New Theme
        const newTheme = {
          id: 'custom_' + Date.now(),
          name: finalName,
          baseMode: customCreatorState.activeMode,
          primaryColor: customCreatorState.modes.dark.brand,
          modes: {
            dark: { ...customCreatorState.modes.dark },
            light: { ...customCreatorState.modes.light }
          },
          colors: { ...customCreatorState.modes.dark }, // fallback
          createdAt: Date.now()
        };

        AppState.customThemes.push(newTheme);
        saveCustomThemesToStorage();
        renderCustomThemesList();
        closeCustomThemeModal();

        // Immediately activate the new custom theme
        setTheme(newTheme.id);

        if (typeof showToast === 'function') {
          showToast(AppState.lang === 'en'
            ? `Custom theme "${finalName}" created & applied!`
            : `Tema kustom "${finalName}" berhasil dibuat & diterapkan!`, 'success');
        }
      }
    });
  }
}
