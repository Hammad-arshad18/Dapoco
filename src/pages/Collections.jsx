import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { luxuryCollections } from '../data/site';
import { categories, totalProducts } from '../data/products';
import { img } from '../data/credits';
import { Label, Photo, SplitText, useReveals, useFontsRefresh } from '../components/ui';
import { PageHero } from './About';

function Search() {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const out = [];
    categories.forEach((c) =>
      c.groups.forEach((g) =>
        g.items.forEach((item) => {
          if (item.toLowerCase().includes(term) || g.name.toLowerCase().includes(term)) out.push({ item, group: g.name, cat: c });
        }),
      ),
    );
    return out.slice(0, 40);
  }, [q]);
  return (
    <div className="search" data-reveal="up" data-delay="0.45" data-immediate>
      <label className="search__field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="m20 20-4-4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <input type="search" placeholder={`Search ${totalProducts}+ product lines — “sofa”, “banquet”, “wardrobe”…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      </label>
      {q.trim().length >= 2 && (
        <div className="search__results" role="list" data-lenis-prevent>
          {results.length === 0 && <p className="search__empty">No matches — but we source to order. Ask us about it.</p>}
          {results.map((r, i) => (
            <Link key={i} to={`/collections/${r.cat.slug}`} className="search__hit" role="listitem" data-cursor="hover">
              <span>{r.item}</span>
              <em>
                {r.cat.title} · {r.group}
              </em>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Collections() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  return (
    <div ref={ref}>
      <PageHero
        label="Collections"
        title="Curated for elite homes,"
        em="offices & five-star hospitality."
        text="Meticulously selected to embody luxury, craftsmanship and timeless design — explore our complete range for residential, commercial, hospitality and bespoke environments."
      >
        <Search />
      </PageHero>

      <section className="section section--tight">
        <div className="container">
          <Label n="01">Signature collections</Label>
          <div className="lux-grid">
            {luxuryCollections.map((c, i) => (
              <Link to={c.link} className="lux-card" key={c.key} data-cursor="view">
                <Photo k={c.image} alt={c.title} sizes="(max-width: 900px) 100vw, 50vw" delay={(i % 2) * 0.1} />
                <div className="lux-card__body">
                  <span className="lux-card__n">0{i + 1}</span>
                  <h3 className="display display--md">{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="02">Product categories</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="The complete" /> <em><SplitText text="range." /></em>
              </h2>
            </div>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => {
              const count = c.groups.reduce((s, g) => s + g.items.length, 0);
              return (
                <Link to={`/collections/${c.slug}`} className="cat-card" key={c.slug} data-cursor="view" data-reveal="up" data-delay={(i % 3) * 0.08}>
                  <div className="cat-card__img">
                    <img src={img(c.image, 'sm')} alt={c.title} loading="lazy" />
                  </div>
                  <div className="cat-card__row">
                    <h3>{c.title}</h3>
                    <span className="cat-card__n">{c.n}</span>
                  </div>
                  <p>
                    {c.tagline} · {count} lines
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
