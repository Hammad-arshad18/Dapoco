import { useRef } from 'react';
import Configurator from '../components/Configurator';
import { Button, Label, SplitText, useReveals, useFontsRefresh } from '../components/ui';
import { PIECES, PALETTES } from '../data/pieces';
import { preloadModels } from '../three/Model';

const finishCount = Object.values(PALETTES).reduce((n, p) => n + p.items.length - 1, 0);

const STEPS = [
  { n: '01', t: 'Compose', d: 'Choose a piece and dress every part of it — upholstery, frame, top, base — from our material library.' },
  { n: '02', t: 'Sample', d: 'We courier physical swatches of your chosen leathers, fabrics, woods and stones to you in Dubai.' },
  { n: '03', t: 'Craft', d: 'Your piece is made to order and can be resized to the centimetre for your space.' },
  { n: '04', t: 'Deliver', d: 'White-glove delivery and installation, followed by dedicated after-care.' },
];

export default function Studio() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  preloadModels([PIECES[0].id]);
  return (
    <div ref={ref} className="studio-page">
      <section className="studio-hero container">
        <Label>The Dapoco Studio</Label>
        <h1 className="display studio-hero__title" data-reveal="split" data-immediate>
          <SplitText text="Compose your" /> <em><SplitText text="piece." /></em>
        </h1>
        <div className="studio-hero__meta" data-reveal="stagger" data-immediate>
          <p><strong>{PIECES.length}</strong> pieces in true 3D</p>
          <p><strong>{Object.keys(PALETTES).length}</strong> material families</p>
          <p><strong>{finishCount}</strong> finishes</p>
          <p className="studio-hero__note">Every piece is modelled at true scale with real material textures. Every change renders live, the way it will be made.</p>
        </div>
      </section>

      <section className="studio-app">
        <Configurator variant="full" />
      </section>

      <section className="section">
        <div className="container">
          <div className="head-row">
            <h2 className="display display--lg" data-reveal="split">
              <SplitText text="From screen" /> <em><SplitText text="to showroom." /></em>
            </h2>
            <Button to="/contact?type=bespoke" variant="ghost">Talk to a designer</Button>
          </div>
          <ol className="studio-steps" data-reveal="stagger">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span>{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
