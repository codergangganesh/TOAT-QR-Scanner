import React from 'react';
import { History } from 'lucide-react';

export default function RecentBins({ recentBins, onSelectBin, currentCode }) {
  const validBins = Array.isArray(recentBins)
    ? recentBins
        .filter((b) => typeof b === 'string' && b.trim().length > 0)
        .slice(0, 5)
    : [];

  if (validBins.length === 0) {
    return null;
  }

  return (
    <div className="recent-bins-strip" aria-label="Recent bins history">
      <div className="recent-label-box">
        <History size={13} className="recent-icon" />
        <span className="recent-label">Recent ({validBins.length}/5):</span>
      </div>
      <div className="recent-scroll-row">
        {validBins.map((bin) => {
          const isSelected = currentCode === bin;
          // Strip CPLM- prefix for a compact readable chip label
          const displayLabel = bin.startsWith('CPLM-') ? bin.slice(5) : bin;

          return (
            <button
              key={bin}
              type="button"
              className={`recent-chip-btn ${isSelected ? 'active-recent' : ''}`}
              onClick={() => onSelectBin(bin)}
              aria-label={`Re-open recent bin ${bin}`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
