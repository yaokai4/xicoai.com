-- 0005: per-mailbox password policy. A row means "this account must change its
-- password before using webmail" (set on admin create / admin reset; cleared
-- when the user self-changes). No row = no forced change (existing accounts are
-- never retroactively forced). Idempotent — deploy/update.sh re-applies it.

CREATE TABLE IF NOT EXISTS mail_password_policy (
  email varchar(320) PRIMARY KEY,
  must_change boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
