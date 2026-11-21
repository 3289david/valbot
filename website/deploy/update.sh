#!/usr/bin/env bash
# Deploy a new version after you upload or git pull new files into the source folder.
# Usage (on the VPS, from the website folder):  sudo bash deploy/update.sh
set -euo pipefail
APP_DIR=/opt/valorant-hub/website
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$SRC_DIR" != "$APP_DIR" ]]; then
  rsync -a --delete --exclude node_modules --exclude data --exclude .env "$SRC_DIR/" "$APP_DIR/"
fi
cd "$APP_DIR"
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
chown -R valbot:valbot /opt/valorant-hub
systemctl restart valorant-hub-web
systemctl --no-pager status valorant-hub-web | head -n 5
