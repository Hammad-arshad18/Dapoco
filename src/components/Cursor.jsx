import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { appState } from '../three/store';

/*
 * Brand cursor — a draughtsman's "sight": hairline ring with four tick marks + a centre point.
 *  - default  : sight follows with a soft lag; the point is exact.
 *  - hover    : sight opens up and turns 45° like a dial; point grows.
 *  - view     : sight folds away, a clay disc with an italic serif "View ↗" takes over.
 *  - drag     : clay disc "‹ Drag ›" with a slowly turning dashed turntable ring (3D stages).
 *  - text     : hidden over inputs so the native caret is used.
 * Ring + dot use mix-blend-mode: difference so they read on bone and forest sections alike;
 * the disc is a separate element (normal blending) so the clay stays true.
 * State changes are applied with classList (no React re-render per pointer move).
 */
const LABELS = { view: 'View', drag: 'Drag' };

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const disc = useRef(null);
  const text = useRef(null);

  useEffect(() => {
    if (appState.isTouch) return undefined;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const els = [dot.current, ring.current, disc.current];
    const instant = appState.reducedMotion;
    const q = (el, prop, d) => gsap.quickTo(el, prop, { duration: instant ? 0 : d, ease: 'power3' });
    const xd = q(dot.current, 'x', 0.08);
    const yd = q(dot.current, 'y', 0.08);
    const xr = q(ring.current, 'x', 0.38);
    const yr = q(ring.current, 'y', 0.38);
    const xc = q(disc.current, 'x', 0.3);
    const yc = q(disc.current, 'y', 0.3);

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

    const move = (e) => {
      root.classList.add('cursor-on');
      xd(e.clientX);
      yd(e.clientY);
      xr(e.clientX);
      yr(e.clientY);
      xc(e.clientX);
      yc(e.clientY);
      const t = e.target;
      if (t.closest?.('input, textarea, select, [contenteditable="true"]')) return setMode('text');
      const c = t.closest?.('[data-cursor]');
      return setMode(c?.dataset.cursor || (t.closest?.('a, button, label') ? 'hover' : ''));
    };
    const down = () => els.forEach((el) => el.classList.add('is-down'));
    const up = () => els.forEach((el) => el.classList.remove('is-down'));
    const leave = (e) => {
      if (!e.relatedTarget) root.classList.remove('cursor-on');
    };
    const wheel = () => {
      if (mode === 'hover' || mode === 'view') setMode('');
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('wheel', wheel, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('mouseout', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('mouseout', leave);
      root.classList.remove('has-cursor', 'cursor-on');
    };
  }, []);

  if (appState.isTouch) return null;
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="13.5" />
          <path d="M20 2.5v5M20 32.5v5M2.5 20h5M32.5 20h5" />
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
            <i className="cursor-disc__arrow cursor-disc__arrow--ne">{"\u2197\uFE0E"}</i>
          </span>
        </div>
      </div>
      <div className="cursor-dot" ref={dot} aria-hidden="true">
        <span />
      </div>
    </>
  );
}
