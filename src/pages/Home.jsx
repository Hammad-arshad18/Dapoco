import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { HeroScene, ShowroomScene } from '../three/Scenes';
import { View3D } from '../three/View3D';
import Configurator from '../components/Configurator';
import { PIECES as STUDIO_PIECES } from '../data/pieces';
import { preloadModels } from '../three/Model';
import { appState, onReady } from '../three/store';
import { company, luxuryCollections, services, whyDapoco, process } from '../data/site';
import { categories, totalProducts } from '../data/products';
import { articles } from '../data/journal';
import { img } from '../data/credits';
import { Button, Label, Marquee, Photo, SplitText, useReveals, useFontsRefresh } from '../components/ui';
import { scrollToEl } from '../components/scroll';

preloadModels(['mid_century_lounge_chair', 'sofa_02', 'modern_arm_chair_01', 'coffee_table_round_01']);

const Arrow = () => (
  <svg viewBox="0 0 24 24" className="arrow" aria-hidden="true">
    <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/* ================================ HERO ================================ */
function Hero() {
  const section = useRef(null);
  const progress = useRef(0);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(progress, { current: 1, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: true } });
      const st = { trigger: section.current, start: 'top top', end: '60% top', scrub: true };
      gsap.to('.hero__line--1', { xPercent: -18, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__line--2', { xPercent: 14, ease: 'none', scrollTrigger: st });
      gsap.to('.hero__corner, .hero__foot', { opacity: 0, y: -30, ease: 'none', scrollTrigger: { ...st, end: '25% top' } });
      const intro = () => {
        gsap.fromTo('.hero .split__i', { yPercent: 115, rotateX: -80, transformOrigin: '50% 0%' }, { yPercent: 0, rotateX: 0, duration: 2, ease: 'expo.out', stagger: 0.07, delay: 0.25 });
        gsap.fromTo('.hero [data-intro]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08, delay: 0.8 });
      };
      if (appState.ready || appState.reducedMotion) intro();
      else {
        gsap.set('.hero .split__i', { yPercent: 115, rotateX: -80, transformOrigin: '50% 0%' });
        gsap.set('.hero [data-intro]', { opacity: 0 });
        onReady(intro);
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={section}>
      <div className="hero__sticky">
        <div className="hero__corner hero__corner--l" data-intro>
          <span>(Dubai, UAE)</span>
          <span>Luxury furniture sourcing &amp; bespoke interiors</span>
        </div>
        <div className="hero__corner hero__corner--r" data-intro>
          <span>Est. {company.founded}</span>
          <span className="arabic">{company.arabicName}</span>
        </div>
        <h1 className="hero__title" aria-label="Luxury, experienced.">
          <span className="hero__line hero__line--1">
            <SplitText text="Luxury," />
          </span>
          <span className="hero__line hero__line--2">
            <em>
              <SplitText text="experienced." />
            </em>
          </span>
        </h1>
        <View3D className="hero__view">
          <HeroScene progress={progress} />
        </View3D>
        <div className="hero__foot">
          <div className="hero__intro" data-intro>
            <p>Premium furniture curated for elite homes, executive offices &amp; five-star hospitality.</p>
            <div className="hero__ctas">
              <Button to="/collections">Explore Collections</Button>
              <Button to="/contact?type=consultation" variant="ghost">
                Private Consultation
              </Button>
            </div>
          </div>
          <div className="hero__spec" data-intro>
            <span className="hero__spec-k">Now on view</span>
            <span>Mid-century lounge chair — leather &amp; walnut</span>
            <button className="scroll-cue" onClick={() => scrollToEl('#statement', -40)} data-cursor="hover">
              <i />
              Scroll to explore
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ STATEMENT ============================ */
const STATEMENT = [
  'Since 2023, Dapoco has curated world-class furniture for',
  { k: 'residential' },
  'villas and penthouses,',
  { k: 'boardroom' },
  'executive boardrooms and',
  { k: 'suite' },
  'five-star hospitality — sourced from elite manufacturers, artisans and design houses.',
];

function Statement() {
  let wi = 0;
  return (
    <section className="statement" id="statement">
      <div className="container">
        <Label n="01">About Dapoco</Label>
        <p className="statement__text" data-scrub-words>
          {STATEMENT.map((seg, si) =>
            typeof seg === 'string' ? (
              seg.split(' ').map((w) => (
                <Fragment key={`w${wi++}`}>
                  <span className="split__w">
                    <span className="split__i">{w}</span>
                  </span>{' '}
                </Fragment>
              ))
            ) : (
              <span className="inline-img" key={`i${si}`} aria-hidden="true">
                <img src={img(seg.k, 'sm')} alt="" loading="lazy" />
              </span>
            ),
          )}
        </p>
        <div className="statement__foot">
          <p className="body" data-reveal="up">
            Our philosophy is simple: luxury is not just seen — it is experienced. Every piece reflects meticulous artistry, premium materials and flawless finishing.
          </p>
          <ul className="stats" data-reveal="stagger">
            <li>
              <strong>{company.founded}</strong>
              <span>Founded in Dubai</span>
            </li>
            <li>
              <strong>{categories.length}</strong>
              <span>Collections</span>
            </li>
            <li>
              <strong>{totalProducts}+</strong>
              <span>Product lines</span>
            </li>
          </ul>
          <Button to="/about" variant="ghost">
            The Dapoco Standard
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ====================== COLLECTIONS — STACKED CARDS ====================== */
function CollectionStack() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.stack__card');
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const st = { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true };
        gsap.to(card.querySelector('.stack__inner'), { scale: 0.9, ease: 'none', scrollTrigger: st });
        // darken with an overlay's opacity (GPU-composited) rather than filter: brightness(), which
        // repaints the whole full-screen photo every frame
        gsap.to(card.querySelector('.stack__dim'), { opacity: 0.45, ease: 'none', scrollTrigger: st });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section className="stack" ref={ref}>
      <div className="container stack__head">
        <Label n="02">Signature Collections</Label>
        <h2 className="display display--xl" data-reveal="split">
          <SplitText text="Four worlds," /> <em><SplitText text="one standard." /></em>
        </h2>
      </div>
      <div className="stack__cards">
        {luxuryCollections.map((c, i) => (
          <article className="stack__card" key={c.key} style={{ '--i': i }}>
            <div className="stack__inner">
              <Photo k={c.image} alt={c.title} reveal={false} parallax={0.08} sizes="100vw" />
              <div className="stack__shade" />
              <div className="stack__dim" />
              <div className="stack__content">
                <span className="stack__n">0{i + 1} / 04</span>
                <h3 className="display display--xl">{c.title.replace(' Furniture', '')}</h3>
                <div className="stack__row">
                  <p>{c.text}</p>
                  <Link to={c.link} className="pill-link" data-cursor="hover">
                    Explore <Arrow />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================== SHOWROOM ============================== */
const SHOWROOM_STEPS = [
  { t: 'Global luxury sourcing', d: 'Exclusive access to world-renowned designers, luxury brands and artisan workshops.' },
  { t: 'Interior consultation', d: 'Expert guidance to compose spaces that reflect prestige, identity and refined taste.' },
  { t: 'White-glove installation', d: 'Delivered, placed and perfected on site — handled with precision, every time.' },
];
const PIECES = ['Chesterfield sofa — tufted leather', 'Lounge armchair — leather & walnut', 'Round coffee table — stone top', 'Leather ottoman', 'Brass & ceramic vessels'];

function Showroom() {
  const section = useRef(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(progress, {
        current: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (s) => setStep(Math.min(2, Math.floor(s.progress * 3 * 0.999))),
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);
  return (
    <section className="showroom" ref={section}>
      <div className="showroom__sticky">
        <View3D className="showroom__view">
          <ShowroomScene progress={progress} />
        </View3D>
        <div className="showroom__head">
          <Label n="03" className="label--light">The Showroom</Label>
          <h2 className="display display--lg" data-reveal="split">
            <SplitText text="A room, rendered" /> <em><SplitText text="in real time." /></em>
          </h2>
        </div>
        <div className="showroom__steps">
          {SHOWROOM_STEPS.map((s, i) => (
            <div key={s.t} className={`showroom__step ${i === step ? 'is-on' : ''}`}>
              <span>0{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
          <div className="showroom__bar">
            <i style={{ transform: `scaleX(${(step + 1) / 3})` }} />
          </div>
        </div>
        <ul className="showroom__pieces">
          <li className="showroom__pieces-h">In this room</li>
          {PIECES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* =========================== MATERIAL STUDIO =========================== */
function MaterialStudio() {
  return (
    <section className="section studio">
      <div className="container">
        <Configurator variant="compact" initial="modern_arm_chair_01">
          <div className="studio__intro">
            <Label n="04">Bespoke Luxury Creations</Label>
            <h2 className="display display--lg" data-reveal="split">
              <SplitText text="Your piece," /> <em><SplitText text="your materials." /></em>
            </h2>
            <p className="body" data-reveal="up">
              Choose from {STUDIO_PIECES.length} pieces and dress every part of them — leathers, velvets, woods, lacquers, metals and marbles. Each change is rendered live, sweeping across the piece.
            </p>
          </div>
        </Configurator>
      </div>
    </section>
  );
}

/* ====================== RANGE — CURSOR IMAGE REVEAL ====================== */
function Range() {
  const [active, setActive] = useState(-1);
  const float = useRef(null);
  useLayoutEffect(() => {
    if (appState.isTouch || !float.current) return;
    const xTo = gsap.quickTo(float.current, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(float.current, 'y', { duration: 0.6, ease: 'power3' });
    const rTo = gsap.quickTo(float.current, 'rotation', { duration: 0.8, ease: 'power3' });
    let lx = 0;
    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(Math.max(-8, Math.min(8, (e.clientX - lx) * 0.4)));
      lx = e.clientX;
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return (
    <section className="section range" onPointerLeave={() => setActive(-1)}>
      <div className="container">
        <div className="head-row">
          <div>
            <Label n="05">The Complete Range</Label>
            <h2 className="display display--xl" data-reveal="split">
              <SplitText text="Every space," /> <em><SplitText text="furnished." /></em>
            </h2>
          </div>
          <p className="body" data-reveal="up">
            From executive suites to kids’ rooms — {totalProducts}+ product lines across ten collections, sourced and delivered across the UAE.
          </p>
        </div>
        <ul className="range__list">
          {categories.map((c, i) => {
            const count = c.groups.reduce((s, g) => s + g.items.length, 0);
            return (
              <li key={c.slug} onPointerEnter={() => setActive(i)} data-reveal="up">
                <Link to={`/collections/${c.slug}`} className="range__row" data-cursor="view">
                  <span className="range__n">{c.n}</span>
                  <img className="range__thumb" src={img(c.image, 'sm')} alt="" loading="lazy" />
                  <span className="range__title">{c.title}</span>
                  <span className="range__tag">{c.tagline}</span>
                  <span className="range__count">{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {!appState.isTouch && (
        <div className={`range__float ${active >= 0 ? 'is-on' : ''}`} ref={float} aria-hidden="true">
          <div className="range__float-inner">
            {categories.map((c, i) => (
              <img key={c.slug} src={img(c.image, 'sm')} alt="" className={i === active ? 'is-on' : ''} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================== STANDARD ============================== */
function Standard() {
  return (
    <section className="section standard">
      <div className="container standard__grid">
        <div className="standard__media">
          <Photo k="atelier" alt="An upholsterer finishing a leather armchair" parallax={0.1} />
          <Photo k="fabric" alt="Close-up of woven upholstery fabric" className="standard__inset" parallax={0.06} sizes="30vw" />
        </div>
        <div className="standard__copy">
          <Label n="06">The Dapoco Standard</Label>
          <h2 className="display display--lg" data-reveal="split">
            <SplitText text="Perfection in" /> <em><SplitText text="every detail." /></em>
          </h2>
          <ol className="process">
            {process.map((p) => (
              <li key={p.n} data-reveal="up">
                <span>{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ========================= SERVICES — ACCORDION ========================= */
function Services() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section services">
      <div className="container">
        <div className="head-row">
          <div>
            <Label n="07">Premium Services</Label>
            <h2 className="display display--xl" data-reveal="split">
              <SplitText text="Sketch to" /> <em><SplitText text="placement." /></em>
            </h2>
          </div>
          <Button to="/services" variant="ghost">
            All Services
          </Button>
        </div>
        <div className="acc">
          {services.map((s, i) => (
            <div key={s.key} className={`acc__item ${open === i ? 'is-open' : ''}`} onPointerEnter={() => !appState.isTouch && setOpen(i)} data-reveal="up">
              <button className="acc__head" onClick={() => setOpen(i)} aria-expanded={open === i} data-cursor="hover">
                <span className="acc__n">0{i + 1}</span>
                <span className="acc__title">{s.title}</span>
                <span className="acc__plus" aria-hidden="true" />
              </button>
              <div className="acc__body">
                <div className="acc__body-inner">
                  <p>{s.long}</p>
                  <img src={img(s.image, 'sm')} alt="" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ SUSTAINABLE ============================ */
function Sustainable() {
  return (
    <section className="sustain">
      <Photo k="wood" alt="Close-up of natural wood grain" className="sustain__bg" reveal={false} parallax={0.15} sizes="100vw" />
      <div className="sustain__shade" />
      <div className="container sustain__inner">
        <Label n="08" className="label--light">Sustainable Luxury</Label>
        <h2 className="display display--xxl" data-reveal="split">
          <SplitText text="Elegance with" /> <em><SplitText text="responsibility." /></em>
        </h2>
        <div className="sustain__row">
          <p data-reveal="up">
            We believe luxury and sustainability can coexist. Our collections feature eco-friendly materials, responsible sourcing, and long-lasting craftsmanship that reduces environmental impact.
          </p>
          <ul className="pill-list" data-reveal="stagger">
            <li>Eco-friendly materials</li>
            <li>Responsible sourcing</li>
            <li>Built to last decades</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ============================== JOURNAL ============================== */
export function JournalCards({ items }) {
  return (
    <div className="journal-grid">
      {items.map((a, i) => (
        <Link to={`/journal/${a.slug}`} className="journal-card" key={a.slug} data-cursor="view" data-reveal="up" data-delay={(i % 3) * 0.08}>
          <div className="journal-card__img">
            <img src={img(a.image, 'sm')} alt="" loading="lazy" />
          </div>
          <div className="journal-card__meta">
            <span>{a.category}</span>
            <span>{a.minutes} min</span>
          </div>
          <h3>{a.title}</h3>
        </Link>
      ))}
    </div>
  );
}

function JournalTeaser() {
  return (
    <section className="section journal-teaser">
      <div className="container">
        <div className="head-row">
          <div>
            <Label n="09">Insights &amp; Inspiration</Label>
            <h2 className="display display--xl" data-reveal="split">
              <SplitText text="The" /> <em><SplitText text="Journal." /></em>
            </h2>
          </div>
          <Button to="/journal" variant="ghost">
            All Articles
          </Button>
        </div>
        <JournalCards items={articles.slice(0, 3)} />
      </div>
    </section>
  );
}

export default function Home() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  return (
    <div ref={ref} className="home">
      <Hero />
      <Statement />
      <CollectionStack />
      <Showroom />
      <MaterialStudio />
      <Range />
      <Marquee items={whyDapoco} speed={60} className="marquee--why" />
      <Standard />
      <Services />
      <Sustainable />
      <JournalTeaser />
    </div>
  );
}
