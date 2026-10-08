# ASTROVERSE

A space-themed React + Vite event website and real team-registration platform for NASA International Space Apps Challenge 2026, hosted at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, on **14–15 November 2026**.

The event brand is **ASTROVERSE**. The venue and institute are separate identifiers, never part of the event name.

## What was provided

This workspace contained no existing React source, package manifest, Supabase configuration, or database schema. It contained two photo PDFs, one space/astronaut illustration, and one event emblem. The PDFs yielded **20 real event photos**, preserved as `public/gallery/event-01.jpeg` through `event-20.jpeg`. The supplied illustration and emblem are used, and a separate ASTROVERSE SVG wordmark and favicon were created. The user-supplied Google share link resolved to the star-field GIF used throughout the site; it was resized and optimized while preserving all 75 frames.

## Platform choice

This environment requires **Netlify Database** for persistence and **Netlify Identity** for authentication. Therefore this project uses those services, not Supabase. It does not contain a second, fake, frontend-only registration system. The requested `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` entries remain empty in `.env.example` for source compatibility, but are **not read by this application**. Do not populate them expecting a Supabase deployment.

## Technologies

- React 19, Vite 6, TypeScript, React Router
- Custom responsive CSS, CSS planet orbits, parallax, scroll reveal, and reduced-motion support
- Netlify Identity, with email confirmation and password recovery
- Netlify Functions, Netlify Database (managed PostgreSQL), Drizzle ORM beta
- Zod shared validation, QRCode generation, lazily loaded jsQR camera scanning
- Netlify Image CDN with local-image fallbacks

## Run locally

Use Node.js 22 or later.

```sh
npm install
netlify link
netlify dev --port 8889
```

Link to a Netlify project with Database and Identity enabled. The linked project supplies the database connection and Identity runtime; do not put database credentials in `VITE_*` variables. A standalone `npm run dev` renders the frontend but does not emulate Netlify Functions, Identity, or Database. Use HTTPS when testing camera permissions and authenticated sessions; Identity uses secure cookies. Production compilation is `npm run build`.

The Identity feature marker is included under `.netlify/features/netlify-identity`. The Identity activation script was run in this workspace. For a newly created site, verify Identity is enabled in the Netlify dashboard.

## Deploy on Netlify

1. Connect this repository to the Netlify project.
2. Keep the build command `npm run build`, publish directory `dist`, and functions directory `netlify/functions` from `netlify.toml`.
3. The platform provisions Netlify Database and applies the migrations under `netlify/database/migrations` during deploy. Do not manually apply the reference schema in addition to those migrations.
4. Enable open Identity registration and **require email confirmation**. Review the Identity email sender, templates, allowed redirect URLs, and production site URL. Confirm that confirmation, invitation, and password-recovery emails are deliverable. A custom SMTP sender may be configured privately in Netlify.
5. Invite the initial organizer as described below. No password is embedded in source.
6. Run the live workflow checklist before opening registration to the public. Backend-dependent flows need the deployed services; they were not represented as locally verified in this handoff.

API function routes are `/api/*`. The final SPA rewrite handles browser routes on refresh. Image CDN routes and static assets are handled by Netlify before the non-forced SPA rewrite.

The frontend remains a conventional Vite SPA and includes `vercel.json` for static client routing. **The real backend is Netlify-specific**; Vercel-only deployment requires equivalent server endpoints and an authentication/database migration. A static Vercel deployment alone is not a working registration platform.

## Initial organizer account

In the Netlify dashboard:

1. Open **Identity → Invite users**.
2. Invite **nasaspace1212@gmail.com**.
3. The organizer opens the invitation and sets their own strong password.
4. Open this user in Identity and add the server-controlled **`admin`** role.
5. Sign in at `/admin/login`.

An email address alone does **not** grant admin access. Client-provided metadata cannot assign roles. All organizer APIs independently check the authenticated account and the server-controlled `admin` role. Never place a password, service key, or database URL in the frontend or source repository.

## Real registration workflow

1. Create an account and confirm the actual email address.
2. Sign in and open `/register`.
3. Supply team identity, category, and 4–6 participants. The first member is the leader and must use the signed-in email.
4. Supply a unique email and mobile for each participant, their institution, and optionally their age. A mentor is optional and excluded from the 4–6 count.
5. Confirm the declaration and, if needed, guardian consent.
6. The API validates again and saves the team, participants, optional mentor, and registration in **one transaction**. Failure rolls back all these records.
7. PostgreSQL generates a unique sequence-controlled ID such as `NASA2026-BIAS-0001` and a random UUID verification reference. Sequence gaps following rolled-back transactions are normal; uniqueness is guaranteed.
8. `/dashboard` fetches the real stored data, renders a QR, and allows a PNG ID download or printing to PDF through the browser’s print dialog.
9. An authorized organizer searches the real records and approves or rejects the team.
10. Scanning the QR calls the real database-backed verification function. An organizer can record a check-in only for an approved team. Duplicate check-in is blocked in both the API and database.

Other registered team members may create and confirm accounts with the exact email on their team record to access that team’s dashboard. They cannot access another team’s records. All team members can select and print their crew’s participant cards.

The event is seeded with registration open. Organizers may open or close it from the admin overview. The homepage reads the real setting rather than displaying a hardcoded open state.

## Validation & database security

