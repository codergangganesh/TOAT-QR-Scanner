import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BinInput from './components/BinInput';
import RecentBins from './components/RecentBins';
import QrCard from './components/QrCard';
import ActionControls from './components/ActionControls';
import BinSuggestions from './components/BinSuggestions';
import { parseBinCode, stepBinCode } from './utils/binFormatter';
import { playScannerBeep } from './utils/audioFeedback';

const THEME_STORAGE_KEY = 'zepto_warehouse_theme';
const AUDIO_STORAGE_KEY = 'zepto_audio_feedback';
const RECENT_STORAGE_KEY = 'zepto_recent_bins';

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

  // Warehouse scanner audio beep toggle (default: true)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Recent 3-5 scanned bins history
  const [recentBins, setRecentBins] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bin code states
  const [rawInput, setRawInput] = useState('');
  const [isVoiceUsed, setIsVoiceUsed] = useState(false);
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

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUDIO_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Instant parsing and formatting on every keystroke
  const parsed = parseBinCode(rawInput);

  // Dual Confirmation: 45ms haptic buzz + authentic scanner audio beep + recent bins history
  const prevValidRef = useRef(false);
  useEffect(() => {
    if (parsed.isValid && !prevValidRef.current) {
      // 1. Tactile haptic pulse
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(45);
        } catch {
          // Ignore
        }
      }

      // 2. Warehouse scanner audio confirmation beep (if enabled)
      if (soundEnabled) {
        playScannerBeep();
      }

      // 3. Save to recent bins strip (up to 5 recent bins)
      if (parsed.formattedCode) {
        setRecentBins((prev) => {
          const updated = [
            parsed.formattedCode,
            ...prev.filter((b) => b !== parsed.formattedCode),
          ].slice(0, 5);
          try {
            localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // Ignore
          }
          return updated;
        });
      }
    }
    prevValidRef.current = parsed.isValid;
  }, [parsed.isValid, parsed.formattedCode, soundEnabled]);

  const handleInputChange = (value) => {
    // Manual typing resets voice mode so button remains in original "Voice" state
    setIsVoiceUsed(false);
    setRawInput(value.toUpperCase());
  };

  const handleManualInputFocus = () => {
    // Worker clicks or taps into the input area to type manually
    setIsVoiceUsed(false);
  };

  const handleClear = () => {
    setIsVoiceUsed(false);
    setRawInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Sequential step bin calculations (+1 next, -1 prev)
  const prevCode = parsed.isValid ? stepBinCode(rawInput, -1) : null;
  const nextCode = parsed.isValid ? stepBinCode(rawInput, 1) : null;
  const canStepPrev = !!prevCode && prevCode !== rawInput;
  const canStepNext = !!nextCode && nextCode !== rawInput;

  const prevLabel = canStepPrev
    ? parseBinCode(prevCode).formattedCode.replace('CPLM-', '')
    : null;
  const nextLabel = canStepNext
    ? parseBinCode(nextCode).formattedCode.replace('CPLM-', '')
    : null;

  const handleStepBin = (direction) => {
    if (!parsed.isValid) return;
    const target = direction === 1 ? nextCode : prevCode;
    if (target && target !== rawInput) {
      setRawInput(target);
      setIsVoiceUsed(false);
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
    } else if (e.key === 'ArrowRight' && e.altKey) {
      handleStepBin(1);
    } else if (e.key === 'ArrowLeft' && e.altKey) {
      handleStepBin(-1);
    }
  };

  // Select bin from suggestions section or recent bins strip
  const handleSelectBin = (code) => {
    // Manual selection from chip/pill resets voice mode
    setIsVoiceUsed(false);
    // Extract suffix e.g. "CPLM-A-1-A-1" -> "A1A1" or "CPLM-A-18" -> "A18"
    const suffix = code.replace('CPLM-', '').replace(/-/g, '');
    setRawInput(suffix);
    // Smoothly scroll to top so the QR code is immediately visible to scan
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle voice speech input
  const handleVoiceInput = (normalizedSuffix) => {
    // Input entered via voice recognition
    setIsVoiceUsed(true);
    setRawInput(normalizedSuffix);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      <main className="mobile-container">
        {/* Header with Logo, Title, Scanner Beep Toggle, and Theme Switcher */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
        />

        {/* Input Card with Fixed CPLM- prefix */}
        <BinInput
          value={rawInput}
          onChange={handleInputChange}
          onClear={handleClear}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onFocus={handleManualInputFocus}
          onClick={handleManualInputFocus}
        />

        {/* Recent Bins Strip (Last 3-5 Scanned Bins for Instant 1-Tap Recovery) */}
        <RecentBins
          recentBins={recentBins}
          onSelectBin={handleSelectBin}
          currentCode={parsed.formattedCode}
        />

        {/* Formatted Bin Code & Enlarged High-Contrast QR Section with Swipe Gestures */}
        <QrCard
          formattedCode={parsed.formattedCode}
          isValid={parsed.isValid}
          statusMessage={parsed.statusMessage}
          onStepBin={handleStepBin}
          canStepPrev={canStepPrev}
          canStepNext={canStepNext}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
        />

        {/* Action Controls: Split into Clear and Voice Mic Input */}
        <ActionControls
          onClear={handleClear}
          onVoiceInput={handleVoiceInput}
          hasValue={!!rawInput}
          isVoiceUsed={isVoiceUsed}
        />

        {/* Separate Bin Sub-Name Suggestions Section */}
        <BinSuggestions
          onSelectBin={handleSelectBin}
          currentCode={parsed.formattedCode}
        />
      </main>
    </div>
  );
}
