import { useRef } from 'react';
import { articles } from '../data/journal';
import { useReveals, useFontsRefresh } from '../components/ui';
import { JournalCards } from './Home';
import { PageHero } from './About';

export default function Journal() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  return (
    <div ref={ref}>
      <PageHero
        label="Insights & inspiration"
        title="The Dapoco"
        em="Journal."
        text="Luxury interior trends, craftsmanship and materials, hospitality design, executive spaces and sustainability — perspectives from our team."
      />
      <section className="section section--tight">
        <div className="container">
          <JournalCards items={articles} />
        </div>
      </section>
    </div>
  );
}
