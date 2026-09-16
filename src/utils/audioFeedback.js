/**
 * Audio feedback utility for warehouse scanner confirmation sound.
 * Emulates the authentic industrial barcode scanner high-pitch beep (2600Hz, 75ms).
 */

let audioCtx = null;

function getOrInitAudioContext() {
  const AudioContextClass =
    typeof window !== 'undefined'
      ? window.AudioContext || window.webkitAudioContext
      : null;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Pre-warm / unlock AudioContext on first user interaction for mobile browser compatibility
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];
  const handleFirstInteraction = () => {
    getOrInitAudioContext();
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleFirstInteraction, { capture: true });
    });
  };

  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
  });
}

export function playScannerBeep() {
  try {
    const ctx = getOrInitAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Standard industrial 2600Hz scanner frequency
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, ctx.currentTime);

    // Clean, crisp acoustic envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    // Gracefully ignore audio autoplay policies
  }
}
