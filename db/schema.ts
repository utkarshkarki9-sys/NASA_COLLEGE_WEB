import { pgTable, serial, text, integer, timestamp, uuid, boolean, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const events = pgTable('events', {
  id: text().primaryKey(), name: text().notNull(), startsAt: timestamp('starts_at', { withTimezone: true }).notNull(), endsAt: timestamp('ends_at', { withTimezone: true }).notNull(), venue: text().notNull(), registrationOpen: boolean('registration_open').notNull().default(true),
});
export const teams = pgTable('teams', {
  id: uuid().defaultRandom().primaryKey(), eventId: text('event_id').notNull().references(() => events.id), ownerId: text('owner_id').notNull(), name: text().notNull(), institution: text().notNull(), category: text().notNull(), declaredSize: integer('declared_size').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [uniqueIndex('team_owner_event_unique').on(table.ownerId, table.eventId), uniqueIndex('team_name_event_unique').on(table.name, table.eventId), check('team_size_4_to_6', sql`${table.declaredSize} between 4 and 6`), check('team_category_valid', sql`${table.category} in ('College', 'School', 'Open')`)]);
export const participants = pgTable('participants', {
  id: uuid().defaultRandom().primaryKey(), teamId: uuid('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }), eventId: text('event_id').notNull().references(() => events.id), name: text().notNull(), email: text().notNull(), mobile: text().notNull(), institution: text().notNull(), role: text().notNull(), age: integer(), position: integer().notNull(),
}, table => [uniqueIndex('participant_email_event_unique').on(table.email, table.eventId), uniqueIndex('participant_mobile_event_unique').on(table.mobile, table.eventId), uniqueIndex('participant_team_position_unique').on(table.teamId, table.position), index('participant_team_idx').on(table.teamId), check('participant_age_valid', sql`${table.age} is null or ${table.age} between 1 and 120`), check('participant_role_valid', sql`${table.role} in ('Team leader', 'Member')`)]);
export const mentors = pgTable('mentors', {
  id: uuid().defaultRandom().primaryKey(), teamId: uuid('team_id').notNull().unique().references(() => teams.id, { onDelete: 'cascade' }), name: text().notNull(), email: text(),
});
export const registrations = pgTable('registrations', {
  id: serial().primaryKey(), registrationId: text('registration_id').notNull().unique().default(''), teamId: uuid('team_id').notNull().unique().references(() => teams.id, { onDelete: 'cascade' }), verificationToken: uuid('verification_token').defaultRandom().notNull().unique(), status: text().default('pending').notNull(), consentAt: timestamp('consent_at', { withTimezone: true }).defaultNow().notNull(), guardianConsent: boolean('guardian_consent').default(false).notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [index('registration_status_idx').on(table.status), check('registration_status_valid', sql`${table.status} in ('pending', 'approved', 'rejected')`)]);
export const verificationRecords = pgTable('verification_records', {
  id: serial().primaryKey(), registrationId: integer('registration_id').notNull().references(() => registrations.id, { onDelete: 'cascade' }), verifiedBy: text('verified_by').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const adminAudit = pgTable('admin_audit', {
  id: serial().primaryKey(), actorId: text('actor_id').notNull(), action: text().notNull(), registrationId: text('registration_id').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const gallery = pgTable('gallery', {
  id: serial().primaryKey(), path: text().notNull().unique(), caption: text().notNull(), position: integer().notNull(), visible: boolean().default(true).notNull(),
});
