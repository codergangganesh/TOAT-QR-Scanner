import React from 'react';
import { Sun, Moon } from 'lucide-react';
import logoImg from '../assets/zepto-logo.png';

export default function Header({ theme, toggleTheme }) {
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
      <button
        type="button"
        id="theme-toggle-btn"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
}
