import React, { useState, useMemo } from 'react';
import { Layers, Search, Check } from 'lucide-react';

const FIRST_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'
];

const SECOND_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function BinSuggestions({ onSelectBin, currentCode }) {
  const [selectedFirst, setSelectedFirst] = useState('A');
  const [selectedSecond, setSelectedSecond] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate suggestions based on selected filters or search query
  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toUpperCase();

    // If user typed a search query, search across all A-U, A-I, 1-10 combinations
    if (query) {
      const results = [];
      for (const f of FIRST_LETTERS) {
        for (const s of SECOND_LETTERS) {
          for (const l of LEVELS) {
            const code = `CPLM-${f}-1-${s}-${l}`;
            const searchPattern = `${f}${s}${l}`;
            const searchPatternWith1 = `${f}1${s}${l}`;
            if (
              code.includes(query) ||
              searchPattern.includes(query) ||
              searchPatternWith1.includes(query)
            ) {
              results.push(code);
              if (results.length >= 80) return results; // Limit search results for performance
            }
          }
        }
      }
      return results;
    }

    // Default filtered view: by selected first and second letter
    const results = [];
    const firstList = selectedFirst === 'ALL' ? FIRST_LETTERS : [selectedFirst];
    const secondList = selectedSecond === 'ALL' ? SECOND_LETTERS : [selectedSecond];

    for (const f of firstList) {
      for (const s of secondList) {
        for (const l of LEVELS) {
          results.push(`CPLM-${f}-1-${s}-${l}`);
        }
      }
    }
    return results;
  }, [selectedFirst, selectedSecond, searchQuery]);

  return (
    <section className="suggestions-section" id="suggestions-section">
      <div className="suggestions-header">
        <div className="suggestions-title-row">
          <Layers size={16} className="suggestions-icon" />
          <h2 className="suggestions-title">BIN SUB-NAME SUGGESTIONS</h2>
        </div>
        <span className="suggestions-badge">
          {selectedFirst === 'ALL' ? 'A–U' : selectedFirst} •{' '}
          {selectedSecond === 'ALL' ? 'A–I' : selectedSecond} • 1–10
        </span>
      </div>

      {/* Quick Search Filter */}
      <div className="suggestions-search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="suggestions-search-input"
          placeholder="Filter bins (e.g. A-1-B, 10, U)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Primary Alphabet Tabs (A to U) */}
      <div className="alphabet-selector-container">
        <div className="alphabet-scroll-row" role="tablist" aria-label="First letter A to U">
          <button
            type="button"
            className={`letter-tab-btn ${selectedFirst === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFirst('ALL');
              setSearchQuery('');
            }}
          >
            ALL
          </button>
          {FIRST_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`letter-tab-btn ${selectedFirst === letter ? 'active' : ''}`}
              onClick={() => {
                setSelectedFirst(letter);
                setSearchQuery('');
              }}
              role="tab"
              aria-selected={selectedFirst === letter}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Alphabet Tabs (A to I) */}
      <div className="second-alphabet-row">
        <span className="sub-filter-label">Shelf:</span>
        <button
          type="button"
          className={`shelf-chip-btn ${selectedSecond === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedSecond('ALL')}
        >
          All (A–I)
        </button>
        {SECOND_LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            className={`shelf-chip-btn ${selectedSecond === letter ? 'active' : ''}`}
            onClick={() => setSelectedSecond(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Suggestions Grid List */}
      <div className="suggestions-grid-wrapper">
        {suggestions.length === 0 ? (
          <div className="no-suggestions-msg">No matching bin codes found</div>
        ) : (
          <div className="suggestions-grid">
            {suggestions.map((code) => {
              const isSelected = currentCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={`bin-suggestion-pill ${isSelected ? 'active-bin' : ''}`}
                  onClick={() => onSelectBin(code)}
                  aria-label={`Select bin ${code}`}
                >
                  <span className="bin-code-text">{code}</span>
                  {isSelected && <Check size={14} className="bin-check-icon" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
