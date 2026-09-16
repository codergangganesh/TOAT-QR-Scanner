<div align="center">

# ⚡ TOAT QR Scanner & Bin Generator
**Ultra-Fast, Mobile-First Progressive Web App for Warehouse & Dark Store TOAT Operations**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25_Offline-059669?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

> **Core Operating Principle:**  
> **Minimum Typing → Instant Formatting → Instant QR Generation → Scan → Next Bin**

</div>

---

## 📌 Table of Contents
- [Warehouse Problem & Solution](#-warehouse-problem--solution)
- [Key Features](#-key-features)
- [Supported Bin Code Formats](#-supported-bin-code-formats)
- [Continuous TOAT Workflow](#-continuous-toat-workflow)
- [Technology Stack](#-technology-stack)
- [Progressive Web App (PWA) & Offline Mode](#-progressive-web-app-pwa--offline-mode)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Browser & Hardware Scanner Compatibility](#-browser--hardware-scanner-compatibility)
- [License](#-license)

---

## 🏬 Warehouse Problem & Solution

In rapid-fulfillment dark stores and sorting hubs (e.g., Zepto TOAT operations), pickers, sorters, and packers repeatedly scan hundreds of tote bins, rack bays, and shelf locations every shift. 

### The Problem
- **Tedious Typing**: Standard bin codes (like `CPLM-A-1-B-15` or `CPLM-A-18`) require typing 13+ characters, including fixed prefixes and repeated hyphens.
- **Accidental Typos**: Switching between letters, digits, and symbols on small touchscreens slows down picking rates and introduces errors.
- **Network Dead Zones**: Basements, cold storage units, and metal rack aisles frequently lose internet connection, breaking cloud-dependent tools.
- **Scanner Contrast Failures**: Dark mode screens or low-contrast artistic QR codes cause optical barcode readers (Zebra, Honeywell) to fail or lag under warehouse lighting.
- **Interruptive UIs**: Annoying toasts ("QR successfully created!"), confirm dialogs, and extra buttons cost seconds on every single bin.

### The Solution
**TOAT QR Scanner** is a purpose-built, single-screen utility designed specifically for warehouse staff:
1. **Fixed `CPLM-` Prefix**: Locked into the interface. Workers only type the suffix (e.g., `a18` or `a1b15`).
2. **Auto-Uppercase**: Workers never need to toggle the Caps Lock key.
3. **Smart Auto-Hyphenation**: Converts raw strings (`a1b15` → `CPLM-A-1-B-15`, `a18` → `CPLM-A-18`) instantly on keystroke.
4. **Instant Optical QR**: Generates immediately in an enlarged, pure white container (`#ffffff`) with deep black modules (`#000000`) for 100% scanner read rates.
5. **Zero Toasts / Zero Lag**: Eliminates popups and loading spinners completely.
6. **100% Offline PWA**: Installs to mobile home screens and works seamlessly with zero internet connection.

---

## ✨ Key Features

### 1. 📱 Mobile-First Single-Screen Design
- Engineered specifically for handheld smartphone viewports (360×800, 375×812, 390×844, 412×915, 430×932) and centered on desktop (`max-width: 440px`).
- The entire workflow fits on a single mobile screen without requiring scrolling.
- Minimum 48px–54px touch targets ensure error-free tapping with gloved hands.
- Input font size (`1.25rem` / 20px) prevents iOS Safari and Chrome Android from auto-zooming.

### 2. ⚡ Instant Client-Side Parsing Engine
- Powered by [`binFormatter.js`](src/utils/binFormatter.js).
- Analyzes and formats codes **in real time** as the worker types.
- Sanitizes redundant prefixes: if a worker pastes `cplm-a-1-b-15` or `cplm a18`, it strips extra characters and properly outputs the standard code.
- **Exact QR Payload**: The generated QR encodes strictly the formatted code string (`CPLM-A-1-B-15` or `CPLM-A-18`) with **zero URLs, JSON, or extraneous tracking metadata**.

### 3. 🔍 High-Visibility Enlarged QR Canvas
- Sized to **260px** inside a **275px × 275px** padded frame.
- Uses **Error Correction Level M** and standard quiet zone margins.
- **Guaranteed Optical Contrast**: Regardless of whether the user is in Light Mode or Dark Mode, the QR canvas container remains **pure white (`#ffffff`)**, eliminating optical reflections and inverted-color read failures on commercial barcode scanners.
- **Standby Safety Frame**: Shows an outline placeholder while code is incomplete, preventing handheld laser guns from accidentally scanning half-typed barcodes.

### 4. 📳 Tactile Haptic Feedback
- Incorporates native web vibration (`navigator.vibrate(45)`).
- Triggers a subtle 45ms tactile pulse the instant a code becomes valid, informing workers the QR is ready without forcing them to look at the screen.

### 5. 🔄 Continuous TOAT Mode & Instant Reset
- A full-width, high-contrast **`Clear`** button resets the input, clears the QR code, and immediately refocuses the keyboard cursor.
- Supports physical hardware barcode scanners and keyboards: pressing **`Enter`** automatically resets and prepares for the next bin.

### 6. 🌙 Persistent Dark & Light Mode
- Compact theme toggle in the header.
- Automatically senses device system theme (`prefers-color-scheme`) on initial visit.
- Stores user preference in browser `localStorage`.

---

## 🏷 Supported Bin Code Formats

The application automatically identifies the bin structure and formats it accordingly:

| Format Category | Raw Input Typed | Auto-Uppercase | Formatted Output | Scannable QR Payload | Status |
|---|---|---|---|---|---|
| **2-Segment Location** | `a18` | `A18` | `CPLM-A-18` | `CPLM-A-18` | `Ready to Scan ✓` |
| **2-Segment Location** | `A18` | `A18` | `CPLM-A-18` | `CPLM-A-18` | `Ready to Scan ✓` |
| **2-Segment Location** | `b05` | `B05` | `CPLM-B-05` | `CPLM-B-05` | `Ready to Scan ✓` |
| **2-Segment (Pasted)** | `cplm-a-18` | `A18` | `CPLM-A-18` | `CPLM-A-18` | `Ready to Scan ✓` |
| **2-Segment (Manual)** | `a-18` | `A18` | `CPLM-A-18` | `CPLM-A-18` | `Ready to Scan ✓` |
| **4-Segment TOAT** | `a1b15` | `A1B15` | `CPLM-A-1-B-15` | `CPLM-A-1-B-15` | `Ready to Scan ✓` |
| **4-Segment TOAT** | `A1B15` | `A1B15` | `CPLM-A-1-B-15` | `CPLM-A-1-B-15` | `Ready to Scan ✓` |
| **4-Segment TOAT** | `a2c20` | `A2C20` | `CPLM-A-2-C-20` | `CPLM-A-2-C-20` | `Ready to Scan ✓` |
| **4-Segment (Pasted)** | `cplm-a1b15` | `A1B15` | `CPLM-A-1-B-15` | `CPLM-A-1-B-15` | `Ready to Scan ✓` |

---

## 🔁 Continuous TOAT Workflow

```text
┌──────────────────────────────────────────────────────────────────┐
│ 1. Worker focuses input (automatically focused on load)         │
│                                ↓                                 │
│ 2. Worker enters suffix: e.g. "a18" or "a1b15"                   │
│                                ↓                                 │
│ 3. Instant auto-capitalization & auto-hyphenation                │
│                                ↓                                 │
│ 4. QR code renders immediately (Haptic buzz 📳)                  │
│                                ↓                                 │
│ 5. Physical scanner or mobile camera reads the QR                │
│                                ↓                                 │
│ 6. Worker taps "Clear" (or presses Enter on scanner gun)        │
│                                ↓                                 │
│ 7. Input resets & refocuses immediately → Ready for Next Bin     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | [React 19](https://react.dev/) | Component architecture, state hooks (`useState`, `useEffect`, `useRef`) |
| **Build Engine** | [Vite 8](https://vitejs.dev/) | Instant HMR, rapid production bundling (`< 300ms`) |
| **QR Generator** | [`qrcode.react`](https://www.npmjs.com/package/qrcode.react) | Canvas-based high-speed client-side QR generation |
| **Styling** | Vanilla CSS (CSS3) | Design tokens, dynamic theme switching, 0kb CSS runtime overhead |
| **PWA Service Worker** | Vanilla Web Worker | Pre-caching static shell, asset caching, 100% offline functionality |
| **Icons** | [`lucide-react`](https://lucide.dev/) | Lightweight, scalable vector icons (`Sun`, `Moon`, `RefreshCw`, `X`, `CheckCircle2`) |
| **Typography** | Google Fonts | `Inter` (UI elements) & `JetBrains Mono` (high-clarity bin digits) |
| **Hosting & Edge** | [Vercel](https://vercel.com/) | Global CDN deployment with automated SPA routing & immutable caching |

---

## 📶 Progressive Web App (PWA) & Offline Mode

The application is fully configured as a Progressive Web App (PWA):

1. **Manifest File ([`public/manifest.json`](public/manifest.json))**:
   - Declares `display: "standalone"` so it launches full-screen without URL bars.
   - Configures theme colors and app icons.
   - Sets `orientation: "portrait"` for consistent mobile orientation.
2. **Service Worker ([`public/sw.js`](public/sw.js))**:
   - Pre-caches `index.html`, JavaScript, CSS, and app logos upon installation.
   - Utilizes a **Cache-First** strategy for assets and **Network-First with offline fallback** for navigation.
   - Cleans up legacy cache versions automatically upon updates.
3. **How to Install on Mobile Devices**:
   - **Android (Chrome)**: Open the URL → Tap the three dots menu `⋮` → Tap **"Install app"** or **"Add to Home screen"**.
   - **iOS (Safari)**: Open the URL → Tap the Share button `⎋` → Tap **"Add to Home Screen"**.

---

## 📂 Project Directory Structure

```text
TOAT-QR-Scanner/
├── public/
│   ├── manifest.json         # PWA Manifest (standalone display, icons, theme)
│   ├── sw.js                 # Service Worker (offline caching & background sync)
│   ├── zepto-logo.png        # Official app icon & favicon
│   └── favicon.svg           # Scalable vector favicon
├── src/
│   ├── assets/
│   │   └── zepto-logo.png    # Bundled asset logo
│   ├── components/
│   │   ├── ActionControls.jsx# Primary 'Clear' button & reset handler
│   │   ├── BinInput.jsx      # Fixed 'CPLM-' prefix input with autofocus & clear
│   │   ├── Header.jsx        # Branding logo, title, and theme toggle
│   │   └── QrCard.jsx        # 260px QR canvas, optical white card, status pill
│   ├── utils/
│   │   └── binFormatter.js   # Parsing, sanitization, auto-hyphenation engine
│   ├── App.jsx               # Root state, haptic feedback, hotkeys (Enter/Esc)
│   ├── index.css             # Design tokens, dark/light themes, mobile ergonomics
│   └── main.jsx              # React root mount & Service Worker registration
├── index.html                # PWA meta tags, safe-area viewport, fonts
├── vercel.json               # Vercel SPA routing, cache-control, security headers
├── vite.config.js            # Vite bundler configuration
└── package.json              # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn` or `pnpm`

### Installation & Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/codergangganesh/TOAT-QR-Scanner.git
   cd TOAT-QR-Scanner
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## ☁ Deploying to Vercel

This repository includes a pre-configured [`vercel.json`](vercel.json) file with SPA rewrite rules and caching policies.

### Method 1: Git Integration (Recommended)
1. Push your changes to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **"Add New Project"** and select **`TOAT-QR-Scanner`**.
4. Framework preset **Vite** is automatically detected.
5. Click **"Deploy"**. Your live URL with free automated HTTPS is ready in seconds!

### Method 2: Vercel CLI
```bash
npx vercel
```
Follow the terminal prompts and accept the default settings.

---

## 📱 Browser & Hardware Scanner Compatibility

- **Handheld Scanners**: Zebra TC21 / TC26 / TC52, Honeywell ScanPal / Dolphin, Datalogic Memor.
- **Mobile Browsers**: Google Chrome (Android), Apple Safari (iOS), Samsung Internet, Microsoft Edge, Opera Touch.
- **Desktop Browsers**: Google Chrome, Mozilla Firefox, Safari, Microsoft Edge.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for your logistics and warehouse operations.
