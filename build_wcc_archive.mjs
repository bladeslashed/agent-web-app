import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = __dirname;

// Events from the 20th century (and 2000)
const MATCH_FILES = [
  { file: 'events/WorldChamp1907.pgn', year: 1907, match: 'World Championship 1907 (Lasker vs Marshall)' },
  { file: 'events/WorldChamp1908.pgn', year: 1908, match: 'World Championship 1908 (Lasker vs Tarrasch)' },
  { file: 'events/WorldChamp1909.pgn', year: 1909, match: 'World Championship 1909 (Lasker vs Janowski)' },
  { file: 'events/WorldChamp1910a.pgn', year: 1910, match: 'World Championship 1910 (Lasker vs Schlechter)' },
  { file: 'events/WorldChamp1910b.pgn', year: 1910, match: 'World Championship 1910 (Lasker vs Janowski)' },
  { file: 'events/WorldChamp1921.pgn', year: 1921, match: 'World Championship 1921 (Capablanca vs Lasker)' },
  { file: 'events/WorldChamp1927.pgn', year: 1927, match: 'World Championship 1927 (Alekhine vs Capablanca)' },
  { file: 'events/WorldChamp1929.pgn', year: 1929, match: 'World Championship 1929 (Alekhine vs Bogoljubov)' },
  { file: 'events/WorldChamp1934.pgn', year: 1934, match: 'World Championship 1934 (Alekhine vs Bogoljubov)' },
  { file: 'events/WorldChamp1935.pgn', year: 1935, match: 'World Championship 1935 (Euwe vs Alekhine)' },
  { file: 'events/WorldChamp1937.pgn', year: 1937, match: 'World Championship 1937 (Alekhine vs Euwe)' },
  { file: 'events/WorldChamp1948.pgn', year: 1948, match: 'World Championship 1948 Tournament (Botvinnik 1st)' },
  { file: 'events/WorldChamp1951.pgn', year: 1951, match: 'World Championship 1951 (Botvinnik vs Bronstein)' },
  { file: 'events/WorldChamp1954.pgn', year: 1954, match: 'World Championship 1954 (Botvinnik vs Smyslov)' },
  { file: 'events/WorldChamp1957.pgn', year: 1957, match: 'World Championship 1957 (Smyslov vs Botvinnik)' },
  { file: 'events/WorldChamp1958.pgn', year: 1958, match: 'World Championship 1958 (Botvinnik vs Smyslov)' },
  { file: 'events/WorldChamp1960.pgn', year: 1960, match: 'World Championship 1960 (Tal vs Botvinnik)' },
  { file: 'events/WorldChamp1961.pgn', year: 1961, match: 'World Championship 1961 (Botvinnik vs Tal)' },
  { file: 'events/WorldChamp1963.pgn', year: 1963, match: 'World Championship 1963 (Petrosian vs Botvinnik)' },
  { file: 'events/WorldChamp1966.pgn', year: 1966, match: 'World Championship 1966 (Petrosian vs Spassky)' },
  { file: 'events/WorldChamp1969.pgn', year: 1969, match: 'World Championship 1969 (Spassky vs Petrosian)' },
  { file: 'events/WorldChamp1972.pgn', year: 1972, match: 'World Championship 1972 (Spassky vs Fischer)' },
  { file: 'events/WorldChamp1978.pgn', year: 1978, match: 'World Championship 1978 (Karpov vs Korchnoi)' },
  { file: 'events/WorldChamp1981.pgn', year: 1981, match: 'World Championship 1981 (Karpov vs Korchnoi)' },
  { file: 'events/WorldChamp1984.pgn', year: 1984, match: 'World Championship 1984/85 (Karpov vs Kasparov)' },
  { file: 'events/WorldChamp1985.pgn', year: 1985, match: 'World Championship 1985 (Kasparov vs Karpov)' },
  { file: 'events/WorldChamp1986.pgn', year: 1986, match: 'World Championship 1986 (Kasparov vs Karpov)' },
  { file: 'events/WorldChamp1987.pgn', year: 1987, match: 'World Championship 1987 (Kasparov vs Karpov)' },
  { file: 'events/WorldChamp1990.pgn', year: 1990, match: 'World Championship 1990 (Kasparov vs Karpov)' },
  { file: 'events/FideChamp1993.pgn', year: 1993, match: 'FIDE World Championship 1993 (Karpov vs Timman)' },
  { file: 'events/PCAChamp1993.pgn', year: 1993, match: 'PCA World Championship 1993 (Kasparov vs Short)' },
  { file: 'events/PCAChamp1995.pgn', year: 1995, match: 'PCA World Championship 1995 (Kasparov vs Anand)' },
  { file: 'events/FideChamp1996.pgn', year: 1996, match: 'FIDE World Championship 1996 (Karpov vs Kamsky)' },
  { file: 'events/FideChamp1998.pgn', year: 1998, match: 'FIDE World Championship 1998 (Karpov vs Anand)' },
  { file: 'events/FideChamp1999.pgn', year: 1999, match: 'FIDE World Championship 1999 (Khalifman vs Akopian)' },
  { file: 'events/WorldChamp2000.pgn', year: 2000, match: 'Classical World Championship 2000 (Kramnik vs Kasparov)' },
  { file: 'events/FideChamp2000.pgn', year: 2000, match: 'FIDE World Championship 2000 (Anand vs Shirov)' },
  { file: 'events/FideChamp2002.pgn', year: 2002, match: 'FIDE World Championship 2001/2002 (Ponomariov vs Ivanchuk)' },
  { file: 'events/WorldChamp2004.pgn', year: 2004, match: 'Classical World Championship 2004 (Kramnik vs Leko)' },
  { file: 'events/FideChamp2004.pgn', year: 2004, match: 'FIDE World Championship 2004 (Kasimdzhanov vs Adams)' },
  { file: 'events/FideChamp2005.pgn', year: 2005, match: 'FIDE World Championship 2005 Tournament (Topalov 1st)' },
  { file: 'events/WorldChamp2006.pgn', year: 2006, match: 'World Championship Reunification 2006 (Kramnik vs Topalov)' },
  { file: 'events/WorldChamp2007.pgn', year: 2007, match: 'World Championship Tournament 2007 (Anand 1st)' },
  { file: 'events/WorldChamp2008.pgn', year: 2008, match: 'World Championship 2008 (Anand vs Kramnik)' },
  { file: 'events/WorldChamp2010.pgn', year: 2010, match: 'World Championship 2010 (Anand vs Topalov)' },
  { file: 'events/WorldChamp2012.pgn', year: 2012, match: 'World Championship 2012 (Anand vs Gelfand)' },
  { file: 'events/WorldChamp2013.pgn', year: 2013, match: 'World Championship 2013 (Carlsen vs Anand)' },
  { file: 'events/WorldChamp2014.pgn', year: 2014, match: 'World Championship 2014 (Carlsen vs Anand)' },
  { file: 'events/WorldChamp2016.pgn', year: 2016, match: 'World Championship 2016 (Carlsen vs Karjakin)' },
  { file: 'events/WorldChamp2018.pgn', year: 2018, match: 'World Championship 2018 (Carlsen vs Caruana)' },
  { file: 'events/WorldChamp2021.pgn', year: 2021, match: 'World Championship 2021 (Carlsen vs Nepomniachtchi)' },
  { file: 'events/WorldChamp2023.pgn', year: 2023, match: 'World Championship 2023 (Ding Liren vs Nepomniachtchi)' },
  { file: 'events/WorldChamp2024.pgn', year: 2024, match: 'World Championship 2024 (Ding Liren vs Gukesh D)' }
];

