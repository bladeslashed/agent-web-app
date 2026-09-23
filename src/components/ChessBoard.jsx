import React from 'react';

// Maps piece letter to local Chess.com piece image asset in public/pieces/
const CHESS_COM_PIECES = {
  // White pieces
  P: '/pieces/wp.png',
  N: '/pieces/wn.png',
  B: '/pieces/wb.png',
  R: '/pieces/wr.png',
  Q: '/pieces/wq.png',
  K: '/pieces/wk.png',

  // Black pieces
  p: '/pieces/bp.png',
  n: '/pieces/bn.png',
  b: '/pieces/bb.png',
  r: '/pieces/br.png',
  q: '/pieces/bq.png',
  k: '/pieces/bk.png'
};

export default function ChessBoard({ 
  boardState, 
  flipped = false, 
  lastMove = null, 
  bestMove = null,
  showStockfish = false 
}) {
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

          let pieceImgSrc = null;
          let pieceAlt = '';
          if (boardState) {
            const boardRankIdx = 8 - rank;
            const boardFileIdx = file.charCodeAt(0) - 'a'.charCodeAt(0);
            const piece = boardState[boardRankIdx] && boardState[boardRankIdx][boardFileIdx];
            if (piece) {
              const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
              pieceImgSrc = CHESS_COM_PIECES[key];
              pieceAlt = `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}`;
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

              {/* Chess.com Piece Image */}
              {pieceImgSrc && (
                <img 
                  src={pieceImgSrc} 
                  alt={pieceAlt}
                  className="piece-svg"
                  style={{
                    width: '85%',
                    height: '85%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.28))'
                  }}
                  draggable="false"
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
