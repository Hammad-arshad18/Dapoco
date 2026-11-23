import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { appState } from '../three/store';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('');

  useEffect(() => {
    if (appState.isTouch) return;
    document.documentElement.classList.add('has-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' });
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' });
    const move = (e) => {
      document.documentElement.classList.add('cursor-on');
      xd(e.clientX);
      yd(e.clientY);
      xr(e.clientX);
      yr(e.clientY);
      const t = e.target.closest?.('[data-cursor]');
      const m = t?.dataset.cursor || '';
      setMode(m);
      setLabel(m === 'drag' ? 'Drag' : m === 'view' ? 'View' : '');
    };
    const down = () => ring.current?.classList.add('is-down');
    const up = () => ring.current?.classList.remove('is-down');
    const reset = () => {
      setMode('');
      setLabel('');
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('wheel', reset, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('wheel', reset);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.classList.remove('has-cursor', 'cursor-on');
    };
  }, []);

  if (appState.isTouch) return null;
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className={`cursor-ring ${mode ? `is-${mode}` : ''}`} ref={ring} aria-hidden="true">
        <span>{label}</span>
      </div>
    </>
  );
}
