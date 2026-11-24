# Dapoco Furnitures Trading LLC — Website

A luxury, animated 3D website for Dapoco Furnitures Trading L.L.C (Dubai).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

## What's inside

| Area | Tech |
| --- | --- |
| UI | React 18 + React Router |
| 3D | Three.js via @react-three/fiber + drei — one shared WebGL canvas; every 3D scene is a `<View>` |
| Motion | GSAP + ScrollTrigger, Lenis smooth scroll (one shared render loop) |
| 3D furniture | 36 photoreal models from Poly Haven (CC0), compressed to meshopt + WebP GLB (130–870 KB each) in `public/models/`, lit by a real studio HDRI (`public/hdri/`). Loader/normaliser: `src/three/Model.jsx`; scenes: `src/three/Scenes.jsx`, `src/three/Stage.jsx`. |
| Photography | 22 interior photos from Unsplash (free Unsplash License), optimised WebP in `public/images/` (`-sm` = 900px). Source links: `src/data/credits.js`. |
| Design | Palette: bone `#EFEAE2`, ink `#171513`, forest `#1F2B25`, clay `#B0582F`. Type: Instrument Serif + Inter Tight. Logo: "D + chair" monogram (`src/components/Logo.jsx`, source in `tools/brand/`). |

### Pages
- `/` Home — photoreal lounge chair in front of giant type, statement with inline photos, stacked full-bleed collection cards, scroll-orbiting 3D showroom (sofa, armchair, ottoman, coffee table, lamp, plant), compact 3D configurator (same engine as `/studio`), range list with cursor-follow photos, process, services accordion, sustainability, journal
- `/about` story, vision, mission, values, team, company credentials
- `/collections` 4 luxury collections + all 10 categories (each with a 3D model) + product search across every line
- `/collections/:slug` 10 category pages (hero 3D, highlights, full product list, Request a Quote)
- `/studio` 3D configurator — 28 pieces, re-dye each part live, shareable URL
- `/services`, `/journal`, `/journal/:slug`, `/contact`

### Content
All copy comes from the company profile and website content package (`src/data/*.js`).
Journal article bodies are draft editorial copy — review before launch.

### Contact form
There is no backend yet: the form opens the visitor's email app with the enquiry pre-filled
to `info@dapocollc.com`. To receive submissions directly, replace `submit()` in
`src/pages/Contact.jsx` with a `fetch()` to a form service (Formspree, Netlify Forms, etc.).

### Deploying
`npm run build` produces a static site in `dist/`. Because it uses client-side routing,
the host must serve `index.html` for unknown paths. Both rules ship in `public/` and are copied into `dist/`:
- Apache / LiteSpeed (Hostinger, cPanel, most shared hosting): `.htaccess` (also sets caching).
  Upload the **contents** of `dist/` — including the hidden `.htaccess` — to the web root (`public_html`).
- Netlify / Cloudflare Pages: `_redirects`. Vercel does this automatically for Vite.

Check after deploying: open `/studio` directly and refresh — it must load, not 404.

### Credits
- 3D models & HDRI: [Poly Haven](https://polyhaven.com) — CC0.
- Photography: [Unsplash](https://unsplash.com) — Unsplash License (individual photo links in `src/data/credits.js`).

## Studio configurator (`/studio`)

- 28 configurable pieces (`src/data/pieces.js`), each a Poly Haven CC0 model in `public/models/`, with thumbnails in `public/thumbs/`.
- Every model was split offline into colour **zones** (upholstery, frame, top, base…). Materials named `<material>__z0`, `__z1`, … are those zones.
- `src/three/dye.js` patches each glTF material so a zone can be re-dyed while keeping its texture detail, and adds two effects:
  - a finish **sweep** with a glowing seam;
  - a **materialise** scan line, used for piece swaps and the hero chair.
- The URL holds the configuration (`?piece=…&f=zone:finish,…`), so a design can be shared as a link.
- Six palettes (leather, fabric, wood, lacquer, metal, stone) with 43 finishes.

## Asset pipeline

Offline scripts for adding models, thumbnails and photos live in `tools/model-pipeline/` (see its README).

## Motion system

- **Page transitions:** staggered columns, with the destination name rolling in 3D.
- **Headlines:** words flip up out of their masks.
- **Section labels:** text scrambles into place.
- **Photos:**
  - open like venetian blinds;
  - lean with scroll velocity (a `--skew` CSS variable set from Lenis).
- **Marquees:** follow scroll direction and speed up with scroll velocity.
