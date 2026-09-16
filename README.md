# Bin QR Generator — Warehouse TOAT Operations (PWA)

Fast, lightweight, mobile-first **Bin QR Generator** engineered for dark store & warehouse TOAT operations.

## Features
- **100% Client-Side & Offline Ready**: Progressive Web App (PWA) with Service Worker caching.
- **Minimum Typing Workflow**:
  - Automatically handles fixed `CPLM-` prefix.
  - Auto-uppercase conversion.
  - Auto-hyphenation for 4-segment codes (e.g., `a1b15` → `CPLM-A-1-B-15`).
  - Auto-hyphenation for 2-segment codes (e.g., `a18` → `CPLM-A-18`).
- **Laser-Friendly QR**: Rendered in a high-contrast pure white container (`#ffffff`) with dark modules (`#000000`) for instant barcode scanner reads.
- **Tactile Haptic Feedback**: Subtle vibration on mobile devices when a QR code is ready to scan.
- **Single-Action Workflow**: Large `Clear` button resets and auto-focuses the input for continuous bin processing.
- **Theme Persistence**: Light and Dark mode with `localStorage` persistence.

---

## Deploy to Vercel

### Option 1: Via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (auto-detected).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Done!

### Option 2: Via Vercel CLI
Run inside this project directory:
```bash
npx vercel
```
Follow the terminal prompts (defaults are pre-configured in `vercel.json`).

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