`db/schema.ts` defines events, teams, participants, mentors, registrations, verification records, gallery metadata, and organizer audit records. The first migration defines tables, foreign keys, indexes, and checks. The second adds:

- Database-controlled registration IDs and case-insensitive team-name uniqueness
- Unique normalized emails and mobile numbers per event
- Deferred constraint triggers enforcing actual 4–6 membership, declared-size consistency, one leader in position zero, matching participant event, a registration per team, and guardian consent for minors
- RLS policies for participant/team access, organizer operations, and public event/gallery reads
- A token-based public verification function returning only non-sensitive team fields
- The actual event record and all 20 real gallery metadata entries; **no participant or registration fixtures**

Functions verify the Identity session before any private query, set transaction-local actor information, and restrict access to the account’s team or admin role. Netlify Database is not exposed as a browser-queryable API. Database owner connections bypass PostgreSQL RLS, so API authorization is mandatory and is implemented separately. The RLS policies provide an additional layer for a restricted application role that honors transaction-local actor settings; never give public clients direct SQL credentials or permission to choose these settings.

The complete PostgreSQL reference DDL is available at `database/schema.sql`. It is for review or a fresh database only; deployment uses the migrations, not both.

CSV export is organizer-only, includes actual participants, neutralizes spreadsheet-formula prefixes, and logs the export. Approvals, rejection, deletion, gallery changes, registration settings, and check-ins create organizer audit records. Deleting a team intentionally cascades its participant, mentor, registration, and check-in records, while retaining the independent audit entry.

There is no same-institution restriction because none was confirmed in the supplied requirements. Each participant’s institution is collected separately. Fees, exact session times, organizer phone numbers, and social links are not invented.

## Public & organizer routes

Public: `/`, `/about`, `/space-apps`, `/highlights`, `/gallery`, `/media`, `/why-participate`, `/schedule`, `/quiz` (also `/questions`), `/faq`, `/contact`, `/register`, `/login`, `/privacy`, `/verify`, `/verify/:token`.

Authenticated participants: `/dashboard`.

Authenticated organizers: `/admin`, `/admin/participants`, `/admin/teams`, `/admin/registrations/:id`, `/admin/verification`, `/admin/gallery`, `/admin/reports`. Organizer login: `/admin/login`.

The public QR screen intentionally accepts a token or complete QR link, not a sequential registration ID. Sequential IDs are searchable only by organizers.

## Editable content

- Dates, venue, FAQ, schedule phases, quiz questions, initial gallery captions, and video definitions: `src/data.ts`.
- Event database seed: the integrity/security migration. After deployment, registration-open state is editable in the admin overview.
- Live gallery captions and visibility: organizer gallery management. Original photo assets are never removed by hiding them.
- To add a YouTube film, add `{ title, type: 'youtube', source: 'VIDEO_ID' }` to `videos`; embeds use the privacy-enhanced YouTube domain. To add a local video, put the licensed file in `public/media/` and add `{ title, type: 'local', source: '/media/file.mp4' }`. No event video was supplied, so the media page currently uses real event stories and photographs rather than an invented video.
- Branding: `public/img/astroverse-logo.svg`, `public/img/favicon.svg`, and the supplied event emblem.

Keep event information in the database seed, static copy, metadata, printable cards, and `src/data.ts` aligned if dates or venue change.

## Live acceptance checklist

These checks require a deployed Netlify site and real accounts. No fake data is seeded.

- Confirm a new email; log in; request a recovery link; complete password recovery; log out.
- Register a consenting real 4-person team. Confirm an actual database record and registration ID.
- Repeat with a 6-person team. Reject 3 and 7 members through the API/database, not only through the form.
- Check duplicate email/mobile, duplicate team name, guardian consent, and a second team from the same leader.
- Open the participant dashboard and confirm the exact saved information; log in as another confirmed team member.
- Download and print the selected member’s ID. Scan its QR on a second phone.
- Confirm the verification page reveals no participant contact details; test an invalid token.
- Attempt organizer routes and APIs as an unauthenticated visitor and as a non-admin.
- Approve/reject a real test registration; verify dashboard/public status reflects the database.
- Check in an approved team and reject a duplicate check-in or check-in for a pending/rejected team.
- Search by ID, team, participant name, email, mobile, institution; test status/category/institution/date filters and pagination.
- Export CSV, inspect real rows, and check the organizer audit entry.
- Edit a photo caption; test visibility; open the gallery’s 20 initial images and keyboard lightbox controls.
- Complete all eight quiz questions, navigate backward, review the score, and restart.
- Check mobile menu, forms, dashboards, camera denial, network failures, reduced motion, and direct route reloads.

Local build, dev-server, and test commands were not run during this editing session because this environment delegates compilation and validation to the deployment pipeline.

## Source archive

Use the **Download project ZIP** link in the website footer to open `/download.html`, a standalone page with a native download button and browser-specific help. Alternatively, open `/downloads/astroverse-project.zip` on the deployed site. The ZIP is served as a downloadable attachment. If the chat's built-in viewer does not start a download, open the download page in a full browser.

`public/downloads/astroverse-project.zip` contains the React/Vite source, package lockfile, all 20 photos, space artwork, optimized GIF, SVG branding, database definitions and migrations, Netlify configuration, Identity feature marker, environment example, and documentation. It excludes installed dependencies, generated build output, private environment files, and the archive itself.
- Shared animated star-field GIF on every page, with a footer pause/play control and a static star-field fallback for reduced motion
