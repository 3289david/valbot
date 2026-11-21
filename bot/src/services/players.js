'use strict';
/*
 * Linked accounts, player cache, stored matches, rank snapshots and the background sync.
 * One Riot account is fetched once for the whole bot, however many servers it appears in.
 */
const { EventEmitter } = require('events');
const store = require('../lib/store');
const henrik = require('../lib/henrik');
const { toRecord, byNewest } = require('../lib/stats');
const { syncActiveMs, syncIdleMs, henrikPerMinute } = require('../config');

const bus = new EventEmitter();
bus.setMaxListeners(50);

const users = store.global('users', {}); // userId -> { accounts: [{puuid, region, main, linkedAt}], private }
const players = store.global('players', {}); // puuid -> player cache
const MAX_MATCHES = 200;
const MAX_SNAPSHOTS = 1500;

/* ---------------- Accessors ---------------- */

function userEntry(userId) { return users.data[userId] || null; }
function mainAccount(userId) {
  const u = userEntry(userId);
  if (!u || !u.accounts.length) return null;
  return u.accounts.find((a) => a.main) || u.accounts[0];
}
function player(puuid) { return players.data[puuid] || null; }
function playerOf(userId) {
  const acc = mainAccount(userId);
  return acc ? player(acc.puuid) : null;
}
function isPrivate(userId) { const u = userEntry(userId); return Boolean(u && u.private); }
function linkedUserIds() { return Object.keys(users.data).filter((id) => users.data[id].accounts.length); }
function userIdsForPuuid(puuid) {
  return linkedUserIds().filter((id) => mainAccount(id).puuid === puuid);
}
function matches(puuid) { return store.perPuuid('matches', puuid, []).data; }
function competitive(puuid, limit) {
  const list = matches(puuid).filter((m) => m.queue === 'competitive').sort(byNewest);
  return limit ? list.slice(0, limit) : list;
}
function snapshots(puuid) { return store.perPuuid('rank', puuid, []).data; }
function riotId(p) { return p ? `${p.name}#${p.tag}` : null; }

/** Rank value at or before a moment, from stored snapshots (null if none that old). */
function eloAt(puuid, isoOrMs) {
  const t = typeof isoOrMs === 'number' ? isoOrMs : Date.parse(isoOrMs);
  let best = null;
  for (const s of snapshots(puuid)) {
    const at = Date.parse(s.at);
    if (at <= t && typeof s.elo === 'number' && (!best || at > Date.parse(best.at))) best = s;
  }
  return best;
}

/* ---------------- Linking ---------------- */

async function link(userId, name, tag, regionHint) {
  const acc = await henrik.account(name, tag, true);
  if (!acc || !acc.puuid) throw new henrik.HenrikError('not_found', 'Not found');
  const region = henrik.REGIONS.includes(String(regionHint || '').toLowerCase())
    ? String(regionHint).toLowerCase()
    : henrik.REGIONS.includes(String(acc.region || '').toLowerCase()) ? String(acc.region).toLowerCase() : 'ap';

  const u = users.data[userId] || (users.data[userId] = { accounts: [], private: false });
  const existing = u.accounts.find((a) => a.puuid === acc.puuid);
  if (existing) existing.region = region;
  else u.accounts.push({ puuid: acc.puuid, region, main: u.accounts.length === 0, linkedAt: new Date().toISOString() });
  users.save();

  const p = players.data[acc.puuid] || (players.data[acc.puuid] = { puuid: acc.puuid });
  Object.assign(p, {
    name: acc.name,
    tag: acc.tag,
    region,
    accountLevel: typeof acc.account_level === 'number' ? acc.account_level : null,
    cardId: typeof acc.card === 'string' ? acc.card : acc.card && acc.card.id ? acc.card.id : null,
  });
  players.save();

  await sync(acc.puuid, { priority: true, force: true, seedHistory: true }).catch((err) => {
    p.lastError = err.message;
    p.lastErrorAt = new Date().toISOString();
  });
  bus.emit('linked', { userId, puuid: acc.puuid });
  return { account: acc, player: p, isNew: !existing };
}

