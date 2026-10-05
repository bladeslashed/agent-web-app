# 🛒 ShopTracked — Smart Grocery & Budget Safety Tracker

> **A modern, mobile-first PWA for supermarket shoppers and students to manage groceries, calculate discounts, prevent overspending, and track monthly shopping trends.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%26%20Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🌟 Key Features

### 1. 🛡️ Live Budget Safety Cap
- Real-time spending progress meter with smart thresholds:
  - **Safe (0–79%)**: Healthy budget margin.
  - **Warning (80–99%)**: Approaching the configured safety limit.
  - **Over Budget (100%+)**: Immediate visual alert with overspend indicators.
- Dynamic remaining budget counter with single-tap budget ceiling configuration.

### 2. 🏷️ Real-Time Multi-Tier Discount Calculator
- Supports multiple discount structures commonly found in retail and supermarkets:
  - **Percentage Off (`%`)**: Direct percent deduction (e.g., 20% off).
  - **Direct Nominal Cut (`Rp`)**: Fixed price slash (e.g., Rp 5.000 off).
  - **Buy X Get Y Free Promo**: Automatically computes required free item offsets.
- Clear breakdown of **Original Price**, **Total Savings / Hemat**, and **Final Net Price**.

### 3. 📊 Monthly Expenditure Comparator
- Compares each shopping trip or month against previous expenditure history.
- Displays spending delta and percentage changes (`↓ Saved` or `↑ Overspend`).
- Full transaction receipts with itemized breakdown and timestamps.

### 4. ⚡ Shelf Catalog Quick-Picker & Barcode Scanner
- Built-in supermarket shelf catalog organized by category:
  - Fresh Produce, Dairy & Eggs, Pantry & Grains, Meat & Seafood, Snacks & Drinks, Household Essentials.
- Quick one-click add to cart from curated shelf items.
- Integrated camera-based barcode / QR code scanner support for instant product lookup.

### 5. ✏️ Full Item Editing & Cart Management
- Edit item name, base price, quantity, discount type/value, and category at any time.
- Smooth swipe/tap item removal, counter adjustment, and clear cart options.

### 6. 🎨 5 Harmonious Color Themes & Flawless Light/Dark Mode
- Seamless transitions between **Dark Mode** and **Light Mode** across all elements.
- 5 curated color palettes:
  - 🌿 **Emerald Mint** (Clean fresh supermarket aesthetic)
  - 🌌 **Midnight Slate** (High-tech contrast)
  - 👑 **Indigo Royal** (Deep navy elegance)
  - 🌅 **Sunset Amber** (Warm vibrant tones)
  - 🌸 **Rose Quartz** (Modern chic pastel)

### 7. ☁️ Offline-First + Firebase Cloud Sync
- **Offline-First**: All data is automatically saved locally in `localStorage`. You can shop inside supermarkets without an active cellular connection.
- **Firebase Authentication**: Quick sign-in with Google.
- **Cloud Firestore**: Seamless background sync of shopping lists and historical receipts across all your devices.

### 8. 🛍️ Interactive Checkout Celebration
- Animated supermarket cart with spinning wheel physics.
- Groceries securely anchored inside the trolley basket.
- Optional audio confirmation effect (SFX) on checkout.
- Clean, responsive transaction summary formatted for all mobile screens.

---

## 🏗️ Project Architecture & Tech Stack

```
ictdt2/
├── app.js                          # Core application lifecycle & event routing
├── index.html                      # Single-page application entry point (generated via build.js)
├── build.js                        # Modular HTML component compiler
├── package.json                    # Project metadata & deployment scripts
├── manifest.json                   # Web App Manifest for mobile installation
├── sw.js                           # Service Worker for offline PWA caching
├── firebase.json                   # Firebase Hosting & Firestore configuration
├── firestore.rules                 # Cloud Firestore security rules
├── .firebaserc                     # Active Firebase project link (`shop-tracked`)
│
├── components/                     # Modular HTML components
│   ├── header.html                 # App topbar, user profile, budget cap meter
│   ├── cart-tab.html               # Active shopping cart & live total footer
│   ├── shelf-tab.html              # Shelf catalog quick picker
│   ├── history-tab.html            # Past transactions & monthly comparator
│   ├── settings-tab.html           # Theme selector, language, budget setting
│   ├── bottom-nav.html             # Mobile navigation bar
│   └── modals/                     # Modal overlays & bottom sheets
│       ├── add-item-modal.html     # Add / Edit item sheet
│       ├── auth-modal.html         # Google Sign-In & cloud sync modal
│       ├── checkout-success-modal.html # Cart animation & receipt popup
│       ├── history-detail-modal.html   # Itemized transaction receipt
│       └── shelf-catalog-modal.html    # Expanded shelf category selector
│
├── css/                            # Modern Vanilla CSS Design System
│   ├── base.css                    # CSS resets & layout constraints
│   ├── variables.css               # Color tokens, themes, light/dark palettes
│   ├── components.css              # Cards, inputs, buttons, badges
│   ├── cart.css                    # Cart list, discount badges, totals
│   ├── modals.css                  # Bottom sheets, animated cart stage, comp pill
│   ├── settings.css                # Settings form controls & theme cards
│   └── history.css                 # History list, receipts, stat cards
│
├── js/                             # Modular JavaScript Architecture
│   ├── state.js                    # Global reactive state (AppState)
│   ├── cart.js                     # Cart CRUD, pricing, discounts
│   ├── modals.js                   # Modal controller & checkout animations
│   ├── history.js                  # Transaction logging & comparison logic
│   ├── shelf.js                    # Shelf catalog data & picker
│   ├── scanner.js                  # Barcode scanner integration
│   ├── auth.js                     # Firebase Google Auth & offline fallback
│   ├── storage.js                  # LocalStorage & Firestore sync layer
│   ├── theme.js                    # Theme switcher & light/dark modes
│   ├── i18n.js                     # Multilingual support (ID / EN)
│   └── data.js                     # Default product presets & mock data
│
└── sfx/                            # Sound effects
    └── miraclei-sample_confirm_accept02_kofi_by_miraclei-364180.mp3
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/bladeslashed/agent-web-app.git
   cd agent-web-app
   ```

2. Compile the modular HTML components:
   ```bash
   node build.js
   ```

3. Serve the application locally using any static web server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```

4. Open your browser and navigate to `http://localhost:8080`.

---

## ⚙️ Build & Deployment

### Build HTML Components
When modifying files inside `components/`, recompile the main `index.html`:
```bash
npm run build
# runs: node build.js
```

### Deploy to Firebase
Deploy both Firebase Hosting and Firestore security rules:
```bash
npm run deploy
# runs: firebase deploy --only hosting,firestore
```

---

## 📱 Mobile PWA Installation
1. Open the deployed application URL in Chrome (Android) or Safari (iOS).
2. Tap the browser menu (**⋮** or **Share** icon).
3. Select **"Add to Home Screen"** / **"Install App"**.
4. Launch ShopTracked directly from your home screen as a standalone application.

---

## 📄 License
This project is licensed under the MIT License.
