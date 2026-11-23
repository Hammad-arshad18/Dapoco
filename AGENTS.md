# AGENTS.md

Instructions for any coding agent (Codex, Cursor, Copilot, Claude, …) working on this repo.
**The full guide is [`CLAUDE.md`](CLAUDE.md)** — read it first; this file is the short version.

- **What:** static marketing site for DAPOCO Furnitures Trading L.L.C (luxury furniture, Dubai).
  Vite + React 18 + React Router, Three.js (@react-three/fiber + drei), GSAP + ScrollTrigger, Lenis.
- **Run:** `npm install`, `npm run dev` (port 5173), `npm run build` must pass. No tests or linter.
- **Check every UI change** in a browser at desktop (1440×900) and phone width; no console errors, no horizontal scroll.
- **Client rules:** never show the trade license, a phone number or a street address — location is "Dubai, UAE",
  contact is email only. Logo = `src/components/Logo.jsx` (traced from `tools/brand/`; don't redraw it). Keep type sizes modest.
- **Architecture in one line:** one transparent full-screen WebGL canvas, scenes are drei `<View>`s, and a single
  gsap.ticker loop drives Lenis → ScrollTrigger → r3f `advance(seconds)`.
- **Known traps:** no ScrollTrigger `once: true` (crashes on refresh); don't pointer-capture clicks on buttons inside
  3D stages; respect `appState.reducedMotion` in every animation.
- **Adding 3D pieces:** follow `tools/model-pipeline/README.md`, then register in `src/data/pieces.js` and `src/data/zoneHex.json`.
