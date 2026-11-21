#!/usr/bin/env bash
# Install the bot on Ubuntu next to the website (run the website installer first).
# Usage, from the bot folder on the VPS:  sudo bash deploy/install.sh
set -euo pipefail
APP_DIR=/opt/valorant-hub/bot
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [[ $EUID -ne 0 ]]; then echo "Run with sudo."; exit 1; fi
command -v node >/dev/null || { echo "Node.js missing. Run the website installer first."; exit 1; }
id -u valbot >/dev/null 2>&1 || useradd --system --create-home --home-dir /opt/valorant-hub --shell /usr/sbin/nologin valbot
mkdir -p "$APP_DIR" /opt/valorant-hub/website/data
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then
  apt-get install -y rsync >/dev/null
  rsync -a --delete --exclude node_modules --exclude .env "$SRC_DIR/" "$APP_DIR/"
fi
if [[ ! -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  sed -i "s|^DATA_DIR=.*|DATA_DIR=/opt/valorant-hub/website/data|" "$APP_DIR/.env"
  # Reuse keys already in the website .env when present
  WEB_ENV=/opt/valorant-hub/website/.env
  if [[ -f "$WEB_ENV" ]]; then
    for K in DISCORD_CLIENT_ID HENRIK_API_KEY; do
      V="$(grep -E "^$K=" "$WEB_ENV" | cut -d= -f2- || true)"
      [[ -n "$V" ]] && sed -i "s|^$K=.*|$K=$V|" "$APP_DIR/.env"
    done
    V="$(grep -E '^DISCORD_BOT_TOKEN=' "$WEB_ENV" | cut -d= -f2- || true)"
    [[ -n "$V" ]] && sed -i "s|^DISCORD_TOKEN=.*|DISCORD_TOKEN=$V|" "$APP_DIR/.env"
    V="$(grep -E '^PUBLIC_URL=' "$WEB_ENV" | cut -d= -f2- || true)"
    [[ -n "$V" ]] && sed -i "s|^DASHBOARD_URL=.*|DASHBOARD_URL=$V|" "$APP_DIR/.env"
  fi
fi
chmod 600 "$APP_DIR/.env"
cd "$APP_DIR"
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
chown -R valbot:valbot /opt/valorant-hub
sudo -u valbot node src/deploy-commands.js || echo "Command registration failed: check DISCORD_TOKEN and DISCORD_CLIENT_ID in $APP_DIR/.env, then run: cd $APP_DIR && sudo -u valbot npm run deploy-commands"
cp deploy/valorant-hub-bot.service /etc/systemd/system/valorant-hub-bot.service
systemctl daemon-reload
systemctl enable --now valorant-hub-bot
echo "Done. Logs: sudo journalctl -u valorant-hub-bot -f"
