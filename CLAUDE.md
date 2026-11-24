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
| `src/three/View3D.jsx` | `View3D` (drei `<View>` + on-screen detection — **use it instead of `View`**) and `Shadow` (ContactShadows that pause off screen, 256px buffer on phones; `frames={1}` for static rooms) |
| `src/three/store.js` | `appState` (ready, pointer, velocity, reducedMotion, isTouch) + `setReady/onReady` (fired by the preloader) |
| `src/three/dye.js` | Patches glTF materials (`onBeforeCompile`): live re-dye keeping texture detail, finish **sweep**, **scan-line** materialise/dissolve. Shared program key `dapoco-dye-1` |
| `src/three/Configurator.jsx` | `DyePiece` (one dyeable model) + `ConfiguratorScene` (piece swap via scan, camera auto-framing, drag inertia, ScanRing) |
| `src/three/Scenes.jsx` / `Stage.jsx` | Hero + other scenes; `useDragRotate`, `StudioLight`, `FitCamera` |
| `src/three/Model.jsx` | `useModel(id)` — **load every GLB through it, never `useGLTF` directly**: picks `/models/sm/` (512px textures) on phones, frees decoded images after GPU upload (phones only — a closed image can never be re-uploaded), ref-counts models and unloads unused ones after 20 s (8 s on phones). Also `Model` (normalised clone), `prefetchModel`/`preloadModels` (HTTP-cache download only, no parse) and `prepareOnGpu` (background shader compile + one texture upload per frame before a piece is shown; **always resolves, 1.5 s budget**) |
| `src/components/Configurator.jsx` | Configurator UI. `variant="full"` (Studio page, URL sync `?piece=&f=zone:finish,…`) / `"compact"` (home) |
| `src/components/Logo.jsx` | Brand logo as inline SVG (`Logo`, `LogoMark`, `LogoName`) |
| `src/components/Cursor.jsx` | Custom cursor (desktop only): liquid-glass lens (`backdrop-filter: url(#lg-lens)`, Chromium; frosted fallback) inside tick-mark "sight" + dot (blend: difference) on plain areas; forest glass "‹ Drag ›" disc on `data-cursor="drag"` 3D stages. **Over anything clickable (links, buttons, cards, inputs) the glass hides and the native hand pointer / caret shows — client decision, don't bring back custom hover/View states.** Don't nest the glass in a blended/opacity<1 parent |
| `src/components/glass.js` | `useLiquidGlass(ref, opts)` — real refraction for `.glass` capsules on Chromium (SDF displacement map per element, redrawn on resize); `.glass` / `.glass--dark` CSS gives tint, rims and the frosted fallback. Used by the nav (logo capsule appears on scroll, links pill, quote button, menu button) |
| `src/components/ui.jsx` | `useReveals` (`data-reveal` = up/fade/split/clip/img/line/stagger/scramble), `SplitText`, `Label`, `Button`, `Photo`, `Marquee` |
| `src/components/Preloader.jsx` | SVG craftsman-planing-wood + chair-assembly loader (~1.3–2.4 s), calls `setReady()` |
| `src/data/site.js` | Company info, nav, copy. `pieces.js` = 28 configurable pieces + 6 finish palettes; `products.js` = 10 categories; `journal.js`; `credits.js` (image helpers) |
| `src/data/zoneHex.json` | zone material name → original average colour ("Signature" swatch) |
| `src/styles/global.css` | All styles, one file. Tokens in `:root`. Sections marked `/* ==== NAME ==== */`; responsive block near the end (breakpoints 1280/899/600) |
| `public/models` `thumbs` `images` `hdri` | 36 GLBs (meshopt+WebP; `models/sm/` = 512px-texture phone copies), 320px WebP thumbs, Unsplash WebP photos (`-sm` = 900px), studio HDRI |
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
  Location is always `company.location` = **"Dubai, UAE"**. Contact is email only (`info@dapocollc.com`).
- Contact form has no backend: `submit()` in `src/pages/Contact.jsx` builds a `mailto:`.
- Journal article bodies are draft copy.

## Gotchas (each one has bitten before)
- **Render loop:** r3f runs `frameloop="never"`; `advance(time)` takes **seconds** (gsap ticker time). Don't add
  another rAF loop or `useFrame` that assumes r3f's own clock.
- **ScrollTrigger `once: true` crashes** (`Cannot read properties of undefined (reading 'end')` → blank page)
  when triggers self-kill during refresh (e.g. reload while scrolled). Use `toggleActions: 'play none none none'`.
