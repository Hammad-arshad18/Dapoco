import { useEffect } from 'react';

/*
 * Liquid glass for rounded UI (capsules, rounded rects).
 *
 * The look (tint, rim highlights, shadow, frosted fallback) lives in CSS on `.glass`. This hook adds
 * real refraction on Chromium: it draws a displacement map that bends the backdrop near the element's
 * rounded edge (a "bezel"), puts it in an SVG <filter>, and sets `backdrop-filter: url(#filter) …`
 * inline. The map is redrawn whenever the element resizes, because it must match the element's box.
 *
 * Gotcha: an ancestor with backdrop-filter, filter, opacity < 1, mask or mix-blend-mode becomes the
 * "backdrop root" and the glass would only see that ancestor, not the page. Keep glass elements free
 * of such parents (that's why the nav no longer has a frosted full-width bar).
 */

// Phones skip refraction: an SVG displacement filter re-runs over the backdrop on every scroll frame,
// which is too much for a phone GPU. They keep the frosted CSS glass.
export const supportsRefraction =
  typeof navigator !== 'undefined' &&
  !!navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand)) &&
  !window.matchMedia?.('(pointer: coarse)').matches;

const NS = 'http://www.w3.org/2000/svg';
let host = null;
let uid = 0;

function svgHost() {
  if (host?.isConnected) return host;
  host = document.createElementNS(NS, 'svg');
  host.setAttribute('aria-hidden', 'true');
  host.setAttribute('focusable', 'false');
  host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.appendChild(host);
  return host;
}

/** Signed-distance displacement map for a w×h rounded rect with corner radius r. */
export function bezelMap(w, h, r, bezel) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const hx = w / 2;
  const hy = h / 2;
  const ix = hx - r;
  const iy = hy - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hx;
      const py = y + 0.5 - hy;
      const qx = Math.abs(px) - ix;
      const qy = Math.abs(py) - iy;
      let nx;
      let ny;
      let dist;
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1;
        nx = (qx / l) * Math.sign(px);
        ny = (qy / l) * Math.sign(py);
        dist = r - l;
      } else if (qx > qy) {
        nx = Math.sign(px);
        ny = 0;
        dist = r - qx;
      } else {
        nx = 0;
        ny = Math.sign(py);
        dist = r - qy;
      }
      // dist = depth inside the shape (0 at the edge). Bend hardest at the edge, fade out by `bezel`.
      const t = dist >= 0 && dist < bezel ? (1 - dist / bezel) ** 2 : 0;
      const i = (y * w + x) * 4;
      img.data[i] = 128 - 127 * t * nx; // sample inward → the edge "lenses" the backdrop
      img.data[i + 1] = 128 - 127 * t * ny;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

/**
 * @param ref       element ref (should also carry the `.glass` class for the visual styling)
 * @param options   bezel: px width of the bending rim; strength: max displacement (px);
 *                  after: extra backdrop filters chained after the refraction; enabled: toggle.
 */
export function useLiquidGlass(ref, { bezel = 14, strength = 18, after = 'blur(4px) saturate(1.7)', enabled = true } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !supportsRefraction) return undefined;
    const id = `lg-${++uid}`;
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', '100%');
    filter.setAttribute('height', '100%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const feImage = document.createElementNS(NS, 'feImage');
    feImage.setAttribute('x', '0');
    feImage.setAttribute('y', '0');
    feImage.setAttribute('preserveAspectRatio', 'none');
    feImage.setAttribute('result', 'map');
    const disp = document.createElementNS(NS, 'feDisplacementMap');
    disp.setAttribute('in', 'SourceGraphic');
    disp.setAttribute('in2', 'map');
    disp.setAttribute('xChannelSelector', 'R');
    disp.setAttribute('yChannelSelector', 'G');
    disp.setAttribute('scale', String(strength * 2));
    filter.append(feImage, disp);
    svgHost().appendChild(filter);

    let lastKey = '';
    const draw = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2, w / 2);
      const key = `${w}x${h}r${r}`;
      if (key === lastKey) return;
      lastKey = key;
      feImage.setAttribute('width', w);
      feImage.setAttribute('height', h);
      feImage.setAttribute('href', bezelMap(w, h, r, Math.min(bezel, h / 2)));
      el.style.backdropFilter = `url(#${id}) ${after}`;
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => {
      ro.disconnect();
      filter.remove();
      el.style.backdropFilter = '';
    };
  }, [ref, bezel, strength, after, enabled]);
}
