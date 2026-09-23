// Stockfish Analysis Service
// Evaluates FEN positions with evaluation score, depth, and best move

const evalCache = new Map();

export async function evaluatePosition(fen, depth = 12) {
  if (!fen) return null;

  // Check cache
  const cacheKey = `${fen}_${depth}`;
  if (evalCache.has(cacheKey)) {
    return evalCache.get(cacheKey);
  }

  try {
    const encodedFen = encodeURIComponent(fen);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=${depth}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        let score = 0;
        let isMate = false;
        let mateIn = null;

        if (data.mate !== null && data.mate !== undefined) {
          isMate = true;
          mateIn = data.mate;
          score = data.mate > 0 ? 999 : -999;
        } else if (data.evaluation !== null && data.evaluation !== undefined) {
          score = parseFloat(data.evaluation);
        }

        // Extract best move from string "bestmove e2e4 ponder ..."
        let bestMove = '';
        if (data.bestmove) {
          const parts = data.bestmove.split(' ');
          if (parts[1]) bestMove = parts[1];
        }

        const result = {
          score: score,
          displayScore: isMate ? `#${mateIn}` : (score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1)),
          isMate,
          mateIn,
          bestMove,
          continuation: data.continuation || '',
          depth: depth,
          isLive: true
        };

        evalCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Fallback to internal material & positional evaluator if API is unreachable/slow
  }

  // Fallback fast positional heuristic
  const fallback = calculateFastEval(fen);
  evalCache.set(cacheKey, fallback);
  return fallback;
}

// Fast heuristic fallback (Piece values + positional weight)
function calculateFastEval(fen) {
  const parts = fen.split(' ');
  const position = parts[0];
  const activeColor = parts[1] || 'w';

  const pieceValues = {
    p: 1, n: 3.05, b: 3.3, r: 5, q: 9.5, k: 0,
    P: 1, N: 3.05, B: 3.3, R: 5, Q: 9.5, K: 0
  };

  let score = 0;
  for (const ch of position) {
    if (ch >= 'A' && ch <= 'Z') {
      score += pieceValues[ch] || 0;
    } else if (ch >= 'a' && ch <= 'z') {
      score -= pieceValues[ch] || 0;
    }
  }

  // Slight bonus for active turn
  if (activeColor === 'w') score += 0.15;
  else score -= 0.15;

  return {
    score: score,
    displayScore: score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1),
    isMate: false,
    mateIn: null,
    bestMove: '',
    continuation: '',
    depth: 8,
    isLive: false
  };
}
