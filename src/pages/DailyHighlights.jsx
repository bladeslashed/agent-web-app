import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import { useAuth } from '../context/AuthContext';
import { 
  fetchDailyHighlights, 
  getHighlightForDate, 
  saveAdminHighlightEdit 
} from '../services/highlights';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Play, 
  RotateCcw, 
  Edit3, 
  Check, 
  ExternalLink,
  Flame,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function DailyHighlights({ allGames = [], onSelectGame }) {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.uid === '1');

  // Format today's date YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [highlight, setHighlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movePlayed, setMovePlayed] = useState(false);
  const [boardState, setBoardState] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  // Admin edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMove, setEditMove] = useState('');

  // Browse recent highlights list
  const [recentHighlights, setRecentHighlights] = useState([]);

  // Load highlight for selectedDate
  useEffect(() => {
    let active = true;
    setLoading(true);
    setMovePlayed(false);

    getHighlightForDate(selectedDate, allGames).then(hl => {
      if (active && hl) {
        setHighlight(hl);
        setEditTitle(hl.title);
        setEditDesc(hl.description);
        setEditMove(hl.moveSan);

        // Setup board at fenBefore
        try {
          const chess = new Chess(hl.fenBefore);
          setBoardState(chess.board());
          setLastMove(null);
        } catch (e) {
          const chess = new Chess();
          setBoardState(chess.board());
          setLastMove(null);
        }
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [selectedDate, allGames]);

  // Load sample of recent highlights for browsing
  useEffect(() => {
    fetchDailyHighlights().then(list => {
      if (list && list.length > 0) {
        setRecentHighlights(list.slice(0, 20));
      }
    });
  }, []);

  // Play the amazing move on the board
  const handlePlayMove = () => {
    if (!highlight || movePlayed) return;
    try {
      const chess = new Chess(highlight.fenBefore);
      const res = chess.move(highlight.moveSan);
      if (res) {
        setBoardState(chess.board());
        setLastMove({ from: res.from, to: res.to, san: res.san });
        setMovePlayed(true);

        // Sound effect
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Could not execute move:', e);
    }
  };

  // Reset back to before the move
  const handleResetMove = () => {
    if (!highlight) return;
    try {
      const chess = new Chess(highlight.fenBefore);
      setBoardState(chess.board());
      setLastMove(null);
      setMovePlayed(false);
    } catch (e) {}
  };

  // Step days
  const handleStepDay = (days) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().slice(0, 10));
  };

  // Save admin edits
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!highlight) return;

    const updated = {
      ...highlight,
      title: editTitle.trim(),
      description: editDesc.trim(),
      moveSan: editMove.trim()
    };
    saveAdminHighlightEdit(updated);
    setHighlight(updated);
    setIsEditing(false);
  };

  const fullGame = useMemo(() => {
    if (!highlight || !highlight.gameId) return null;
    return allGames.find(g => g.id === highlight.gameId);
  }, [highlight, allGames]);

  return (
    <div>
      {/* Page Title & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flame size={22} style={{ color: 'var(--accent-warning)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Daily Highlights
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Every day, discover an iconic tactical move, sacrifice, or breakthrough from World Championship history.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className="btn-icon" 
            onClick={() => handleStepDay(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="date" 
              className="input-field" 
              style={{ padding: '4px 8px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button 
            className="btn-icon" 
            onClick={() => handleStepDay(1)}
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>

          {selectedDate !== todayStr && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {loading || !highlight ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-warning)' }} />
          <p>Loading highlight for {selectedDate}...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 500px) 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Interactive Chessboard */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Position Before Move {highlight.moveNumber}
              </span>
              <span className="badge badge-eco">
                Turn: {highlight.moveSan.includes('...') ? 'Black' : 'White'}
              </span>
            </div>

            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              {boardState && (
                <ChessBoard 
                  boardState={boardState} 
                  lastMove={lastMove} 
                />
              )}
            </div>

            {/* Interactive Move Trigger Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className={`btn ${movePlayed ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1, height: '42px', justifyContent: 'center', fontSize: '0.95rem' }}
                onClick={handlePlayMove}
                disabled={movePlayed}
              >
                <Sparkles size={16} style={{ color: movePlayed ? 'inherit' : 'var(--accent-warning)' }} />
                <span>{movePlayed ? `Played: ${highlight.moveSan}` : `Execute Move: ${highlight.moveSan}`}</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ height: '42px', padding: '0 14px' }}
                onClick={handleResetMove}
                title="Reset Position"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Move Details, Story & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {highlight.date} • {highlight.event} ({highlight.year})
                </span>

                {isAdmin && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 size={13} />
                    <span>Edit Highlight (Admin)</span>
                  </button>
                )}
              </div>

              {/* Title */}
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: 1.3 }}>
                {highlight.title}
              </h2>

              {/* Players Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600 }}>{highlight.white}</div>
                <span style={{ color: 'var(--text-muted)' }}>vs</span>
                <div style={{ fontWeight: 600 }}>{highlight.black}</div>
                <span className="badge badge-white-win" style={{ marginLeft: 'auto' }}>
                  {highlight.result}
                </span>
              </div>

              {/* Move Narrative */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                {highlight.description}
              </p>

              {highlight.isFailsafe && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-warning)', marginBottom: '16px' }}>
                  <HelpCircle size={14} />
                  <span>Generated by dynamic failsafe engine (outside the 3-year pre-computed catalog).</span>
                </div>
              )}

              {/* Replay Full Game Button */}
              {fullGame && (
                <button 
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '42px', justifyContent: 'center' }}
                  onClick={() => onSelectGame(fullGame)}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Replay Full Game from Move 1</span>
                  <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </button>
              )}
            </div>

            {/* Quick Browse Bar */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
                Browse More Highlights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {recentHighlights.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedDate(item.date)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: item.date === selectedDate ? 'var(--bg-subtle)' : 'transparent',
                      border: item.date === selectedDate ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '8px' }}>
                        {item.date}
                      </span>
                    </div>
                    <span className="badge badge-eco">{item.moveSan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit Daily Highlight</h3>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Highlight Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Move SAN Notation</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editMove}
                  onChange={(e) => setEditMove(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Highlight Narrative / Description</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
