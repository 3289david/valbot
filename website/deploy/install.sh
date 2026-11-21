#!/usr/bin/env bash
# One-time setup of the Valorant Hub website on Ubuntu 22.04 / 24.04.
# Run from the website folder on the VPS:   sudo bash deploy/install.sh your.domain.com you@email.com
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"
APP_DIR=/opt/valorant-hub/website
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ $EUID -ne 0 ]]; then echo "Run with sudo."; exit 1; fi
if [[ -z "$DOMAIN" ]]; then echo "Usage: sudo bash deploy/install.sh your.domain.com you@email.com"; exit 1; fi

echo "==> Installing packages (Node.js 20, Nginx, Certbot)"
apt-get update -y
apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx rsync
if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Creating service user and app folder"
id -u valbot >/dev/null 2>&1 || useradd --system --create-home --home-dir /opt/valorant-hub --shell /usr/sbin/nologin valbot
mkdir -p "$APP_DIR"
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then
  rsync -a --delete --exclude node_modules --exclude data --exclude .env "$SRC_DIR/" "$APP_DIR/"
fi
mkdir -p "$APP_DIR/data"

if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$SECRET|" "$APP_DIR/.env"
  sed -i "s|^PUBLIC_URL=.*|PUBLIC_URL=https://$DOMAIN|" "$APP_DIR/.env"
  echo "    Created $APP_DIR/.env  -> fill in DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN, HENRIK_API_KEY"
fi
chmod 600 "$APP_DIR/.env"

echo "==> Installing Node dependencies"
cd "$APP_DIR"
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
chown -R valbot:valbot /opt/valorant-hub

echo "==> systemd service"
cp "$APP_DIR/deploy/valorant-hub-web.service" /etc/systemd/system/valorant-hub-web.service
systemctl daemon-reload
systemctl enable --now valorant-hub-web

echo "==> Nginx"
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$APP_DIR/deploy/nginx-valorant-hub.conf" > /etc/nginx/sites-available/valorant-hub
ln -sf /etc/nginx/sites-available/valorant-hub /etc/nginx/sites-enabled/valorant-hub
nginx -t
systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full'
fi

if [[ -n "$EMAIL" ]]; then
  echo "==> HTTPS certificate"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
  echo "    Skipped HTTPS. Run: sudo certbot --nginx -d $DOMAIN"
fi

echo
echo "Done. Next:"
echo "  1. sudo nano $APP_DIR/.env   (fill in the Discord and HenrikDev values)"
echo "  2. sudo systemctl restart valorant-hub-web"
echo "  3. Add https://$DOMAIN/auth/callback as an OAuth2 redirect in the Discord Developer Portal"
echo "  4. Logs: sudo journalctl -u valorant-hub-web -f"
