import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { FIXED_PREFIX } from '../utils/binFormatter';

export default function QrCard({
  formattedCode,
  isValid,
  statusMessage,
}) {
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

      {/* Enlarged QR Code Area */}
      {isValid && formattedCode ? (
        <div className="qr-canvas-wrapper" id="qr-container">
          <QRCodeCanvas
            value={formattedCode}
            size={260}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#000000"
            style={{ width: '100%', height: '100%', maxWidth: '270px', maxHeight: '270px' }}
          />
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
