import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import EvalBar from '../components/EvalBar';
import { useAuth } from '../context/AuthContext';
import { 
  fetchCommunityHighlights, 
  createCommunityHighlight, 
  toggleHighlightLike, 
  deleteCommunityHighlight, 
  editCommunityHighlight, 
  togglePinHighlight,
  getGameMoveHistory,
  calculatePositionAtPly
} from '../services/highlights';
import { evaluatePosition } from '../services/stockfish';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  Play, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  Pin, 
  Cpu, 
  ExternalLink, 
  Shield, 
  Check, 
  X, 
  ChevronRight, 
  User, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function DailyHighlights({ allGames = [], onSelectGame }) {
  const { user } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.uid === '1');

  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHighlightId, setSelectedHighlightId] = useState(null);

  // Tab & Search filters
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' | 'newest' | 'pinned' | 'my'
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive board & move state
  const [boardState, setBoardState] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [movePlayed, setMovePlayed] = useState(false);

  // Stockfish evaluation state
  const [showStockfish, setShowStockfish] = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Create highlight modal state
  const [isCreating, setIsCreating] = useState(false);
  const [gameSearch, setGameSearch] = useState('');
  const [selectedGameForNew, setSelectedGameForNew] = useState(null);
  const [newPlyIndex, setNewPlyIndex] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Admin edit modal state
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPinned, setEditIsPinned] = useState(false);

  // Load highlights
  const loadHighlights = async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityHighlights();
      setHighlights(data);
      if (data.length > 0 && !selectedHighlightId) {
        setSelectedHighlightId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load highlights:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHighlights();
  }, []);

  // Filtered & sorted highlights list
  const filteredHighlights = useMemo(() => {
    let list = [...highlights];

    if (activeTab === 'popular') {
      list.sort((a, b) => ((b.likes || []).length) - ((a.likes || []).length));
    } else if (activeTab === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === 'pinned') {
      list = list.filter(h => h.isPinned);
    } else if (activeTab === 'my') {
      if (user) {
        list = list.filter(h => h.authorUid === user.uid);
      } else {
        list = [];
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(h => 
        (h.title && h.title.toLowerCase().includes(q)) ||
        (h.white && h.white.toLowerCase().includes(q)) ||
        (h.black && h.black.toLowerCase().includes(q)) ||
        (h.authorName && h.authorName.toLowerCase().includes(q)) ||
        (h.authorUsername && h.authorUsername.toLowerCase().includes(q))
      );
    }

    return list;
  }, [highlights, activeTab, searchQuery, user]);

  // Selected highlight
  const selectedHighlight = useMemo(() => {
    if (!selectedHighlightId) return highlights[0] || null;
    return highlights.find(h => h.id === selectedHighlightId) || highlights[0] || null;
  }, [highlights, selectedHighlightId]);

  // Sync board state when selected highlight changes
  useEffect(() => {
    if (selectedHighlight && selectedHighlight.fenBefore) {
      try {
        const chess = new Chess(selectedHighlight.fenBefore);
        setBoardState(chess.board());
        setLastMove(null);
        setMovePlayed(false);
        setEvalData(null);
      } catch (e) {
        const chess = new Chess();
        setBoardState(chess.board());
        setLastMove(null);
        setMovePlayed(false);
      }
    }
  }, [selectedHighlight]);

  // Stockfish evaluation on toggle
  useEffect(() => {
    let active = true;
    if (showStockfish && selectedHighlight) {
      setIsEvaluating(true);
      const targetFen = movePlayed && selectedHighlight.fenAfter ? selectedHighlight.fenAfter : selectedHighlight.fenBefore;
      evaluatePosition(targetFen, 12).then(res => {
        if (active && res) {
          setEvalData(res);
          setIsEvaluating(false);
        }
      });
    } else {
      setEvalData(null);
    }
    return () => { active = false; };
  }, [showStockfish, selectedHighlight, movePlayed]);

  // Play decisive move on board
  const handlePlayMove = () => {
    if (!selectedHighlight || movePlayed) return;
    try {
      const chess = new Chess(selectedHighlight.fenBefore);
      const res = chess.move(selectedHighlight.moveSan);
      if (res) {
        setBoardState(chess.board());
        setLastMove({ from: res.from, to: res.to, san: res.san });
        setMovePlayed(true);

        // Subtle audio feedback
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(460, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.12);
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Could not execute move:', e);
    }
  };

  // Reset move position
  const handleResetMove = () => {
    if (!selectedHighlight) return;
    try {
      const chess = new Chess(selectedHighlight.fenBefore);
      setBoardState(chess.board());
      setLastMove(null);
      setMovePlayed(false);
    } catch (e) {}
  };

  // Like / Unlike action
  const handleToggleLike = async (highlightId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert('Please log in or sign up to like community highlights!');
      return;
    }

    try {
      const res = await toggleHighlightLike(highlightId, user.uid);
      setHighlights(prev => prev.map(h => {
        if (h.id === highlightId) {
          return { ...h, likes: res.likes };
        }
        return h;
      }));
    } catch (err) {
      alert(err.message || 'Failed to update like status.');
    }
  };

  // Admin Pin / Unpin
  const handleTogglePin = async (highlightId, e) => {
    if (e) e.stopPropagation();
    try {
      const isPinned = await togglePinHighlight(highlightId, user);
      setHighlights(prev => prev.map(h => {
        if (h.id === highlightId) {
          return { ...h, isPinned };
        }
        return h;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Highlight (Author or Admin)
  const handleDeleteHighlight = async (highlightId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;
    try {
      await deleteCommunityHighlight(highlightId, user);
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      if (selectedHighlightId === highlightId) {
        setSelectedHighlightId(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Admin/Author Edit Modal
  const handleOpenEdit = (hl, e) => {
    if (e) e.stopPropagation();
    setEditingHighlight(hl);
    setEditTitle(hl.title);
    setEditDesc(hl.description);
    setEditIsPinned(!!hl.isPinned);
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingHighlight) return;
    try {
      const updated = await editCommunityHighlight(
        editingHighlight.id, 
        { title: editTitle, description: editDesc, isPinned: editIsPinned }, 
        user
      );
      setHighlights(prev => prev.map(h => h.id === updated.id ? updated : h));
      setEditingHighlight(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Jump to Game Replay from this specific move
  const handleJumpToGame = () => {
    if (!selectedHighlight) return;
    const fullGame = allGames.find(g => g.id === selectedHighlight.gameId);
    if (fullGame) {
      onSelectGame(fullGame, selectedHighlight.plyIndex);
    } else {
      // Fallback pseudo-game if game not in allGames
      const synthetic = {
        id: selectedHighlight.gameId,
        year: selectedHighlight.year,
        event: selectedHighlight.event,
        white: selectedHighlight.white,
        black: selectedHighlight.black,
        result: selectedHighlight.result,
        eco: selectedHighlight.eco,
        moves: ''
      };
      onSelectGame(synthetic, selectedHighlight.plyIndex);
    }
  };

  // Games matching search in Create Highlight modal
  const matchingGamesForModal = useMemo(() => {
    if (!gameSearch.trim()) return allGames.slice(0, 8);
    const q = gameSearch.toLowerCase().trim();
    return allGames.filter(g => 
      (g.white && g.white.toLowerCase().includes(q)) ||
      (g.black && g.black.toLowerCase().includes(q)) ||
      (g.event && g.event.toLowerCase().includes(q)) ||
      (String(g.year).includes(q))
    ).slice(0, 15);
  }, [allGames, gameSearch]);

  // History moves of game selected for new highlight
  const selectedGameMoves = useMemo(() => {
    if (!selectedGameForNew) return [];
    return getGameMoveHistory(selectedGameForNew);
  }, [selectedGameForNew]);

  // Position preview for new highlight creation
  const newHighlightPositionPreview = useMemo(() => {
    if (!selectedGameForNew || selectedGameMoves.length === 0) return null;
    return calculatePositionAtPly(selectedGameForNew, newPlyIndex);
  }, [selectedGameForNew, selectedGameMoves, newPlyIndex]);

  // Submit new Community Highlight
  const handleSubmitNewHighlight = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!user) {
      setCreateError('You must be signed in to submit a highlight.');
      return;
    }
    if (!selectedGameForNew) {
      setCreateError('Please select a game first.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const created = await createCommunityHighlight({
        title: newTitle,
        description: newDescription,
        game: selectedGameForNew,
        plyIndex: newPlyIndex,
        user
      });
      setHighlights(prev => [created, ...prev]);
      setSelectedHighlightId(created.id);
      setIsCreating(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setSelectedGameForNew(null);
      setNewPlyIndex(0);
      setGameSearch('');
    } catch (err) {
      setCreateError(err.message || 'Failed to submit highlight.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const isCurrentLiked = selectedHighlight && user && (selectedHighlight.likes || []).includes(user.uid);
  const likesCount = selectedHighlight ? (selectedHighlight.likes || []).length : 0;

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Community Highlights
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Iconic moves, brilliant tactical sacrifices, and historical masterstrokes curated and shared by the chess community.
          </p>
        </div>

        {/* Action: Submit Highlight Button */}
        <button 
          className="btn btn-primary"
          onClick={() => {
            if (!user) {
              alert('Please log in or sign up to contribute a highlight to the community!');
            } else {
              setIsCreating(true);
            }
          }}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Submit a Highlight</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`btn ${activeTab === 'popular' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', height: '32px' }}
            onClick={() => setActiveTab('popular')}
          >
            <Flame size={14} />
            <span>Most Liked</span>
          </button>

          <button 
            className={`btn ${activeTab === 'newest' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', height: '32px' }}
            onClick={() => setActiveTab('newest')}
          >
            <Clock size={14} />
            <span>Newest</span>
          </button>

          <button 
            className={`btn ${activeTab === 'pinned' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.82rem', height: '32px' }}
            onClick={() => setActiveTab('pinned')}
          >
            <Pin size={14} />
            <span>Pinned</span>
          </button>

          {user && (
            <button 
              className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.82rem', height: '32px' }}
              onClick={() => setActiveTab('my')}
            >
              <User size={14} />
              <span>My Submissions</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search moves, players, or contributors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
          <p>Loading community highlights...</p>
        </div>
      ) : !selectedHighlight ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No highlights match your filter.</p>
          <button className="btn btn-secondary" onClick={() => { setActiveTab('popular'); setSearchQuery(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Left Column: Interactive Chessboard */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Position Before Move {selectedHighlight.moveNumber}
              </span>
              <span className="badge badge-eco">
                Turn: {selectedHighlight.moveSan.includes('...') ? 'Black' : 'White'}
              </span>
            </div>

            {/* Stockfish Engine Evaluation Bar */}
            {showStockfish && (
              <div style={{ marginBottom: '14px' }}>
                <EvalBar evalData={evalData} isAnalyzing={isEvaluating} />
              </div>
            )}

            {/* Chessboard */}
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              {boardState && (
                <ChessBoard 
                  boardState={boardState} 
                  lastMove={lastMove}
                  bestMove={evalData ? evalData.bestMove : null}
                  showStockfish={showStockfish}
                />
              )}
            </div>

            {/* Move Execution Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <button 
                className={`btn ${movePlayed ? 'btn-secondary' : 'btn-primary'}`}
                style={{ flex: 1, height: '42px', justifyContent: 'center', fontSize: '0.92rem' }}
                onClick={handlePlayMove}
                disabled={movePlayed}
              >
                <Sparkles size={16} style={{ color: movePlayed ? 'inherit' : 'var(--accent-warning)' }} />
                <span>{movePlayed ? `Executed: ${selectedHighlight.moveSan}` : `Execute Move: ${selectedHighlight.moveSan}`}</span>
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

            {/* Secondary Option: Stockfish Evaluation Toggle */}
            <button 
              className={`btn ${showStockfish ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', height: '38px', justifyContent: 'center', fontSize: '0.85rem' }}
              onClick={() => setShowStockfish(!showStockfish)}
            >
              <Cpu size={16} style={{ color: showStockfish ? '#fff' : 'var(--accent-primary)' }} />
              <span>{showStockfish ? 'Hide Stockfish Analysis' : 'Stockfish Engine Evaluation'}</span>
            </button>
          </div>

          {/* Right Column: Move Details, Author, Likes, Actions & Browse List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px' }}>
              {/* Top Meta: Pinned status + Admin controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedHighlight.isPinned && (
                    <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Pin size={11} />
                      <span>PINNED</span>
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedHighlight.event} ({selectedHighlight.year})
                  </span>
                </div>

                {/* Admin / Author Management Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isAdmin && (
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: selectedHighlight.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                      onClick={(e) => handleTogglePin(selectedHighlight.id, e)}
                      title="Toggle Pin Status"
                    >
                      <Pin size={12} />
                      <span>{selectedHighlight.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                  )}

                  {(isAdmin || (user && user.uid === selectedHighlight.authorUid)) && (
                    <>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={(e) => handleOpenEdit(selectedHighlight, e)}
                        title="Edit highlight"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-danger)' }}
                        onClick={(e) => handleDeleteHighlight(selectedHighlight.id, e)}
                        title="Delete highlight"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.3 }}>
                {selectedHighlight.title}
              </h2>

              {/* Contributor Author Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <img 
                  src={selectedHighlight.authorPhoto || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150'}
                  alt={selectedHighlight.authorName} 
                  style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{selectedHighlight.authorName}</span>
                    {selectedHighlight.authorUsername && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                        @{selectedHighlight.authorUsername}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Contributed {new Date(selectedHighlight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Players Match Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <div style={{ fontWeight: 600 }}>{selectedHighlight.white}</div>
                <span style={{ color: 'var(--text-muted)' }}>vs</span>
                <div style={{ fontWeight: 600 }}>{selectedHighlight.black}</div>
                <span className="badge badge-white-win" style={{ marginLeft: 'auto' }}>
                  {selectedHighlight.result}
                </span>
              </div>

              {/* Move Narrative */}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '24px' }}>
                {selectedHighlight.description}
              </p>

              {/* Actions Row: Like Button & Jump to Game Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {/* Like Button */}
                <button 
                  className={`btn ${isCurrentLiked ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    height: '42px', 
                    padding: '0 16px',
                    borderColor: isCurrentLiked ? 'var(--accent-danger)' : undefined,
                    backgroundColor: isCurrentLiked ? 'rgba(239, 68, 68, 0.15)' : undefined,
                    color: isCurrentLiked ? 'var(--accent-danger)' : undefined
                  }}
                  onClick={(e) => handleToggleLike(selectedHighlight.id, e)}
                >
                  <Heart size={16} fill={isCurrentLiked ? 'currentColor' : 'none'} />
                  <span style={{ fontWeight: 600 }}>{likesCount}</span>
                  <span>{likesCount === 1 ? 'Like' : 'Likes'}</span>
                </button>

                {/* Option to get into the game from that move */}
                <button 
                  className="btn btn-primary"
                  style={{ flex: 1, height: '42px', justifyContent: 'center' }}
                  onClick={handleJumpToGame}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Replay Game from this Move</span>
                  <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </div>

            {/* Community Highlights Explorer Feed */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  Community Submissions ({filteredHighlights.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {filteredHighlights.map(item => {
                  const isSelected = item.id === selectedHighlight.id;
                  const itemLikes = (item.likes || []).length;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedHighlightId(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 120ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {item.isPinned && <Pin size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            by @{item.authorUsername || 'user'} • {item.white.split(',')[0]} vs {item.black.split(',')[0]} ({item.year})
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={12} fill={user && (item.likes || []).includes(user.uid) ? 'var(--accent-danger)' : 'none'} style={{ color: 'var(--accent-danger)' }} />
                          <span>{itemLikes}</span>
                        </span>
                        <span className="badge badge-eco">{item.moveSan}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COMMUNITY HIGHLIGHT MODAL */}
      {isCreating && (
        <div className="modal-overlay" onClick={() => setIsCreating(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Share a Community Highlight</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsCreating(false)}>
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleSubmitNewHighlight} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1: Select Game */}
              <div>
                <label className="input-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                  1. Select a World Championship Game
                </label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search player name, year (e.g. Fischer, Kasparov, 1972)..."
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ maxHeight: '130px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
                  {matchingGamesForModal.map(g => {
                    const isPicked = selectedGameForNew && selectedGameForNew.id === g.id;
                    return (
                      <div 
                        key={g.id}
                        onClick={() => {
                          setSelectedGameForNew(g);
                          setNewPlyIndex(Math.floor((getGameMoveHistory(g).length || 2) / 2));
                        }}
                        style={{
                          padding: '6px 10px',
                          cursor: 'pointer',
                          backgroundColor: isPicked ? 'var(--bg-subtle)' : 'transparent',
                          border: isPicked ? '1px solid var(--accent-primary)' : '1px solid transparent',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontWeight: isPicked ? 600 : 400 }}>
                          {g.year}: {g.white} vs {g.black} ({g.result})
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.event}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Decisive Move */}
              {selectedGameForNew && selectedGameMoves.length > 0 && (
                <div>
                  <label className="input-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                    2. Select the Decisive Move / Shot
                  </label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <input 
                      type="range" 
                      min={0} 
                      max={selectedGameMoves.length - 1}
                      value={newPlyIndex}
                      onChange={(e) => setNewPlyIndex(parseInt(e.target.value, 10))}
                      style={{ flex: 1 }}
                    />
                    <span className="badge badge-eco" style={{ fontSize: '0.85rem', padding: '4px 10px' }}>
                      Move {Math.floor(newPlyIndex / 2) + 1}: {selectedGameMoves[newPlyIndex]?.san}
                    </span>
                  </div>

                  {newHighlightPositionPreview && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Turn: {newHighlightPositionPreview.turn}</span>
                      <span>•</span>
                      <span>FEN: {newHighlightPositionPreview.fenBefore.slice(0, 30)}...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Title & Commentary */}
              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>Highlight Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Kasparov's Stunning Rook Sacrifice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>Move Commentary &amp; Narrative</label>
                <textarea 
                  className="input-field" 
                  rows={3}
                  placeholder="Explain why this tactical breakthrough, brilliant defense, or endgame finesse is memorable..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createSubmitting || !selectedGameForNew || !newTitle.trim() || !newDescription.trim()}
                >
                  <Sparkles size={14} />
                  <span>{createSubmitting ? 'Publishing...' : 'Publish to Community'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN / AUTHOR EDIT MODAL */}
      {editingHighlight && (
        <div className="modal-overlay" onClick={() => setEditingHighlight(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Edit Community Highlight</h3>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Narrative / Description</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="editIsPinned"
                    checked={editIsPinned}
                    onChange={(e) => setEditIsPinned(e.target.checked)}
                  />
                  <label htmlFor="editIsPinned" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Pin this highlight to the top of Community Highlights
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingHighlight(null)}>
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
