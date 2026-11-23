import { useRef } from 'react';
import { services, process } from '../data/site';
import { Button, Label, Photo, SplitText, useReveals, useFontsRefresh } from '../components/ui';
import { PageHero } from './About';

export default function Services() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  return (
    <div ref={ref}>
      <PageHero
        label="Premium services"
        title="Precision, care &"
        em="uncompromising service."
        text="From global sourcing to white-glove installation and dedicated after-care — every step executed with precision and care."
        scene="office"
      >
        <div className="page-hero__ctas" data-reveal="up" data-delay="0.4" data-immediate>
          <Button to="/contact?type=consultation">Request a Consultation</Button>
        </div>
      </PageHero>

      <section className="section">
        <div className="container service-rows">
          {services.map((s, i) => (
            <article className="service-row" key={s.key}>
              <Photo k={s.image} alt={s.title} className="service-row__media" parallax={0.08} sizes="(max-width: 900px) 100vw, 50vw" />
              <div className="service-row__body">
                <span className="service-row__n">0{i + 1} / 05</span>
                <h2 className="display display--lg" data-reveal="split">
                  <SplitText text={s.title} />
                </h2>
                <p className="lead" data-reveal="up">
                  {s.text}
                </p>
                <p data-reveal="up">{s.long}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="head-row">
            <div>
              <Label n="06">How we work</Label>
              <h2 className="display display--xl" data-reveal="split">
                <SplitText text="Consultation to" /> <em><SplitText text="installation." /></em>
              </h2>
            </div>
          </div>
          <ol className="timeline" data-reveal="stagger">
            {process.map((p) => (
              <li key={p.n}>
                <span className="timeline__n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
