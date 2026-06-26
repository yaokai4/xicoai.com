#!/usr/bin/env bash
# One-click deploy/update: pull latest, rebuild, restart, migrate + seed.
# Idempotent — safe to run any time.   usage:  bash deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# Use docker without sudo if possible, else with sudo (fresh installs).
if docker info >/dev/null 2>&1; then DC="docker"; else DC="sudo docker"; fi
COMPOSE="$DC compose -f docker-compose.prod.yml"

echo "▸ Pulling latest code…"
git pull --ff-only

echo "▸ Building & (re)starting containers…"
$COMPOSE up -d --build

echo "▸ Waiting for the database to be ready…"
for _ in $(seq 1 30); do
  $COMPOSE exec -T db pg_isready -U xico -d xico >/dev/null 2>&1 && break
  sleep 2
done

echo "▸ Applying schema (if missing) and seed data…"
has_posts=$($COMPOSE exec -T db psql -U xico -d xico -tAc \
  "SELECT to_regclass('public.posts')" </dev/null 2>/dev/null | tr -d '[:space:]' || true)
if [ -z "$has_posts" ]; then
  $COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -U xico -d xico < drizzle/0000_robust_cyclops.sql
fi
# incremental migrations (0001+) are written idempotently (IF NOT EXISTS)
for mig in $(ls drizzle/*.sql 2>/dev/null | grep -vE '0000_|seed' | sort); do
  $COMPOSE exec -T db psql -U xico -d xico < "$mig" >/dev/null 2>&1 && echo "  applied $(basename "$mig")"
done
# seed.sql is idempotent (ON CONFLICT DO NOTHING)
$COMPOSE exec -T db psql -U xico -d xico < drizzle/seed.sql

# The Caddyfile is a bind-mounted file; git-pull replaces its inode, so a
# running caddy won't see edits until recreated. Recreate only if it changed.
if [ "$($COMPOSE exec -T caddy cat /etc/caddy/Caddyfile </dev/null 2>/dev/null || true)" != "$(cat deploy/Caddyfile)" ]; then
  echo "▸ Caddyfile changed — recreating caddy…"
  $COMPOSE up -d --force-recreate caddy
fi

echo "▸ Cleaning up old images…"
$DC image prune -f >/dev/null 2>&1 || true

echo ""
echo "✓ Deployed → https://xicoai.com"
$COMPOSE ps
