#!/usr/bin/env bash
# First-time provisioning on a fresh Ubuntu/Debian host (e.g. AWS EC2).
# Installs Docker, clones the repo, generates .env, then deploys.
#
#   ADMIN_PASSWORD='your-admin-pass' bash deploy/setup.sh
#
# (Run from a clone, or curl this file down first. Re-running is safe.)
set -euo pipefail

REPO="https://github.com/yaokai4/xicoai.com.git"
APP_DIR="${APP_DIR:-/opt/xicoai.com}"

# ── Docker ──────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  echo "▸ Installing Docker…"
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
fi

# ── Code ────────────────────────────────────────────────────
if [ ! -d "$APP_DIR/.git" ]; then
  echo "▸ Cloning repo into $APP_DIR…"
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER":"$(id -gn)" "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ── Environment ─────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "▸ Generating .env with fresh secrets…"
  cp .env.example .env
  ADMINPW="${ADMIN_PASSWORD:-$(openssl rand -hex 12)}"
  ADMINUSER="${ADMIN_USERNAME:-admin}"
  printf '\nPOSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 24)" >> .env
  sed -i "s|^ADMIN_USERNAME=.*|ADMIN_USERNAME=${ADMINUSER}|" .env
  sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMINPW}|" .env
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://xicoai.com|" .env
  echo "  → admin login:  ${ADMINUSER} / ${ADMINPW}"
  echo "  (saved in $APP_DIR/.env — edit SMTP_PASS there to enable email)"
fi

# ── Build + migrate + seed ──────────────────────────────────
bash deploy/update.sh

cat <<'EOF'

────────────────────────────────────────────────────────
✓ xicoai.com is up.

  • Site   : https://xicoai.com
  • Admin  : https://xicoai.com/admin
  • Update : bash /opt/xicoai.com/deploy/update.sh

Make sure inbound 80 and 443 are open in the AWS security
group, and that xicoai.com + www point at this host — Caddy
needs both to issue the HTTPS certificate.
────────────────────────────────────────────────────────
EOF
