import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { ArrowUpRight, CheckCircle2, Download, Printer, RefreshCw, CalendarDays, ShieldCheck } from 'lucide-react';
import { useAuth } from '../components/Auth';
import { api } from '../lib/api';
import { ArrowLink, Eyebrow, Loading, Notice } from '../components/UI';
import { event } from '../data';

export type TeamRecord = { registration_id: string; status: string; team_name: string; institution: string; category: string; verification_token: string; created_at: string; members: { name: string; email: string; mobile: string; institution: string; role: string; age?: number }[]; mentor: { name: string; email?: string } | null };
export default function Dashboard() {
  const { user } = useAuth();
  const [record, setRecord] = useState<TeamRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(0);
  const [qr, setQr] = useState('');
  const [cardError, setCardError] = useState('');
  const cardRef = useRef<HTMLElement>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const data = await api('/me'); setRecord(data.registration); if (data.registration) { const ownIndex = data.registration.members.findIndex((member: any) => member.email === user?.email?.toLowerCase()); setSelected(Math.max(0, ownIndex)); } } catch (caught: any) { setError(caught.message); } finally { setLoading(false); } }, [user?.email]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (record) QRCode.toDataURL(`${window.location.origin}/verify/${record.verification_token}`, { width: 360, margin: 2, errorCorrectionLevel: 'M' }).then(setQr).catch(() => setCardError('The QR card could not load. Refresh to try again.')); }, [record]);
  async function download() {
    if (!record || !qr) return;
    setCardError('');
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1360;
      const context = canvas.getContext('2d'); if (!context) return;
      context.fillStyle = '#0d1625'; context.fillRect(0, 0, 1000, 1360);
      context.fillStyle = '#ed624f'; context.fillRect(0, 0, 1000, 12);
      const image = new Image(); image.src = '/img/astroverse-logo.svg'; await image.decode(); context.drawImage(image, 70, 65, 500, 86);
      context.fillStyle = '#bac5d6'; context.font = '22px sans-serif'; context.fillText('NASA International Space Apps Challenge 2026', 70, 209);
      context.fillStyle = '#fff'; context.font = 'bold 52px sans-serif'; context.fillText(record.members[selected].name, 70, 329, 860);
      context.font = '28px sans-serif'; context.fillStyle = '#bac5d6'; context.fillText(record.members[selected].role.toUpperCase(), 70, 379);
      context.font = 'bold 32px sans-serif'; context.fillStyle = '#fff'; context.fillText(record.team_name, 70, 459, 860);
      context.font = '26px sans-serif'; context.fillStyle = '#bac5d6'; context.fillText(record.institution, 70, 508, 860);
      const qrImage = new Image(); qrImage.src = qr; await qrImage.decode(); context.drawImage(qrImage, 295, 580, 410, 410);
      context.textAlign = 'center'; context.font = 'bold 28px monospace'; context.fillStyle = '#fff'; context.fillText(record.registration_id, 500, 1048);
      context.font = '22px sans-serif'; context.fillStyle = '#ed624f'; context.fillText(`STATUS: ${record.status.toUpperCase()}`, 500, 1095);
      context.fillStyle = '#bac5d6'; context.fillText('14–15 November 2026', 500, 1180); context.fillText('Birla Institute of Applied Sciences', 500, 1230); context.fillText('Bhimtal, Uttarakhand', 500, 1270);
      const link = document.createElement('a'); link.download = `${record.registration_id}-${selected + 1}.png`; link.href = canvas.toDataURL('image/png'); link.click();
    } catch { setCardError('The ID card could not download. Use Print / PDF instead.'); }
  }
  if (loading) return <Loading text="Retrieving your mission details…" />;
  if (error) return <div className="page narrow"><Notice>{error}</Notice><button className="button secondary" onClick={load}>Try again<RefreshCw size={16} /></button></div>;
  if (!record) return <div className="page narrow empty-state"><RocketIcon /><Eyebrow>YOUR NEXT STEP</Eyebrow><h1 className="page-title">YOUR CREW IS<br />WAITING TO LAUNCH.</h1><p>Your account is ready, but no team registration is linked to your email yet. Register a team, or ask your team leader to include your confirmed email address.</p><ArrowLink primary to="/register">Register your team</ArrowLink></div>;
  return <div className="page container dashboard-page"><div className="dashboard-heading"><div><Eyebrow>PARTICIPANT MISSION CONTROL</Eyebrow><h1 className="page-title">WELCOME ABOARD,<br /><span className="serif-accent">{user?.name || record.members[selected].name}.</span></h1></div><button className="button secondary" onClick={load}><RefreshCw size={15} />Refresh status</button></div><div className="dashboard-grid"><div><section className="data-panel"><div className="data-panel-header"><h2>Your team registration</h2><span className={`status-badge ${record.status}`}>{record.status}</span></div><div className="registration-reference"><span className="mono muted">REGISTRATION ID</span><strong>{record.registration_id}</strong></div><dl className="details-grid"><div><dt>Team name</dt><dd>{record.team_name}</dd></div><div><dt>Institution</dt><dd>{record.institution}</dd></div><div><dt>Category</dt><dd>{record.category}</dd></div><div><dt>Registered</dt><dd>{new Date(record.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div></dl><div className="inline-hint"><ShieldCheck size={18} />{record.status === 'pending' ? 'Your details are saved. Your team is awaiting organizer approval.' : record.status === 'approved' ? 'Your team is approved. Bring your QR ID card for event check-in.' : 'Your registration was not approved. Speak with an event organizer for clarification.'}</div></section><section className="data-panel"><div className="data-panel-header"><h2>Your crew</h2><span className="mono muted">{record.members.length} MEMBERS</span></div><div className="crew-list">{record.members.map(member => <div key={member.email}><span className="member-avatar">{member.name.charAt(0)}</span><div><strong>{member.name}</strong><span>{member.email}</span><span>{member.institution}</span></div><span className="mono muted">{member.role}</span></div>)}</div>{record.mentor && <div className="mentor-info"><span className="mono muted">MENTOR</span><strong>{record.mentor.name}</strong>{record.mentor.email && <span>{record.mentor.email}</span>}</div>}</section><section className="event-reminder"><CalendarDays size={21} /><div><strong>{event.dates}</strong><span>{event.venue} · {event.location}</span></div><Link to="/schedule" aria-label="View event schedule"><ArrowUpRight /></Link></section></div><div className="id-card-column"><label className="id-selector">ID card for<select value={selected} onChange={event => setSelected(Number(event.target.value))}>{record.members.map((member, index) => <option key={member.email} value={index}>{member.name}</option>)}</select></label><article className="digital-id" ref={cardRef} id="print-id"><img className="id-logo" src="/img/astroverse-logo.svg" alt="ASTROVERSE" /><span className="id-event">NASA International Space Apps Challenge 2026</span><div className="id-name"><span className="mono">{record.members[selected].role.toUpperCase()}</span><h2>{record.members[selected].name}</h2><strong>{record.team_name}</strong><p>{record.institution}</p></div><div className="qr-container">{qr ? <img src={qr} alt={`Verification QR code for ${record.registration_id}`} width={200} height={200} /> : <Loading text="Generating QR…" />}</div><strong className="id-reference">{record.registration_id}</strong><span className={`status-badge ${record.status}`}>{record.status}</span><div className="id-location"><CalendarDays size={13} />{event.dates}<br /><span>{event.venue}<br />{event.location}</span></div></article>{cardError && <Notice>{cardError}</Notice>}<div className="id-actions"><button className="button primary" onClick={download} disabled={!qr}><Download size={16} />Download ID</button><button className="button secondary" onClick={() => window.print()} disabled={!qr}><Printer size={16} />Print / PDF</button></div><Link className="text-link" to={`/verify/${record.verification_token}`}>Verify this registration<ArrowUpRight size={14} /></Link><p className="small muted">The QR verifies your team against the real database. Your personal contact details are never displayed publicly.</p></div></div></div>;
}
function RocketIcon() { return <CheckCircle2 size={42} strokeWidth={1} />; }
