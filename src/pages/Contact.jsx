import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { company } from '../data/site';
import { Button, Photo, useReveals, useFontsRefresh } from '../components/ui';
import { PageHero } from './About';

const TYPES = [
  { key: 'consultation', label: 'Book a consultation' },
  { key: 'quote', label: 'Request a quote' },
  { key: 'bespoke', label: 'Bespoke commission' },
  { key: 'general', label: 'General enquiry' },
];
const PROJECTS = ['Residential', 'Corporate / Office', 'Hospitality', 'Other'];

/* NOTE: no server yet — the form composes an email in the visitor's mail app.
   Swap `submit` for a fetch() to a form backend when one is chosen. */
export default function Contact() {
  const ref = useRef(null);
  useReveals(ref);
  useFontsRefresh();
  const [params] = useSearchParams();
  const initialType = TYPES.find((t) => t.key === params.get('type'))?.key || 'consultation';
  const prefill = useMemo(() => {
    const parts = [];
    if (params.get('category')) parts.push(`Collection: ${params.get('category')}`);
    if (params.get('item')) parts.push(`Product: ${params.get('item')}`);
    if (params.get('spec')) parts.push(`Specification: ${params.get('spec')}`);
    return parts.length ? `${parts.join('\n')}\n\n` : '';
  }, [params]);

  const [type, setType] = useState(initialType);
  const [project, setProject] = useState('Residential');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();
    const errs = {};
    if (!name) errs.name = 'Please tell us your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email';
    if (message.length < 10) errs.message = 'A few more details help us prepare';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const typeLabel = TYPES.find((t) => t.key === type).label;
    const body = [`Enquiry: ${typeLabel}`, `Project type: ${project}`, `Name: ${name}`, `Email: ${email}`, '', message, file ? `\n[Attachment to include: ${file.name}]` : '']
      .filter((l) => l !== false && l !== undefined)
      .join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(`${typeLabel} — ${name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div ref={ref}>
      <PageHero
        label="Contact"
        title="Begin your luxury"
        em="furnishing journey."
        text="Our team is ready to assist with your high-end residential, corporate, or hospitality project."
      />
      <section className="section section--tight">
        <div className="container contact">
          <form className="form" onSubmit={submit} noValidate data-reveal="up">
            {sent ? (
              <div className="form__sent">
                <h2 className="display display--md">
                  Thank you — <em>your message is ready.</em>
                </h2>
                <p>
                  Your email app should have opened with your enquiry pre-filled. Simply press send{file ? ` and attach “${file.name}”` : ''}. If nothing opened, write to us at{' '}
                  <a href={`mailto:${company.email}`}>{company.email}</a>.
                </p>
                <Button onClick={() => setSent(false)} variant="ghost">
                  Edit my enquiry
                </Button>
              </div>
            ) : (
              <>
                <fieldset className="form__chips">
                  <legend>I would like to</legend>
                  {TYPES.map((t) => (
                    <label key={t.key} className={`chip ${type === t.key ? 'is-active' : ''}`} data-cursor="hover">
                      <input type="radio" name="type" value={t.key} checked={type === t.key} onChange={() => setType(t.key)} />
                      {t.label}
                    </label>
                  ))}
                </fieldset>
                <fieldset className="form__chips">
                  <legend>Project type</legend>
                  {PROJECTS.map((p) => (
                    <label key={p} className={`chip ${project === p ? 'is-active' : ''}`} data-cursor="hover">
                      <input type="radio" name="project" value={p} checked={project === p} onChange={() => setProject(p)} />
                      {p}
                    </label>
                  ))}
                </fieldset>
                <div className="form__row">
                  <label className={`field ${errors.name ? 'has-error' : ''}`}>
                    <input name="name" placeholder=" " autoComplete="name" />
                    <span>Full name *</span>
                    {errors.name && <small>{errors.name}</small>}
                  </label>
                  <label className={`field ${errors.email ? 'has-error' : ''}`}>
                    <input name="email" type="email" placeholder=" " autoComplete="email" />
                    <span>Email *</span>
                    {errors.email && <small>{errors.email}</small>}
                  </label>
                </div>
                <label className={`field ${errors.message ? 'has-error' : ''}`}>
                  <textarea name="message" rows={5} placeholder=" " defaultValue={prefill} />
                  <span>Tell us about your project *</span>
                  {errors.message && <small>{errors.message}</small>}
                </label>
                <label className="file" data-cursor="hover">
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <span className="file__icon">+</span>
                  <span>{file ? file.name : 'Attach floor plans, mood boards or references (optional)'}</span>
                </label>
                <div className="form__submit">
                  <Button type="submit">Send enquiry</Button>
                  <p className="form__note">We respond discreetly and personally. Your details are used only to reply to you.</p>
                </div>
              </>
            )}
          </form>

          <aside className="contact__info" data-reveal="up" data-delay="0.15">
            <Photo k="lobby" alt="A calm, contemporary lounge interior" className="contact__photo" sizes="(max-width: 900px) 100vw, 35vw" />
            <div className="info-block">
              <span>Email</span>
              <a href={`mailto:${company.email}`} className="display display--sm" data-cursor="hover">
                {company.email}
              </a>
            </div>
            <div className="info-block">
              <span>Studio</span>
              <p className="display display--sm">{company.location}</p>
              <p className="arabic" style={{ textAlign: 'left', color: 'var(--mute)' }}>
                {company.arabicName}
              </p>
            </div>
            <div className="info-block">
              <span>We assist with</span>
              <ul className="pill-list">
                <li>Luxury residences</li>
                <li>Executive offices</li>
                <li>Hotels &amp; resorts</li>
                <li>Restaurants &amp; cafés</li>
                <li>Bespoke pieces</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
