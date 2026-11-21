'use strict';
/*
 * Server settings. The website dashboard writes data/guilds/<guildId>.json; the bot reads it
 * (re-reading when the file changes) and writes it only from /setup actions.
 * Defaults and validation match website/server.js.
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { dataDir } = require('../config');

const TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'ascendant', 'immortal', 'radiant'];

function defaults() {
  return {
    general: { language: 'auto', timezone: 'Asia/Seoul', region: 'kr', defaultRanking: 'rr', publicStats: false },
    features: { autoRoles: true, notifications: true, scrims: true, parties: true, duels: true, clubs: true, tournaments: true, analytics: true },
    tierRoles: { ...Object.fromEntries(TIERS.map((t) => [t, null])), unlinked: null, peakRole: false, restoreManualEdits: true },
    panels: { hub: null, leaderboard: null, scrims: null, lfg: null, duels: null, clubs: null, tournament: null, admin: null },
    notifications: {
      channel: null, rankUp: true, rankDown: false, rrChange: false, matchEnd: false, streak: true,
      streakThreshold: 5, seasonEnd: true, events: true, tournament: true, cooldownMinutes: 10,
    },
    weeklyRecap: { enabled: false, channel: null, day: 0, hour: 20 },
  };
}

const isSnowflake = (v) => typeof v === 'string' && /^\d{15,25}$/.test(v);
const ENUMS = {
  'general.language': ['auto', 'ko', 'en'],
  'general.region': ['ap', 'br', 'eu', 'kr', 'latam', 'na'],
  'general.defaultRanking': ['rr', 'tier', 'winrate', 'kd', 'acs'],
};
const RANGES = {
  'notifications.streakThreshold': [2, 20],
  'notifications.cooldownMinutes': [0, 1440],
  'weeklyRecap.day': [0, 6],
  'weeklyRecap.hour': [0, 23],
};

function validTz(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
}

function sanitize(def, input, prefix = '') {
  const out = {};
  for (const [key, d] of Object.entries(def)) {
    const at = prefix ? `${prefix}.${key}` : key;
    const v = input && Object.prototype.hasOwnProperty.call(input, key) ? input[key] : undefined;
    if (d !== null && typeof d === 'object') out[key] = sanitize(d, v && typeof v === 'object' ? v : {}, at);
    else if (d === null) out[key] = isSnowflake(v) ? v : null;
    else if (typeof d === 'boolean') out[key] = typeof v === 'boolean' ? v : d;
    else if (typeof d === 'number') {
      const n = Number(v);
      const r = RANGES[at];
      out[key] = Number.isInteger(n) && (!r || (n >= r[0] && n <= r[1])) ? n : d;
    } else if (typeof d === 'string') {
      if (ENUMS[at]) out[key] = ENUMS[at].includes(v) ? v : d;
      else if (at === 'general.timezone') out[key] = typeof v === 'string' && validTz(v) ? v : d;
      else out[key] = typeof v === 'string' ? v : d;
    }
  }
  return out;
}

const file = (guildId) => path.join(dataDir, 'guilds', `${guildId}.json`);
const auditFile = (guildId) => path.join(dataDir, 'audit', `${guildId}.json`);
const cache = new Map(); // guildId -> { mtimeMs, settings, checkedAt }

function get(guildId) {
  if (!guildId) return defaults();
  const hit = cache.get(guildId);
  const now = Date.now();
  if (hit && now - hit.checkedAt < 5000) return hit.settings;
  let mtimeMs = 0;
  try { mtimeMs = fs.statSync(file(guildId)).mtimeMs; } catch (e) { mtimeMs = 0; }
  if (hit && hit.mtimeMs === mtimeMs) {
    hit.checkedAt = now;
    return hit.settings;
  }
  let saved = null;
  if (mtimeMs) {
    try { saved = JSON.parse(fs.readFileSync(file(guildId), 'utf8')); } catch (e) { saved = null; }
  }
  const settings = sanitize(defaults(), saved ? saved.settings : {});
  cache.set(guildId, { mtimeMs, settings, checkedAt: now });
  return settings;
}

/** Apply a change from the bot (e.g. /setup created tier roles). Recorded in the audit log like dashboard edits. */
async function update(guildId, mutate, actor) {
  let saved = null;
  try { saved = JSON.parse(await fsp.readFile(file(guildId), 'utf8')); } catch (e) { saved = null; }
  const before = sanitize(defaults(), saved ? saved.settings : {});
  const next = JSON.parse(JSON.stringify(before));
  mutate(next);
  const clean = sanitize(defaults(), next);
  const changes = [];
  (function diff(a, b, p) {
    for (const k of Object.keys(a)) {
      const at = p ? `${p}.${k}` : k;
      if (a[k] !== null && typeof a[k] === 'object') diff(a[k], b[k] || {}, at);
      else if (a[k] !== b[k]) changes.push({ key: at, from: b[k] ?? null, to: a[k] });
    }
  })(clean, before, '');
  const updatedAt = new Date().toISOString();
  await writeAtomic(file(guildId), { settings: clean, updatedAt, updatedBy: actor ? actor.id : 'bot' });
  if (changes.length) {
    let log = [];
    try { log = JSON.parse(await fsp.readFile(auditFile(guildId), 'utf8')); } catch (e) { log = []; }
    log.unshift({ userId: actor ? actor.id : 'bot', username: actor ? `${actor.username} (via bot)` : 'Valorant Hub bot', action: 'settings.update', changes, at: updatedAt });
    await writeAtomic(auditFile(guildId), log.slice(0, 500));
  }
  cache.delete(guildId);
  return clean;
}

async function writeAtomic(f, data) {
  await fsp.mkdir(path.dirname(f), { recursive: true });
  const tmp = `${f}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
  await fsp.rename(tmp, f);
}

module.exports = { get, update, defaults, sanitize, TIERS };
