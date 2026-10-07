/**
 * Smart Grocery & Budget Safety Tracker
 * HTML Builder / Component Assembler
 * 
 * Run `node build.js` to compile components/*.html into index.html
 */

const fs = require('fs');
const path = require('path');

function readComponent(relPath) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Component not found: ${fullPath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8').trim();
}

function buildIndexHtml() {
  console.log('[Build] Reading modular HTML components...');

  const headerHtml = readComponent('components/header.html');
  const cartTabHtml = readComponent('components/cart-tab.html');
  const historyTabHtml = readComponent('components/history-tab.html');
  const analyticsTabHtml = readComponent('components/analytics-tab.html');
  const settingsTabHtml = readComponent('components/settings-tab.html');
  const navHtml = readComponent('components/navigation.html');
  const addItemModalHtml = readComponent('components/modals/add-item-modal.html');
  const historyDetailModalHtml = readComponent('components/modals/history-detail-modal.html');
  const authModalHtml = readComponent('components/modals/auth-modal.html');
  const shelfCatalogModalHtml = readComponent('components/modals/shelf-catalog-modal.html');
  const checkoutSuccessModalHtml = readComponent('components/modals/checkout-success-modal.html');

  const compiledHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#0f172a">
  <meta name="description" content="Smart Grocery & Budget Safety Tracker - Asisten belanja bulanan hemat dan pengendali anggaran belanja troli untuk siswa rantau.">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="SmartGrocery">
  
  <title>Smart Grocery & Budget Safety Tracker</title>
  
  <!-- Favicon and PWA Manifest -->
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  
  <!-- Modern Font: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- Firebase SDKs (Compat v10 for PWA client) -->
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js"></script>

  <!-- Chart.js CDN & Local Fallback for Offline PWA Support -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>if (typeof Chart === 'undefined') { document.write('<script src="js/lib/chart.umd.js"><\\/script>'); }</script>

  <!-- Modular Stylesheet (Master stylesheet imports css/*.css) -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Desktop Decorative Backdrop Container -->
  <div class="desktop-wrapper">
    <div class="mobile-device">
      
      <!-- COMPONENT: HEADER & STICKY BUDGET SAFETY CAP (components/header.html) -->
      ${headerHtml}

      <!-- Main Scrollable Content Area -->
      <main class="app-content">

        <!-- COMPONENT: TAB 1 BELANJA (components/cart-tab.html) -->
        ${cartTabHtml}

        <!-- COMPONENT: TAB 2 RIWAYAT (components/history-tab.html) -->
        ${historyTabHtml}

        <!-- COMPONENT: TAB 3 GRAFIK & ANALISIS (components/analytics-tab.html) -->
        ${analyticsTabHtml}

        <!-- COMPONENT: TAB 4 ANGGARAN & AKUN (components/settings-tab.html) -->
        ${settingsTabHtml}

      </main>

      <!-- COMPONENT: BOTTOM NAVIGATION BAR (components/navigation.html) -->
      ${navHtml}

      <!-- COMPONENT: MODALS & BOTTOM SHEETS -->
      <!-- Add Item Modal (components/modals/add-item-modal.html) -->
      ${addItemModalHtml}

      <!-- History Detail Modal (components/modals/history-detail-modal.html) -->
      ${historyDetailModalHtml}

      <!-- Firebase Auth & Google Login Modal (components/modals/auth-modal.html) -->
      ${authModalHtml}

      <!-- Supermarket Shelf Catalog Popup (components/modals/shelf-catalog-modal.html) -->
      ${shelfCatalogModalHtml}

      <!-- Animated Shopping Cart Checkout Success Popup (components/modals/checkout-success-modal.html) -->
      ${checkoutSuccessModalHtml}

      <!-- Toast Feedback Notification Element -->
      <div id="app-toast" class="app-toast hidden" role="status" aria-live="polite">
        <div class="toast-icon"><i data-lucide="info"></i></div>
        <div class="toast-message" id="toast-message">Pesan notifikasi</div>
      </div>

    </div>
  </div>

  <!-- Modular JavaScript Application Scripts -->
  <script src="js/config.js"></script>
  <script src="js/data/shelfProducts.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/budget.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/history.js"></script>
  <script src="js/shelf.js"></script>
  <script src="js/theme.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/modals.js"></script>
  <script src="js/analytics.js"></script>
  <script src="app.js"></script>
</body>
</html>
`;

  const outputPath = path.join(__dirname, 'index.html');
  fs.writeFileSync(outputPath, compiledHtml, 'utf8');
  console.log(`[Build] Successfully compiled index.html (${compiledHtml.length} bytes)`);
}

buildIndexHtml();
