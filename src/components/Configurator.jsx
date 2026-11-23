import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { View } from '@react-three/drei';
import { ConfiguratorScene } from '../three/Configurator';
import { useDragRotate } from '../three/Stage';
import { PIECES, PIECE_MAP, PALETTES, STUDIO_CATEGORIES, thumb, finishOf, defaultFinishes, specText } from '../data/pieces';
import zoneHex from '../data/zoneHex.json';
import { Button } from './ui';
import { appState } from '../three/store';

const pad = (n) => String(n).padStart(2, '0');

/* Big serif name that rolls in letter by letter whenever the piece changes */
function RollName({ text, className = '' }) {
  return (
    <span className={`roll ${className}`} key={text} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span key={i} className="roll__c" style={{ '--i': i }} aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  );
}

function Swatches({ zone, value, onPick }) {
  const pal = PALETTES[zone.type];
  const orig = zoneHex[zone.mats[0]] || '#8a7560';
  const current = finishOf(zone, value);
  return (
    <div className="options__group">
      <div className="options__label">
        <span>
          {zone.label} <small>· {pal.label}</small>
        </span>
        <em key={current.key} className="options__value">
          {current.key === 'original' ? `${current.name} finish` : current.name}
        </em>
      </div>
      <div className="swatches" role="radiogroup" aria-label={zone.label}>
        {pal.items.map((f) => (
          <button
            key={f.key}
            type="button"
            role="radio"
            aria-checked={f.key === current.key}
            aria-label={f.key === 'original' ? `${f.name} (original)` : f.name}
            title={f.key === 'original' ? 'Signature (original)' : f.name}
            className={`swatch swatch--${zone.type} ${f.key === 'original' ? 'swatch--orig' : ''} ${f.key === current.key ? 'is-active' : ''}`}
            style={{ '--sw': f.color || orig }}
            onClick={(e) => onPick(f.key, e)}
            data-cursor="hover"
          />
        ))}
      </div>
    </div>
  );
}

