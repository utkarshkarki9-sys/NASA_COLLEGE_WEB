CREATE FUNCTION assign_registration_id() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.registration_id := 'NASA2026-BIAS-' || lpad(NEW.id::text, greatest(4, length(NEW.id::text)), '0');
  RETURN NEW;
END; $$;
CREATE TRIGGER registration_id_from_sequence BEFORE INSERT ON registrations FOR EACH ROW EXECUTE FUNCTION assign_registration_id();

CREATE FUNCTION enforce_team_membership() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE team_uuid uuid; expected integer; actual integer; leaders integer; event_key text;
BEGIN
  IF TG_TABLE_NAME = 'teams' THEN team_uuid := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN team_uuid := OLD.team_id;
  ELSE team_uuid := NEW.team_id; END IF;
  SELECT declared_size, event_id INTO expected, event_key FROM teams WHERE id = team_uuid;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT count(*), count(*) FILTER (WHERE role = 'Team leader' AND position = 0) INTO actual, leaders FROM participants WHERE team_id = team_uuid;
  IF actual NOT BETWEEN 4 AND 6 OR actual <> expected OR leaders <> 1 OR EXISTS (SELECT 1 FROM participants WHERE team_id = team_uuid AND event_id <> event_key) THEN
    RAISE EXCEPTION 'Team must have 4–6 members, matching event, and one leader' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM registrations WHERE team_id=team_uuid) THEN
    RAISE EXCEPTION 'A team requires a registration' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (SELECT 1 FROM participants WHERE team_id=team_uuid AND age<18) AND NOT EXISTS (SELECT 1 FROM registrations WHERE team_id=team_uuid AND guardian_consent=true) THEN
    RAISE EXCEPTION 'Guardian consent is required for minors' USING ERRCODE = '23514';
  END IF;
  IF TG_TABLE_NAME = 'participants' AND TG_OP = 'UPDATE' THEN
    IF OLD.team_id <> NEW.team_id AND EXISTS (SELECT 1 FROM teams WHERE id=OLD.team_id) THEN
      IF (SELECT count(*) FROM participants WHERE team_id=OLD.team_id) <> (SELECT declared_size FROM teams WHERE id=OLD.team_id) THEN
        RAISE EXCEPTION 'Previous team size must remain valid' USING ERRCODE = '23514';
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END; $$;
CREATE CONSTRAINT TRIGGER team_members_count AFTER INSERT OR UPDATE ON teams DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_team_membership();
CREATE CONSTRAINT TRIGGER participant_team_count AFTER INSERT OR UPDATE OR DELETE ON participants DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_team_membership();
CREATE CONSTRAINT TRIGGER registration_team_integrity AFTER INSERT OR UPDATE OR DELETE ON registrations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_team_membership();
ALTER TABLE participants ADD CONSTRAINT normalized_email CHECK (email = lower(trim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
ALTER TABLE participants ADD CONSTRAINT normalized_mobile CHECK (mobile ~ '^\+[0-9]{10,15}$');
ALTER TABLE participants ADD CONSTRAINT participant_nonempty CHECK (length(trim(name)) >= 2 AND length(trim(institution)) >= 2 AND position BETWEEN 0 AND 5);
ALTER TABLE teams ADD CONSTRAINT team_nonempty CHECK (length(trim(name)) >= 2 AND length(trim(institution)) >= 2);
CREATE UNIQUE INDEX team_name_case_insensitive ON teams(event_id, lower(name));
CREATE UNIQUE INDEX team_single_leader ON participants(team_id) WHERE role = 'Team leader';
CREATE UNIQUE INDEX single_check_in ON verification_records(registration_id);

CREATE FUNCTION astro_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce(current_setting('astro.is_admin', true), '') = 'true' $$;
CREATE FUNCTION astro_team_access(team_uuid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT astro_admin() OR EXISTS (SELECT 1 FROM teams WHERE id = team_uuid AND owner_id = current_setting('astro.user_id', true)) OR EXISTS (SELECT 1 FROM participants WHERE team_id = team_uuid AND email = current_setting('astro.email', true));
$$;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_read ON teams FOR SELECT USING (astro_team_access(id));
CREATE POLICY team_insert ON teams FOR INSERT WITH CHECK (owner_id = current_setting('astro.user_id', true) OR astro_admin());
CREATE POLICY team_admin ON teams FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY participant_read ON participants FOR SELECT USING (astro_team_access(team_id));
CREATE POLICY participant_insert ON participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM teams WHERE id=team_id AND owner_id=current_setting('astro.user_id',true)) OR astro_admin());
CREATE POLICY participant_admin ON participants FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY registration_read ON registrations FOR SELECT USING (astro_team_access(team_id));
CREATE POLICY registration_insert ON registrations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM teams WHERE id=team_id AND owner_id=current_setting('astro.user_id',true)) OR astro_admin());
CREATE POLICY registration_admin ON registrations FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY mentor_read ON mentors FOR SELECT USING (astro_team_access(team_id));
CREATE POLICY mentor_insert ON mentors FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM teams WHERE id=team_id AND owner_id=current_setting('astro.user_id',true)) OR astro_admin());
CREATE POLICY mentor_admin ON mentors FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY verification_admin ON verification_records FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY audit_admin ON admin_audit FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY event_read ON events FOR SELECT USING (true);
CREATE POLICY event_admin ON events FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());
CREATE POLICY gallery_read ON gallery FOR SELECT USING (visible OR astro_admin());
CREATE POLICY gallery_admin ON gallery FOR ALL USING (astro_admin()) WITH CHECK (astro_admin());

CREATE FUNCTION public_verification(reference uuid) RETURNS TABLE(registration_id text, team_name text, institution text, status text, team_size integer, checked_in boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT r.registration_id, t.name, t.institution, r.status, t.declared_size, EXISTS(SELECT 1 FROM verification_records v WHERE v.registration_id=r.id)
  FROM registrations r JOIN teams t ON t.id=r.team_id WHERE r.verification_token=reference;
$$;
INSERT INTO events(id,name,starts_at,ends_at,venue) VALUES ('astroverse-2026','NASA International Space Apps Challenge 2026','2026-11-14T00:00:00+05:30','2026-11-15T23:59:59+05:30','Birla Institute of Applied Sciences, Bhimtal, Uttarakhand');
INSERT INTO gallery(path,caption,position)
SELECT '/gallery/event-' || lpad(number::text,2,'0') || '.jpeg',
  (ARRAY['A room full of possibilities','Sharing ideas at Space Apps','Celebrating the innovators','Our Space Apps community','Ideas take the stage','Learning together','Recognizing creative solutions','The teams behind the ideas','Building real-world prototypes','A new generation of problem solvers','From concepts to code','One team. Many possibilities.','Mentorship in action','Collaboration at the workstations','Working through the challenge','The campus comes together','Engineering a new perspective','Stories from the launchpad','A moment of discovery','Exploring beyond the classroom'])[number], number
FROM generate_series(1,20) number;
