#!/usr/bin/env bash
# Deploy new bot files after an upload or git pull. Usage: sudo bash deploy/update.sh
set -euo pipefail
APP_DIR=/opt/valorant-hub/bot
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then rsync -a --delete --exclude node_modules --exclude .env "$SRC_DIR/" "$APP_DIR/"; fi
cd "$APP_DIR"
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
chown -R valbot:valbot /opt/valorant-hub
sudo -u valbot node src/deploy-commands.js
systemctl restart valorant-hub-bot
systemctl --no-pager status valorant-hub-bot | head -n 5
