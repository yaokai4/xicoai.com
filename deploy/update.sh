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
# seed.sql is idempotent (ON CONFLICT DO NOTHING)
$COMPOSE exec -T db psql -U xico -d xico < drizzle/seed.sql

echo "▸ Cleaning up old images…"
$DC image prune -f >/dev/null 2>&1 || true

echo ""
echo "✓ Deployed → https://xicoai.com"
$COMPOSE ps
