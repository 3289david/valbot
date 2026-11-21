'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const int = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  devGuildId: process.env.DEV_GUILD_ID || '',
  henrikKey: process.env.HENRIK_API_KEY || '',
  henrikPerMinute: int(process.env.HENRIK_REQUESTS_PER_MINUTE, 25),
  dataDir: path.resolve(path.join(__dirname, '..'), process.env.DATA_DIR || '../website/data'),
  dashboardUrl: (process.env.DASHBOARD_URL || '').replace(/\/$/, ''),
  syncActiveMs: int(process.env.SYNC_ACTIVE_MINUTES, 10) * 60_000,
  syncIdleMs: int(process.env.SYNC_IDLE_MINUTES, 60) * 60_000,
};
