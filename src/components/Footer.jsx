import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { company, nav } from '../data/site';
import { categories } from '../data/products';
import { Button, SplitText, useReveals, Photo } from './ui';
import { scrollToTop } from './scroll';

export default function Footer() {
  const ref = useRef(null);
  useReveals(ref);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer__giant span',
        { yPercent: 100 },
        { yPercent: 0, ease: 'expo.out', duration: 1.4, stagger: 0.05, scrollTrigger: { trigger: '.footer__giant', start: 'top 95%', toggleActions: 'play none none none' } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <footer className="footer" ref={ref}>
      <section className="footer__cta">
        <div className="footer__cta-copy">
          <p className="label label--light">
            <span className="label__n">(Contact)</span>
            <span>Private consultations by appointment</span>
          </p>
          <h2 className="display display--xxl" data-reveal="split">
            <SplitText text="Begin your" /> <em><SplitText text="luxury journey." /></em>
          </h2>
          <p className="footer__lead" data-reveal="up">
            Our team is ready to assist with your high-end residential, corporate, or hospitality project.
          </p>
          <div className="footer__ctas" data-reveal="up" data-delay="0.1">
            <Button to="/contact?type=consultation" variant="bone">
              Book a Consultation
            </Button>
            <Button to="/contact?type=quote" variant="ghost-light">
              Request a Quote
            </Button>
          </div>
        </div>
        <Photo k="dubai" alt="Dubai skyline at dusk" className="footer__photo" parallax={0.1} sizes="(max-width: 900px) 100vw, 40vw" />
      </section>

      <div className="footer__grid">
        <div>
          <h4>Studio</h4>
          <ul>
            <li>
              <a href={`mailto:${company.email}`} data-cursor="hover">{company.email}</a>
            </li>
            <li>{company.location}</li>
            <li className="arabic footer__ar">{company.arabicName}</li>
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} data-cursor="hover">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Collections</h4>
          <ul className="footer__cols">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/collections/${c.slug}`} data-cursor="hover">{c.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Registered</h4>
          <ul>
            <li>{company.legalName}</li>
            <li>{company.legalType}</li>
            <li>{company.location}</li>
          </ul>
        </div>
      </div>

      <div className="footer__giant" aria-hidden="true">
        {'DAPOCO'.split('').map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>

      <div className="footer__bottom">
        <span>© {company.founded}–{new Date().getFullYear()} {company.legalName}</span>
        <span>{company.tagline}</span>
        <button onClick={() => scrollToTop()} data-cursor="hover" className="footer__top">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
