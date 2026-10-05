/**
 * Theme & Appearance Manager
 * Smart Grocery & Budget Safety Tracker
 * 
 * Supports 5 Visual Themes with Dark & Light Mode Variants:
 * 1. midnight (Slate Blue)
 * 2. emerald (Supermarket Green)
 * 3. sunset (Tangerine Amber)
 * 4. violet (Cyberpunk Lavender)
 * 5. rose (Berry Coral)
 */

const THEME_META_COLORS = {
  midnight: { dark: '#090d16', light: '#f8fafc' },
  emerald: { dark: '#041812', light: '#f0fdf4' },
  sunset: { dark: '#170d04', light: '#fff7ed' },
  violet: { dark: '#100620', light: '#faf5ff' },
  rose: { dark: '#18050b', light: '#fff1f2' }
};

/**
 * Initialize theme and mode on page load
 */
function initTheme() {
  const savedTheme = localStorage.getItem('smart_grocery_theme') || 'midnight';
  const savedMode = localStorage.getItem('smart_grocery_mode') || 'dark';

  AppState.theme = savedTheme;
  AppState.themeMode = savedMode;

  applyThemeToDOM(savedTheme, savedMode);
  updateThemeUI(savedTheme, savedMode);
}

/**
 * Apply theme and mode data attributes to <html> and <meta theme-color>
 */
function applyThemeToDOM(theme, mode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-mode', mode);

  // Update mobile browser address bar theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor && THEME_META_COLORS[theme] && THEME_META_COLORS[theme][mode]) {
    metaThemeColor.setAttribute('content', THEME_META_COLORS[theme][mode]);
  }
}

/**
 * Update UI icons, pills, and swatch cards to match current theme
 */
function updateThemeUI(theme, mode) {
  // 1. Update Header Quick Toggle Icon
  const modeBtnIcon = document.getElementById('mode-toggle-icon');
  if (modeBtnIcon) {
    // If current mode is dark, show sun (to switch to light); if light, show moon
    const targetIcon = mode === 'dark' ? 'sun' : 'moon';
    modeBtnIcon.setAttribute('data-lucide', targetIcon);
  }

  // 2. Update Settings Tab Mode Segmented Pills
  const pillDark = document.getElementById('pill-mode-dark');
  const pillLight = document.getElementById('pill-mode-light');

  if (pillDark) pillDark.classList.toggle('active', mode === 'dark');
  if (pillLight) pillLight.classList.toggle('active', mode === 'light');

  // 3. Update Settings Tab Theme Swatches
  const swatchCards = document.querySelectorAll('.theme-swatch-card');
  swatchCards.forEach(card => {
    const cardTheme = card.getAttribute('data-theme');
    card.classList.toggle('active', cardTheme === theme);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Change the active color theme (e.g. 'midnight', 'emerald', 'sunset', 'violet', 'rose')
 */
function setTheme(themeName) {
  if (!THEME_META_COLORS[themeName]) return;

  AppState.theme = themeName;
  localStorage.setItem('smart_grocery_theme', themeName);

  applyThemeToDOM(themeName, AppState.themeMode);
  updateThemeUI(themeName, AppState.themeMode);

  const themeNames = {
    midnight: 'Midnight Slate',
    emerald: 'Emerald Supermarket',
    sunset: 'Sunset Tangerine',
    violet: 'Cyberpunk Violet',
    rose: 'Rose Berry'
  };

  const displayName = themeNames[themeName] || themeName;
  const msg = AppState.lang === 'en' 
    ? `Theme set to: ${displayName}` 
    : `Tema diganti ke: ${displayName}`;

  if (typeof showToast === 'function') {
    showToast(msg);
  }
}

/**
 * Change the active theme mode ('dark' or 'light')
 */
function setThemeMode(mode) {
  if (mode !== 'dark' && mode !== 'light') return;

  AppState.themeMode = mode;
  localStorage.setItem('smart_grocery_mode', mode);

  applyThemeToDOM(AppState.theme, mode);
  updateThemeUI(AppState.theme, mode);

  const modeName = mode === 'dark' 
    ? (AppState.lang === 'en' ? 'Dark Mode' : 'Mode Gelap')
    : (AppState.lang === 'en' ? 'Light Mode' : 'Mode Terang');

  if (typeof showToast === 'function') {
    showToast(`${modeName} ${AppState.lang === 'en' ? 'activated' : 'diaktifkan'}`);
  }
}

/**
 * Toggle between Dark and Light mode
 */
function toggleThemeMode() {
  const nextMode = AppState.themeMode === 'dark' ? 'light' : 'dark';
  setThemeMode(nextMode);
}
