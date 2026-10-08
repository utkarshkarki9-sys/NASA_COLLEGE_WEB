import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, LoaderCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ArrowLink({ to, children, primary = false, className = '' }: { to: string; children: ReactNode; primary?: boolean; className?: string }) { return <Link className={`button ${primary ? 'primary' : 'secondary'} ${className}`} to={to}>{children}<ArrowUpRight size={17} /></Link>; }
export function Eyebrow({ children }: { children: ReactNode }) { return <div className="eyebrow"><span />{children}</div>; }
export function SectionTitle({ label, title, children, level = 'h2' }: { label: string; title: string; children?: ReactNode; level?: 'h1' | 'h2' }) { const Heading = level; return <div className="section-heading"><div><Eyebrow>{label}</Eyebrow><Heading>{title}</Heading></div>{children}</div>; }
export function Loading({ text = 'Preparing your mission…' }: { text?: string }) { return <div className="loading" role="status"><div className="loading-orbit"><span /><LoaderCircle size={25} /></div><p>{text}</p></div>; }
export function Notice({ children, success = false }: { children: ReactNode; success?: boolean }) { return <div className={`notice ${success ? 'success' : ''}`} role={success ? 'status' : 'alert'}>{children}</div>; }
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = document.querySelector<HTMLElement>('.modal-panel');
    dialog?.querySelector<HTMLElement>('button,input')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialog) {
        const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a,input,select,textarea,[tabindex="0"]'));
        if (!elements.length) return;
        if (event.shiftKey && document.activeElement === elements[0]) { event.preventDefault(); elements[elements.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === elements[elements.length - 1]) { event.preventDefault(); elements[0].focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = oldOverflow; previous?.focus(); };
  }, [onClose]);
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-panel" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X /></button></div>{children}</div></div>;
}
export function OptimizedImage({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [fallback, setFallback] = useState(false);
  return <img className={className} src={fallback ? src : `/.netlify/images?url=${encodeURIComponent(src)}&w=960&fm=webp&q=85`} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFallback(true)} />;
}
