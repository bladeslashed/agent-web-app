/**
 * Global Configuration & State Management
 * Smart Grocery & Budget Safety Tracker
 */

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAU8kV1fQxBM5oVv5dWl921geBJoJzFEa4",
  authDomain: "shop-tracked.firebaseapp.com",
  projectId: "shop-tracked",
  storageBucket: "shop-tracked.firebasestorage.app",
  messagingSenderId: "521957538184",
  appId: "1:521957538184:web:6884a716cd568125d2623d",
  measurementId: "G-YT6J8SC5VP"
};

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let currentUser = null;
let firestoreUnsubscribe = null;
let isRemoteSyncInProgress = false;

// ==========================================
// DEFAULT SUPERMARKET & STORE LOCATIONS
// ==========================================
const DEFAULT_LOCATIONS = [
  'Lotte Mart Grocery - Puri Indah',
  'Super Indo - Intercon Kebon Jeruk',
  'Hypermart - Puri Indah Mall',
  'Grand Lucky Superstore - SCBD',
  'Ranch Market - Pesanggrahan',
  'Farmers Market - Mall Kelapa Gading',
  'AEON Store - BSD City',
  'Transmart Carrefour - Cempaka Putih',
  'Hero Supermarket - Pondok Indah Mall',
  'GS The Fresh Supermarket',
  'Food Hall - Senayan City',
  'Kem Chicks - Pacific Place',
  'Papaya Fresh Gallery - Blok M',
  'Alfamidi Super',
  'Indomaret Fresh',
  'Pasar Tradisional'
];

// ==========================================
// STORAGE KEYS & APPLICATION STATE
// ==========================================
const STORAGE_KEYS = {
  CART: 'smart_grocery_cart',
  BUDGET_CAP: 'smart_grocery_budget_cap',
  HISTORY: 'smart_grocery_history',
  LANG: 'smart_grocery_lang',
  THEME: 'smart_grocery_theme',
  MODE: 'smart_grocery_mode',
  CUSTOM_THEMES: 'smart_grocery_custom_themes',
  LOCATIONS: 'smart_grocery_locations',
  MUTE_SYNC: 'smart_grocery_mute_sync',
  DELETED_HISTORY: 'smart_grocery_deleted_history',
  LAST_UPDATE: 'smart_grocery_last_update'
};

const AppState = {
  budgetCap: Number(localStorage.getItem('smart_grocery_budget_cap')) || 500000,
  cart: [],
  history: [],
  locations: [],
  activeTab: 'tab-belanja',
  deferredInstallPrompt: null,
  lastLocalUpdate: Number(localStorage.getItem('smart_grocery_last_update')) || 0,
  lang: localStorage.getItem('smart_grocery_lang') || 'id',
  theme: localStorage.getItem('smart_grocery_theme') || 'mint',
  themeMode: localStorage.getItem('smart_grocery_mode') || 'dark',
  pendingCheckout: false,
  shelfCategoryFilter: 'all',
  shelfSearchQuery: '',
  analyticsPeriod: 'all',
  discountChartMode: 'category',
  ogiveGranularity: 'monthly',
  ogiveDisplayType: 'ogive',
  customThemes: [],
  deletedHistoryIds: [],
  muteSyncNotifications: localStorage.getItem('smart_grocery_mute_sync') === 'true'
};

