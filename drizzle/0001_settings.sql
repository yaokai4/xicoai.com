-- Key-value settings store (idempotent; safe to re-run).
CREATE TABLE IF NOT EXISTS settings (
  key varchar(64) PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
