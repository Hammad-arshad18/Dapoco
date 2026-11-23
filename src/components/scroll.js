let lenis = null;
export const setLenis = (l) => (lenis = l);
export const getLenis = () => lenis;

export function scrollToTop(immediate = false) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToEl(target, offset = -80) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