function unlink(userId, puuid) {
  const u = users.data[userId];
  if (!u) return false;
  const before = u.accounts.length;
  u.accounts = puuid ? u.accounts.filter((a) => a.puuid !== puuid) : [];
  if (u.accounts.length && !u.accounts.some((a) => a.main)) u.accounts[0].main = true;
  if (!u.accounts.length && !u.lang) delete users.data[userId];
  users.save();
  const changed = before !== (u.accounts ? u.accounts.length : 0);
  if (changed) bus.emit('unlinked', { userId });
  return changed;
}

function setMain(userId, puuid) {
  const u = users.data[userId];
  if (!u || !u.accounts.some((a) => a.puuid === puuid)) return false;
  u.accounts.forEach((a) => { a.main = a.puuid === puuid; });
  users.save();
  bus.emit('linked', { userId, puuid });
  return true;
}

function setLang(userId, lang) {
  const u = users.data[userId] || (users.data[userId] = { accounts: [], private: false });
  if (lang === 'ko' || lang === 'en') u.lang = lang; else delete u.lang;
  if (!u.accounts.length && !u.lang) delete users.data[userId];
  users.save();
}

function setPrivate(userId, value) {
  const u = users.data[userId];
  if (!u) return false;
  u.private = Boolean(value);
  users.save();
  return true;
}

/* ---------------- Sync ---------------- */

const inFlight = new Map();

function sync(puuid, opts = {}) {
  if (inFlight.has(puuid)) return inFlight.get(puuid);
  const job = doSync(puuid, opts).finally(() => inFlight.delete(puuid));
  inFlight.set(puuid, job);
  return job;
}

