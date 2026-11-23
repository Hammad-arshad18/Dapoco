import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useProgress } from '@react-three/drei';
import { setReady, appState } from '../three/store';
import { stopScroll, startScroll } from './scroll';
import { LogoMark } from './Logo';

/* ============================================================================
   Preloader — "In the workshop"
   A line-drawn craftsman planes a plank (shavings curl off every stroke) while
   a lounge chair assembles itself piece by piece as the assets load.
   Everything is one SVG animated from the gsap ticker; it is short by design.
   ========================================================================== */

const HIPS = [118, 184];
const SHOULDER = [134, 110];
const L1 = 56; // upper arm
const L2 = 60; // forearm
const STROKE = [176, 238]; // plane travel along the plank
const PERIOD = 0.62; // seconds per back-and-forth

const rot = ([x, y], [cx, cy], a) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

// two-bone IK, elbow bending downwards
function arm(sh, hand) {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const e = [sh[0] + Math.cos(base + a) * L1, sh[1] + Math.sin(base + a) * L1];
  return `M${sh[0].toFixed(1)} ${sh[1].toFixed(1)} L${e[0].toFixed(1)} ${e[1].toFixed(1)} L${hand[0].toFixed(1)} ${hand[1].toFixed(1)}`;
}

// chair parts, in assembly order (each drops into place as loading advances)
const CHAIR = [
  { d: 'M404 262 L414 204', w: 5 }, // back leg
  { d: 'M466 262 L456 204', w: 5 }, // front leg
  { d: 'M400 204 L470 204', w: 6 }, // seat rail
  { d: 'M402 190 h66 a7 7 0 0 1 0 14 h-66 a7 7 0 0 1 0-14z', w: 2.2, fill: true }, // seat cushion
  { d: 'M408 200 L394 132', w: 5 }, // back frame
  { d: 'M392 136 q-4 26 8 52 l12 -2 q-10 -24 -6 -50z', w: 2.2, fill: true }, // back cushion
  { d: 'M404 166 L462 166 L458 204', w: 3 }, // arm rest
];

