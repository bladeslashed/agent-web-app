import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIECES_DIR = path.join(__dirname, 'public', 'pieces');

if (!fs.existsSync(PIECES_DIR)) {
  fs.mkdirSync(PIECES_DIR, { recursive: true });
}

const PIECE_NAMES = [
  'wp', 'wn', 'wb', 'wr', 'wq', 'wk',
  'bp', 'bn', 'bb', 'br', 'bq', 'bk'
];

async function downloadPieces() {
  console.log('Downloading Chess.com Neo pieces to public/pieces/...');
  for (const p of PIECE_NAMES) {
    const url = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p}.png`;
    const targetFile = path.join(PIECES_DIR, `${p}.png`);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(targetFile, Buffer.from(buffer));
        console.log(`✓ Downloaded ${p}.png (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed to download ${p}: HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`Error downloading ${p}:`, err.message);
    }
  }
  console.log('All Chess.com pieces downloaded successfully!');
}

downloadPieces();
