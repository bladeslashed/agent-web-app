import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import MoveList from '../components/MoveList';
import EvalBar from '../components/EvalBar';
import { useFavorites } from '../context/FavoritesContext';
import { evaluatePosition } from '../services/stockfish';
import { 
  ArrowLeft, 
  Heart, 
  SkipBack, 
  ChevronLeft, 
  Play, 
  Pause, 
  ChevronRight, 
  SkipForward, 
  RotateCw,
  Cpu,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  X,
  Trash2,
  Edit3
} from 'lucide-react';

export default function GameReplay({ game, onBack }) {
  const { isFavorite, toggleFavorite, getMoveFavorite, saveMoveFavorite, deleteMoveFavorite } = useFavorites();
  const [currentPly, setCurrentPly] = useState(() => (game && game.initialPly !== undefined ? game.initialPly : -1));
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1200); // ms
  const [showStockfish, setShowStockfish] = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Move Bookmark with Notes Modal State
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkSubmitting, setBookmarkSubmitting] = useState(false);

  useEffect(() => {
    if (game && game.initialPly !== undefined) {
      setCurrentPly(game.initialPly);
    }
  }, [game]);

  const fav = isFavorite(game.id);

  // Parse game moves and pre-calculate positions for all plies
  const { positions, movesList } = useMemo(() => {
    const chess = new Chess();
    const pos = [];
    const moves = [];

    // Initial position (ply -1)
    pos.push({
      ply: -1,
      fen: chess.fen(),
      board: chess.board(),
      lastMove: null
    });

    try {
      // Clean move text for chess.js loading
      const cleanMoves = (game.moves || '').replace(/\{[^}]*\}/g, ' ').replace(/\$[0-9]+/g, ' ');
      chess.loadPgn(cleanMoves);
      const history = chess.history({ verbose: true });

      // Re-play step by step to record each position
      const stepper = new Chess();
      for (let i = 0; i < history.length; i++) {
        const m = history[i];
        stepper.move(m.san);
        moves.push(m);
        pos.push({
          ply: i,
          fen: stepper.fen(),
          board: stepper.board(),
          lastMove: { from: m.from, to: m.to, san: m.san }
        });
      }
    } catch (err) {
      console.warn('Error parsing PGN in chess.js:', err);
    }

    return { positions: pos, movesList: moves };
  }, [game]);

  // Current board state and FEN
  const currentPos = positions[currentPly + 1] || positions[0];

  // Play subtle move click sound via Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  };

  // Step controls
  const handlePrev = () => {
    if (currentPly > -1) {
      setCurrentPly(p => p - 1);
      playClickSound();
    }
  };

  const handleNext = () => {
    if (currentPly < movesList.length - 1) {
      setCurrentPly(p => p + 1);
      playClickSound();
    } else {
      setIsPlaying(false);
    }
  };

  const handleFirst = () => {
    setCurrentPly(-1);
    setIsPlaying(false);
    playClickSound();
  };

  const handleLast = () => {
    setCurrentPly(movesList.length - 1);
    setIsPlaying(false);
    playClickSound();
  };

  // Auto-play timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPly(prev => {
          if (prev < movesList.length - 1) {
            playClickSound();
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, movesList.length, soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowUp') handleFirst();
      if (e.key === 'ArrowDown') handleLast();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPly, movesList.length]);

  // Stockfish evaluation on position change
  useEffect(() => {
    if (!showStockfish) {
      setEvalData(null);
      return;
    }

    let active = true;
    setIsAnalyzing(true);
    evaluatePosition(currentPos.fen, 12).then(res => {
      if (active && res) {
        setEvalData(res);
        setIsAnalyzing(false);
      }
    });

    return () => {
      active = false;
    };
  }, [currentPos.fen, showStockfish]);

  // Current move favorite item if bookmarked
  const currentMoveFav = currentPly >= 0 ? getMoveFavorite(game.id, currentPly) : null;

  const handleOpenBookmarkModal = () => {
    if (currentPly < 0) return;
    const existing = getMoveFavorite(game.id, currentPly);
    setBookmarkNote(existing ? existing.note : '');
    setIsBookmarkModalOpen(true);
  };

  const handleSaveBookmark = async (e) => {
    e.preventDefault();
    if (currentPly < 0) return;
    const moveObj = movesList[currentPly];
    const moveNumber = Math.floor(currentPly / 2) + 1;
    const moveSan = currentPly % 2 === 0 ? `${moveNumber}. ${moveObj?.san || ''}` : `${moveNumber}... ${moveObj?.san || ''}`;

    setBookmarkSubmitting(true);
    try {
      await saveMoveFavorite({
        gameId: game.id,
        gameTitle: `${game.white} vs ${game.black} (${game.year})`,
        year: game.year,
        white: game.white,
        black: game.black,
        event: game.event,
        result: game.result,
        eco: game.eco,
        plyIndex: currentPly,
        moveNumber,
        moveSan,
        fen: currentPos.fen,
        note: bookmarkNote
      });
      setIsBookmarkModalOpen(false);
    } finally {
      setBookmarkSubmitting(false);
    }
  };

  const handleDeleteBookmark = async () => {
    if (!currentMoveFav) return;
    if (!window.confirm('Delete this move bookmark and note?')) return;
    await deleteMoveFavorite(currentMoveFav.id);
    setIsBookmarkModalOpen(false);
  };

  return (
    <div>
      {/* Top Bar Navigation & Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Bookmark Specific Move with Notes */}
          <button 
            className={`btn ${currentMoveFav ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleOpenBookmarkModal}
            disabled={currentPly < 0}
            title={currentPly < 0 ? 'Step to a move to bookmark it' : 'Bookmark this move with study notes'}
            style={{
              borderColor: currentMoveFav ? 'var(--accent-warning)' : undefined,
              backgroundColor: currentMoveFav ? 'rgba(245, 158, 11, 0.15)' : undefined,
              color: currentMoveFav ? 'var(--accent-warning)' : undefined
            }}
          >
            <Bookmark size={15} fill={currentMoveFav ? 'currentColor' : 'none'} />
            <span>{currentMoveFav ? 'Move Bookmarked (Edit Note)' : 'Bookmark Move & Note'}</span>
          </button>

          {/* Favorite Entire Game */}
          <button 
            className={`btn btn-secondary ${fav ? 'active' : ''}`}
            onClick={() => toggleFavorite(game.id)}
            style={{ color: fav ? 'var(--accent-danger)' : 'inherit' }}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
            <span>{fav ? 'Saved in Favorites' : 'Save to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Game Header Details */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {game.event} • Round {game.round} • {game.year}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {game.white} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs</span> {game.black}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-eco">{game.eco || 'ECO'}</span>
            <span className="badge badge-white-win">{game.result}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {game.moveCount} moves ({movesList.length} plies)
            </span>
          </div>
        </div>
      </div>

      {/* Main Replay Container: Chessboard + Controls + Notation */}
      <div className="replay-container">
        {/* Left Side: Chessboard & Controls */}
        <div className="board-wrapper">
          {/* Stockfish Engine Evaluation Bar */}
          {showStockfish && (
            <EvalBar 
              evalData={evalData} 
              isAnalyzing={isAnalyzing} 
            />
          )}

          {/* Interactive Chessboard */}
          <ChessBoard 
            boardState={currentPos.board}
            flipped={flipped}
            lastMove={currentPos.lastMove}
            bestMove={evalData ? evalData.bestMove : null}
            showStockfish={showStockfish}
          />

          {/* Replay Navigation Controls */}
          <div className="board-controls">
            <div className="control-group">
              <button 
                className="btn-icon" 
                onClick={handleFirst} 
                disabled={currentPly === -1}
                title="Start Position (Up Arrow)"
              >
                <SkipBack size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={handlePrev} 
                disabled={currentPly === -1}
                title="Previous Move (Left Arrow)"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0 16px', height: '36px' }}
                onClick={() => setIsPlaying(!isPlaying)}
                title="Auto Play (Spacebar)"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                <span style={{ fontSize: '0.85rem' }}>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button 
                className="btn-icon" 
                onClick={handleNext} 
                disabled={currentPly >= movesList.length - 1}
                title="Next Move (Right Arrow)"
              >
                <ChevronRight size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={handleLast} 
                disabled={currentPly >= movesList.length - 1}
                title="End Position (Down Arrow)"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Utility buttons */}
            <div className="control-group">
              {/* Flip Board */}
              <button 
                className="btn-icon" 
                onClick={() => setFlipped(!flipped)}
                title="Flip Board"
              >
                <RotateCw size={15} />
              </button>

              {/* Sound Toggle */}
              <button 
                className="btn-icon" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute move sounds' : 'Enable move sounds'}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Stockfish Engine Toggle */}
              <button 
                className={`btn ${showStockfish ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0 12px', height: '36px', fontSize: '0.82rem' }}
                onClick={() => setShowStockfish(!showStockfish)}
                title="Toggle Stockfish Analysis"
              >
                <Cpu size={15} />
                <span>{showStockfish ? 'Stockfish ON' : 'Stockfish OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Move Notation Table */}
        <MoveList 
          moves={movesList}
          currentPlyIndex={currentPly}
          onSelectPly={(ply) => {
            setCurrentPly(ply);
            playClickSound();
          }}
          result={game.result}
        />
      </div>

      {/* BOOKMARK MOVE & STUDY NOTE MODAL */}
      {isBookmarkModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBookmarkModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={18} style={{ color: 'var(--accent-warning)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Bookmark Move &amp; Note</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsBookmarkModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {game.white} vs {game.black} ({game.year})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-eco" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                  {currentPly % 2 === 0 ? `${Math.floor(currentPly / 2) + 1}. ${movesList[currentPly]?.san || ''}` : `${Math.floor(currentPly / 2) + 1}... ${movesList[currentPly]?.san || ''}`}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Ply {currentPly + 1}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveBookmark} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>Personal Study Note</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  placeholder="Record tactical breakthrough ideas, key variations, opening nuances, or critical blunder analysis..."
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '6px' }}>
                {currentMoveFav ? (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}
                    onClick={handleDeleteBookmark}
                  >
                    <Trash2 size={15} />
                    <span>Delete Bookmark</span>
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsBookmarkModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={bookmarkSubmitting}
                  >
                    <Bookmark size={15} fill="currentColor" />
                    <span>{bookmarkSubmitting ? 'Saving...' : 'Save Move & Note'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
