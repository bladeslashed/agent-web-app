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
// STORAGE KEYS & APPLICATION STATE
// ==========================================
const STORAGE_KEYS = {
  CART: 'smart_grocery_cart',
  BUDGET_CAP: 'smart_grocery_budget_cap',
  HISTORY: 'smart_grocery_history',
  LANG: 'smart_grocery_lang',
  THEME: 'smart_grocery_theme',
  MODE: 'smart_grocery_mode'
};

const AppState = {
  budgetCap: 500000,
  cart: [],
  history: [],
  activeTab: 'tab-belanja',
  deferredInstallPrompt: null,
  lastLocalUpdate: Date.now(),
  lang: localStorage.getItem('smart_grocery_lang') || 'id',
  theme: localStorage.getItem('smart_grocery_theme') || 'midnight',
  themeMode: localStorage.getItem('smart_grocery_mode') || 'dark',
  pendingCheckout: false,
  shelfCategoryFilter: 'all',
  shelfSearchQuery: ''
};
