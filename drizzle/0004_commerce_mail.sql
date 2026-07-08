-- 0004: manual license issuance (admin console) + self-hosted mail system.
-- Idempotent by construction — deploy/update.sh re-applies every deploy.

ALTER TABLE mac_licenses ADD COLUMN IF NOT EXISTS source varchar(16) NOT NULL DEFAULT 'purchase';
ALTER TABLE mac_licenses ADD COLUMN IF NOT EXISTS note varchar(256);

CREATE TABLE IF NOT EXISTS mail_subscribers (
  id serial PRIMARY KEY,
  email varchar(256) NOT NULL UNIQUE,
  name varchar(128),
  locale varchar(8),
  source varchar(16) NOT NULL DEFAULT 'manual',
  status varchar(16) NOT NULL DEFAULT 'subscribed',
  token varchar(64) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mail_campaigns (
  id serial PRIMARY KEY,
  subject varchar(256) NOT NULL,
  preheader varchar(256),
  body_text text NOT NULL,
  audience varchar(16) NOT NULL DEFAULT 'subscribed',
  status varchar(16) NOT NULL DEFAULT 'draft',
  total_queued integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS mail_outbox (
  id serial PRIMARY KEY,
  kind varchar(16) NOT NULL DEFAULT 'transactional',
  campaign_id integer REFERENCES mail_campaigns(id) ON DELETE SET NULL,
  to_email varchar(320) NOT NULL,
  subject varchar(512) NOT NULL,
  text text NOT NULL,
  html text,
  headers jsonb,
  status varchar(16) NOT NULL DEFAULT 'queued',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  message_id varchar(512),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS mail_outbox_status_idx ON mail_outbox (status, id);
-- retry backoff (safe to re-run; also covers tables created by an older 0004)
ALTER TABLE mail_outbox ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS mail_messages (
  id serial PRIMARY KEY,
  direction varchar(4) NOT NULL,
  from_email varchar(320),
  from_name varchar(256),
  to_email varchar(320),
  rcpt jsonb,
  subject text,
  text text,
  html text,
  message_id varchar(512),
  in_reply_to varchar(512),
  attachments jsonb,
  unread boolean NOT NULL DEFAULT true,
  archived boolean NOT NULL DEFAULT false,
  outbox_id integer REFERENCES mail_outbox(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mail_messages_dir_idx ON mail_messages (direction, archived, id DESC);
