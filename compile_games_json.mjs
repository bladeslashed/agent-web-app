import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;
const OUT_DIR = path.join(ROOT_DIR, 'public', 'data');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function parsePgnFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tags = {};
  const tagRegex = /\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]/g;
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    tags[m[1]] = m[2];
  }

  // Extract moves
  const moveText = content.replace(/\[[^\]]+\]/g, '').trim();

  return { tags, moves: moveText };
}

function run() {
  console.log('Compiling 1,756 PGN games into games.json...');
  const entries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  const yearDirs = entries
    .filter(e => e.isDirectory() && /^\d{4}$/.test(e.name))
    .map(e => e.name)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const allGames = [];
  let idCounter = 1;

  for (const year of yearDirs) {
    const yearPath = path.join(ROOT_DIR, year);
    const files = fs.readdirSync(yearPath).filter(f => f.endsWith('.pgn'));

    for (const f of files) {
      const fullPath = path.join(yearPath, f);
      const { tags, moves } = parsePgnFile(fullPath);

      const moveCount = tags.MoveCount ? parseInt(tags.MoveCount, 10) : 0;
      const plyCount = tags.PlyCount ? parseInt(tags.PlyCount, 10) : 0;

      const gameObj = {
        id: `g_${year}_${idCounter++}`,
        year: parseInt(year, 10),
        event: tags.Event || `World Championship ${year}`,
        site: tags.Site || '',
        date: tags.Date || `${year}.??.??`,
        round: tags.Round || '1',
        white: tags.White || 'Unknown',
        black: tags.Black || 'Unknown',
        result: tags.Result || '*',
        whiteElo: tags.WhiteElo || '',
        blackElo: tags.BlackElo || '',
        eco: tags.ECO || '',
        moveCount: isNaN(moveCount) ? 0 : moveCount,
        plyCount: isNaN(plyCount) ? 0 : plyCount,
        filename: `${year}/${f}`,
        moves: moves
      };

      allGames.push(gameObj);
    }
  }

  const outPath = path.join(OUT_DIR, 'games.json');
  fs.writeFileSync(outPath, JSON.stringify(allGames), 'utf8');
  const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Successfully compiled ${allGames.length} games to ${outPath} (${sizeMb} MB)`);
}

run();
