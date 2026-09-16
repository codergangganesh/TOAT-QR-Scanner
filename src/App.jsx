import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BinInput from './components/BinInput';
import QrCard from './components/QrCard';
import ActionControls from './components/ActionControls';
import BinSuggestions from './components/BinSuggestions';
import { parseBinCode } from './utils/binFormatter';

const THEME_STORAGE_KEY = 'zepto_warehouse_theme';

export default function App() {
  // Theme state: dark / light with persistence and system detection
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      // System preference fallback
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {
      // Ignore localStorage access issues
    }
    return 'dark'; // Default to dark for warehouse utility
  });

  // Bin code states
  const [rawInput, setRawInput] = useState('');
  const inputRef = useRef(null);

  // Synchronize document theme attribute and meta theme-color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#080c14' : '#f1f5f9'
      );
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  // Autofocus input on initial page mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Instant parsing and formatting on every keystroke
  const parsed = parseBinCode(rawInput);

  // Subtle tactile haptic vibration when QR code is ready to scan
  const prevValidRef = useRef(false);
  useEffect(() => {
    if (parsed.isValid && !prevValidRef.current) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(45);
        } catch {
          // Ignore
        }
      }
    }
    prevValidRef.current = parsed.isValid;
  }, [parsed.isValid]);

  const handleInputChange = (value) => {
    // Automatically convert to uppercase and sanitize
    setRawInput(value.toUpperCase());
  };

  const handleClear = () => {
    setRawInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Support rapid TOAT repetitive workflow via Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (parsed.isValid) {
        // If code is valid, worker has scanned and pressed Enter to jump to next bin
        e.preventDefault();
        handleClear();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  // Select bin from suggestions section
  const handleSelectBin = (code) => {
    // Extract suffix e.g. "CPLM-A-1-A-1" -> "A1A1"
    const suffix = code.replace('CPLM-', '').replace(/-/g, '');
    setRawInput(suffix);
    // Smoothly scroll to top so the QR code is immediately visible to scan
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      <main className="mobile-container">
        {/* Header with Zepto App Logo, Title, and Theme Switcher */}
        <Header theme={theme} toggleTheme={toggleTheme} />

        {/* Input Card with Fixed CPLM- prefix */}
        <BinInput
          value={rawInput}
          onChange={handleInputChange}
          onClear={handleClear}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
        />

        {/* Formatted Bin Code & Enlarged High-Contrast QR Section */}
        <QrCard
          formattedCode={parsed.formattedCode}
          isValid={parsed.isValid}
          statusMessage={parsed.statusMessage}
        />

        {/* Primary Clear & Next Bin Action */}
        <ActionControls onClear={handleClear} />

        {/* Separate Bin Sub-Name Suggestions Section */}
        <BinSuggestions
          onSelectBin={handleSelectBin}
          currentCode={parsed.formattedCode}
        />
      </main>
    </div>
  );
}
