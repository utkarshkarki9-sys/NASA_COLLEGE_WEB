# ASTROVERSE project guide

## Architecture

This is a React 19 + Vite 6 TypeScript SPA deployed on Netlify. React Router renders public, participant, and organizer pages. Keep the event name ASTROVERSE separate from its host institute in every piece of copy and every asset. Preserve the editorial, dark-space identity: Barlow Condensed headings, DM Sans text, IBM Plex Mono mission labels, coral accents, supplied space/astronaut artwork, and real event images.

## Directories

- `src/main.tsx`: route composition, lazy loading, route titles, scroll reveal.
- `src/pages`: public information, quiz, auth, registration, participant dashboard, QR scanning/verification, organizer dashboard.
- `src/components`: shared layout, Identity context/protected routes, accessible UI, gallery/lightbox.
- `src/lib/validation.ts`: shared Zod registration validation, imported by both client and API.
- `src/lib/api.ts`: same-origin JSON requests, session refresh, timeout, friendly failures.
- `src/data.ts`: editable event copy, FAQ, schedule, photos, quiz, media definitions.
- `src/styles.css`: responsive CSS, reduced motion, animations, printable ID layout.
- `public/gallery`: all 20 original event images extracted from supplied PDFs. Do not delete, rename, or substitute stock photographs.
- `public/img`: supplied hero art/emblem, optimized supplied GIF, ASTROVERSE wordmark/favicon.
- `netlify/functions/platform.mts`: modern Request/Response API. Keep auth, role authorization, owner checks, CSRF checks, and private cache controls on the server.
- `db/schema.ts`: Drizzle table definitions. `db/index.ts` exposes the native Netlify Drizzle adapter.
- `netlify/database/migrations`: automatically deployed migrations. The hand-authored integrity migration adds triggers/RLS/security beyond Drizzle’s table definitions.
- `database/schema.sql`: full SQL reference, not another migration to deploy.

## Conventions & decisions

Use explicit TypeScript interfaces for new data boundaries, existing CSS conventions, named descriptive variables, and focused edits. Prefer CSS animations and existing dependencies over new visual libraries. Respect keyboard operation, native form semantics, visible focus, image fallbacks, and reduced-motion settings. Keep registration and participant records real; never seed fake registrants or compute fake organizer counts. Informational images and static content may have local fallbacks, but failed registration operations must never produce success or QR records.

The environment requires Netlify Database and Identity, not Supabase. The blank legacy Supabase entries in `.env.example` are unused. Do not implement an external database or parallel auth system. Always use `@netlify/identity`, not older widget/GoTrue packages. Admin rights come from the server-controlled `admin` role, not the initial organizer email or user metadata. A Netlify administrator must invite the first organizer and assign that role manually.

New schema changes require a migration. Use `drizzle-orm@beta` and `drizzle-kit@beta` for the Netlify adapter. Do not manually apply migrations; the platform applies them. Keep SQL actor settings transaction-local and derived only from verified Identity users. Owner database connections can bypass RLS; do not remove explicit API authorization.

IDs come from a PostgreSQL sequence/trigger. QR codes contain a random verification UUID; public output is deliberately restricted. Registration is an atomic multi-table transaction. Deferred constraints check the actual team size, leader, event, registration existence, and minors’ guardian consent at commit. Preserve these checks when changing the registration model.

The signup/confirmation/recovery/invitation callback runs in the root auth provider, not inside a protected route. Keep callback processing safe under React Strict Mode. Camera streams must stop when the scanner closes or unmounts. CSV exports must stay admin-only and neutralize formula injection.

Do not invent event fee information, organizer contact channels, videos, or exact session times. Keep the supplied November 14–16, 2026 local event dates. Media supports privacy-enhanced YouTube and local files via `src/data.ts`.

For local service-backed development use `netlify dev --port 8889` with a linked Netlify project. Static Vercel routing is provided, but the backend requires Netlify. This build environment forbids manual build/dev/test validation commands; the automated pipeline performs compilation. Future sessions should obey their active environment instructions. Do not create commits or read `.git` internals. Recreate the public source ZIP after any final source change, excluding secrets, dependencies, build output, and the archive itself.
