import { Chess } from 'chess.js';

let cachedHighlights = null;

export async function fetchDailyHighlights() {
  if (cachedHighlights) return cachedHighlights;
  try {
    const res = await fetch('/data/daily_highlights.json');
    if (res.ok) {
      cachedHighlights = await res.json();
    } else {
      cachedHighlights = [];
    }
  } catch (e) {
    cachedHighlights = [];
  }
  return cachedHighlights;
}

export function getCustomAdminOverrides() {
  try {
    const raw = localStorage.getItem('tca_custom_highlights');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveAdminHighlightEdit(highlight) {
  const overrides = getCustomAdminOverrides();
  overrides[highlight.id] = highlight;
  if (highlight.date) {
    overrides[highlight.date] = highlight;
  }
  localStorage.setItem('tca_custom_highlights', JSON.stringify(overrides));
  return highlight;
}

// Get highlight for a given date, with admin override & dynamic failsafe
export async function getHighlightForDate(dateStr, allGames = []) {
  const overrides = getCustomAdminOverrides();
  if (overrides[dateStr]) {
    return overrides[dateStr];
  }

  const list = await fetchDailyHighlights();
  const found = list.find(h => h.date === dateStr);

  if (found) {
    return overrides[found.id] || found;
  }

  // FAILSAFE: If date is beyond 3 years or not in list, dynamically pick a game & decisive move
  return generateFailsafeHighlight(dateStr, allGames);
}

// Dynamic failsafe generator
export function generateFailsafeHighlight(dateStr, allGames = []) {
  if (!allGames || allGames.length === 0) {
    return {
      id: `dh_failsafe_${dateStr}`,
      date: dateStr,
      title: 'Championship Tactical Classic',
      white: 'White',
      black: 'Black',
      year: 1972,
      event: 'World Chess Championship',
      moveNumber: 25,
      plyIndex: 49,
      moveSan: 'Rxe6',
      fenBefore: 'r1bqkb1r/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      description: 'An automatic curated tactical masterpiece from World Championship history.'
    };
  }

  // Derive pseudo-random index from date string hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % allGames.length;
  }
  const game = allGames[Math.abs(hash)];

  let history = [];
  try {
    const chess = new Chess();
    const clean = (game.moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ');
    chess.loadPgn(clean);
    history = chess.history({ verbose: true });
  } catch (e) {
    history = [];
  }

  const plyIdx = Math.max(0, Math.floor(history.length * 0.6));
  const stepper = new Chess();
  for (let i = 0; i < plyIdx; i++) {
    if (history[i]) stepper.move(history[i].san);
  }
  const fenBefore = stepper.fen();
  const criticalMove = history[plyIdx] ? history[plyIdx].san : 'Nxd5';
  const moveNumber = Math.floor(plyIdx / 2) + 1;

  return {
    id: `dh_failsafe_${dateStr}`,
    date: dateStr,
    title: `[Auto-Curated Masterclass #${Math.abs(hash) + 1}] Tactical Clash: ${game.white.split(',')[0]} vs ${game.black.split(',')[0]} (${game.year})`,
    gameId: game.id,
    year: game.year,
    event: game.event,
    white: game.white,
    black: game.black,
    result: game.result,
    eco: game.eco,
    moveNumber: moveNumber,
    plyIndex: plyIdx,
    moveSan: criticalMove,
    fenBefore: fenBefore,
    description: `[Failsafe Curated Highlight] In the ${game.year} World Championship, a pivotal move (${criticalMove}) arrived on move ${moveNumber} in the battle between ${game.white} and ${game.black}.`,
    isFailsafe: true
  };
}
