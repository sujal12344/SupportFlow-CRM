-- Supabase Schema Setup for Support CRM System
-- Run this script in the Supabase SQL Editor to initialize your database.

-- 1. Create a sequence for Ticket IDs
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1001;

-- 2. Create the tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE,  -- auto-filled by trigger (TKT-1001, TKT-1002, ...)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CONSTRAINT check_status CHECK (status IN ('Open', 'In Progress', 'Closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Trigger to automatically generate ticket_id (e.g. TKT-1001, TKT-1002)
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := 'TKT-' || nextval('ticket_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_generate_ticket_id
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_id();

-- 5. Trigger to automatically update the updated_at timestamp on edit
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Indexes for faster search and filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes(ticket_id);

-- 7. Row Level Security (required when RLS is enabled in Supabase)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anon key (used by this CRM) to read/write tickets and notes
DROP POLICY IF EXISTS "crm_tickets_select" ON tickets;
DROP POLICY IF EXISTS "crm_tickets_insert" ON tickets;
DROP POLICY IF EXISTS "crm_tickets_update" ON tickets;
DROP POLICY IF EXISTS "crm_notes_select" ON notes;
DROP POLICY IF EXISTS "crm_notes_insert" ON notes;

CREATE POLICY "crm_tickets_select" ON tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "crm_tickets_insert" ON tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "crm_tickets_update" ON tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "crm_notes_select" ON notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "crm_notes_insert" ON notes FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Ticket ID sequence must be readable for the insert trigger
GRANT USAGE, SELECT ON SEQUENCE ticket_seq TO anon, authenticated;
