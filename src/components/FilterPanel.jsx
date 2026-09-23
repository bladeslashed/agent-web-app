import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

export default function FilterPanel({ filters, setFilters, onReset, totalMatches = 0, yearsList = [] }) {
  const handleTextChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
          <Filter size={16} />
          <span>Filters & Search</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            ({totalMatches} games match)
          </span>
        </div>

        <button 
          className="btn btn-ghost" 
          style={{ fontSize: '0.8rem', padding: '4px 8px' }}
          onClick={onReset}
        >
          <RotateCcw size={13} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Search Player */}
        <div className="input-group">
          <label className="input-label">Player Name</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '100%', paddingLeft: '32px' }}
              placeholder="e.g. Fischer, Kasparov..."
              value={filters.player}
              onChange={(e) => handleTextChange('player', e.target.value)}
            />
          </div>
        </div>

        {/* Year Filter */}
        <div className="input-group">
          <label className="input-label">Year / Era</label>
          <select 
            className="input-field"
            value={filters.year}
            onChange={(e) => handleTextChange('year', e.target.value)}
          >
            <option value="">All Years (1907 - Present)</option>
            <optgroup label="Decades">
              <option value="1900s">1900s (Lasker era)</option>
              <option value="1910s">1910s (Lasker defenses)</option>
              <option value="1920s">1920s (Capablanca, Alekhine)</option>
              <option value="1930s">1930s (Alekhine, Euwe)</option>
              <option value="1940s">1940s (1948 Tournament)</option>
              <option value="1950s">1950s (Botvinnik, Smyslov)</option>
              <option value="1960s">1960s (Tal, Petrosian, Spassky)</option>
              <option value="1970s">1970s (Fischer, Karpov)</option>
              <option value="1980s">1980s (Kasparov vs Karpov)</option>
              <option value="1990s">1990s (Short, Anand, Kamsky)</option>
              <option value="2000s">2000s (Kramnik, Topalov, Anand)</option>
              <option value="2010s">2010s (Carlsen era)</option>
              <option value="2020s">2020s (Nepo, Ding Liren, Gukesh)</option>
            </optgroup>
            <optgroup label="Specific Years">
              {yearsList.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Result Filter */}
        <div className="input-group">
          <label className="input-label">Result</label>
          <select 
            className="input-field"
            value={filters.result}
            onChange={(e) => handleTextChange('result', e.target.value)}
          >
            <option value="">All Outcomes</option>
            <option value="1-0">1-0 (White Win)</option>
            <option value="0-1">0-1 (Black Win)</option>
            <option value="1/2-1/2">½-½ (Draw)</option>
          </select>
        </div>

        {/* Game Length (Moves) Filter */}
        <div className="input-group">
          <label className="input-label">Move Length</label>
          <select 
            className="input-field"
            value={filters.lengthRange}
            onChange={(e) => handleTextChange('lengthRange', e.target.value)}
          >
            <option value="">Any Length</option>
            <option value="miniature">Miniatures (&lt; 25 moves)</option>
            <option value="standard">Standard (25 - 45 moves)</option>
            <option value="long">Long Battles (46 - 70 moves)</option>
            <option value="marathon">Marathons (70+ moves)</option>
          </select>
        </div>

        {/* ECO Opening Code */}
        <div className="input-group">
          <label className="input-label">ECO / Opening Code</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. B90, E56, C"
            value={filters.eco}
            onChange={(e) => handleTextChange('eco', e.target.value)}
          />
        </div>

        {/* Sort Order */}
        <div className="input-group">
          <label className="input-label">Sort By</label>
          <select 
            className="input-field"
            value={filters.sort}
            onChange={(e) => handleTextChange('sort', e.target.value)}
          >
            <option value="year-asc">Year (Earliest first)</option>
            <option value="year-desc">Year (Latest first)</option>
            <option value="moves-desc">Most moves played</option>
            <option value="moves-asc">Least moves played</option>
          </select>
        </div>
      </div>
    </div>
  );
}
