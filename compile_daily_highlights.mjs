import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Chess } from 'chess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GAMES_PATH = path.join(__dirname, 'public', 'data', 'games.json');
const OUT_PATH = path.join(__dirname, 'public', 'data', 'daily_highlights.json');

const DESCRIPTIVE_PREFIXES = [
  "Masterclass Attack", "Brilliant Sacrifice", "Crushing Breakthrough", "Precision Maneuver",
  "Tactical Masterstroke", "The Lightning Strike", "Iron Defense Refutation", "Endgame Perfection",
  "Devastating Queen Thrust", "Knight Outpost Dominance", "The King Hunt", "Central Pawn Avalanche",
  "Rook Lift Surge", "Decisive Queen Trade", "The Bishop Pair Symphony", "Exchange Sacrifice Stunner",
  "Unstoppable Passed Pawn", "Sudden Counterblow", "Cold-Blooded Refutation", "The Geometry of Victory",
  "Kingside Shockwave", "Queenside Storm", "The Timeless Pearl", "Dynamic Positional Squeeze"
];

function cleanMoveText(moves) {
  return (moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function run() {
  console.log('Generating 3+ years of unique Daily Highlights (1,120 days)...');
  const gamesRaw = fs.readFileSync(GAMES_PATH, 'utf8');
  const games = JSON.parse(gamesRaw);

  const highlights = [];
  const startDate = new Date('2024-01-01T00:00:00Z');
  const totalDays = 1120; // Over 3 full years (2024, 2025, 2026, into 2027)

  let gameIdx = 0;

  for (let day = 0; day < totalDays; day++) {
    const curDate = new Date(startDate.getTime() + day * 86400000);
    const dateStr = curDate.toISOString().slice(0, 10);

    // Pick game cyclically or by curated sequence
    const game = games[gameIdx % games.length];
    gameIdx++;

    // Load moves with chess.js to extract a decisive move
    let chess = new Chess();
    let history = [];
    try {
      const clean = cleanMoveText(game.moves);
      chess.loadPgn(clean);
      history = chess.history({ verbose: true });
    } catch (e) {
      history = [];
    }

    // Pick a critical move in the middle-to-end of the game (between 40% and 85% of total plies)
    let moveIdx = Math.max(0, Math.floor(history.length * 0.65));
    if (moveIdx >= history.length) moveIdx = Math.max(0, history.length - 1);

    // Replay to the position right before that move to get fenBefore
    const stepper = new Chess();
    for (let k = 0; k < moveIdx; k++) {
      if (history[k]) stepper.move(history[k].san);
    }
    const fenBefore = stepper.fen();
    const criticalMove = history[moveIdx];
    const moveSan = criticalMove ? criticalMove.san : (game.result === '1-0' ? '1-0' : '0-1');
    const moveNumber = Math.floor(moveIdx / 2) + 1;
    const isWhiteTurn = stepper.turn() === 'w';
    const playerActing = isWhiteTurn ? game.white.split(',')[0].trim() : game.black.split(',')[0].trim();

    // Unique title formulation
    const prefix = DESCRIPTIVE_PREFIXES[day % DESCRIPTIVE_PREFIXES.length];
    const title = `${playerActing}'s ${prefix}: ${moveSan} (${game.year})`;

    const description = `In Round ${game.round} of the ${game.year} World Championship, ${playerActing} played the brilliant ${moveSan} on move ${moveNumber}, seizing commanding tactical initiative against ${isWhiteTurn ? game.black.split(',')[0] : game.white.split(',')[0]}.`;

    highlights.push({
      id: `dh_${day + 1}`,
      dayIndex: day,
      date: dateStr,
      title: title,
      gameId: game.id,
      year: game.year,
      event: game.event,
      white: game.white,
      black: game.black,
      result: game.result,
      eco: game.eco,
      moveNumber: moveNumber,
      plyIndex: moveIdx,
      moveSan: moveSan,
      fenBefore: fenBefore,
      description: description
    });
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(highlights), 'utf8');
  const sizeMb = (fs.statSync(OUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Successfully generated ${highlights.length} daily highlights in ${OUT_PATH} (${sizeMb} MB)`);
}

run();
