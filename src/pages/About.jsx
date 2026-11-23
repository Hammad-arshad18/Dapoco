import { useRef } from 'react';
import { company, vision, mission, values, team } from '../data/site';
import { Button, Label, ModelView, Photo, SplitText, useReveals, useFontsRefresh, Marquee } from '../components/ui';

export function PageHero({ label, title, em, text, scene, children }) {
  return (
    <section className={`page-hero ${scene ? 'page-hero--model' : ''}`}>
      <div className="container page-hero__grid">
        <div className="page-hero__copy">
          <Label>{label}</Label>
          <h1 className="display page-hero__title" data-reveal="split" data-immediate>
            <SplitText text={title} />
            {em && (
              <>
                {' '}
                <em>
                  <SplitText text={em} />
                </em>
              </>
            )}
          </h1>
          {text && (
            <p className="lead" data-reveal="up" data-delay="0.3" data-immediate>
              {text}
            </p>
          )}
          {children}
        </div>
        {scene && (
          <div className="page-hero__model" data-reveal="fade" data-immediate>
            <ModelView scene={scene} />
          </div>
        )}
      </div>
    </section>
  );
}

export default function About() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  return (
    <div ref={ref}>
      <PageHero
        label="About Dapoco"
        title="Crafting luxury through"
        em="design, detail & distinction."
        text={`A premier provider of luxury furniture solutions in Dubai — curated collections and bespoke interior furnishings for elite residential, corporate and hospitality environments since ${company.founded}.`}
      />
      <Photo k="dubai" alt="Dubai skyline at dusk" className="banner" parallax={0.12} sizes="100vw" eager />

      <section className="section">
        <div className="container two-col">
          <Label n="01">Our story</Label>
          <div className="prose">
            <p className="lead" data-reveal="up">
              Dapoco Furnitures Trading LLC is dedicated to sourcing and delivering pieces that embody elegance, sophistication, and enduring quality.
            </p>
            <p data-reveal="up">
              We collaborate with world-renowned manufacturers, artisans, and design houses to bring exceptional craftsmanship and timeless beauty to every project. From penthouses to executive boardrooms to five-star hotels, Dapoco elevates spaces with precision, artistry, and distinction.
            </p>
            <p data-reveal="up">We don’t just supply furniture — we help shape spaces that inspire comfort, creativity, and connection.</p>
          </div>
        </div>
        <div className="container">
          <blockquote className="quote" data-scrub-words>
            <SplitText text="“Luxury is not merely visual —" /> <em><SplitText text="it is an experience.”" /></em>
          </blockquote>
        </div>
      </section>

      <section className="section vm">
        <div className="container vm__grid">
          <article className="vm__card">
            <Label n="02" className="label--light">Our vision</Label>
            <p className="display display--md" data-reveal="up">
              {vision}
            </p>
          </article>
          <article className="vm__card">
            <Label n="03" className="label--light">Our mission</Label>
            <ul className="check-list" data-reveal="stagger">
              {mission.map((m, i) => (
                <li key={m}>
                  <span>0{i + 1}</span>
                  {m}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="04">Our values</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="Six principles," /> <em><SplitText text="one standard." /></em>
              </h2>
            </div>
          </div>
          <div className="values-grid" data-reveal="stagger">
            {values.map((v, i) => (
              <article className="value-card" key={v.title}>
                <span className="value-card__n">0{i + 1}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Marquee items={['Unmatched craftsmanship', 'Design excellence', 'Client-centric luxury', 'Integrity & discretion', 'Sustainable luxury']} speed={50} className="marquee--why" />

      <section className="section">
        <div className="container standard__grid">
          <div className="standard__media">
            <Photo k="carving" alt="Artisan carving wood by hand" parallax={0.1} />
            <Photo k="fabric" alt="Woven upholstery fabric detail" className="standard__inset" parallax={0.06} sizes="30vw" />
          </div>
          <div className="standard__copy">
            <Label n="05">The Dapoco Standard</Label>
            <p className="display display--md" data-scrub-words>
              <SplitText text="Luxury is not a trend — it is our foundation. Every project is approached with meticulous attention to detail, from concept to completion." />
            </p>
            <p className="body" data-reveal="up" style={{ marginTop: '2rem' }}>
              Our clients trust us because we deliver excellence without compromise.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="06">Our team</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="Passionate" /> <em><SplitText text="professionals." /></em>
              </h2>
            </div>
            <p className="body" data-reveal="up">
              Procurement specialists, designers, consultants and logistics experts — all dedicated to delivering excellence and exceptional value.
            </p>
          </div>
          <div className="team-grid" data-reveal="stagger">
            {team.map((t, i) => (
              <article className="team-card" key={t.role}>
                <span className="team-card__n">0{i + 1}</span>
                <h3>{t.role}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container credentials__grid">
          <div>
            <Label n="07">Credentials</Label>
            <h2 className="display display--lg" data-reveal="split">
              <SplitText text="Rooted &" /> <em><SplitText text="established in Dubai." /></em>
            </h2>
          </div>
          <dl className="cred-list" data-reveal="stagger">
            <div>
              <dt>Registered name</dt>
              <dd>{company.legalName}</dd>
            </div>
            <div>
              <dt>Trade name (Arabic)</dt>
              <dd className="arabic">{company.arabicName}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{company.location}</dd>
            </div>
            <div>
              <dt>Legal form</dt>
              <dd>{company.legalType}</dd>
            </div>
            <div>
              <dt>Established</dt>
              <dd>July {company.founded}</dd>
            </div>
          </dl>
        </div>
        <div className="container center" style={{ marginTop: '5rem' }}>
          <Button to="/collections">Explore our collections</Button>
        </div>
      </section>
    </div>
  );
}
