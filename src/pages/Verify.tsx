import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Camera, CameraOff, ArrowRight, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../components/Auth';
import { Eyebrow, Loading, Notice } from '../components/UI';
import { api } from '../lib/api';
import { event } from '../data';

export default function Verify() {
  const { token } = useParams();
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);
  const navigate = useNavigate();
  const stop = useCallback(() => { cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; setScanning(false); }, []);
  const extract = (input: string) => { let reference = input.trim(); try { if (/^https?:\/\//.test(reference)) reference = new URL(reference).pathname.split('/verify/')[1] || ''; else if (reference.startsWith('/verify/')) reference = reference.slice(8); } catch { return null; } return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reference) ? reference : null; };
  useEffect(() => { if (!token) return; let active = true; setLoading(true); setError(''); setMessage(''); setRecord(null); api(`/verify/${encodeURIComponent(token)}`).then(data => { if (active) setRecord(data); }).catch(caught => { if (active) setError(caught.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [token]);
  useEffect(() => () => { cancelAnimationFrame(frameRef.current); streamRef.current?.getTracks().forEach(track => track.stop()); }, []);
  async function scan() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera scanning needs HTTPS and a supported browser. Use your phone’s camera app or paste the QR link below.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream; setScanning(true);
    } catch { setError('Camera access was not granted. Check browser permissions, or paste the QR link below.'); }
  }
  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return;
    let active = true;
    const video = videoRef.current; video.srcObject = streamRef.current;
    const canvas = document.createElement('canvas'); const context = canvas.getContext('2d', { willReadFrequently: true });
    async function start() {
      try {
        await video.play(); const { default: jsQR } = await import('jsqr');
        let previous = 0;
        const detect = (time: number) => {
          if (!active) return;
          if (time - previous > 200 && video.readyState >= 2 && context) {
            previous = time; canvas.width = 480; canvas.height = Math.max(1, Math.round(video.videoHeight / video.videoWidth * 480)); context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = context.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(image.data, canvas.width, canvas.height);
            if (code) { const reference = extract(code.data); if (reference) { stop(); navigate(`/verify/${reference}`); return; } setError('That QR code is not an ASTROVERSE registration. Try your event ID card.'); }
          }
          frameRef.current = requestAnimationFrame(detect);
        };
        frameRef.current = requestAnimationFrame(detect);
      } catch { setError('The camera could not start. Paste the QR link instead.'); stop(); }
    }
    start(); return () => { active = false; cancelAnimationFrame(frameRef.current); };
  }, [scanning, navigate, stop]);
  function submit(event: FormEvent) { event.preventDefault(); const reference = extract(value); if (!reference) { setError('Paste the full QR link or its secure verification reference, not just the registration ID.'); return; } stop(); setError(''); navigate(`/verify/${reference}`); }
  async function checkIn() { setBusy(true); setError(''); try { await api(`/admin/registrations/${record.registration_id}`, { method: 'PATCH', body: JSON.stringify({ checkIn: true }) }); setRecord({ ...record, checked_in: true }); setMessage('The team is now checked in. The verification record has been saved.'); } catch (caught: any) { setError(caught.message); } finally { setBusy(false); } }
  return <div className="page verification-page narrow"><Eyebrow>REAL REGISTRATION. SECURE VERIFICATION.</Eyebrow><h1 className="page-title">MISSION<br /><span className="serif-accent">verified.</span></h1><p>Scan an ASTROVERSE ID card or paste its QR link to check the real registration.</p><div className="verification-panel">{loading ? <Loading text="Checking the registration database…" /> : record ? <div className="verification-result"><div className={`verification-seal ${record.status === 'rejected' ? 'rejected' : ''}`}>{record.status === 'rejected' ? <XCircle size={44} strokeWidth={1.3} /> : <ShieldCheck size={44} strokeWidth={1.3} />}</div><span className="mono">REGISTRATION FOUND</span><h2>{record.team_name}</h2><p>{record.institution}</p><strong className="verification-id">{record.registration_id}</strong><span className={`status-badge ${record.status}`}>{record.status === 'pending' ? 'Awaiting approval' : record.status}</span><dl className="details-grid"><div><dt>Team size</dt><dd>{record.team_size} participants</dd></div><div><dt>Check-in</dt><dd>{record.checked_in ? 'Checked in' : 'Not checked in'}</dd></div><div className="grid-full"><dt>Event</dt><dd>{event.name}<br />{event.dates}<br />{event.venue}</dd></div></dl>{record.status === 'pending' && <p className="small muted">This record is real, but the team is not yet approved for check-in.</p>}{user?.roles?.includes('admin') && <div className="organizer-verify"><span className="mono muted">ORGANIZER CONTROLS</span><button className="button primary" onClick={checkIn} disabled={busy || record.status !== 'approved' || record.checked_in}>{busy ? 'Saving check-in…' : record.checked_in ? 'Already checked in' : 'Check in this team'}<CheckCircle2 size={16} /></button><Link className="text-link" to={`/admin/registrations/${record.registration_id}`}>Open registration details<ArrowRight size={14} /></Link></div>}</div> : !error && <div className="verification-empty"><ShieldCheck size={42} strokeWidth={1} /><h2>A quick check. A real record.</h2><p>No personal emails or mobile numbers are revealed during public verification.</p></div>}{error && <Notice>{error}</Notice>}{message && <Notice success>{message}</Notice>}{scanning && <div className="scanner"><video ref={videoRef} playsInline muted aria-label="QR scanning camera" /><div className="scanner-target" /><button className="button secondary" onClick={stop}><CameraOff size={15} />Stop camera</button></div>}<form className="verify-form" onSubmit={submit}><label>QR link or secure verification reference<input value={value} onChange={event => setValue(event.target.value)} required placeholder="Paste the link from your QR code" /></label><div><button className="button primary">Verify registration<ArrowRight size={15} /></button><button className="button secondary" type="button" onClick={scanning ? stop : scan}><Camera size={17} />{scanning ? 'Stop scanning' : 'Scan QR'}</button></div></form></div><p className="small muted">The registration ID alone is not a public lookup key. The QR includes a unique, unguessable verification reference.</p></div>;
}
