CREATE TABLE "admin_audit" (
	"id" serial PRIMARY KEY,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"registration_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"venue" text NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY,
	"path" text NOT NULL UNIQUE,
	"caption" text NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"team_id" uuid NOT NULL UNIQUE,
	"name" text NOT NULL,
	"email" text
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"team_id" uuid NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"mobile" text NOT NULL,
	"institution" text NOT NULL,
	"role" text NOT NULL,
	"age" integer,
	"position" integer NOT NULL,
	CONSTRAINT "participant_age_valid" CHECK ("age" is null or "age" between 1 and 120),
	CONSTRAINT "participant_role_valid" CHECK ("role" in ('Team leader', 'Member'))
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY,
	"registration_id" text DEFAULT '' NOT NULL UNIQUE,
	"team_id" uuid NOT NULL UNIQUE,
	"verification_token" uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
	"status" text DEFAULT 'pending' NOT NULL,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"guardian_consent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registration_status_valid" CHECK ("status" in ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"institution" text NOT NULL,
	"category" text NOT NULL,
	"declared_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_size_4_to_6" CHECK ("declared_size" between 4 and 6),
	CONSTRAINT "team_category_valid" CHECK ("category" in ('College', 'School', 'Open'))
);
--> statement-breakpoint
CREATE TABLE "verification_records" (
	"id" serial PRIMARY KEY,
	"registration_id" integer NOT NULL,
	"verified_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "participant_email_event_unique" ON "participants" ("email","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_mobile_event_unique" ON "participants" ("mobile","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participant_team_position_unique" ON "participants" ("team_id","position");--> statement-breakpoint
CREATE INDEX "participant_team_idx" ON "participants" ("team_id");--> statement-breakpoint
CREATE INDEX "registration_status_idx" ON "registrations" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "team_owner_event_unique" ON "teams" ("owner_id","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "team_name_event_unique" ON "teams" ("name","event_id");--> statement-breakpoint
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id");--> statement-breakpoint
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;