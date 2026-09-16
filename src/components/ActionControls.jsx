import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function ActionControls({ onClear }) {
  return (
    <section className="actions-section">
      {/* Primary Clear & Next Bin Button */}
      <button
        type="button"
        id="clear-btn"
        className="action-btn action-btn-clear"
        onClick={onClear}
        aria-label="Clear bin code and start next"
      >
        <RefreshCw size={22} strokeWidth={2.5} />
        <span>Clear</span>
      </button>
    </section>
  );
}
