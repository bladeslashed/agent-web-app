import { Chess } from 'chess.js';

const STORAGE_KEY = 'tca_community_highlights';

// Pre-seeded iconic community highlights if storage is fresh
const SEED_HIGHLIGHTS = [
  {
    id: 'hl_fischer_1972_game6',
    title: "Fischer's Positional Masterpiece (Game 6, 1972)",
    description: "In Game 6 of the 1972 World Championship in Reykjavik, Fischer deviated into the Queen's Gambit for the first time in his life. 38. Qf4! tied Spassky into knots, receiving a standing ovation from both Spassky and the Icelandic audience.",
    gameId: 'g_1972_6',
    year: 1972,
    event: 'World Championship 28th',
    white: 'Fischer, Robert J',
    black: 'Spassky, Boris V',
    result: '1-0',
    eco: 'D59',
    moveNumber: 38,
    plyIndex: 74,
    moveSan: 'Qf4',
    fenBefore: '2r1r1k1/5pp1/1p1q1b1p/p1pp4/P2P4/1P1QP1P1/4NP1P/2RR2K1 w - - 4 38',
    authorUid: '1',
    authorName: 'admin',
    authorUsername: 'admin',
    authorPhoto: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-01T10:00:00.000Z',
    likes: ['1', 'usr_sample_1', 'usr_sample_2'],
    isPinned: true
  },
  {
    id: 'hl_kasparov_karpov_1985_game16',
    title: "Kasparov's Monster Knight on d3 (Game 16, 1985)",
    description: "The 'Immortal Octopus Knight'. Kasparov planted his black knight on d3 deep into Karpov's territory. Karpov was completely paralyzed as Garry took command of the board with tactical fireworks.",
    gameId: 'g_1985_16',
    year: 1985,
    event: 'World Championship 32th',
    white: 'Karpov, Anatoly',
    black: 'Kasparov, Garry',
    result: '0-1',
    eco: 'B44',
    moveNumber: 21,
    plyIndex: 41,
    moveSan: 'Nd3',
    fenBefore: 'r2q1rk1/1b2bppp/p2p1n2/1p2p3/4P3/1PN1BP2/1PP1N1PP/R2Q1R1K b - - 1 21',
    authorUid: 'usr_sample_1',
    authorName: 'Grandmaster Fan',
    authorUsername: 'tactics_wiz',
    authorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-10T14:30:00.000Z',
    likes: ['1', 'usr_sample_3', 'usr_sample_4', 'usr_sample_5'],
    isPinned: true
  },
  {
    id: 'hl_tal_botvinnik_1960_game6',
    title: "Tal's Legendary Knight Sacrifice 21...Nf4! (1960)",
    description: "The 23-year-old 'Magician from Riga' sent shockwaves through the chess world by hurling his knight into Botvinnik's kingside. Even if computers debate the objective refutation, under over-the-board clock pressure it broke Botvinnik completely.",
    gameId: 'g_1960_6',
    year: 1960,
    event: 'World Championship 23th',
    white: 'Botvinnik, Mikhail',
    black: 'Tal, Mikhail',
    result: '0-1',
    eco: 'E69',
    moveNumber: 21,
    plyIndex: 41,
    moveSan: 'Nf4',
    fenBefore: 'r1b2rk1/pp1nqpbp/2pp1np1/4p3/2PPP3/1PN1B3/P2QBPPP/R3NRK1 b - - 5 21',
    authorUid: 'usr_sample_2',
    authorName: 'Misha Lover',
    authorUsername: 'riga_magic',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-15T18:20:00.000Z',
    likes: ['1', 'usr_sample_1'],
    isPinned: false
  },
  {
    id: 'hl_capablanca_lasker_1921',
    title: "Capablanca's Precision Squeeze (Game 10, 1921)",
    description: "Capablanca exhibited his flawless clarity, demonstrating how slight structural weaknesses in Black's pawn structure could be methodically converted into decisive zugzwang.",
    gameId: 'g_1921_10',
    year: 1921,
    event: 'World Championship 11th',
    white: 'Capablanca, Jose Raul',
    black: 'Lasker, Emanuel',
    result: '1-0',
    eco: 'D61',
    moveNumber: 30,
    plyIndex: 58,
    moveSan: 'Ne5',
    fenBefore: '2r1r1k1/pp3p1p/3b1p2/8/3N4/1P4P1/P4PKP/R2R4 w - - 0 30',
    authorUid: '1',
    authorName: 'admin',
    authorUsername: 'admin',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-18T09:15:00.000Z',
    likes: ['usr_sample_2'],
    isPinned: false
  }
];

// Initialize Community Highlights Storage
export function initCommunityHighlights() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HIGHLIGHTS));
    return SEED_HIGHLIGHTS;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HIGHLIGHTS));
      return SEED_HIGHLIGHTS;
    }
    return list;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HIGHLIGHTS));
    return SEED_HIGHLIGHTS;
  }
}

// Fetch all community highlights
export async function fetchCommunityHighlights() {
  const list = initCommunityHighlights();
  return list;
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