async function doSync(puuid, { priority = false, force = false, seedHistory = false } = {}) {
  const p = players.data[puuid];
  if (!p) return null;
  const region = p.region || 'ap';
  const now = new Date().toISOString();

  // 1) Current rank
  const mmr = await henrik.mmr(region, puuid, priority);
  const before = p.current ? { ...p.current } : null;
  if (mmr && mmr.account) {
    if (mmr.account.name) p.name = mmr.account.name;
    if (mmr.account.tag) p.tag = mmr.account.tag;
  }
  const cur = mmr && mmr.current ? mmr.current : null;
  p.current = cur ? {
    tier: cur.tier ? cur.tier.name : null,
    tierId: cur.tier ? cur.tier.id : null,
    rr: typeof cur.rr === 'number' ? cur.rr : null,
    elo: typeof cur.elo === 'number' ? cur.elo : null,
    lastChange: typeof cur.last_change === 'number' ? cur.last_change : null,
    gamesNeeded: typeof cur.games_needed_for_rating === 'number' ? cur.games_needed_for_rating : null,
    leaderboardRank: cur.leaderboard_placement && typeof cur.leaderboard_placement.rank === 'number' ? cur.leaderboard_placement.rank : null,
  } : null;
  p.peak = mmr && mmr.peak && mmr.peak.tier ? { tier: mmr.peak.tier.name, tierId: mmr.peak.tier.id, season: mmr.peak.season ? mmr.peak.season.short : null } : null;
  p.lastSyncAt = now;
  p.lastError = null;

  // 2) Snapshot when something changed (or the first time)
  const snaps = store.perPuuid('rank', puuid, []);
  const last = snaps.data[snaps.data.length - 1];
  if (p.current && (!last || last.elo !== p.current.elo || last.tierId !== p.current.tierId || last.rr !== p.current.rr)) {
    snaps.data.push({ at: now, tier: p.current.tier, tierId: p.current.tierId, rr: p.current.rr, elo: p.current.elo, source: 'mmr' });
    if (snaps.data.length > MAX_SNAPSHOTS) snaps.data.splice(0, snaps.data.length - MAX_SNAPSHOTS);
    snaps.save();
  }

  // 3) Seed past rank changes from MMR history (real dated entries), once at link time
  if (seedHistory) {
    try {
      const hist = await henrik.mmrHistory(region, puuid, priority);
      const known = new Set(snaps.data.map((s) => s.matchId).filter(Boolean));
      const entries = (hist && Array.isArray(hist.history) ? hist.history : [])
        .filter((h) => h.date && !known.has(h.match_id))
        .map((h) => ({ at: h.date, tier: h.tier ? h.tier.name : null, tierId: h.tier ? h.tier.id : null, rr: h.rr ?? null, elo: h.elo ?? null, lastChange: h.last_change ?? null, matchId: h.match_id, map: h.map ? h.map.name : null, source: 'history' }));
      if (entries.length) {
        snaps.data = snaps.data.concat(entries).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).slice(-MAX_SNAPSHOTS);
        snaps.save();
      }
    } catch (err) { /* history is optional; current rank already stored */ }
  }

  // 4) Matches: fetch when rank moved, when forced, or when it has been a while
  const changed = !before || !p.current || before.elo !== p.current.elo || before.rr !== p.current.rr;
  const stale = !p.lastMatchSyncAt || Date.now() - Date.parse(p.lastMatchSyncAt) > syncIdleMs;
  let added = [];
  if (force || changed || stale) {
    const list = await henrik.matches(region, puuid, { mode: 'competitive', size: 10 }, priority);
    const mdoc = store.perPuuid('matches', puuid, []);
    const have = new Set(mdoc.data.map((m) => m.matchId));
    added = (Array.isArray(list) ? list : []).map((m) => toRecord(m, puuid)).filter((r) => r && r.matchId && !have.has(r.matchId));
    if (added.length) {
      mdoc.data = mdoc.data.concat(added).sort(byNewest).slice(0, MAX_MATCHES);
      mdoc.save();
      const newest = added.reduce((a, r) => (Date.parse(r.startedAt || 0) > Date.parse(a || 0) ? r.startedAt : a), p.lastMatchAt || null);
      p.lastMatchAt = newest;
    }
    p.lastMatchSyncAt = now;
  }
  players.save();

  // 5) Events (not on the first sync after linking)
  if (!seedHistory && before && p.current && before.tierId !== p.current.tierId) {
    bus.emit('rankChanged', { puuid, before, after: { ...p.current } });
  }
  if (!seedHistory && added.length) bus.emit('newMatches', { puuid, records: added });
  bus.emit('playerUpdated', { puuid });
  return p;
}

/* Background loop: refresh accounts when due, never more than the API budget allows. */
let timer = null;
function startLoop() {
  if (timer) return;
  const tick = async () => {
    const now = Date.now();
    const linked = new Set(linkedUserIds().flatMap((id) => users.data[id].accounts.map((a) => a.puuid)));
    const due = [...linked]
      .map((puuid) => players.data[puuid])
      .filter(Boolean)
      .filter((p) => {
        const recent = p.lastMatchAt && now - Date.parse(p.lastMatchAt) < 3 * 86400_000;
        const every = recent ? syncActiveMs : syncIdleMs;
        return !p.lastSyncAt || now - Date.parse(p.lastSyncAt) >= every;
      })
      .sort((a, b) => Date.parse(a.lastSyncAt || 0) - Date.parse(b.lastSyncAt || 0));
    // Each sync costs 1-2 requests; leave room for user commands.
    const budget = Math.max(1, Math.floor(henrikPerMinute / 4) - henrik.queueLength());
    for (const p of due.slice(0, budget)) {
      sync(p.puuid).catch((err) => {
        p.lastError = err.message;
        p.lastErrorAt = new Date().toISOString();
        players.save();
      });
    }
  };
  timer = setInterval(() => tick().catch((e) => console.error('[sync]', e)), 30_000);
  setTimeout(() => tick().catch(() => {}), 5000);
}

module.exports = {
  bus, users, players,
  userEntry, mainAccount, player, playerOf, isPrivate, linkedUserIds, userIdsForPuuid,
  matches, competitive, snapshots, eloAt, riotId,
  link, unlink, setMain, setPrivate, setLang, sync, startLoop,
};
