// Service Worker for Smart Grocery & Budget Safety Tracker
const CACHE_NAME = 'smart-grocery-v1.2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Audio SFX
  './sfx/miraclei-sample_confirm_accept02_kofi_by_miraclei-364180.mp3',
  // Modular CSS
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/header.css',
  './css/navigation.css',
  './css/cart.css',
  './css/history.css',
  './css/settings.css',
  './css/modals.css',
  // Modular JS
  './js/config.js',
  './js/data/shelfProducts.js',
  './js/utils.js',
  './js/i18n.js',
  './js/budget.js',
  './js/cart.js',
  './js/history.js',
  './js/shelf.js',
  './js/theme.js',
  './js/auth.js',
  './js/modals.js'
];

// Install event - caching assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache-first with network fallback for local assets, network-first for external CDNs
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Direct network bypass for Firebase Auth, Google APIs, and Firestore
  if (url.hostname.includes('googleapis.com') || 
      url.hostname.includes('google.com') || 
      url.hostname.includes('gstatic.com') || 
      url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('firebaseapp.com')) {
    return;
  }

  // If local asset or same origin
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cache and fetch update in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return response;
        });
      })
    );
  } else {
    // External resources (fonts, cdn)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return response;
          }).catch(() => {
            // Offline fallback if needed
            return cachedResponse;
          })
        );
      })
    );
  }
});
