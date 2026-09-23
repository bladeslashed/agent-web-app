import React, { useEffect, useRef } from 'react';

export default function MoveList({ 
  moves = [], 
  currentPlyIndex = -1, 
  onSelectPly,
  result = '*' 
}) {
  const activeMoveRef = useRef(null);
  const containerRef = useRef(null);

  // Group moves into pairs: [ { moveNum: 1, white: { san: 'e4', ply: 0 }, black: { san: 'e5', ply: 1 } }, ... ]
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    pairs.push({
      moveNum,
      white: { san: moves[i].san, ply: i },
      black: moves[i + 1] ? { san: moves[i + 1].san, ply: i + 1 } : null
    });
  }

  // Auto-scroll to active move
  useEffect(() => {
    if (activeMoveRef.current && containerRef.current) {
      activeMoveRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentPlyIndex]);

  return (
    <div className="movelist-card">
      <div className="movelist-header">
        <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Move Notation</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {moves.length} plies played
        </span>
      </div>

      <div className="movelist-scroll" ref={containerRef}>
        {/* Start Position (Ply -1) */}
        <div 
          className="move-row" 
          style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}
        >
          <span className="move-num">0.</span>
          <span 
            className={`move-ply ${currentPlyIndex === -1 ? 'active' : ''}`}
            onClick={() => onSelectPly(-1)}
          >
            Start Position
          </span>
          <span />
        </div>

        {pairs.map((p) => {
          const isWhiteActive = currentPlyIndex === p.white.ply;
          const isBlackActive = p.black && currentPlyIndex === p.black.ply;

          return (
            <div key={p.moveNum} className="move-row">
              <span className="move-num">{p.moveNum}.</span>

              {/* White Move */}
              <span
                ref={isWhiteActive ? activeMoveRef : null}
                className={`move-ply ${isWhiteActive ? 'active' : ''}`}
                onClick={() => onSelectPly(p.white.ply)}
              >
                {p.white.san}
              </span>

              {/* Black Move */}
              {p.black ? (
                <span
                  ref={isBlackActive ? activeMoveRef : null}
                  className={`move-ply ${isBlackActive ? 'active' : ''}`}
                  onClick={() => onSelectPly(p.black.ply)}
                >
                  {p.black.san}
                </span>
              ) : (
                <span />
              )}
            </div>
          );
        })}

        {/* Game Result Footer */}
        {result && (
          <div style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {result === '1-0' && 'White wins (1-0)'}
            {result === '0-1' && 'Black wins (0-1)'}
            {result === '1/2-1/2' && 'Draw (½-½)'}
            {result !== '1-0' && result !== '0-1' && result !== '1/2-1/2' && `Result: ${result}`}
          </div>
        )}
      </div>
    </div>
  );
}
