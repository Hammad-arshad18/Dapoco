import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { advance } from '@react-three/fiber';

import WebGL from './three/WebGL';
import { appState, onReady } from './three/store';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import { setLenis, scrollToTop } from './components/scroll';

import Home from './pages/Home';
import About from './pages/About';
import Collections from './pages/Collections';
import Category from './pages/Category';
import Services from './pages/Services';
import Journal from './pages/Journal';
import Article from './pages/Article';
import Contact from './pages/Contact';
import Studio from './pages/Studio';
import NotFound from './pages/NotFound';

gsap.registerPlugin(ScrollTrigger);
// phones: the address bar showing/hiding resizes the viewport — don't recalculate every trigger for that (jumps)
ScrollTrigger.config({ ignoreMobileResize: true });

const NAMES = { '': 'Home', about: 'About', collections: 'Collections', studio: 'Studio', services: 'Services', journal: 'Journal', contact: 'Contact' };
const pageName = (path) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  return NAMES[parts[0] || ''] || 'Dapoco';
};

export default function App() {
  const location = useLocation();
  const [shown, setShown] = useState(location);
  const curtain = useRef(null);
  const first = useRef(true);

  /* ---- smooth scroll + single render loop (Lenis → ScrollTrigger → WebGL) ---- */
  useEffect(() => {
    const lenis = appState.reducedMotion
      ? null
      : new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          // Touch: scroll is driven from the same frame as the WebGL layer. With native touch scrolling the
          // page moves on the compositor a frame ahead of the fixed 3D canvas, so models wobble against
          // their boxes ("jitter"). Finger tracking stays 1:1; only the fling uses the lerp.
          syncTouch: appState.isTouch,
          syncTouchLerp: 0.09,
          // leave pinch-zoom (two fingers, or panning while zoomed in) to the browser — syncTouch would block it
          virtualScroll: ({ event }) => !(event.touches?.length > 1 || (window.visualViewport?.scale ?? 1) > 1.01),
          // textareas scroll themselves (long contact messages)
          prevent: (node) => node.tagName === 'TEXTAREA',
        });
    setLenis(lenis);
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      if (!appState.ready) {
        lenis.stop();
        onReady(() => lenis.start());
      }
    }
    let skew = 0;
    const root = document.documentElement;
    // the skew restyles every photo each frame — skip it on phones, where that budget matters most
    const skewOn = !appState.reducedMotion && !appState.isTouch;
    const tick = (time) => {
      lenis?.raf(time * 1000);
      // scroll velocity → a gentle skew on photography (shared CSS variable)
      const v = lenis ? lenis.velocity : 0;
      appState.velocity = v;
      const target = skewOn ? Math.max(-3, Math.min(3, v * 0.09)) : 0;
      const next = skew + (target - skew) * 0.12;
      if (Math.abs(next - skew) > 0.002 || (next !== 0 && Math.abs(next) < 0.002)) {
        skew = Math.abs(next) < 0.002 ? 0 : next;
        root.style.setProperty('--skew', skew.toFixed(3));
      }
      // r3f's manual loop expects SECONDS (it diffs against clock.elapsedTime)
      advance(time);
    };
    gsap.ticker.add(tick);
    // cap time jumps so 3D never lurches: after any frame slower than 100 ms (background tab, a heavy
    // frame on a phone) the next step counts as one normal frame instead of a big leap
    gsap.ticker.lagSmoothing(100, 33);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  /* ---- page transition: staggered columns + destination name ---- */
  useEffect(() => {
    if (location.pathname === shown.pathname && location.search === shown.search) return;
    // the WebGL context was restored while a form had text in it (see WebGL.jsx) — reload now, on the new page
    if (appState.needsReload) {
      window.location.reload();
      return;
    }
    if (first.current) first.current = false;
    const el = curtain.current;
    const cols = el.querySelectorAll('.page-curtain__col');
    // write the destination name as individual letters (imperative: the timeline needs them now)
    const nameEl = el.querySelector('.page-curtain__name');
    nameEl.textContent = '';
    pageName(location.pathname)
      .split('')
      .forEach((c) => {
        const sp = document.createElement('span');
        sp.className = 'roll__c roll__c--static';
        sp.textContent = c === ' ' ? '\u00A0' : c;
        nameEl.appendChild(sp);
      });
    if (appState.reducedMotion) {
      setShown(location);
      scrollToTop(true);
      return undefined;
    }
    const tl = gsap.timeline();
    tl.set(el, { display: 'block' })
      .fromTo(cols, { yPercent: 101 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut', stagger: 0.05 })
      .fromTo(el.querySelectorAll('.page-curtain__name .roll__c'), { yPercent: 120, rotateX: -80, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.025 }, 0.35)
      .add(() => {
        setShown(location);
        scrollToTop(true);
      })
      .to(el.querySelectorAll('.page-curtain__name .roll__c'), { yPercent: -110, opacity: 0, duration: 0.45, ease: 'expo.in', stagger: 0.015 }, '+=0.15')
      .to(cols, { yPercent: -101, duration: 0.8, ease: 'expo.inOut', stagger: 0.05 }, '-=0.2')
      .set(el, { display: 'none' });
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useLayoutEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [shown]);

  return (
    <>
      <Preloader />
      <WebGL />
      <Cursor />
      <Nav />
      <div className="page-curtain" ref={curtain} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} className="page-curtain__col" style={{ left: `${i * 20}%` }} />
        ))}
        <div className="page-curtain__mark">
          <span className="page-curtain__name" />
        </div>
      </div>
      <main className="page" key={shown.pathname}>
        <Routes location={shown}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<Category />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<Article />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </main>
    </>
  );
}
