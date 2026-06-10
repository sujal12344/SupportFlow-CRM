-- Run this in Supabase → SQL Editor if you get:
-- "new row violates row-level security policy for table tickets"

-- Tickets policies
DROP POLICY IF EXISTS "crm_tickets_select" ON tickets;
DROP POLICY IF EXISTS "crm_tickets_insert" ON tickets;
DROP POLICY IF EXISTS "crm_tickets_update" ON tickets;
DROP POLICY IF EXISTS "Allow anonymous read/write" ON tickets;

CREATE POLICY "crm_tickets_select" ON tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "crm_tickets_insert" ON tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "crm_tickets_update" ON tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Notes policies
DROP POLICY IF EXISTS "crm_notes_select" ON notes;
DROP POLICY IF EXISTS "crm_notes_insert" ON notes;
DROP POLICY IF EXISTS "Allow anonymous read/write notes" ON notes;

CREATE POLICY "crm_notes_select" ON notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "crm_notes_insert" ON notes FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Sequence for auto ticket IDs (TKT-1001, ...)
GRANT USAGE, SELECT ON SEQUENCE ticket_seq TO anon, authenticated;