function sanitizeName(name) {
  if (!name) return 'Unknown';
  // If "Lastname, Firstname", keep "Lastname" or clean string
  let clean = name.trim();
  if (clean.includes(',')) {
    clean = clean.split(',')[0].trim();
  }
  clean = clean.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean || 'Unknown';
}

function splitGames(text) {
  const games = [];
  const lines = text.split(/\r?\n/);
  let currentTags = [];
  let currentMoves = [];
  let inMoves = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[')) {
      if (inMoves && currentTags.length > 0) {
        games.push({
          rawTags: currentTags.join('\n'),
          rawMoves: currentMoves.join('\n').trim()
        });
        currentTags = [];
        currentMoves = [];
        inMoves = false;
      }
      currentTags.push(line);
    } else {
      if (trimmed.length > 0 || inMoves) {
        inMoves = true;
        currentMoves.push(line);
      }
    }
  }

  if (currentTags.length > 0 || currentMoves.length > 0) {
    games.push({
      rawTags: currentTags.join('\n'),
      rawMoves: currentMoves.join('\n').trim()
    });
  }

  return games.filter(g => g.rawTags.trim().length > 0);
}

function parseTags(rawTags) {
  const tags = {};
  const tagOrder = [];
  const regex = /\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]/g;
  let match;
  while ((match = regex.exec(rawTags)) !== null) {
    const key = match[1];
    const val = match[2].replace(/\\"/g, '"');
    tags[key] = val;
    tagOrder.push(key);
  }
  return { tags, tagOrder };
}