export default function Preloader() {
  const root = useRef(null);
  const svg = useRef(null);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const { progress, active } = useProgress();
  const target = useRef(0);
  const activeRef = useRef(active);
  const finished = useRef(false);

  useEffect(() => {
    target.current = Math.max(target.current, progress);
    activeRef.current = active;
  }, [progress, active]);

  useEffect(() => {
    const s = svg.current;
    if (!s) return undefined;
    stopScroll();
    document.documentElement.classList.add('is-loading');
    const q = (sel) => s.querySelector(sel);
    const torso = q('[data-torso]');
    const armNear = q('[data-arm-near]');
    const armFar = q('[data-arm-far]');
    const plane = q('[data-plane]');
    const parts = [...s.querySelectorAll('[data-part]')];
    const curls = [...s.querySelectorAll('[data-curl]')].map((el) => ({ el, life: 1, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 }));
    let curlI = 0;
    let lastPhase = 0;

    const counter = { v: 0 };
    const start = performance.now();
    const reduced = appState.reducedMotion;
    const minTime = reduced ? 300 : 1300;
    let prev = start;

    const draw = (now) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      // plane stroke: quick push forward, slower pull back
      const ph = (t % PERIOD) / PERIOD;
      const k = ph < 0.55 ? gsap.parseEase('power2.inOut')(ph / 0.55) : 1 - gsap.parseEase('sine.inOut')((ph - 0.55) / 0.45);
      const px = STROKE[0] + (STROKE[1] - STROKE[0]) * (reduced ? 0.5 : k);
      const lean = ((4 + 9 * (reduced ? 0.5 : k)) * Math.PI) / 180;
      torso.setAttribute('transform', `rotate(${((lean * 180) / Math.PI).toFixed(2)} ${HIPS[0]} ${HIPS[1]})`);
      const sh = rot(SHOULDER, HIPS, lean);
      const shFar = rot([SHOULDER[0] + 6, SHOULDER[1] + 2], HIPS, lean);
      armNear.setAttribute('d', arm(sh, [px - 4, 147]));
      armFar.setAttribute('d', arm(shFar, [px + 10, 145]));
      plane.setAttribute('transform', `translate(${px.toFixed(1)} 0)`);

      // a shaving curls off at the end of every forward push
      if (!reduced && lastPhase < 0.5 && ph >= 0.5) {
        const c = curls[curlI++ % curls.length];
        Object.assign(c, { life: 0, x: px + 20, y: 150, vx: 30 + Math.random() * 40, vy: -70 - Math.random() * 40, r: 0, vr: 200 + Math.random() * 300 });
      }
      lastPhase = ph;
      curls.forEach((c) => {
        if (c.life >= 1) {
          c.el.setAttribute('opacity', '0');
          return;
        }
        c.life += dt / 0.9;
        c.vy += 260 * dt;
        c.x += c.vx * dt;
        c.y = Math.min(c.y + c.vy * dt, 258);
        c.r += c.vr * dt;
        c.el.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.r.toFixed(0)}) scale(${(0.7 + c.life * 0.5).toFixed(2)})`);
        c.el.setAttribute('opacity', (1 - c.life * c.life).toFixed(2));
      });

      // counter: eases toward time-based progress, then real asset progress
      const elapsed = now - start;
      const timeP = Math.min(92, (elapsed / minTime) * 92);
      const assetsDone = !activeRef.current && target.current >= 100;
      const want = assetsDone ? Math.max(timeP, Math.min(100, (elapsed / minTime) * 100)) : Math.max(Math.min(timeP, target.current), Math.min(timeP, 55));
      counter.v += (want - counter.v) * 0.16;
      setN(Math.round(counter.v));

      // the chair builds itself with the counter
      const p = counter.v / 100;
      parts.forEach((el, i) => {
        const a = Math.max(0, Math.min(1, (p * (parts.length + 0.6) - i) / 1));
        const e = gsap.parseEase('back.out(2.2)')(a);
        el.setAttribute('opacity', Math.min(1, a * 2.5).toFixed(2));
        el.setAttribute('transform', `translate(0 ${((1 - e) * -26).toFixed(1)})`);
      });

      const timedOut = elapsed > 2400;
      if (!finished.current && elapsed > minTime && (assetsDone || timedOut || (target.current === 0 && elapsed > 1600))) {
        finished.current = true;
        exit();
      }
    };

    const tick = () => draw(performance.now());
    const exit = () => {
      gsap
        .timeline()
        .to(counter, {
          v: 100,
          duration: 0.25,
          ease: 'power2.out',
          onUpdate: () => {
            setN(Math.round(counter.v));
            parts.forEach((el) => {
              el.setAttribute('opacity', '1');
              el.setAttribute('transform', 'translate(0 0)');
            });
          },
        })
        .to(s.querySelector('[data-glow]'), { opacity: 1, scale: 1.4, transformOrigin: '50% 50%', duration: 0.35, ease: 'expo.out' }, '<0.1')
        .add(() => {
          setReady();
          document.documentElement.classList.remove('is-loading');
          startScroll();
        })
        .to('.preloader__scene', { yPercent: -12, opacity: 0, duration: 0.55, ease: 'expo.in' }, '<0.05')
        .to('.preloader__meta, .preloader__count, .preloader__bar', { opacity: 0, duration: 0.3 }, '<')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'expo.inOut' }, '-=0.25')
        .add(() => {
          gsap.ticker.remove(tick);
          setDone(true);
        });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  return (
    <div className="preloader" ref={root} aria-live="polite" aria-label="Loading">
      <div className="preloader__meta">
        <span className="preloader__brand"><LogoMark /> Dapoco — Furnitures Trading</span>
        <span>Crafting your showroom</span>
      </div>

      <div className="preloader__scene">
        <svg ref={svg} viewBox="0 0 520 300" className="workshop" aria-hidden="true">
          {/* floor */}
          <path d="M30 262 H490" className="ws-line ws-line--mute" />
          {/* workbench */}
          <rect x="150" y="172" width="196" height="9" rx="1.5" className="ws-fill-ink" />
          <path d="M166 181 V262 M330 181 V262 M166 236 H330" className="ws-line" />
          {/* plank being planed */}
          <rect x="168" y="159" width="150" height="13" rx="1" className="ws-wood" />
          <path d="M176 165 h40 M228 168 h60 M190 162 h22" className="ws-grain" />
          {/* far arm (behind body) */}
          <path data-arm-far className="ws-limb ws-limb--far" />
          {/* legs */}
          <path d="M113 186 L103 224 L96 262 L84 262 M126 186 L140 224 L136 262 L154 262" className="ws-limb" />
          {/* torso + head (lean with the stroke) */}
          <g data-torso>
            <path d="M126 104 C112 124 108 158 112 188 L128 188 C134 160 144 130 142 110 Z" className="ws-body" />
            <path d="M134 118 L147 122 L144 202 L124 199 Z" className="ws-apron" />
            <path d="M134 118 L131 104 M147 122 L146 108" className="ws-line ws-line--thin" />
            <circle cx="140" cy="84" r="13" className="ws-body" />
            {/* cap */}
            <path d="M127 82 C127 68 152 66 154 80 L162 82 C160 84 150 84 127 82 Z" className="ws-cap" />
            <path d="M152 88 q3 2 6 0" className="ws-line ws-line--thin" />
          </g>
          {/* hand plane */}
          <g data-plane>
            <path d="M-16 148 h34 l4 10 h-42 z" className="ws-plane" />
            <path d="M-12 148 c0 -12 8 -14 12 -6" className="ws-line" />
            <circle cx="14" cy="144" r="3.5" className="ws-knob" />
          </g>
          {/* near arm */}
          <path data-arm-near className="ws-limb" />
          {/* shavings */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} data-curl opacity="0" d="M0 0 c5 -7 12 -2 7 4 c-4 5 -9 1 -5 -3" className="ws-curl" />
          ))}
          {/* the chair, assembled as loading progresses */}
          <circle data-glow cx="432" cy="200" r="58" className="ws-glow" opacity="0" />
          {CHAIR.map((c, i) => (
            <path key={i} data-part opacity="0" d={c.d} className={c.fill ? 'ws-cushion' : 'ws-frame'} style={{ strokeWidth: c.w }} />
          ))}
        </svg>
        <p className="preloader__word">
          <span>Made by hand,</span> <em>finished for you.</em>
        </p>
      </div>

      <div className="preloader__count">
        {n}
        <sup>%</sup>
      </div>
      <div className="preloader__bar">
        <span style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  );
}
