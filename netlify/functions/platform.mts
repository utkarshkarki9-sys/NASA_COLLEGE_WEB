import { getUser, type User } from '@netlify/identity';
import { getDatabase } from '@netlify/database';
import { eq } from 'drizzle-orm';
import { database } from '../../db/index';
import { events } from '../../db/schema';
import { registrationSchema } from '../../src/lib/validation';
import type { Config } from '@netlify/functions';

function reply(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
function failure(message: string, status = 400): never { throw Object.assign(new Error(message), { status }); }
async function transaction<T>(actor: User | null, run: (client: any) => Promise<T>) {
  const connection = getDatabase();
  try {
    const client = await connection.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('astro.user_id', $1, true), set_config('astro.email', $2, true), set_config('astro.is_admin', $3, true)", [actor?.id || '', actor?.email?.toLowerCase() || '', actor?.roles?.includes('admin') ? 'true' : 'false']);
      const result = await run(client);
      await client.query('COMMIT');
      return result;
    } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; } finally { client.release(); }
  } finally { await connection.pool.end().catch(() => {}); }
}
async function fullRecord(client: any, condition: string, values: unknown[]) {
  const result = await client.query(`SELECT r.*, t.name AS team_name, t.institution, t.category, t.declared_size, t.owner_id, t.id AS team_id FROM registrations r JOIN teams t ON t.id = r.team_id WHERE ${condition}`, values);
  if (!result.rows[0]) return null;
  const record = result.rows[0];
  record.members = (await client.query('SELECT name, email, mobile, institution, role, age FROM participants WHERE team_id = $1 ORDER BY position', [record.team_id])).rows;
  record.mentor = (await client.query('SELECT name, email FROM mentors WHERE team_id = $1', [record.team_id])).rows[0] || null;
  return record;
}
export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const route = url.pathname.replace(/^\/api/, '');
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) return reply({ error: 'Method not allowed.' }, 405);
    if (request.method !== 'GET') {
      const origin = request.headers.get('origin');
      if (origin && origin !== url.origin) return reply({ error: 'Request not permitted.' }, 403);
      if (Number(request.headers.get('content-length') || 0) > 32000) return reply({ error: 'Request is too large.' }, 413);
    }
    if (route === '/event' && request.method === 'GET') {
      const connection = database();
      try {
        const [event] = await connection.db.select().from(events).where(eq(events.id, 'astroverse-2026'));
        return reply({ event });
      } finally { await connection.close().catch(() => {}); }
    }
    if (route === '/gallery' && request.method === 'GET') return reply(await transaction(null, async client => (await client.query('SELECT id, path, caption, position FROM gallery WHERE visible = true ORDER BY position')).rows));
    if (route.startsWith('/verify/') && request.method === 'GET') {
      const token = route.split('/')[2];
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return reply({ error: 'This verification reference is invalid.' }, 404);
      const result = await transaction(null, async client => (await client.query('SELECT * FROM public_verification($1::uuid)', [token])).rows[0]);
      if (!result) return reply({ error: 'Registration not found. Check the QR code or ask an organizer.' }, 404);
      return reply(result);
    }
    const actor = await getUser();
    if (!actor) return reply({ error: 'Please log in to continue.' }, 401);
    if (!actor.confirmedAt) return reply({ error: 'Confirm your email address before continuing.' }, 403);
    const isAdmin = actor.roles?.includes('admin') || false;
    if (route.startsWith('/admin') && !isAdmin) return reply({ error: 'An organizer account is required.' }, 403);
    if (route === '/me' && request.method === 'GET') {
      const record = await transaction(actor, client => fullRecord(client, '(t.owner_id = $1 OR EXISTS (SELECT 1 FROM participants p WHERE p.team_id = t.id AND p.email = $2))', [actor.id, actor.email?.toLowerCase()]));
      return reply({ registration: record, isAdmin });
    }
    if (route === '/registrations' && request.method === 'POST') {
      const text = await request.text();
      if (text.length > 32000) return reply({ error: 'Request is too large.' }, 413);
      let input;
      try { input = JSON.parse(text); } catch { return reply({ error: 'Invalid form submission.' }, 400); }
      const parsed = registrationSchema.safeParse(input);
      if (!parsed.success) return reply({ error: parsed.error.issues[0].message }, 422);
      const data = parsed.data;
      if (data.members[0].email !== actor.email?.toLowerCase()) return reply({ error: 'The team leader email must match your signed-in account.' }, 422);
      const saved = await transaction(actor, async client => {
        const event = (await client.query('SELECT registration_open FROM events WHERE id = $1 FOR SHARE', ['astroverse-2026'])).rows[0];
        if (!event?.registration_open) failure('Registration is currently closed.', 409);
        const team = (await client.query('INSERT INTO teams (event_id, owner_id, name, institution, category, declared_size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', ['astroverse-2026', actor.id, data.name, data.institution, data.category, data.members.length])).rows[0];
        for (const [position, member] of data.members.entries()) await client.query('INSERT INTO participants (team_id, event_id, name, email, mobile, institution, role, age, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [team.id, 'astroverse-2026', member.name, member.email, member.mobile, member.institution, position === 0 ? 'Team leader' : 'Member', member.age || null, position]);
        if (data.mentor?.name) await client.query('INSERT INTO mentors (team_id,name,email) VALUES ($1,$2,$3)', [team.id, data.mentor.name, data.mentor.email || null]);
        const record = (await client.query('INSERT INTO registrations (team_id, guardian_consent) VALUES ($1,$2) RETURNING registration_id, verification_token', [team.id, data.guardianConsent])).rows[0];
        return record;
      });
      return reply(saved, 201);
    }
    if (route === '/admin/registrations' && request.method === 'GET') {
      const search = (url.searchParams.get('search') || '').slice(0, 150);
      const status = url.searchParams.get('status') || '';
      const category = url.searchParams.get('category') || '';
      const institution = (url.searchParams.get('institution') || '').slice(0, 120);
      const date = url.searchParams.get('date') || '';
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return reply({ error: 'Enter a valid filter date.' }, 422);
      const page = Math.max(1, Math.min(10000, Number(url.searchParams.get('page')) || 1));
      return reply(await transaction(actor, async client => {
        const where = `($1 = '' OR r.registration_id ILIKE $2 OR t.name ILIKE $2 OR t.institution ILIKE $2 OR EXISTS (SELECT 1 FROM participants p WHERE p.team_id = t.id AND (p.name ILIKE $2 OR p.email ILIKE $2 OR p.mobile ILIKE $2))) AND ($3 = '' OR r.status = $3) AND ($4 = '' OR t.category = $4) AND ($5 = '' OR t.institution ILIKE $5) AND ($6 = '' OR (r.created_at AT TIME ZONE 'Asia/Kolkata')::date = NULLIF($6, '')::date)`;
        const filters = [search, `%${search}%`, status, category, institution ? `%${institution}%` : '', date];
        const rows = (await client.query(`SELECT r.registration_id, r.status, r.created_at, t.name AS team_name, t.institution, t.category, t.declared_size, (SELECT json_agg(json_build_object('name',p.name,'email',p.email,'mobile',p.mobile,'role',p.role) ORDER BY p.position) FROM participants p WHERE p.team_id=t.id) AS members FROM registrations r JOIN teams t ON t.id=r.team_id WHERE ${where} ORDER BY r.created_at DESC LIMIT 50 OFFSET $7`, [...filters, (page - 1) * 50])).rows;
        const total = Number((await client.query(`SELECT count(*) FROM registrations r JOIN teams t ON t.id=r.team_id WHERE ${where}`, filters)).rows[0].count);
        const stats = (await client.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE status='pending')::int AS pending, count(*) FILTER (WHERE status='approved')::int AS approved, count(*) FILTER (WHERE status='rejected')::int AS rejected, (SELECT count(*)::int FROM participants) AS participants FROM registrations")).rows[0];
        return { rows, total, page, stats };
      }));
    }
    if (route === '/admin/export' && request.method === 'GET') {
      const csv = await transaction(actor, async client => {
        const rows = (await client.query('SELECT r.registration_id, r.status, t.name AS team_name, t.category, t.institution AS team_institution, p.name, p.email, p.mobile, p.institution, p.role, p.age, r.created_at FROM registrations r JOIN teams t ON t.id=r.team_id JOIN participants p ON p.team_id=t.id ORDER BY r.id, p.position')).rows;
        const columns = ['registration_id', 'status', 'team_name', 'category', 'team_institution', 'name', 'email', 'mobile', 'institution', 'role', 'age', 'created_at'];
        const escape = (value: unknown) => { const str = String(value ?? ''); return `"${(/^[=+\-@\t\r]/.test(str) ? "'" : '') + str.replace(/"/g, '""')}"`; };
        await client.query('INSERT INTO admin_audit(actor_id,action,registration_id) VALUES ($1,$2,$3)', [actor.id, 'export', 'all']);
        return '\uFEFF' + [columns.join(','), ...rows.map((row: any) => columns.map(column => escape(row[column])).join(','))].join('\r\n');
      });
      return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="astroverse-participants.csv"', 'Cache-Control': 'no-store' } });
    }
    if (route.startsWith('/admin/registrations/')) {
      const id = decodeURIComponent(route.split('/')[3]);
      if (!/^NASA2026-BIAS-\d+$/.test(id)) return reply({ error: 'Invalid registration reference.' }, 400);
      if (request.method === 'GET') {
        const record = await transaction(actor, client => fullRecord(client, 'r.registration_id=$1', [id]));
        return record ? reply(record) : reply({ error: 'Registration not found.' }, 404);
      }
      if (request.method === 'PATCH') {
        const { status, checkIn } = await request.json();
        if (!checkIn && !['pending', 'approved', 'rejected'].includes(status)) return reply({ error: 'Choose a valid status.' }, 422);
        return reply(await transaction(actor, async client => {
          const record = (await client.query('SELECT id,status FROM registrations WHERE registration_id=$1 FOR UPDATE', [id])).rows[0];
          if (!record) failure('Registration not found.', 404);
          if (checkIn) {
            if (record.status !== 'approved') failure('Only approved teams can check in.', 409);
            const existing = await client.query('SELECT id FROM verification_records WHERE registration_id=$1', [record.id]);
            if (existing.rows.length) failure('This team is already checked in.', 409);
            await client.query('INSERT INTO verification_records(registration_id,verified_by) VALUES ($1,$2)', [record.id, actor.id]);
          } else await client.query('UPDATE registrations SET status=$1, updated_at=now() WHERE id=$2', [status, record.id]);
          await client.query('INSERT INTO admin_audit(actor_id,action,registration_id) VALUES ($1,$2,$3)', [actor.id, checkIn ? 'check-in' : status, id]);
          return { success: true };
        }));
      }
      if (request.method === 'DELETE') return reply(await transaction(actor, async client => {
        const found = (await client.query('SELECT team_id FROM registrations WHERE registration_id=$1', [id])).rows[0];
        if (!found) failure('Registration not found.', 404);
        await client.query('DELETE FROM teams WHERE id=$1', [found.team_id]);
        await client.query('INSERT INTO admin_audit(actor_id,action,registration_id) VALUES ($1,$2,$3)', [actor.id, 'delete', id]);
        return { success: true };
      }));
    }
    if (route === '/admin/gallery') {
      if (request.method === 'GET') return reply(await transaction(actor, async client => (await client.query('SELECT * FROM gallery ORDER BY position')).rows));
      if (request.method === 'PATCH') {
        const { id, caption, visible } = await request.json();
        if (!Number.isInteger(id) || typeof caption !== 'string' || !caption.trim() || caption.length > 180 || typeof visible !== 'boolean') return reply({ error: 'Enter a valid gallery caption.' }, 422);
        await transaction(actor, async client => { await client.query('UPDATE gallery SET caption=$1,visible=$2 WHERE id=$3', [caption.trim(), visible, id]); await client.query('INSERT INTO admin_audit(actor_id,action,registration_id) VALUES ($1,$2,$3)', [actor.id, 'gallery-update', String(id)]); });
        return reply({ success: true });
      }
    }
    if (route === '/admin/event' && request.method === 'PATCH') {
      const { registrationOpen } = await request.json();
      if (typeof registrationOpen !== 'boolean') return reply({ error: 'Invalid event setting.' }, 422);
      await transaction(actor, async client => { await client.query('UPDATE events SET registration_open=$1 WHERE id=$2', [registrationOpen, 'astroverse-2026']); await client.query('INSERT INTO admin_audit(actor_id,action,registration_id) VALUES ($1,$2,$3)', [actor.id, registrationOpen ? 'open-registration' : 'close-registration', 'event']); });
      return reply({ success: true });
    }
    return reply({ error: 'This endpoint does not exist.' }, 404);
  } catch (caught: any) {
    if (caught?.code === '23505') {
      const constraint = caught.constraint || '';
      return reply({ error: constraint.includes('email') ? 'A member email is already registered for this event.' : constraint.includes('mobile') ? 'A member mobile number is already registered for this event.' : constraint.includes('name') ? 'This team name is already taken.' : 'Your account already has a team registration.' }, 409);
    }
    if (caught?.status) return reply({ error: caught.message }, caught.status);
    if (caught?.code === '23514') return reply({ error: 'Check your team: 4–6 members and one team leader are required.' }, 422);
    return reply({ error: 'We couldn’t complete that request. Please try again shortly. Your team is not registered until you receive a registration ID.' }, 503);
  }
};
export const config: Config = { path: '/api/*' };
