/**
 * Staging script to prepare clean web assets for Capacitor in `www/`
 * Ensures only client-side web runtime files are packaged into the Android APK.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WWW_DIR = path.join(ROOT_DIR, 'www');

// List of files and directories to bundle into www/
const ASSET_ITEMS = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'service-worker.js',
  'css',
  'js',
  'icons',
  'sfx'
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const children = fs.readdirSync(src);
    for (const child of children) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function prepareWww() {
  console.log('[Prepare-WWW] Cleaning previous www/ folder...');
  if (fs.existsSync(WWW_DIR)) {
    fs.rmSync(WWW_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(WWW_DIR, { recursive: true });

  console.log('[Prepare-WWW] Copying client-side assets to www/...');
  let count = 0;

  for (const item of ASSET_ITEMS) {
    const srcPath = path.join(ROOT_DIR, item);
    const destPath = path.join(WWW_DIR, item);

    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, destPath);
      count++;
      console.log(`  + Added: ${item}`);
    } else {
      console.warn(`  - Warning: ${item} not found, skipped.`);
    }
  }

  console.log(`[Prepare-WWW] Successfully staged ${count} asset items into www/`);
}

prepareWww();
