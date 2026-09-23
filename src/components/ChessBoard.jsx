import React from 'react';

// Crisp minimalist SVG chess pieces (standard cburnett set)
const PIECE_SVGS = {
  // White pieces
  P: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  N: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" stroke="#18181b" strokeWidth="1.5" />
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.83-.82 2.06-.76.23-.74-.75-1.18-.75-.44 0-.5.64-1 .69-.5.05-1.05-.27-1-.94.05-.67.76-1.57.5-2.06-.26-.49-.78-.42-1.5-.42-.72 0-1.28.32-1.5-.37-.22-.69.45-.98.5-1.5.05-.52-1-.77-.5-1.5.5-.73 1.54-.7 1.5-1.5-.04-.8-1.5-1-1.5-1.5 0-.5 1-1 1-1.5.5-1.5 1.5-3 2.5-4 1.5-1.5 5.5-3 8.5-3 1.5 0 3 .5 3.5 1.5 0 0-2 .5-2 1.5 0 1 1.5 2 2.5 2 1 0 1.5-.5 2-.5z" fill="#fff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="14.5" r="1.2" fill="#18181b" />
    </svg>
  ),
  B: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="none" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#fff" />
        <path d="M17.5 26h10M15 30h15" />
      </g>
    </svg>
  ),
  R: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#fff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" />
      </g>
    </svg>
  ),
  Q: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#fff" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-14-7 14-7-11 2 12zM9 31c5.5-.5 21.5-.5 27 0v2.5H9V31zM9 36c5.5-.5 21.5-.5 27 0v2.5H9V36z" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="14" cy="9" r="2" />
        <circle cx="22.5" cy="8" r="2" />
        <circle cx="31" cy="9" r="2" />
        <circle cx="39" cy="12" r="2" />
      </g>
    </svg>
  ),
  K: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="none" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" />
        <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0l-2-6h-18l-2 6zM12.5 30c5.5-3 14.5-3 20 0l1-2c-6.5-3-15.5-3-22 0l1 2zM11.5 14c-4.5 6 1.5 13.5 3 15h16c1.5-1.5 7.5-9 3-15-2.5-3.5-7.5-3.5-10.5-1-1.5-1.5-3-1.5-4.5-1-3 0-6 1.5-7 2z" fill="#fff" />
      </g>
    </svg>
  ),

  // Black pieces
  p: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  n: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#27272a" stroke="#fff" strokeWidth="1.2" />
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.83-.82 2.06-.76.23-.74-.75-1.18-.75-.44 0-.5.64-1 .69-.5.05-1.05-.27-1-.94.05-.67.76-1.57.5-2.06-.26-.49-.78-.42-1.5-.42-.72 0-1.28.32-1.5-.37-.22-.69.45-.98.5-1.5.05-.52-1-.77-.5-1.5.5-.73 1.54-.7 1.5-1.5-.04-.8-1.5-1-1.5-1.5 0-.5 1-1 1-1.5.5-1.5 1.5-3 2.5-4 1.5-1.5 5.5-3 8.5-3 1.5 0 3 .5 3.5 1.5 0 0-2 .5-2 1.5 0 1 1.5 2 2.5 2 1 0 1.5-.5 2-.5z" fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15" cy="14.5" r="1.2" fill="#fff" />
    </svg>
  ),
  b: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
        <path d="M17.5 26h10M15 30h15" fill="none" />
      </g>
    </svg>
  ),
  r: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" />
      </g>
    </svg>
  ),
  q: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7-14-7 14-7-11 2 12zM9 31c5.5-.5 21.5-.5 27 0v2.5H9V31zM9 36c5.5-.5 21.5-.5 27 0v2.5H9V36z" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="14" cy="9" r="2" />
        <circle cx="22.5" cy="8" r="2" />
        <circle cx="31" cy="9" r="2" />
        <circle cx="39" cy="12" r="2" />
      </g>
    </svg>
  ),
  k: (
    <svg viewBox="0 0 45 45" className="piece-svg">
      <g fill="#27272a" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" fill="none" />
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
        <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0l-2-6h-18l-2 6zM12.5 30c5.5-3 14.5-3 20 0l1-2c-6.5-3-15.5-3-22 0l1 2zM11.5 14c-4.5 6 1.5 13.5 3 15h16c1.5-1.5 7.5-9 3-15-2.5-3.5-7.5-3.5-10.5-1-1.5-1.5-3-1.5-4.5-1-3 0-6 1.5-7 2z" />
      </g>
    </svg>
  )
};

export default function ChessBoard({ 
  boardState, 
  flipped = false, 
  lastMove = null, 
  bestMove = null,
  showStockfish = false 
}) {
  // BoardState is an 8x8 2D array of { square: 'e4', type: 'p', color: 'w' } | null
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  // Best move square coordinates
  let bestFrom = null;
  let bestTo = null;
  if (showStockfish && bestMove && bestMove.length >= 4) {
    bestFrom = bestMove.slice(0, 2);
    bestTo = bestMove.slice(2, 4);
  }

  return (
    <div className="chessboard">
      {ranks.map((rank, rankIdx) =>
        files.map((file, fileIdx) => {
          const squareName = `${file}${rank}`;
          const isLight = (rank + fileIdx) % 2 !== 0;

          // Lookup piece at this square in boardState
          let pieceKey = null;
          if (boardState) {
            // Find in 8x8 array
            const boardRankIdx = 8 - rank;
            const boardFileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0);
            const piece = boardState[boardRankIdx] && boardState[boardRankIdx][boardFileIdx];
            if (piece) {
              pieceKey = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
            }
          }

          const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
          const isBestMoveSquare = showStockfish && (bestFrom === squareName || bestTo === squareName);

          return (
            <div
              key={squareName}
              className={`square ${isLight ? 'light' : 'dark'} ${isLastMoveSquare ? 'highlighted' : ''} ${isBestMoveSquare ? 'best-move-hint' : ''}`}
              title={squareName}
            >
              {/* Coordinates */}
              {fileIdx === 0 && <span className="square-coord rank">{rank}</span>}
              {rankIdx === 7 && <span className="square-coord file">{file}</span>}

              {/* Chess piece */}
              {pieceKey && PIECE_SVGS[pieceKey]}
            </div>
          );
        })
      )}
    </div>
  );
}
