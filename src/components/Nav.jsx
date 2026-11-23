import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { nav, company } from '../data/site';
import { getLenis, stopScroll, startScroll } from './scroll';
import { Magnetic } from './ui';
import { img } from '../data/credits';
import Logo from './Logo';


const menuImages = ['residential', 'lobby', 'lounge', 'atelier', 'suite-sculpt', 'dubai'];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(0);
  const menu = useRef(null);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = getLenis()?.scroll ?? window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 400);
      last = y;
    };
    const id = setInterval(() => {
      const l = getLenis();
      if (l) {
        l.on('scroll', onScroll);
        clearInterval(id);
      }
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearInterval(id);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    if (open) {
      stopScroll();
      gsap.set(el, { display: 'grid' });
      gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' });
      gsap.fromTo(el.querySelectorAll('.menu__link span'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.4 });
      gsap.fromTo(el.querySelectorAll('.menu__foot > *, .menu__visual'), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.6 });
    } else {
      startScroll();
      gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut', onComplete: () => gsap.set(el, { display: 'none' }) });
    }
  }, [open]);

  return (
    <>
      <header className={`nav ${hidden && !open ? 'nav--hidden' : ''} ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
        <Link to="/" className="nav__brand" aria-label="Dapoco home" data-cursor="hover">
          <Logo />
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {nav.slice(1).map((n) => (
            <NavLink key={n.to} to={n.to} className="nav__link" data-cursor="hover">
              <span>{n.label}</span>
              <span aria-hidden="true">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="nav__actions">
          <Magnetic strength={0.2}>
            <Link to="/contact?type=quote" className="nav__cta" data-cursor="hover">
              Request a Quote
            </Link>
          </Magnetic>
          <button className="burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} data-cursor="hover">
            <span>{open ? 'Close' : 'Menu'}</span>
            <i />
          </button>
        </div>
      </header>

      <div className="menu" ref={menu} role="dialog" aria-modal="true" aria-label="Site menu">
        <nav className="menu__nav">
          {nav.map((n, i) => (
            <NavLink key={n.to} to={n.to} className="menu__link" onClick={() => setOpen(false)} onPointerEnter={() => setHoverIdx(i)}>
              <em>0{i + 1}</em>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="menu__visual" aria-hidden="true">
          {menuImages.map((k, i) => (
            <img key={k} src={img(k, 'sm')} alt="" className={i === hoverIdx ? 'is-on' : ''} />
          ))}
        </div>
        <div className="menu__foot">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <span>{company.location}</span>
          <span className="arabic">{company.arabicName}</span>
        </div>
      </div>
    </>
  );
}
