-- Extend the configured event end date to the confirmed third day.
-- This is a forward-only migration: do not edit the previously applied seed migration.
UPDATE events
SET ends_at = '2026-11-16T23:59:59+05:30'::timestamptz
WHERE id = 'astroverse-2026'
  AND ends_at < '2026-11-16T23:59:59+05:30'::timestamptz;
