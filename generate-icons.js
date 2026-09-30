const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None
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

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
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

// Draw a beautiful grocery cart & shield icon
function drawIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background rounded squircle / gradient
  const bgR = Math.round(15 + 20 * nx);
  const bgG = Math.round(23 + 60 * ny);
  const bgB = Math.round(42 + 80 * (1 - ny));

  // Outer border glow
  if (dist > 0.48) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Emerald ring / accent badge
  if (dist > 0.44 && dist <= 0.47) {
    return [16, 185, 129, 255]; // Emerald accent
  }

  // Cart body coordinates
  const cartTop = 0.32;
  const cartBottom = 0.58;
  const cartLeft = 0.28;
  const cartRight = 0.72;

  // Shopping cart basket check
  const inCart = (ny >= cartTop && ny <= cartBottom && nx >= cartLeft + (ny - cartTop) * 0.15 && nx <= cartRight);
  const inHandle = (ny >= 0.28 && ny <= 0.35 && nx >= 0.20 && nx <= 0.30);
  const inWheel1 = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.68) ** 2) < 0.055;
  const inWheel2 = Math.sqrt((nx - 0.64) ** 2 + (ny - 0.68) ** 2) < 0.055;

  // Grocery checkmark / dollar / spark inside cart
  const inBadge = Math.sqrt((nx - 0.52) ** 2 + (ny - 0.44) ** 2) < 0.09;

  if (inBadge) {
    return [245, 158, 11, 255]; // Amber shield center
  }
  if (inCart || inHandle || inWheel1 || inWheel2) {
    return [255, 255, 255, 255]; // White cart
  }

  // Inner background
  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, drawIcon));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, drawIcon));
console.log('Icons generated successfully!');
