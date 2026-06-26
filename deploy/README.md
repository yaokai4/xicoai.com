# Deploy

Self-contained single-host deployment: **Postgres + Next.js app + Caddy**
(automatic HTTPS via Let's Encrypt). See `../docker-compose.prod.yml`.

## Prerequisites
- A host (e.g. AWS EC2) with `xicoai.com` **and** `www.xicoai.com` DNS A
  records pointing at it.
- Inbound **22, 80, 443** open in the firewall / security group
  (80 + 443 are required for Caddy to issue the certificate).

## First time
On the server:

```bash
curl -fsSL https://raw.githubusercontent.com/yaokai4/xicoai.com/main/deploy/setup.sh \
  | ADMIN_PASSWORD='your-admin-pass' bash
```

This installs Docker, clones to `/opt/xicoai.com`, writes `.env` with
freshly generated `POSTGRES_PASSWORD` / `AUTH_SECRET`, then builds and
starts everything and applies the schema + seed.

## Update (one click)
After pushing changes to `main`:

```bash
bash /opt/xicoai.com/deploy/update.sh
```

Pulls latest, rebuilds, restarts, and re-applies the idempotent seed.

## Notes
- Secrets live only in `/opt/xicoai.com/.env` (git-ignored) — never the repo.
- To enable transactional email, set `SMTP_PASS` in that `.env` and re-run update.
- Moving to a China host later: keep this stack; HTTPS there additionally
  requires ICP 备案 for the domain before a cert can be issued.
