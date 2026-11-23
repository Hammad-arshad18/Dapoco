# CLAUDE.md — Dapoco website

Marketing site for **DAPOCO FURNITURES TRADING L.L.C** (luxury furniture, Dubai). Static SPA:
Vite 5 + React 18 + React Router 6, Three.js via @react-three/fiber 8 / drei 9, GSAP 3 + ScrollTrigger,
Lenis smooth scroll. No backend, no tests, no linter config. Human-facing overview: `README.md`.

## Commands
```bash
npm run dev      # http://localhost:5173 (launch config: .claude/launch.json)
npm run build    # must pass before you call work done (three ≈684 kB, r3f ≈420 kB chunks are expected)
```
Verify UI changes in the browser at 1440×900 **and** mobile width; check for horizontal overflow
(`document.documentElement.scrollWidth === innerWidth`) and console errors.

## Map
| Path | What |
| --- | --- |
| `src/App.jsx` | Routes, **the single render loop** (gsap.ticker → Lenis → ScrollTrigger → r3f `advance(time)`), `--skew` var, column-curtain page transition |
| `src/three/WebGL.jsx` | One fixed full-screen transparent `<Canvas frameloop="never">` above the page; every 3D scene is a drei `<View>` tracking a DOM rect |
| `src/three/store.js` | `appState` (ready, pointer, velocity, reducedMotion, isTouch) + `setReady/onReady` (fired by the preloader) |
| `src/three/dye.js` | Patches glTF materials (`onBeforeCompile`): live re-dye keeping texture detail, finish **sweep**, **scan-line** materialise/dissolve. Shared program key `dapoco-dye-1` |
| `src/three/Configurator.jsx` | `DyePiece` (one dyeable model) + `ConfiguratorScene` (piece swap via scan, camera auto-framing, drag inertia, ScanRing) |
| `src/three/Scenes.jsx` / `Stage.jsx` / `Model.jsx` | Hero + other scenes; `useDragRotate`, `StudioLight`, `FitCamera`; GLB loader/normaliser + `preloadModels` |
| `src/components/Configurator.jsx` | Configurator UI. `variant="full"` (Studio page, URL sync `?piece=&f=zone:finish,…`) / `"compact"` (home) |
| `src/components/Logo.jsx` | Brand logo as inline SVG (`Logo`, `LogoMark`, `LogoName`) |
| `src/components/ui.jsx` | `useReveals` (`data-reveal` = up/fade/split/clip/img/line/stagger/scramble), `SplitText`, `Label`, `Button`, `Photo`, `Marquee` |
| `src/components/Preloader.jsx` | SVG craftsman-planing-wood + chair-assembly loader (~1.3–2.4 s), calls `setReady()` |
| `src/data/site.js` | Company info, nav, copy. `pieces.js` = 28 configurable pieces + 6 finish palettes; `products.js` = 10 categories; `journal.js`; `credits.js` (image helpers) |
| `src/data/zoneHex.json` | zone material name → original average colour ("Signature" swatch) |
| `src/styles/global.css` | All styles, one file. Tokens in `:root`. Sections marked `/* ==== NAME ==== */`; responsive block near the end (breakpoints 1280/899/600) |
| `public/models` `thumbs` `images` `hdri` | 36 GLBs (meshopt+WebP), 320px WebP thumbs, Unsplash WebP photos (`-sm` = 900px), studio HDRI |
| `tools/brand/` | Logo source artwork + trace script |
| `tools/model-pipeline/` | Offline asset scripts (download, compress, zone-split, thumbnails). See its README to add a piece |

## Design system
- Colours: bone `#efeae2`, paper `#f7f4ef`, ink `#171513`, forest `#1f2b25`, clay `#b0582f` (accent), mute `#7a7166`.
- Type: Instrument Serif (display, italic `<em>` accents in clay) + Inter Tight (UI) + Noto Kufi Arabic.
  Display sizes are `clamp()`s on `.display--xxl…sm`, `.hero__title`, `.page-hero__title`; the client
  asked for smaller type twice — don't scale headings back up.
- Tone: quiet luxury, editorial. Motion is a core feature; every effect must respect `appState.reducedMotion`.
- **Logo:** the client-approved "D + chair" monogram, vector-traced from `tools/brand/logo-source.webp`
  (`tools/brand/trace.py`; the unused line-art alternative is kept there too). `src/components/Logo.jsx`
  exports `Logo` (mark + name + descriptor lockup), `LogoMark` and `LogoName`. Paths use `currentColor`, so set
  the colour with CSS `color`. Used in `Nav.jsx`, `Footer.jsx` (`.footer__brand`) and `Preloader.jsx` (meta line).
  Standalone files: `public/brand/dapoco-logo.svg` (full lockup), `dapoco-mark.svg`; favicon = bone mark on forest tile.
  Don't redraw or restyle the logo; re-trace from the source if it needs to change.

## Content rules (client decisions — do not revert)
- **Do not show** the trade license number / issuing authority, any phone number, or a street address.
  Location is always `company.location` = **"Dubai, UAE"**. Contact is email only (`dapocoftllc@gmail.com`).
- Contact form has no backend: `submit()` in `src/pages/Contact.jsx` builds a `mailto:`.
- Journal article bodies are draft copy.

## Gotchas (each one has bitten before)
- **Render loop:** r3f runs `frameloop="never"`; `advance(time)` takes **seconds** (gsap ticker time). Don't add
  another rAF loop or `useFrame` that assumes r3f's own clock.
- **ScrollTrigger `once: true` crashes** (`Cannot read properties of undefined (reading 'end')` → blank page)
  when triggers self-kill during refresh (e.g. reload while scrolled). Use `toggleActions: 'play none none none'`.
- **Pointer capture:** `useDragRotate` calls `setPointerCapture` on the stage; it must skip buttons/links inside
  the stage or their clicks are retargeted and lost (this broke the prev/next arrows).
- **Piece swap:** the outgoing `DyePiece` must stay hidden once `cut.on` turns false (React unmounts it a frame
  later) — see `data.group.visible` in `three/Configurator.jsx`. Hero scan waits for **both** preloader-ready
  and model-loaded.
- gsap absorbs CSS `transform` into its own `x/y`; don't put initial transforms in CSS for elements gsap animates.
- Grid children holding wide content need `minmax(0,1fr)` / `min-width: 0` (caused 3000px mobile overflow).
- Models: strip `COLOR_0` (turns dyed meshes black); zone materials are named `<name>__zN`.
- Variable name clash: `Home.jsx` imports studio pieces as `STUDIO_PIECES`.
- Vite HMR can leave stale ScrollTrigger/Preloader errors in the console — reload before trusting them.

## Assets & licensing
3D models + HDRI: Poly Haven (CC0). Photos: Unsplash (links in `src/data/credits.js`). Keep both credited in README.
