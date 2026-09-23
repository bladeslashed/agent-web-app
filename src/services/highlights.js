import { Chess } from 'chess.js';

const STORAGE_KEY = 'tca_community_highlights';

// Legacy seed IDs to purge completely
const OLD_DEFAULT_IDS = new Set([
  'hl_fischer_1972_game6',
  'hl_kasparov_karpov_1985_game16',
  'hl_tal_botvinnik_1960_game6',
  'hl_capablanca_lasker_1921'
]);

// Initialize Community Highlights Storage (No default seeds; purely user & community driven)
export function initCommunityHighlights() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try {
    let list = JSON.parse(raw);
    if (!Array.isArray(list)) {
      list = [];
    }
    // Purge any legacy default seed highlights so they never reappear
    const filtered = list.filter(h => !OLD_DEFAULT_IDS.has(h.id));
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

// Fetch all community highlights
export async function fetchCommunityHighlights() {
  return initCommunityHighlights();
}

// Extract moves and positions from game
export function getGameMoveHistory(game) {
  if (!game || !game.moves) return [];
  try {
    const chess = new Chess();
    const cleanMoves = (game.moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ');
    chess.loadPgn(cleanMoves);
    return chess.history({ verbose: true });
  } catch (e) {
    return [];
  }
}

// Calculate board position at a specific ply
export function calculatePositionAtPly(game, targetPly) {
  if (!game || !game.moves) return null;
  try {
    const chess = new Chess();
    const cleanMoves = (game.moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ');
    chess.loadPgn(cleanMoves);
    const history = chess.history({ verbose: true });

    if (targetPly < 0 || targetPly >= history.length) {
      return null;
    }

    const stepper = new Chess();
    for (let i = 0; i < targetPly; i++) {
      stepper.move(history[i].san);
    }
    const fenBefore = stepper.fen();
    const moveObj = history[targetPly];
    stepper.move(moveObj.san);
    const fenAfter = stepper.fen();

    return {
      fenBefore,
      fenAfter,
      moveSan: moveObj.san,
      moveNumber: Math.floor(targetPly / 2) + 1,
      plyIndex: targetPly,
      turn: moveObj.color === 'w' ? 'White' : 'Black'
    };
  } catch (e) {
    console.error('Error calculating position at ply:', e);
    return null;
  }
}

// Create new Community Highlight
export async function createCommunityHighlight({
  title,
  description,
  game,
  plyIndex,
  user
}) {
  if (!user) throw new Error('You must be signed in to submit a highlight.');
  if (!title || !title.trim()) throw new Error('Title is required.');
  if (!description || !description.trim()) throw new Error('Description is required.');
  if (!game) throw new Error('Game is required.');

  const posData = calculatePositionAtPly(game, plyIndex);
  if (!posData) {
    throw new Error('Invalid move selected for this game.');
  }

  const list = initCommunityHighlights();
  const newHighlight = {
    id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: title.trim(),
    description: description.trim(),
    gameId: game.id,
    year: game.year,
    event: game.event,
    white: game.white,
    black: game.black,
    result: game.result,
    eco: game.eco || '',
    moveNumber: posData.moveNumber,
    plyIndex: posData.plyIndex,
    moveSan: posData.moveSan,
    fenBefore: posData.fenBefore,
    fenAfter: posData.fenAfter,
    authorUid: user.uid,
    authorName: user.displayName || 'Player',
    authorUsername: user.username || 'user',
    authorPhoto: user.photoURL || '',
    createdAt: new Date().toISOString(),
    likes: [user.uid], // Submitter automatically likes their own submission
    isPinned: false
  };

  list.unshift(newHighlight);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newHighlight;
}

// Toggle Like on Highlight
export async function toggleHighlightLike(highlightId, userUid) {
  if (!userUid) throw new Error('Please sign in to like highlights.');
  const list = initCommunityHighlights();
  const index = list.findIndex(h => h.id === highlightId);
  if (index === -1) throw new Error('Highlight not found.');

  const item = list[index];
  const likes = Array.isArray(item.likes) ? item.likes : [];
  let isLiked = false;

  if (likes.includes(userUid)) {
    item.likes = likes.filter(uid => uid !== userUid);
    isLiked = false;
  } else {
    item.likes = [...likes, userUid];
    isLiked = true;
  }

  list[index] = item;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return { likes: item.likes, isLiked, count: item.likes.length };
}

// Delete Community Highlight (Author or Admin)
export async function deleteCommunityHighlight(highlightId, user) {
  if (!user) throw new Error('Authentication required.');
  const list = initCommunityHighlights();
  const index = list.findIndex(h => h.id === highlightId);
  if (index === -1) throw new Error('Highlight not found.');

  const item = list[index];
  const isAdmin = user.role === 'admin' || user.uid === '1';
  if (!isAdmin && item.authorUid !== user.uid) {
    throw new Error('You do not have permission to delete this highlight.');
  }

  list.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return true;
}

// Edit Community Highlight (Author or Admin)
export async function editCommunityHighlight(highlightId, updates, user) {
  if (!user) throw new Error('Authentication required.');
  const list = initCommunityHighlights();
  const index = list.findIndex(h => h.id === highlightId);
  if (index === -1) throw new Error('Highlight not found.');

  const item = list[index];
  const isAdmin = user.role === 'admin' || user.uid === '1';
  if (!isAdmin && item.authorUid !== user.uid) {
    throw new Error('You do not have permission to edit this highlight.');
  }

  const updated = {
    ...item,
    title: updates.title !== undefined ? updates.title.trim() : item.title,
    description: updates.description !== undefined ? updates.description.trim() : item.description,
    isPinned: isAdmin && updates.isPinned !== undefined ? updates.isPinned : item.isPinned
  };

  list[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

// Toggle Pin Status (Admin only)
export async function togglePinHighlight(highlightId, user) {
  if (!user || (user.role !== 'admin' && user.uid !== '1')) {
    throw new Error('Only administrators can pin highlights.');
  }
  const list = initCommunityHighlights();
  const index = list.findIndex(h => h.id === highlightId);
  if (index === -1) throw new Error('Highlight not found.');

  list[index].isPinned = !list[index].isPinned;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list[index].isPinned;
}
