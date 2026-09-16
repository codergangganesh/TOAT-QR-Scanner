import React from 'react';
import { X } from 'lucide-react';
import { FIXED_PREFIX } from '../utils/binFormatter';

export default function BinInput({
  value,
  onChange,
  onClear,
  inputRef,
  onKeyDown,
  onFocus,
  onClick,
}) {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <section className="input-section">
      <label htmlFor="bin-input-field" className="section-label">
        Enter Bin Code
      </label>
      <div className="input-box">
        <span className="input-prefix" aria-hidden="true">
          {FIXED_PREFIX}
        </span>
        <input
          id="bin-input-field"
          ref={inputRef}
          type="text"
          className="bin-text-input"
          placeholder="A18 or A1B15"
          value={value}
          onChange={handleInputChange}
          onFocus={onFocus}
          onClick={onClick}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          inputMode="text"
          maxLength={14}
          aria-label="Bin Code Suffix"
        />
        {value && (
          <button
            type="button"
            className="input-clear-btn"
            onClick={onClear}
            aria-label="Clear input"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </section>
  );
}
