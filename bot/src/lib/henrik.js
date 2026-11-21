'use strict';
/*
 * HenrikDev Valorant API client.
 * - One request queue for the whole bot, paced to HENRIK_REQUESTS_PER_MINUTE.
 * - Short response cache so 100 servers asking about the same player cost one request.
 * - "Not found" and "API error" are separate error codes.
 */
const { henrikKey, henrikPerMinute } = require('../config');

const BASE = 'https://api.henrikdev.xyz';
const PLATFORM = 'pc';
const REGIONS = ['ap', 'br', 'eu', 'kr', 'latam', 'na'];

class HenrikError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code; // not_found | rate_limited | api_error | no_key | network
    this.status = status;
  }
}

const queue = [];
let running = false;
let lastAt = 0;
const gap = Math.ceil(60_000 / henrikPerMinute);
const stats = { requests: 0, errors: 0, lastError: null, lastErrorAt: null, lastOkAt: null };

const cache = new Map();
function cached(key, ttl, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.promise;
  const promise = fn().catch((err) => { cache.delete(key); throw err; });
  cache.set(key, { at: Date.now(), promise });
  if (cache.size > 5000) cache.delete(cache.keys().next().value);
  return promise;
}

function enqueue(path, priority) {
  return new Promise((resolve, reject) => {
    const job = { path, resolve, reject };
    if (priority) queue.unshift(job); else queue.push(job);
    pump();
  });
}

async function pump() {
  if (running) return;
  running = true;
  while (queue.length) {
    const wait = lastAt + gap - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const job = queue.shift();
    lastAt = Date.now();
    try {
      job.resolve(await request(job.path));
    } catch (err) {
      job.reject(err);
    }
  }
  running = false;
}

async function request(path, attempt = 0) {
  if (!henrikKey) throw new HenrikError('no_key', 'HENRIK_API_KEY is not set.');
  stats.requests++;
  let res;
  try {
    res = await fetch(BASE + path, { headers: { Authorization: henrikKey, Accept: 'application/json' } });
  } catch (err) {
    stats.errors++;
    stats.lastError = `network: ${err.message}`;
    stats.lastErrorAt = new Date().toISOString();
    throw new HenrikError('network', 'Could not reach the HenrikDev API.');
  }
  const body = await res.json().catch(() => null);
  if (res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset')) || 30;
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, Math.min(reset, 60) * 1000));
      return request(path, attempt + 1);
    }
    stats.errors++;
    stats.lastError = 'rate limited';
    stats.lastErrorAt = new Date().toISOString();
    throw new HenrikError('rate_limited', 'HenrikDev rate limit reached.', 429);
  }
  if (res.status === 404) throw new HenrikError('not_found', 'Not found.', 404);
  if (!res.ok || !body) {
    const msg = body && body.errors && body.errors[0] && body.errors[0].message ? body.errors[0].message : `HTTP ${res.status}`;
    stats.errors++;
    stats.lastError = msg;
    stats.lastErrorAt = new Date().toISOString();
    throw new HenrikError('api_error', msg, res.status);
  }
  stats.lastOkAt = new Date().toISOString();
  return body.data;
}

const enc = encodeURIComponent;

module.exports = {
  REGIONS,
  HenrikError,
  stats,
  queueLength: () => queue.length,

  /** Account lookup by Riot ID. Fields: puuid, region, account_level, name, tag, card, title, updated_at */
  account(name, tag, priority = true) {
    return cached(`acc|${name.toLowerCase()}|${tag.toLowerCase()}`, 60_000, () => enqueue(`/valorant/v2/account/${enc(name)}/${enc(tag)}`, priority));
  },

  /** MMR v3: data.account, data.current {tier{id,name}, rr, elo, last_change, games_needed_for_rating, leaderboard_placement}, data.peak, data.seasonal */
  mmr(region, puuid, priority = false) {
    return cached(`mmr|${puuid}`, 60_000, () => enqueue(`/valorant/v3/by-puuid/mmr/${region}/${PLATFORM}/${enc(puuid)}`, priority));
  },

  /** MMR history v2: data.history[] {match_id, tier{id,name}, map{name}, season{short}, rr, last_change, elo, date} */
  mmrHistory(region, puuid, priority = false) {
    return cached(`mmrh|${puuid}`, 120_000, () => enqueue(`/valorant/v2/by-puuid/mmr-history/${region}/${PLATFORM}/${enc(puuid)}`, priority));
  },

  /** Matches v4 (max 10 per call). mode e.g. "competitive". */
  matches(region, puuid, { mode = 'competitive', size = 10, start = 0 } = {}, priority = false) {
    const q = new URLSearchParams({ size: String(size), start: String(start) });
    if (mode) q.set('mode', mode);
    return cached(`m|${puuid}|${mode}|${size}|${start}`, 60_000, () => enqueue(`/valorant/v4/by-puuid/matches/${region}/${PLATFORM}/${enc(puuid)}?${q}`, priority));
  },
};