function calculateMoveLength(moveText) {
  if (!moveText) return { fullMoves: 0, plyCount: 0 };
  
  // Strip comments: {...} and ; to end of line
  let cleaned = moveText.replace(/\{[^}]*\}/g, ' ').replace(/;[^\r\n]*/g, ' ');
  // Strip variations: (...)
  while (/\([^()]*\)/.test(cleaned)) {
    cleaned = cleaned.replace(/\([^()]*\)/g, ' ');
  }
  
  // Strip game results
  cleaned = cleaned.replace(/(?:1-0|0-1|1\/2-1\/2|\*)\s*$/, '').trim();

  // Find all move numbers like "1.", "2...", etc.
  const moveNums = [...cleaned.matchAll(/(\d+)\s*\./g)].map(m => parseInt(m[1], 10));
  const fullMoves = moveNums.length > 0 ? Math.max(...moveNums) : 0;

  // Tokenize to count plies: remove move numbers e.g. "1." or "1..."
  const tokens = cleaned
    .replace(/\d+\s*\.{1,3}/g, ' ')
    .replace(/\$[0-9]+/g, ' ') // NAGs
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0 && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));

  const plyCount = tokens.length;
  const effectiveFullMoves = fullMoves > 0 ? fullMoves : Math.ceil(plyCount / 2);

  return { fullMoves: effectiveFullMoves, plyCount };
}

function formatPgn(tags, moveText, fullMoves, plyCount) {
  const priorityHeaders = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
  const enrichmentHeaders = ['MoveCount', 'PlyCount', 'GameLength'];

  tags['MoveCount'] = String(fullMoves);
  tags['PlyCount'] = String(plyCount);
  tags['GameLength'] = `${fullMoves} moves (${plyCount} ply)`;

  // Ensure default Date if missing
  if (!tags['Date'] || tags['Date'] === '?') {
    tags['Date'] = '????.??.??';
  }

  let output = '';
  
  for (const h of priorityHeaders) {
    if (tags[h] !== undefined && tags[h] !== null) {
      output += `[${h} "${tags[h]}"]\n`;
    } else {
      output += `[${h} "?"]\n`;
    }
  }

  for (const h of enrichmentHeaders) {
    output += `[${h} "${tags[h]}"]\n`;
  }

  for (const [k, v] of Object.entries(tags)) {
    if (!priorityHeaders.includes(k) && !enrichmentHeaders.includes(k) && v !== '') {
      output += `[${k} "${v}"]\n`;
    }
  }

  output += '\n';

  // Clean move text
  output += moveText.trim() + '\n';

  return output;
}

