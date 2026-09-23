import React from 'react';
import { Cpu, Zap } from 'lucide-react';

export default function EvalBar({ evalData, isAnalyzing }) {
  if (!evalData) {
    return (
      <div className="eval-container" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Cpu size={16} />
        <span>Evaluating position...</span>
      </div>
    );
  }

  const { score, displayScore, isMate, mateIn, bestMove, depth, isLive } = evalData;

  // Convert score (-10 to +10) into percentage (0% to 100%)
  // Math: 50 + (score / 10) * 50 clamped between 5% and 95%
  let percentage = 50;
  if (isMate) {
    percentage = mateIn > 0 ? 98 : 2;
  } else {
    const clamped = Math.max(-10, Math.min(10, score));
    percentage = 50 + (clamped / 10) * 45;
  }

  return (
    <div className="eval-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={16} style={{ color: 'var(--accent-warning)' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          STOCKFISH
        </span>
      </div>

      {/* Visual Evaluation Bar */}
      <div className="eval-bar-track" title={`White advantage: ${percentage.toFixed(0)}%`}>
        <div 
          className="eval-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Score Text */}
      <span 
        className="eval-score-text"
        style={{
          color: score > 0 ? '#ffffff' : (score < 0 ? '#94a3b8' : 'var(--text-secondary)')
        }}
      >
        {displayScore}
      </span>

      {/* Best Move Badge */}
      {bestMove && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Best:</span>
          <span className="badge badge-eco" style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
            {bestMove}
          </span>
        </div>
      )}

      {/* Depth */}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        d={depth}
      </span>
    </div>
  );
}
