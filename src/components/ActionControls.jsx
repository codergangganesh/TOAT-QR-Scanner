import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Mic, MicOff, RotateCcw, AlertCircle } from 'lucide-react';
import { normalizeSpokenBin, parseBinCode } from '../utils/binFormatter';

export default function ActionControls({
  onClear,
  onVoiceInput,
  hasValue,
  isVoiceUsed,
}) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const isStoppingRef = useRef(false);
  const errorTimeoutRef = useRef(null);

  const showError = (msg) => {
    setVoiceError(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setVoiceError('');
    }, 5000);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const toggleVoiceListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError('Voice recognition is not supported in this browser. Please open in Safari (iOS) or Chrome.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        isStoppingRef.current = true;
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
      setIsListening(false);
      return;
    }

    // Auto-replace: If there is any existing input, wipe it clean immediately so the worker speaks fresh
    if (onClear) {
      onClear();
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      isStoppingRef.current = false;
      recognition.lang = 'en-US';
      const isIOS =
        typeof navigator !== 'undefined' &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

      recognition.continuous = !isIOS; // iOS WebKit does not support continuous speech reliably
      recognition.interimResults = true; // Zero-delay response
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        if (isStoppingRef.current) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const rawTranscript = event.results[i]?.[0]?.transcript;
          if (!rawTranscript) continue;

          const normalized = normalizeSpokenBin(rawTranscript);
          if (!normalized) continue;

          // Check if valid bin code reached (e.g. A18, A1B15, A1C1, etc.)
          const check = parseBinCode(normalized);

          if (check.isValid) {
            // Valid code detected - immediately populate and stop listening
            if (onVoiceInput) {
              onVoiceInput(normalized);
            }
            isStoppingRef.current = true;
            try {
              recognition.stop();
            } catch {
              // Ignore
            }
            setIsListening(false);
            return;
          } else {
            // Partial speech heard - update input in real time and continue listening hands-free
            if (onVoiceInput) {
              onVoiceInput(normalized);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            showError('Microphone access was denied. Please allow microphone permissions.');
          } else {
            showError(`Voice error: ${event.error}`);
          }
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      showError('Could not start microphone. Please check browser permissions.');
      setIsListening(false);
    }
  };

  const showRespeak = isVoiceUsed && hasValue && !isListening;

  return (
    <section className="actions-section">
      <div className="action-row-split">
        {/* Column 1: Clear Button */}
        <button
          type="button"
          id="clear-btn"
          className="action-btn action-btn-clear"
          onClick={onClear}
          aria-label="Clear bin code and start next"
        >
          <RefreshCw size={20} strokeWidth={2.5} />
          <span>Clear</span>
        </button>

        {/* Column 2: Voice / Re-speak Mic Button */}
        <button
          type="button"
          id="mic-btn"
          className={`action-btn action-btn-mic ${isListening ? 'listening' : ''} ${
            showRespeak ? 'respeak' : ''
          }`}
          onClick={toggleVoiceListening}
          aria-label={
            isListening
              ? 'Listening for bin code'
              : showRespeak
              ? 'Re-speak to correct bin code'
              : 'Speak bin code'
          }
        >
          {isListening ? (
            <>
              <MicOff size={20} strokeWidth={2.5} />
              <span>Listening...</span>
            </>
          ) : showRespeak ? (
            <>
              <RotateCcw size={19} strokeWidth={2.5} />
              <span>Re-speak</span>
            </>
          ) : (
            <>
              <Mic size={20} strokeWidth={2.5} />
              <span>Voice</span>
            </>
          )}
        </button>
      </div>

      {/* Non-blocking inline voice error notification */}
      {voiceError && (
        <div className="voice-error-banner" role="alert">
          <AlertCircle size={15} className="voice-error-icon" />
          <span>{voiceError}</span>
          <button
            type="button"
            className="voice-error-dismiss"
            onClick={() => setVoiceError('')}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