- **Pointer capture:** `useDragRotate` calls `setPointerCapture` on the stage; it must skip buttons/links inside
  the stage or their clicks are retargeted and lost (this broke the prev/next arrows).
- **Piece swap:** an incoming `DyePiece` (role `in`) stays hidden until `prepareOnGpu` finishes, then calls `onInfo` to start the scan — otherwise shader compile + texture upload land in the frame it appears (the swap hitch). `prepareOnGpu` is only an optimisation and must never be able to block: it used to await three's `compileAsync`, which polls the driver with no time limit — on Windows machines where that never completes the hero chair never appeared and every swap hung on the old piece (so colours looked dead too). Keep the budget + catch; don't reintroduce an unbounded wait. The configurator prefetches the neighbouring pieces and any hovered thumbnail. The outgoing `DyePiece` must stay hidden once `cut.on` turns false (React unmounts it a frame
  later) — see `data.group.visible` in `three/Configurator.jsx`. Hero scan waits for **both** preloader-ready
  and model-loaded.
- **Liquid glass needs a clean backdrop:** a parent with `backdrop-filter`, `filter`, `opacity<1`, `mask` or `mix-blend-mode` becomes the backdrop root and the glass stops seeing the page. That's why `.nav` has no frosted bar — don't add one back.
- gsap absorbs CSS `transform` into its own `x/y`; don't put initial transforms in CSS for elements gsap animates.
- Grid children holding wide content need `minmax(0,1fr)` / `min-width: 0` (caused 3000px mobile overflow).
- **WebGL context:** no `powerPreference: 'high-performance'` (it makes dual-GPU laptops switch graphics cards → context loss → models never rendered there). On `webglcontextrestored` we reload **once** per tab (`glLostBefore`/`markGlLost` in `store.js`), after that three.js restores in place and `Model.jsx` stops closing texture images — never make that reload unconditional again (reload loop).
- Models: strip `COLOR_0` (turns dyed meshes black); zone materials are named `<name>__zN`. Zone names in `pieces.js` must match the GLB material names **exactly, including case** (`ArmChair_01.glb` holds `Armchair_01__z0`) or that zone silently never re-colours.
- Variable name clash: `Home.jsx` imports studio pieces as `STUDIO_PIECES`.
- Vite HMR can leave stale ScrollTrigger/Preloader errors in the console — reload before trusting them.

## Performance (phones especially — client asked for no lag/jitter on any device)
- Measure in dev: `window.__r3f.gl.info` (draw calls) and per-frame ticker cost. Phone budget is tight; check
  any new effect at mobile width.
- Never use `ContactShadows` directly — use `Shadow` from `View3D.jsx` (off-screen shadows used to re-render
  every frame, three passes at 1024px on the home page). Static scenes: `frames={1}` inside the models' Suspense.
- Canvas pixel ratio is adaptive (`PerformanceMonitor` in `WebGL.jsx`; phones max 1.5).
- Touch scrolling runs through Lenis `syncTouch` so the fixed WebGL layer moves in the same frame as the page
  (native touch scroll made models wobble against their boxes). While it does, `html.touch-sync` sets `touch-action: pinch-zoom` so the browser cannot pan/fling as well — with only Lenis's `preventDefault`, a touchmove sometimes slipped through and native + Lenis scrolling fought (page flipping ±50–80px every frame on Android; measured from a client screen recording). Don't remove the class or the CSS rule; any new `overflow: auto/scroll` element needs `data-lenis-prevent`. Nested scrollers need `data-lenis-prevent` (textareas are exempt automatically; pinch-zoom is passed back to the browser via `virtualScroll` in `App.jsx` — keep it, accessibility).
- Phones skip: photo skew (`--skew`), paper grain (`body::after`), SVG glass refraction (frosted CSS only).
- Don't animate `filter` on large elements (use an overlay's opacity, see `.stack__dim`); don't read layout
  (`scrollWidth`, `getBoundingClientRect`) inside ticker callbacks — cache it with ResizeObserver.
- Memory: textures are the bulk (a 1024px texture ≈ 5.6 MB on the GPU; all 36 models ≈ 670 MB if everything
  were loaded). `useModel` keeps only what's shown. Every model needs a phone copy in `public/models/sm/`
  (`tools/model-pipeline/mobile.sh <id>`) or phones get a 404.
- `.webgl` is `100lvh` tall so the address bar sliding doesn't resize the WebGL buffer; `ScrollTrigger.config({ ignoreMobileResize: true })`.

## Assets & licensing
3D models + HDRI: Poly Haven (CC0). Photos: Unsplash (links in `src/data/credits.js`). Keep both credited in README.
