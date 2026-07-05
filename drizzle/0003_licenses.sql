-- Xico Clean commerce: Stripe orders → issued activation keys → device seats.
-- Idempotent; deploy/update.sh re-runs every migration on each deploy.

DO $$ BEGIN
  CREATE TYPE mac_license_plan AS ENUM ('personal', 'family');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mac_order_status AS ENUM ('pending', 'paid', 'refunded', 'failed', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE mac_license_status AS ENUM ('active', 'refunded', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS mac_orders (
  id serial PRIMARY KEY,
  order_no varchar(64) NOT NULL UNIQUE,
  plan mac_license_plan NOT NULL,
  email varchar(256),
  amount integer NOT NULL,
  currency varchar(8) NOT NULL,
  status mac_order_status NOT NULL DEFAULT 'pending',
  provider varchar(24) NOT NULL DEFAULT 'stripe',
  provider_session_id varchar(256) UNIQUE,
  provider_payment_intent varchar(256),
  checkout_url text,
  locale varchar(8),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS mac_orders_status_idx ON mac_orders (status);
CREATE INDEX IF NOT EXISTS mac_orders_created_at_idx ON mac_orders (created_at);

CREATE TABLE IF NOT EXISTS mac_licenses (
  id serial PRIMARY KEY,
  license_uid varchar(64) NOT NULL UNIQUE,
  key_hash varchar(128) NOT NULL UNIQUE,
  key_encrypted text NOT NULL,
  key_last4 varchar(4) NOT NULL,
  plan mac_license_plan NOT NULL,
  seats integer NOT NULL DEFAULT 1,
  max_major_version integer NOT NULL DEFAULT 99,
  email varchar(256),
  order_id integer REFERENCES mac_orders (id) ON DELETE SET NULL,
  status mac_license_status NOT NULL DEFAULT 'active',
  activated_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mac_licenses_email_idx ON mac_licenses (email);
-- One license per order (NULLs are distinct in Postgres, so admin-issued keys
-- with no order are unconstrained). Makes webhook fulfilment idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS mac_licenses_order_id_unique
  ON mac_licenses (order_id);

CREATE TABLE IF NOT EXISTS mac_license_activations (
  id serial PRIMARY KEY,
  license_id integer NOT NULL REFERENCES mac_licenses (id) ON DELETE CASCADE,
  device_id varchar(128) NOT NULL,
  device_name varchar(128),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS mac_license_activations_unique
  ON mac_license_activations (license_id, device_id);

CREATE TABLE IF NOT EXISTS mac_payment_events (
  event_id varchar(128) PRIMARY KEY,
  event_type varchar(64) NOT NULL,
  order_no varchar(64),
  received_at timestamptz NOT NULL DEFAULT now()
);
