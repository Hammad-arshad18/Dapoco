import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { appState } from '../three/store';

/*
 * Brand cursor — a liquid-glass lens inside a draughtsman's "sight" (four tick marks + centre point).
 *  - default  : small glass lens that refracts/magnifies what's under it; ticks + point on top.
 *  - native   : over links, buttons, cards and inputs the glass hides and the real hand pointer / caret
 *               shows (client asked for a normal pointer on clickable things).
 *  - drag     : forest-tinted glass disc "‹ Drag ›" + turning dashed orbit (3D stages).
 *  (`hover`/`view` styles remain in CSS but are no longer triggered.)
 *
 * Refraction = CSS `backdrop-filter: url(#svg-filter)` with an feDisplacementMap whose map is drawn here
 * on a canvas (rim bends hard, centre magnifies gently). Only Chromium renders SVG backdrop filters, so
 * `html.glass-refract` is set there; other browsers get frosted glass (blur + saturate) from the CSS.
 * Ticks + dot are separate elements with mix-blend-mode: difference (a blend mode would make the glass a
 * backdrop root and kill the refraction, so they can't be nested).
 * State changes are applied with classList (no React re-render per pointer move).
 */
const LABELS = { view: 'View', drag: 'Drag' };
const LENS = 30; // px — keep in sync with .cursor-lens in global.css
const DISC = 92; // px — keep in sync with .cursor-disc

/** Displacement map for a round lens of `size` px: R/G encode x/y offset toward the centre. */
function lensMap(size, { rim = 0.8, center = 0.22, power = 4 } = {}) {
  const s = size * 2; // draw at 2x for smoothness
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(s, s);
  const h = s / 2;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const nx = (x + 0.5 - h) / h;
      const ny = (y + 0.5 - h) / h;
      const r = Math.hypot(nx, ny);
      let dx = 0;
      let dy = 0;
      if (r > 0 && r <= 1) {
        const f = Math.min(1, center * r + rim * r ** power);
        dx = (f * nx) / r;
        dy = (f * ny) / r;
      }
      const i = (y * s + x) * 4;
      img.data[i] = 128 - 127 * dx; // sample toward the centre → magnify
      img.data[i + 1] = 128 - 127 * dy;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const lens = useRef(null);
  const disc = useRef(null);
  const text = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    if (appState.isTouch) return undefined;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    // Refraction maps (Chromium only — the only engine that applies SVG filters in backdrop-filter).
    const chromium = !!navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand));
    if (chromium && svg.current) {
      svg.current.querySelector('#lg-lens-map').setAttribute('href', lensMap(LENS, { rim: 0.75, center: 0.35, power: 3 }));
      svg.current.querySelector('#lg-disc-map').setAttribute('href', lensMap(DISC, { rim: 0.9, center: 0.08, power: 6 }));
      root.classList.add('glass-refract');
    }

    const els = [dot.current, ring.current, lens.current, disc.current];
    const instant = appState.reducedMotion;
    const q = (el, prop, d) => gsap.quickTo(el, prop, { duration: instant ? 0 : d, ease: 'power3' });
    const moves = [
      [dot.current, 0.08],
      [ring.current, 0.32],
      [lens.current, 0.32],
      [disc.current, 0.3],
    ].map(([el, d]) => [q(el, 'x', d), q(el, 'y', d)]);

    let mode = '';
    const setMode = (m) => {
      if (m === mode) return;
      els.forEach((el) => {
        if (mode) el.classList.remove(`is-${mode}`);
        if (m) el.classList.add(`is-${m}`);
      });
      if (LABELS[m]) text.current.textContent = LABELS[m];
      mode = m;
    };

    // Over anything clickable or typeable the native cursor (hand / caret) takes over and the glass hides.
    const NATIVE =
      'a, button, label, select, summary, input, textarea, [role="button"], [contenteditable="true"], [data-cursor="hover"], [data-cursor="view"]';
    const pick = (t) => {
      if (!t?.closest) return setMode('');
      if (t.closest(NATIVE)) return setMode('native');
      return setMode(t.closest('[data-cursor]')?.dataset.cursor || '');
    };
    let px = -1;
    let py = -1;
    const move = (e) => {
      root.classList.add('cursor-on');
      px = e.clientX;
      py = e.clientY;
      moves.forEach(([x, y]) => {
        x(px);
        y(py);
      });
      pick(e.target);
    };
    const down = () => els.forEach((el) => el.classList.add('is-down'));
    const up = () => els.forEach((el) => el.classList.remove('is-down'));
    const leave = (e) => {
      if (!e.relatedTarget) root.classList.remove('cursor-on');
    };
    // content moves under a still pointer while scrolling — re-check what's under it
    let raf = 0;
    const wheel = () => {
      if (px < 0 || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        pick(document.elementFromPoint(px, py));
      });
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', wheel, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('mouseout', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', wheel);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('mouseout', leave);
      cancelAnimationFrame(raf);
      root.classList.remove('has-cursor', 'cursor-on', 'glass-refract');
    };
  }, []);

  if (appState.isTouch) return null;
  return (
    <>
      <svg ref={svg} className="cursor-filters" aria-hidden="true" focusable="false">
        <filter id="lg-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage id="lg-lens-map" x="0" y="0" width={LENS} height={LENS} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS * 0.32} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="lg-disc" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage id="lg-disc-map" x="0" y="0" width={DISC} height={DISC} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={DISC * 0.35} xChannelSelector="R" yChannelSelector="G" result="bent" />
          <feGaussianBlur in="bent" stdDeviation="2.5" />
        </filter>
      </svg>

      <div className="cursor-lens" ref={lens} aria-hidden="true">
        <span />
      </div>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path d="M20 0.5v4.5M20 35v4.5M0.5 20h4.5M35 20h4.5" />
        </svg>
      </div>
      <div className="cursor-disc" ref={disc} aria-hidden="true">
        <div className="cursor-disc__body">
          <svg className="cursor-disc__orbit" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" />
          </svg>
          <span className="cursor-disc__label">
            <i className="cursor-disc__arrow cursor-disc__arrow--l">‹</i>
            <span ref={text}>View</span>
            <i className="cursor-disc__arrow cursor-disc__arrow--r">›</i>
            <i className="cursor-disc__arrow cursor-disc__arrow--ne">{'↗︎'}</i>
          </span>
        </div>
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true">
        <span />
      </div>
    </>
  );
}
