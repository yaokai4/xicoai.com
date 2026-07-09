#!/usr/bin/env bash
# Sync Caddy's auto-renewed Let's Encrypt cert for mail.xicoai.com into the
# Stalwart volume, and restart Stalwart only when the cert actually changed.
# Stalwart's own ACME is stuck (it never re-attempts after the first failure),
# so Caddy (which owns 80/443) is the issuer and this script is the bridge.
#
# Installed on the host as a systemd timer (mail-cert-sync.timer, daily 03:30):
#   /etc/systemd/system/mail-cert-sync.service  -> ExecStart this script
#   /etc/systemd/system/mail-cert-sync.timer    -> OnCalendar=*-*-* 03:30:00
set -euo pipefail
CDIR="/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.xicoai.com"
TMPC=$(mktemp); TMPK=$(mktemp)
trap 'rm -f "$TMPC" "$TMPK"' EXIT
docker exec xicoai-caddy cat "$CDIR/mail.xicoai.com.crt" > "$TMPC"
docker exec xicoai-caddy cat "$CDIR/mail.xicoai.com.key" > "$TMPK"
[ -s "$TMPC" ] && [ -s "$TMPK" ] || { echo "$(date -u +%FT%TZ) ERROR: empty cert from caddy"; exit 1; }
CUR=$(docker exec xicoai-stalwart cat /opt/stalwart/tls/mail.crt 2>/dev/null | sha256sum | cut -d" " -f1 || true)
NEW=$(sha256sum "$TMPC" | cut -d" " -f1)
if [ "$CUR" = "$NEW" ]; then
  echo "$(date -u +%FT%TZ) cert unchanged"
  exit 0
fi
docker cp "$TMPC" xicoai-stalwart:/opt/stalwart/tls/mail.crt
docker cp "$TMPK" xicoai-stalwart:/opt/stalwart/tls/mail.key
docker exec -u root xicoai-stalwart sh -c 'chown stalwart:stalwart /opt/stalwart/tls/mail.crt /opt/stalwart/tls/mail.key; chmod 644 /opt/stalwart/tls/mail.crt; chmod 640 /opt/stalwart/tls/mail.key'
docker restart xicoai-stalwart >/dev/null
echo "$(date -u +%FT%TZ) cert UPDATED and stalwart restarted"
