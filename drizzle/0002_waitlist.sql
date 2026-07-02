-- Xico Clean early-access waitlist (idempotent; safe to re-run).
DO $$ BEGIN
  CREATE TYPE waitlist_status AS ENUM ('new', 'invited', 'converted', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS waitlist_signups (
  id serial PRIMARY KEY,
  email varchar(256) NOT NULL UNIQUE,
  name varchar(128),
  product varchar(48) NOT NULL DEFAULT 'xico-clean',
  source varchar(64),
  locale varchar(8),
  status waitlist_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
