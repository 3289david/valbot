'use strict';
/*
 * JSON file store shared with the website.
 *   data/bot/_global/...        accounts, players, matches, rank snapshots (shared by all servers)
 *   data/bot/<guildId>/<name>.json  per-server collections (the dashboard reads these)
 * Files are cached in memory and written atomically shortly after a change.
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { dataDir } = require('../config');

const BOT_DIR = path.join(dataDir, 'bot');
const cache = new Map(); // file -> { data, timer }
const pending = new Set();

function readSync(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    // Corrupt file: keep a copy and start fresh rather than crash.
    try { fs.copyFileSync(file, `${file}.corrupt-${Date.now()}`); } catch (e) { /* ignore */ }
    console.error(`[store] could not parse ${file}: ${err.message}`);
    return fallback;
  }
}

async function writeAtomic(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
  await fsp.rename(tmp, file);
}

function load(file, fallback) {
  let entry = cache.get(file);
  if (!entry) {
    entry = { data: readSync(file, fallback), timer: null };
    cache.set(file, entry);
  }
  return entry;
}

function scheduleSave(file) {
  const entry = cache.get(file);
  if (!entry || entry.timer) return;
  pending.add(file);
  entry.timer = setTimeout(async () => {
    entry.timer = null;
    pending.delete(file);
    try {
      await writeAtomic(file, entry.data);
    } catch (err) {
      console.error(`[store] write failed ${file}: ${err.message}`);
    }
  }, 400);
}

const globalFile = (name) => path.join(BOT_DIR, '_global', `${name}.json`);
const guildFile = (guildId, name) => path.join(BOT_DIR, guildId, `${name}.json`);
const perPuuidFile = (kind, puuid) => path.join(BOT_DIR, '_global', kind, `${puuid}.json`);

/** Get a mutable reference; call save() after changing it. */
function doc(file, fallback) {
  const entry = load(file, fallback);
  return {
    get data() { return entry.data; },
    set data(v) { entry.data = v; },
    save() { scheduleSave(file); },
  };
}

module.exports = {
  BOT_DIR,
  global: (name, fallback) => doc(globalFile(name), fallback),
  guild: (guildId, name, fallback) => doc(guildFile(guildId, name), fallback),
  perPuuid: (kind, puuid, fallback) => doc(perPuuidFile(kind, puuid), fallback),
  guildDirs() {
    try {
      return fs.readdirSync(BOT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && /^\d+$/.test(d.name)).map((d) => d.name);
    } catch (e) {
      return [];
    }
  },
  async flush() {
    const files = [...pending];
    await Promise.all(files.map(async (file) => {
      const entry = cache.get(file);
      if (!entry) return;
      if (entry.timer) clearTimeout(entry.timer);
      entry.timer = null;
      pending.delete(file);
      await writeAtomic(file, entry.data);
    }));
  },
  newId(prefix) {
    return `${prefix}${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}`;
  },
};
