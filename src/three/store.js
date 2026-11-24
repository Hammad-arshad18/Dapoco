// Tiny mutable app state shared between DOM and the WebGL render loop.
export const appState = {
  ready: false,
  pointer: { x: 0, y: 0 },
  velocity: 0, // smooth-scroll velocity (px / frame), drives skew + marquee
  reducedMotion:
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  isTouch: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  needsReload: false, // WebGL context came back while the visitor was typing → reload on next page change
};

/* WebGL context loss (GPU switch on dual-GPU laptops, driver reset, phone memory pressure).
   The first time it happens we reload once for a clean start; this flag (per browser tab session)
   stops that from ever becoming a reload loop and tells Model.jsx to keep texture images so
   three.js can restore in place from then on. */
const GL_LOST_KEY = 'dapoco-gl-lost';
export function glLostBefore() {
  try {
    return window.sessionStorage.getItem(GL_LOST_KEY) === '1';
  } catch {
    return false;
  }
}
export function markGlLost() {
  try {
    window.sessionStorage.setItem(GL_LOST_KEY, '1');
  } catch {
    /* storage blocked: we just can't remember it */
  }
}

const readyListeners = new Set();
export function setReady() {
  appState.ready = true;
  readyListeners.forEach((fn) => fn());
}
export function onReady(fn) {
  if (appState.ready) fn();
  else readyListeners.add(fn);
  return () => readyListeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      appState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      appState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
