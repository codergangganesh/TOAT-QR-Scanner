import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, CheckCircle2, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { FIXED_PREFIX } from '../utils/binFormatter';

export default function QrCard({
  formattedCode,
  isValid,
  statusMessage,
  onStepBin,
  canStepPrev,
  canStepNext,
  prevLabel,
  nextLabel,
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    direction: null, // 'horizontal' | 'vertical' | null
  });
  const isMouseDownRef = useRef(false);

  // Touch handlers for mobile swipe with strict vertical scroll protection
  const handleTouchStart = (e) => {
    if (!isValid || !onStepBin) return;
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      direction: null,
    };
    setIsSwiping(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping || !isValid) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStateRef.current.startX;
    const diffY = touch.clientY - touchStateRef.current.startY;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // 1. Lock gesture direction once movement exceeds 8px
    if (!touchStateRef.current.direction) {
      if (absX > 8 || absY > 8) {
        if (absX > absY * 1.6) {
          // Intentional horizontal swipe confirmed
          touchStateRef.current.direction = 'horizontal';
        } else {
          // Vertical page scroll detected: cancel swipe immediately
          touchStateRef.current.direction = 'vertical';
          setIsSwiping(false);
          setDragOffset(0);
          return;
        }
      }
    }

    // 2. Ignore if locked as vertical scroll
    if (touchStateRef.current.direction === 'vertical') {
      return;
    }

    // 3. Elastic horizontal drag if confirmed horizontal gesture
    if (touchStateRef.current.direction === 'horizontal') {
      setDragOffset(diffX * 0.35);
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping || !isValid) {
      setDragOffset(0);
      return;
    }
    setIsSwiping(false);

    // Only step if direction was locked as horizontal swipe
    if (touchStateRef.current.direction !== 'horizontal') {
      setDragOffset(0);
      return;
    }

    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (!touch) {
      setDragOffset(0);
      return;
    }

    const diffX = touch.clientX - touchStateRef.current.startX;
    const diffY = touch.clientY - touchStateRef.current.startY;
    const elapsed = Date.now() - touchStateRef.current.startTime;

    // Minimum distance of 45px, clean horizontal ratio, within 500ms
    const minSwipeDistance = 45;
    const isCleanHorizontal = Math.abs(diffX) > Math.abs(diffY) * 1.6;

    if (isCleanHorizontal && elapsed < 500 && Math.abs(diffX) >= minSwipeDistance) {
      if (diffX < 0) {
        // Swiped Right -> Left: Advance to Next Bin (+1)
        if (canStepNext && onStepBin) {
          onStepBin(1);
        }
      } else {
        // Swiped Left -> Right: Return to Previous Bin (-1)
        if (canStepPrev && onStepBin) {
          onStepBin(-1);
        }
      }
    }

    setDragOffset(0);
    touchStateRef.current.direction = null;
  };

  // Mouse drag support for desktop testing
  const handleMouseDown = (e) => {
    if (!isValid || !onStepBin) return;
    isMouseDownRef.current = true;
    touchStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      direction: 'horizontal',
    };
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !isValid) return;
    const diffX = e.clientX - touchStateRef.current.startX;
    setDragOffset(diffX * 0.3);
  };

  const handleMouseUp = (e) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const diffX = e.clientX - touchStateRef.current.startX;
    if (diffX < -45 && canStepNext && onStepBin) {
      onStepBin(1);
    } else if (diffX > 45 && canStepPrev && onStepBin) {
      onStepBin(-1);
    }
    setDragOffset(0);
  };

  return (
    <section className="qr-section">
      {/* Formatted Bin Code Display */}
      <div className="code-display-card">
        {formattedCode ? (
          <div className="code-display-value">{formattedCode}</div>
        ) : (
          <div className="code-display-placeholder">{FIXED_PREFIX}—</div>
        )}
      </div>

      {/* Enlarged QR Code Area with Swipe Gestures */}
      {isValid && formattedCode ? (
        <div className="qr-swipe-layout">
          {/* Stepper Button: Previous (-1) */}
          <button
            type="button"
            className="qr-stepper-btn"
            onClick={() => onStepBin(-1)}
            disabled={!canStepPrev}
            aria-label={`Previous bin: ${prevLabel || ''}`}
            title={`Previous bin (-1): ${prevLabel || ''}`}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Swipeable Canvas Wrapper */}
          <div
            className="qr-canvas-wrapper"
            id="qr-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              setIsSwiping(false);
              setDragOffset(0);
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              isMouseDownRef.current = false;
              setDragOffset(0);
            }}
            style={{
              transform: `translateX(${dragOffset}px)`,
              transition: isSwiping ? 'none' : 'transform 0.18s ease-out',
              cursor: 'grab',
              touchAction: 'pan-y', // enables natural vertical scrolling while capturing horizontal swipes
            }}
          >
            <QRCodeCanvas
              value={formattedCode}
              size={260}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#000000"
              style={{ width: '100%', height: '100%', maxWidth: '270px', maxHeight: '270px' }}
            />

            {/* Dynamic Swipe Direction Pill Feedback */}
            {dragOffset < -18 && (
              <div className="swipe-indicator next">
                <span>Next ({nextLabel})</span>
                <ArrowRight size={14} />
              </div>
            )}
            {dragOffset > 18 && (
              <div className="swipe-indicator prev">
                <ArrowLeft size={14} />
                <span>Prev ({prevLabel})</span>
              </div>
            )}
          </div>

          {/* Stepper Button: Next (+1) */}
          <button
            type="button"
            className="qr-stepper-btn"
            onClick={() => onStepBin(1)}
            disabled={!canStepNext}
            aria-label={`Next bin: ${nextLabel || ''}`}
            title={`Next bin (+1): ${nextLabel || ''}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      ) : (
        <div className="qr-placeholder-wrapper" id="qr-placeholder">
          <QrCode size={64} strokeWidth={1.4} />
          <p className="qr-placeholder-text">
            Enter bin code
            <br />
            to generate QR
          </p>
        </div>
      )}

      {/* Swipe Micro-Hint when valid */}
      {isValid && (canStepPrev || canStepNext) && (
        <div className="swipe-hint-row" aria-hidden="true">
          <span className="swipe-hint-text">
            {canStepPrev ? `← Swipe for ${prevLabel}` : 'First slot in bin'}
          </span>
          <span className="swipe-hint-divider">•</span>
          <span className="swipe-hint-text">
            {canStepNext ? `Swipe for ${nextLabel} →` : ''}
          </span>
        </div>
      )}

      {/* Status Pill */}
      <div
        className={`status-pill ${isValid ? 'ready' : 'standby'}`}
        id="status-indicator"
      >
        {isValid && <CheckCircle2 size={18} strokeWidth={2.5} />}
        <span>{isValid ? 'Ready to Scan ✓' : statusMessage}</span>
      </div>
    </section>
  );
}
