import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { articles, findArticle } from '../data/journal';
import { Button, Photo, useReveals, useFontsRefresh } from '../components/ui';
import { PageHero } from './About';
import NotFound from './NotFound';

export default function Article() {
  const { slug } = useParams();
  const a = findArticle(slug);
  const ref = useRef(null);
  useReveals(ref, [slug]);
  useFontsRefresh();
  if (!a) return <NotFound />;
  const next = articles[(articles.indexOf(a) + 1) % articles.length];
  return (
    <div ref={ref}>
      <PageHero label={a.category} title={a.title}>
        <p className="page-hero__count" data-reveal="up" data-delay="0.4" data-immediate>
          {a.minutes} min read · Dapoco Journal
        </p>
      </PageHero>
      <Photo k={a.image} alt={a.title} className="banner" parallax={0.1} sizes="100vw" eager />
      <section className="section">
        <article className="container article">
          <p className="lead" data-reveal="up">
            {a.excerpt}
          </p>
          {a.body.map((p, i) => (
            <p key={i} data-reveal="up">
              {p}
            </p>
          ))}
          <div className="article__cta" data-reveal="up">
            <Button to="/contact?type=consultation">Book a Consultation</Button>
            <Link to="/journal" className="link-u" data-cursor="hover">
              ← All articles
            </Link>
          </div>
        </article>
      </section>
      <section className="section section--tight">
        <Link to={`/journal/${next.slug}`} className="container next-article" data-cursor="view">
          <span>Next article</span>
          <strong className="display display--lg">{next.title}</strong>
        </Link>
      </section>
    </div>
  );
}
