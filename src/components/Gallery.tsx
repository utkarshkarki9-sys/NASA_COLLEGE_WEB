import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';
import { photos } from '../data';
import { api } from '../lib/api';
import { OptimizedImage, SectionTitle, ArrowLink, Loading } from './UI';

export default function Gallery({ preview = false }: { preview?: boolean }) {
  const [images, setImages] = useState(photos);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(!preview);
  const close = useCallback(() => setSelected(null), []);
  const move = useCallback((direction: number) => setSelected(current => current === null ? null : (current + direction + images.length) % images.length), [images.length]);
  useEffect(() => { let active = true; api<typeof photos>('/gallery').then(data => { if (active && Array.isArray(data)) { setSelected(null); setImages(data); } }).catch(() => {}).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  useEffect(() => {
    if (selected === null) return;
    const before = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeButton = document.querySelector<HTMLElement>('.lightbox-close'); closeButton?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'Tab') {
        const buttons = Array.from(document.querySelectorAll<HTMLElement>('.lightbox button'));
        if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); before?.focus(); };
  }, [selected === null, close, move]);
  const shown = preview ? images.slice(0, 6) : images;
  return <section className={`gallery-section ${preview ? '' : 'page'} container`}><SectionTitle level={preview ? "h2" : "h1"} label="THE PEOPLE. THE PROJECTS. THE POSSIBILITIES." title={preview ? 'A universe of memories.' : 'MOMENTS THAT MATTER.'}>{preview ? <ArrowLink to="/gallery">Explore the gallery</ArrowLink> : <span className="mono muted">{images.length} REAL EVENT MOMENTS</span>}</SectionTitle><p className="section-intro">Not just a hackathon. A community of minds that dare to ask “what if?”</p>{loading ? <Loading text="Opening the photo archive…" /> : <div className="gallery-grid">{shown.map((image, index) => <button className="gallery-item" key={image.path} onClick={() => setSelected(index)} aria-label={`Open photo ${index + 1}: ${image.caption}`}><OptimizedImage src={image.path} alt={image.caption} /><span className="gallery-caption"><span>{image.caption}</span><Expand size={17} /></span><span className="photo-number">{String(index + 1).padStart(2, '0')}</span></button>)}</div>}{selected !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Event photo gallery" onClick={event => { if (event.currentTarget === event.target) close(); }}><button className="lightbox-close icon-button" onClick={close} aria-label="Close photo"><X /></button><button className="lightbox-prev icon-button" onClick={() => move(-1)} aria-label="Previous photo"><ArrowLeft /></button><figure><img src={images[selected].path} alt={images[selected].caption} /><figcaption aria-live="polite">{images[selected].caption}<span>{selected + 1} / {images.length}</span></figcaption></figure><button className="lightbox-next icon-button" onClick={() => move(1)} aria-label="Next photo"><ArrowRight /></button></div>}</section>;
}
