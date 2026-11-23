// Tiny mutable app state shared between DOM and the WebGL render loop.
export const appState = {
  ready: false,
  pointer: { x: 0, y: 0 },
  velocity: 0, // smooth-scroll velocity (px / frame), drives skew + marquee
  reducedMotion:
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  isTouch: typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
};

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
