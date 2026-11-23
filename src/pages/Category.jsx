import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories, findCategory } from '../data/products';
import { Button, Label, Photo, SplitText, useReveals, useFontsRefresh } from '../components/ui';
import { PageHero } from './About';
import NotFound from './NotFound';

export default function Category() {
  const { slug } = useParams();
  const cat = findCategory(slug);
  const ref = useRef(null);
  useReveals(ref, [slug]);
  useFontsRefresh();
  if (!cat) return <NotFound />;
  const idx = categories.indexOf(cat);
  const prev = categories[(idx - 1 + categories.length) % categories.length];
  const next = categories[(idx + 1) % categories.length];
  const count = cat.groups.reduce((s, g) => s + g.items.length, 0);
  const quote = `/contact?type=quote&category=${encodeURIComponent(cat.title)}`;

  return (
    <div ref={ref}>
      <PageHero label={`Collection ${cat.n} / 10`} title={cat.title} text={cat.intro} scene={cat.scene}>
        <p className="page-hero__tag" data-reveal="up" data-delay="0.4" data-immediate>
          {cat.tagline}
        </p>
        <div className="page-hero__ctas" data-reveal="up" data-delay="0.5" data-immediate>
          <Button to={quote}>Request a Quote</Button>
          <span className="page-hero__count">
            {cat.groups.length} {cat.groups.length === 1 ? 'family' : 'families'} · {count} product lines
          </span>
        </div>
      </PageHero>

      <Photo k={cat.banner} alt={cat.title} className="banner" parallax={0.1} sizes="100vw" />

      <section className="section">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="01">Highlights</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="Signature" /> <em><SplitText text="pieces." /></em>
              </h2>
            </div>
          </div>
          <div className="highlight-grid" data-reveal="stagger">
            {cat.highlights.map((h, i) => (
              <article className="highlight-card" key={h.title}>
                <span className="highlight-card__n">0{i + 1}</span>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="02">Product range</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="Explore the" /> <em><SplitText text="range." /></em>
              </h2>
            </div>
          </div>
          <div className="groups">
            {cat.groups.map((g) => (
              <div className="group" key={g.name} data-reveal="up">
                <div className="group__head">
                  <h3 className="display display--sm">{g.name}</h3>
                  <span>{g.items.length} lines</span>
                </div>
                <ul className="group__items">
                  {g.items.map((item) => (
                    <li key={item}>
                      <Link to={`/contact?type=quote&category=${encodeURIComponent(cat.title)}&item=${encodeURIComponent(item)}`} data-cursor="hover">
                        <span>{item}</span>
                        <em>Enquire ↗</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section quote-band">
        <div className="container">
          <div className="quote-band__inner" data-reveal="up">
            <div>
              <Label className="label--light">Bespoke on request</Label>
              <h2 className="display display--lg">
                A size, finish or quantity <em>you don’t see here?</em>
              </h2>
            </div>
            <Button to={quote} variant="bone">
              Request a Quote
            </Button>
          </div>
        </div>
      </section>

      <nav className="cat-pager container" aria-label="More collections">
        <Link to={`/collections/${prev.slug}`} data-cursor="hover">
          <span>← Previous</span>
          <strong>{prev.title}</strong>
        </Link>
        <Link to="/collections" className="cat-pager__all" data-cursor="hover">
          All collections
        </Link>
        <Link to={`/collections/${next.slug}`} className="cat-pager__next" data-cursor="hover">
          <span>Next →</span>
          <strong>{next.title}</strong>
        </Link>
      </nav>
    </div>
  );
}