async function run() {
  console.log(`Starting archival of World Chess Championship matches...`);
  
  const summaryReport = [];
  let totalGamesArchived = 0;

  for (const matchInfo of MATCH_FILES) {
    const yearDir = path.join(ROOT_DIR, String(matchInfo.year));
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }

    const url = `https://pgnmentor.com/${matchInfo.file}`;
    console.log(`Fetching ${matchInfo.match} from ${url}...`);

    let pgnRaw;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) {
        console.error(`HTTP error ${res.status} for ${url}`);
        continue;
      }
      pgnRaw = await res.text();
    } catch (err) {
      console.error(`Failed to fetch ${url}:`, err.message);
      continue;
    }

    const games = splitGames(pgnRaw);
    console.log(`  Found ${games.length} games.`);
    let matchSavedCount = 0;

    const usedFileNames = new Set();

    games.forEach((game, idx) => {
      const { tags } = parseTags(game.rawTags);
      const { fullMoves, plyCount } = calculateMoveLength(game.rawMoves);
      const formatted = formatPgn(tags, game.rawMoves, fullMoves, plyCount);

      const white = sanitizeName(tags.White);
      const black = sanitizeName(tags.Black);
      let roundStr = tags.Round ? tags.Round.replace(/[^0-9a-zA-Z]/g, '') : '';
      if (!roundStr || isNaN(parseInt(roundStr, 10))) {
        roundStr = String(idx + 1).padStart(2, '0');
      } else {
        roundStr = String(parseInt(roundStr, 10)).padStart(2, '0');
      }

      // Suffix identifier if multiple matches in the same year
      let eventPrefix = '';
      if (matchInfo.file.includes('1910a')) eventPrefix = 'Schlechter_';
      else if (matchInfo.file.includes('1910b')) eventPrefix = 'Janowski_';
      else if (matchInfo.file.includes('PCAChamp1993')) eventPrefix = 'PCA_';
      else if (matchInfo.file.includes('FideChamp1993')) eventPrefix = 'FIDE_';
      else if (matchInfo.file.includes('FideChamp2000')) eventPrefix = 'FIDE_';
      else if (matchInfo.file.includes('WorldChamp2000')) eventPrefix = 'Classical_';
      else if (matchInfo.file.includes('FideChamp2004')) eventPrefix = 'FIDE_';
      else if (matchInfo.file.includes('WorldChamp2004')) eventPrefix = 'Classical_';

      let fileName = `Game_${roundStr}_${eventPrefix}${white}_vs_${black}.pgn`;
      let counter = 1;
      while (usedFileNames.has(fileName) || fs.existsSync(path.join(yearDir, fileName))) {
        fileName = `Game_${roundStr}_${eventPrefix}${white}_vs_${black}_${counter}.pgn`;
        counter++;
      }
      usedFileNames.add(fileName);

      const filePath = path.join(yearDir, fileName);
      fs.writeFileSync(filePath, formatted, 'utf8');
      matchSavedCount++;
      totalGamesArchived++;
    });

    summaryReport.push({
      year: matchInfo.year,
      match: matchInfo.match,
      file: matchInfo.file,
      games: matchSavedCount
    });
  }

  // Generate a master summary markdown file
  let md = `# 20th Century World Chess Championship Archive\n\n`;
  md += `This archive contains historical games from official World Chess Championship matches of the 20th century (and 2000).\n\n`;
  md += `- **Total Matches Cataloged**: ${summaryReport.length}\n`;
  md += `- **Total Games Recorded**: ${totalGamesArchived}\n\n`;
  md += `## Match Catalog by Year\n\n`;
  md += `| Year | Event / Match | Games Count | Source Archive |\n`;
  md += `| :--- | :--- | :---: | :--- |\n`;

  for (const item of summaryReport) {
    md += `| **${item.year}** | [${item.match}](./${item.year}) | ${item.games} | \`${item.file}\` |\n`;
  }

  md += `\n## Metadata Included in Each Game File\n\n`;
  md += `Each game is stored in standard Portable Game Notation (\`.pgn\`) format with full metadata:\n`;
  md += `- **Players**: \`[White "..."]\` and \`[Black "..."]\`\n`;
  md += `- **Date/Time**: \`[Date "YYYY.MM.DD"]\`\n`;
  md += `- **Result**: \`[Result "1-0" | "0-1" | "1/2-1/2"]\`\n`;
  md += `- **Game Length in Moves**: \`[MoveCount "<N>"]\`, \`[PlyCount "<P>"]\`, and \`[GameLength "<N> moves (<P> ply)"]\`\n`;
  md += `- **Context**: \`[Event "..."]\`, \`[Site "..."]\`, \`[Round "..."]\`, and \`[ECO "..."]\`\n`;
  md += `- **Move Text**: Complete SAN move sequence.\n`;

  fs.writeFileSync(path.join(ROOT_DIR, 'README.md'), md, 'utf8');
  console.log(`\nArchival complete! Total games archived: ${totalGamesArchived}. Master README.md written.`);
}

run();
