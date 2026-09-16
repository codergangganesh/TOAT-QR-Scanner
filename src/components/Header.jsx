import React from 'react';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';
import logoImg from '../assets/zepto-logo.png';

export default function Header({ theme, toggleTheme, soundEnabled, toggleSound }) {
  return (
    <header className="app-header">
      <div className="header-branding">
        <img
          src={logoImg}
          alt="Zepto Logo"
          className="app-logo-img"
        />
        <div className="header-titles">
          <h1 className="app-title">QR GENERATOR</h1>
        </div>
      </div>
      <div className="header-controls">
        {/* Warehouse Scanner Beep Toggle */}
        <button
          type="button"
          id="sound-toggle-btn"
          className={`header-icon-btn ${soundEnabled ? 'active' : ''}`}
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute warehouse scanner beep' : 'Enable warehouse scanner beep'}
          title={soundEnabled ? 'Scanner Beep: ON' : 'Scanner Beep: OFF'}
        >
          {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          id="theme-toggle-btn"
          className="header-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}