/* Burst of rings from a clicked swatch — a small tactile flourish */
function burst(e) {
  if (appState.reducedMotion) return;
  const r = e.currentTarget.getBoundingClientRect();
  const el = document.createElement('i');
  el.className = 'swatch-burst';
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top + r.height / 2}px`;
  el.style.setProperty('--sw', getComputedStyle(e.currentTarget).getPropertyValue('--sw'));
  document.body.appendChild(el);
  gsap.fromTo(el, { scale: 0.4, opacity: 0.9 }, { scale: 3.2, opacity: 0, duration: 0.9, ease: 'expo.out', onComplete: () => el.remove() });
}

function parseUrl() {
  const p = new URLSearchParams(window.location.search);
  const piece = PIECE_MAP[p.get('piece')];
  if (!piece) return null;
  const fin = defaultFinishes(piece);
  (p.get('f') || '').split(',').forEach((kv) => {
    const [k, v] = kv.split(':');
    if (k in fin && v) fin[k] = v;
  });
  return { piece, fin };
}

/**
 * Live 3D configurator.
 * variant="full"    → the Studio page (catalogue grid with filters, URL sync)
 * variant="compact" → home-page section (horizontal piece rail)
 */
export default function Configurator({ variant = 'full', initial = 'mid_century_lounge_chair', children }) {
  const full = variant === 'full';
  const start = useMemo(() => (full && parseUrl()) || { piece: PIECE_MAP[initial], fin: defaultFinishes(PIECE_MAP[initial]) }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [piece, setPiece] = useState(start.piece);
  const [all, setAll] = useState({ [start.piece.id]: start.fin });
  const [cat, setCat] = useState('all');
  const [copied, setCopied] = useState(false);
  const drag = useDragRotate(0);
  const railRef = useRef(null);

  const finishes = all[piece.id] || defaultFinishes(piece);
  const list = cat === 'all' ? PIECES : PIECES.filter((p) => p.cat === cat);
  const index = PIECES.indexOf(piece);
  const spec = specText(piece, finishes);

  const choose = useCallback(
    (p) => {
      setPiece(p);
      setAll((a) => (a[p.id] ? a : { ...a, [p.id]: defaultFinishes(p) }));
    },
    [setPiece],
  );
  const step = (d) => choose(PIECES[(index + d + PIECES.length) % PIECES.length]);
  const pick = (zoneKey, key, e) => {
    burst(e);
    setAll((a) => ({ ...a, [piece.id]: { ...finishes, [zoneKey]: key } }));
  };
  const surprise = () => {
    const p = PIECES[(index + 1 + Math.floor(Math.random() * (PIECES.length - 1))) % PIECES.length];
    const fin = Object.fromEntries(
      p.zones.map((zn) => {
        const items = PALETTES[zn.type].items;
        return [zn.key, items[1 + Math.floor(Math.random() * (items.length - 1))].key];
      }),
    );
    setPiece(p);
    setAll((a) => ({ ...a, [p.id]: fin }));
  };
  const reset = () => setAll((a) => ({ ...a, [piece.id]: Object.fromEntries(piece.zones.map((zn) => [zn.key, 'original'])) }));

  // keep the URL shareable on the Studio page (replaceState: no route transition)
  useEffect(() => {
    if (!full) return;
    const f = piece.zones.map((zn) => `${zn.key}:${finishes[zn.key]}`).join(',');
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?piece=${piece.id}&f=${f}`);
  }, [full, piece, finishes]);

  // keep the active thumbnail in view
  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.querySelector('.is-active');
    if (!rail || !el) return;
    const horizontal = rail.scrollWidth > rail.clientWidth + 4;
    const behavior = appState.reducedMotion ? 'auto' : 'smooth';
    if (horizontal) rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior });
    else rail.scrollTo({ top: el.offsetTop - rail.clientHeight / 2 + el.clientHeight / 2, behavior });
  }, [piece, cat]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  };

  const catalogue = (
    <div className={`cfg__catalogue ${full ? 'cfg__catalogue--grid' : 'cfg__catalogue--rail'}`}>
      {full && (
        <div className="cfg__filters" role="tablist" aria-label="Filter pieces">
          {STUDIO_CATEGORIES.map((c) => (
            <button key={c.key} type="button" role="tab" aria-selected={cat === c.key} className={`chip ${cat === c.key ? 'is-active' : ''}`} onClick={() => setCat(c.key)} data-cursor="hover">
              {c.label}
              <sup>{c.key === 'all' ? PIECES.length : PIECES.filter((p) => p.cat === c.key).length}</sup>
            </button>
          ))}
        </div>
      )}
      <div className="cfg__thumbs" ref={railRef} data-lenis-prevent>
        {list.map((p) => (
          <button key={p.id} type="button" className={`cfg__thumb ${p.id === piece.id ? 'is-active' : ''}`} onClick={() => choose(p)} aria-pressed={p.id === piece.id} data-cursor="hover">
            <span className="cfg__thumb-n">{pad(PIECES.indexOf(p) + 1)}</span>
            <img src={thumb(p.id)} alt="" loading="lazy" decoding="async" width="160" height="160" />
            <span className="cfg__thumb-name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`cfg cfg--${variant}`}>
      {full && <aside className="cfg__side">{catalogue}</aside>}
      {children && <div className="cfg__intro">{children}</div>}
      <div className="cfg__stage" {...drag.bind} data-cursor="drag" tabIndex={0} onKeyDown={onKey} aria-label={`${piece.name}, 3D view. Use arrow keys to change piece.`}>
        <div className="cfg__ghost" aria-hidden="true">
          <RollName text={piece.name.split(' ')[0]} />
        </div>
        <View className="cfg__view">
          <ConfiguratorScene piece={piece} finishes={finishes} drag={drag} />
        </View>
        <div className="cfg__count" aria-hidden="true">
          <span key={index} className="cfg__count-n">{pad(index + 1)}</span>
          <span>/ {PIECES.length}</span>
        </div>
        <div className="cfg__arrows">
          <button type="button" onClick={() => step(-1)} aria-label="Previous piece" data-cursor="hover">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next piece" data-cursor="hover">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <span className="model-view__hint" aria-hidden="true">
          <i />
          Drag to rotate · {full && !appState.isTouch ? '← → to browse' : '3D'}
        </span>
      </div>

      <div className="cfg__panel">
        <div className="cfg__head">
          <p className="cfg__cat">{STUDIO_CATEGORIES.find((c) => c.key === piece.cat)?.label}</p>
          <h3 className="cfg__name">
            <RollName text={piece.name} />
          </h3>
          <p className="cfg__blurb" key={piece.id}>
            {piece.blurb}
          </p>
        </div>
        {!full && catalogue}
        <div className="options" key={`o-${piece.id}`}>
          {piece.zones.map((zn) => (
            <Swatches key={zn.key} zone={zn} value={finishes[zn.key]} onPick={(k, e) => pick(zn.key, k, e)} />
          ))}
        </div>
        <div className="spec">
          <span>Your specification</span>
          <p>{spec}</p>
        </div>
        <div className="cfg__actions">
          <Button to={`/contact?type=bespoke&item=${encodeURIComponent(piece.name)}&spec=${encodeURIComponent(spec)}`}>Commission This Piece</Button>
          {full ? (
            <div className="cfg__tools">
              <button type="button" className="text-btn" onClick={surprise} data-cursor="hover">Surprise me</button>
              <button type="button" className="text-btn" onClick={reset} data-cursor="hover">Reset finishes</button>
              <button type="button" className="text-btn" onClick={copy} data-cursor="hover">{copied ? 'Link copied ✓' : 'Copy link'}</button>
            </div>
          ) : (
            <Link to={`/studio?piece=${piece.id}&f=${piece.zones.map((zn) => `${zn.key}:${finishes[zn.key]}`).join(',')}`} className="text-btn" data-cursor="hover">
              Open the full studio — {PIECES.length} pieces →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
