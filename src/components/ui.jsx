import { useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { View } from '@react-three/drei';
import { ProductStage, useDragRotate, SCENES } from '../three/Stage';
import { appState } from '../three/store';
import { img, imgSet } from '../data/credits';

/* ---------- Split text into masked words (pure React) ---------- */
export function SplitText({ text, className = '' }) {
  const words = text.split(' ');
  return (
    <span className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span className="split__w" key={i} aria-hidden="true">
          <span className="split__i">{w}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/* ---------- Text scramble: letters cycle through glyphs before settling ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/—·+0123456789';
function scramble(el, delay, st) {
  const target = el.querySelector('[data-scramble]') || el;
  const text = target.textContent;
  target.setAttribute('aria-label', text);
  const state = { p: 0 };
  gsap.set(el, { opacity: 0 });
  gsap.timeline({ delay, scrollTrigger: st })
    .to(el, { opacity: 1, duration: 0.2 })
    .to(state, {
      p: 1,
      duration: Math.min(1.4, 0.4 + text.length * 0.03),
      ease: 'power2.out',
      onUpdate: () => {
        const n = Math.floor(state.p * text.length);
        let out = text.slice(0, n);
        for (let i = n; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        target.textContent = out;
      },
      onComplete: () => (target.textContent = text),
    }, 0);
}

/* ---------- Scroll-triggered reveals ----------
   data-reveal = up | fade | split | clip | img | line | stagger | scramble            */
export function useReveals(scope, deps = []) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        const type = el.dataset.reveal;
        const delay = parseFloat(el.dataset.delay || 0);
        const immediate = el.dataset.immediate !== undefined;
        const st = immediate ? undefined : { trigger: el, start: 'top 90%', toggleActions: 'play none none none' };
        if (appState.reducedMotion) return;
        if (type === 'split') {
          // words flip up out of their mask like turning cards
          gsap.fromTo(
            el.querySelectorAll('.split__i'),
            { yPercent: 110, rotateX: -85, transformOrigin: '50% 0%' },
            { yPercent: 0, rotateX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.06, delay: delay + (immediate ? 0.15 : 0), scrollTrigger: st },
          );
        } else if (type === 'up') {
          gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay, scrollTrigger: st });
        } else if (type === 'fade') {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out', delay, scrollTrigger: st });
        } else if (type === 'img') {
          // venetian-blind reveal: seven slats open while the photo settles
          const inner = el.querySelector('img');
          el.classList.add('is-blinds');
          gsap.set(el, { '--blind': '0%' });
          const tl = gsap.timeline({ delay, scrollTrigger: st });
          tl.to(el, { '--blind': '100%', duration: 1.5, ease: 'expo.inOut', onComplete: () => el.classList.remove('is-blinds') });
          if (inner) tl.fromTo(inner, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0);
        } else if (type === 'scramble') {
          scramble(el, delay, st);
        } else if (type === 'clip') {
          gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay, scrollTrigger: st });
        } else if (type === 'line') {
          gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1.4, ease: 'expo.inOut', delay, scrollTrigger: st });
        } else if (type === 'stagger') {
          gsap.fromTo(
            el.children,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay, scrollTrigger: st ? { ...st, start: 'top 88%' } : undefined },
          );
        }
      });
      gsap.utils.toArray('[data-scrub-words]').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.split__i'),
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true } },
        );
      });
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || 0.12);
        gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ---------- Photo with reveal + optional parallax ---------- */
export function Photo({ k, alt, className = '', reveal = true, parallax = 0, eager = false, sizes = '(max-width: 900px) 100vw, 60vw', delay }) {
  return (
    <figure className={`photo ${className}`} data-reveal={reveal ? 'img' : undefined} data-delay={delay}>
      <img
        src={img(k)}
        srcSet={imgSet(k)}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        data-parallax={parallax || undefined}
        style={parallax ? { height: `${100 + parallax * 200}%`, top: `${-parallax * 100}%` } : undefined}
      />
    </figure>
  );
}

/* ---------- Magnetic wrapper ---------- */
export function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || appState.isTouch) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <span className="magnetic" ref={ref}>
      {children}
    </span>
  );
}

export function Button({ to, href, children, variant = 'ink', onClick, type, arrow = true, ...rest }) {
  const cls = `btn btn--${variant}`;
  const inner = (
    <>
      <span className="btn__label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {arrow && (
        <span className="btn__dot" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      )}
    </>
  );
  const el = to ? (
    <Link to={to} className={cls} data-cursor="hover" {...rest}>
      {inner}
    </Link>
  ) : href ? (
    <a href={href} className={cls} data-cursor="hover" {...rest}>
      {inner}
    </a>
  ) : (
    <button type={type || 'button'} className={cls} onClick={onClick} data-cursor="hover" {...rest}>
      {inner}
    </button>
  );
  return <Magnetic strength={0.18}>{el}</Magnetic>;
}

export function Label({ children, n, className = '' }) {
  return (
    <p className={`label ${className}`} data-reveal="scramble">
      {n && <span className="label__n">({n})</span>}
      <span data-scramble>{children}</span>
    </p>
  );
}

/* ---------- Marquee ---------- */
export function Marquee({ items, speed = 40, className = '' }) {
  const track = useRef(null);
  // follows the scroll: reverses with scroll direction, accelerates and leans with velocity
  useEffect(() => {
    const el = track.current;
    if (!el || appState.reducedMotion) return undefined;
    let x = 0;
    let dir = 1;
    let boost = 0;
    const tick = (_, dtMs) => {
      const dt = Math.min(dtMs, 50) / 1000;
      const half = el.scrollWidth / 2;
      if (!half) return;
      const v = appState.velocity || 0;
      if (Math.abs(v) > 0.4) dir = v > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(v) * 0.45, 9) - boost) * 0.08;
      x -= dir * (half / speed) * (1 + boost) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${(-dir * Math.min(boost, 6) * 0.9).toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed]);
  const row = (
    <div className="marquee__row">
      {items.map((t, i) => (
        <span key={i} className="marquee__item">
          {t}
          <i className="marquee__sep" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${className}`} style={{ '--speed': `${speed}s` }} aria-hidden="true">
      <div className="marquee__track" ref={track}>
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------- 3D product viewport (photoreal model + drag) ---------- */
export function ModelView({ scene, items, className = '', interactive = true, hint = true, dir, margin, sway, shadow }) {
  const drag = useDragRotate(0);
  return (
    <div className={`model-view ${className}`} {...(interactive ? drag.bind : {})} data-cursor={interactive ? 'drag' : undefined}>
      <View className="model-view__canvas">
        <ProductStage items={items || SCENES[scene] || SCENES.lounge} drag={interactive ? drag : null} dir={dir} margin={margin} sway={sway} shadow={shadow} />
      </View>
      {interactive && hint && (
        <span className="model-view__hint" aria-hidden="true">
          <i />
          Drag to rotate · 3D
        </span>
      )}
    </div>
  );
}

export function useFontsRefresh() {
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
}
