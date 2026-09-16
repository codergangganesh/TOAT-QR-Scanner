import React, { useState, useMemo } from 'react';
import { Layers, Search, Check } from 'lucide-react';

// All 26 letters of the alphabet A to Z
const ALL_ALPHABETS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

const FIRST_LETTERS = ALL_ALPHABETS; // A to Z
const SECOND_LETTERS = ALL_ALPHABETS; // A to Z
const ALL_LEVELS = Array.from({ length: 30 }, (_, i) => i + 1); // 1 to 30

const LEVEL_RANGES = [
  { label: 'All (1–30)', value: 'ALL' },
  { label: '1–10', value: '1-10', min: 1, max: 10 },
  { label: '11–20', value: '11-20', min: 11, max: 20 },
  { label: '21–30', value: '21-30', min: 21, max: 30 }
];

export default function BinSuggestions({ onSelectBin, currentCode }) {
  const [selectedFirst, setSelectedFirst] = useState('A');
  const [selectedSecond, setSelectedSecond] = useState('ALL');
  const [selectedLevelRange, setSelectedLevelRange] = useState('ALL');
  const [selectedExactLevel, setSelectedExactLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active levels based on range & exact level selection
  const activeLevels = useMemo(() => {
    let list = ALL_LEVELS;

    if (selectedLevelRange === '1-10') {
      list = list.filter((l) => l >= 1 && l <= 10);
    } else if (selectedLevelRange === '11-20') {
      list = list.filter((l) => l >= 11 && l <= 20);
    } else if (selectedLevelRange === '21-30') {
      list = list.filter((l) => l >= 21 && l <= 30);
    }

    if (selectedExactLevel !== 'ALL') {
      const exactNum = Number(selectedExactLevel);
      list = list.filter((l) => l === exactNum);
    }

    return list;
  }, [selectedLevelRange, selectedExactLevel]);

  // Generate suggestions based on selected filters or search query
  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toUpperCase();

    // Fast search mode across all A-Z, A-Z, 1-30 combinations
    if (query) {
      const results = [];
      for (const f of FIRST_LETTERS) {
        for (const s of SECOND_LETTERS) {
          for (const l of ALL_LEVELS) {
            const code = `CPLM-${f}-1-${s}-${l}`;
            const shortPattern = `${f}-1-${s}-${l}`;
            const compactPattern = `${f}1${s}${l}`;
            if (
              code.includes(query) ||
              shortPattern.includes(query) ||
              compactPattern.includes(query)
            ) {
              results.push(code);
              if (results.length >= 100) return results; // Capped for mobile 60fps performance
            }
          }
        }
      }
      return results;
    }

    // Default filtered view by selected first letter, second letter, and levels
    const results = [];
    const firstList = selectedFirst === 'ALL' ? FIRST_LETTERS : [selectedFirst];
    const secondList = selectedSecond === 'ALL' ? SECOND_LETTERS : [selectedSecond];

    for (const f of firstList) {
      for (const s of secondList) {
        for (const l of activeLevels) {
          results.push(`CPLM-${f}-1-${s}-${l}`);
        }
      }
    }
    return results;
  }, [selectedFirst, selectedSecond, activeLevels, searchQuery]);

  return (
    <section className="suggestions-section" id="suggestions-section">
      {/* Header */}
      <div className="suggestions-header">
        <div className="suggestions-title-row">
          <Layers size={16} className="suggestions-icon" />
          <h2 className="suggestions-title">BIN SUB-NAME SUGGESTIONS</h2>
        </div>
        <span className="suggestions-badge">
          {selectedFirst === 'ALL' ? 'A–Z' : selectedFirst} •{' '}
          {selectedSecond === 'ALL' ? 'A–Z' : selectedSecond} •{' '}
          {selectedExactLevel !== 'ALL'
            ? `L${selectedExactLevel}`
            : selectedLevelRange === 'ALL'
            ? '1–30'
            : selectedLevelRange}
        </span>
      </div>

      {/* Quick Search Filter */}
      <div className="suggestions-search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="suggestions-search-input"
          placeholder="Search bin (e.g. A-1-B-1, A-1-C-1, 30)..."
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

      {/* 1. Primary Alphabet Tabs (Aisle A to Z) */}
      <div className="filter-group">
        <span className="sub-filter-label">Aisle / Zone (A–Z):</span>
        <div className="alphabet-selector-container">
          <div className="alphabet-scroll-row" role="tablist" aria-label="First letter A to Z">
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
      </div>

      {/* 2. Secondary Alphabet Tabs (Shelf A to Z) */}
      <div className="filter-group">
        <span className="sub-filter-label">Shelf (A–Z e.g. A, B, C...):</span>
        <div className="second-alphabet-row">
          <button
            type="button"
            className={`shelf-chip-btn ${selectedSecond === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedSecond('ALL')}
          >
            All (A–Z)
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
      </div>

      {/* 3. Level Filter (1 to 30) */}
      <div className="filter-group">
        <div className="level-filter-header">
          <span className="sub-filter-label">Level (1–30):</span>
          <div className="level-range-chips">
            {LEVEL_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                className={`level-range-btn ${
                  selectedLevelRange === range.value && selectedExactLevel === 'ALL'
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  setSelectedLevelRange(range.value);
                  setSelectedExactLevel('ALL');
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Individual Level Picker (1 to 30) */}
        <div className="level-scroll-container">
          <div className="level-scroll-row">
            <button
              type="button"
              className={`level-pill-btn ${selectedExactLevel === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedExactLevel('ALL')}
            >
              ALL
            </button>
            {ALL_LEVELS.map((level) => {
              const inRange =
                selectedLevelRange === 'ALL' ||
                (selectedLevelRange === '1-10' && level <= 10) ||
                (selectedLevelRange === '11-20' && level >= 11 && level <= 20) ||
                (selectedLevelRange === '21-30' && level >= 21 && level <= 30);

              return (
                <button
                  key={level}
                  type="button"
                  className={`level-pill-btn ${
                    selectedExactLevel === String(level) ? 'active' : ''
                  } ${!inRange ? 'out-of-range' : ''}`}
                  onClick={() => {
                    setSelectedExactLevel(String(level));
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Suggestions Grid List */}
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
