const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdrData),
    createChunk('IDAT', compressedData),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

// Icon rendering functions
function drawLauncher(x, y, w, h, isRound = false) {
  const nx = x / w;
  const ny = y / h;
  const dx = nx - 0.5;
  const dy = ny - 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (isRound) {
    if (dist > 0.48) return [0, 0, 0, 0];
  } else {
    // Squircle check
    const cornerRadius = 0.22;
    const ax = Math.abs(dx) - (0.5 - cornerRadius);
    const ay = Math.abs(dy) - (0.5 - cornerRadius);
    if (ax > 0 && ay > 0 && Math.sqrt(ax * ax + ay * ay) > cornerRadius) {
      return [0, 0, 0, 0];
    }
  }

  // Background gradient
  const bgR = Math.round(15 + 20 * nx);
  const bgG = Math.round(23 + 60 * ny);
  const bgB = Math.round(42 + 80 * (1 - ny));

  // Accent ring
  if (isRound && dist > 0.44 && dist <= 0.47) {
    return [16, 185, 129, 255];
  }

  // Cart elements
  const cartTop = 0.32;
  const cartBottom = 0.58;
  const cartLeft = 0.28;
  const cartRight = 0.72;

  const inCart = (ny >= cartTop && ny <= cartBottom && nx >= cartLeft + (ny - cartTop) * 0.15 && nx <= cartRight);
  const inHandle = (ny >= 0.28 && ny <= 0.35 && nx >= 0.20 && nx <= 0.30);
  const inWheel1 = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.68) ** 2) < 0.055;
  const inWheel2 = Math.sqrt((nx - 0.64) ** 2 + (ny - 0.68) ** 2) < 0.055;
  const inBadge = Math.sqrt((nx - 0.52) ** 2 + (ny - 0.44) ** 2) < 0.09;

  if (inBadge) return [245, 158, 11, 255]; // Amber shield center
  if (inCart || inHandle || inWheel1 || inWheel2) return [255, 255, 255, 255]; // White cart

  return [bgR, bgG, bgB, 255];
}

function drawForeground(x, y, w, h) {
  // Foreground for adaptive icons:
  // Center is (0.5, 0.5). Scale cart to fit central 60% safe area.
  const nx = 0.5 + (x / w - 0.5) * 1.5;
  const ny = 0.5 + (y / h - 0.5) * 1.5;

  const cartTop = 0.32;
  const cartBottom = 0.58;
  const cartLeft = 0.28;
  const cartRight = 0.72;

  const inCart = (ny >= cartTop && ny <= cartBottom && nx >= cartLeft + (ny - cartTop) * 0.15 && nx <= cartRight);
  const inHandle = (ny >= 0.28 && ny <= 0.35 && nx >= 0.20 && nx <= 0.30);
  const inWheel1 = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.68) ** 2) < 0.055;
  const inWheel2 = Math.sqrt((nx - 0.64) ** 2 + (ny - 0.68) ** 2) < 0.055;
  const inBadge = Math.sqrt((nx - 0.52) ** 2 + (ny - 0.44) ** 2) < 0.09;

  if (inBadge) return [245, 158, 11, 255];
  if (inCart || inHandle || inWheel1 || inWheel2) return [255, 255, 255, 255];

  // Rest is transparent so background shows through
  return [0, 0, 0, 0];
}

const RES_DIR = path.resolve(__dirname, '../android/app/src/main/res');

const DENSITIES = [
  { name: 'mipmap-mdpi', launcherSize: 48, fgSize: 108 },
  { name: 'mipmap-hdpi', launcherSize: 72, fgSize: 162 },
  { name: 'mipmap-xhdpi', launcherSize: 96, fgSize: 216 },
  { name: 'mipmap-xxhdpi', launcherSize: 144, fgSize: 324 },
  { name: 'mipmap-xxxhdpi', launcherSize: 192, fgSize: 432 },
];

function generateAndroidIcons() {
  console.log('[Android-Icons] Generating launcher & adaptive icons...');
  
  for (const d of DENSITIES) {
    const dir = path.join(RES_DIR, d.name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. ic_launcher.png
    const launcherPng = createPng(d.launcherSize, d.launcherSize, (x, y, w, h) => drawLauncher(x, y, w, h, false));
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), launcherPng);

    // 2. ic_launcher_round.png
    const roundPng = createPng(d.launcherSize, d.launcherSize, (x, y, w, h) => drawLauncher(x, y, w, h, true));
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), roundPng);

    // 3. ic_launcher_foreground.png
    const fgPng = createPng(d.fgSize, d.fgSize, drawForeground);
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), fgPng);

    console.log(`  + Generated icons for ${d.name} (${d.launcherSize}x${d.launcherSize}, FG ${d.fgSize}x${d.fgSize})`);
  }

  console.log('[Android-Icons] All Android mipmap icons generated successfully!');
}

generateAndroidIcons();
