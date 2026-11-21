'use strict';

/*
 * Valorant Hub website server
 * - Serves the landing page, commands page and dashboard from /public
 * - Discord OAuth2 login for the dashboard
 * - Live rank lookup through the HenrikDev API (key stays on the server)
 * - Per-server dashboard settings saved as JSON files in /data
 *
 * Every value returned here comes from Discord, HenrikDev, or files the bot / dashboard wrote.
 * Nothing is generated or estimated. When a source is missing, the API says so.
 */

require('dotenv').config();

const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const HENRIK_KEY = process.env.HENRIK_API_KEY || '';
const HENRIK_PER_MIN = Number(process.env.HENRIK_REQUESTS_PER_MINUTE) || 20;
const SESSION_SECRET = process.env.SESSION_SECRET || '';

const DISCORD_API = 'https://discord.com/api/v10';
const HENRIK_API = 'https://api.henrikdev.xyz';
const DATA_DIR = path.join(__dirname, 'data');
const REDIRECT_URI = `${PUBLIC_URL}/auth/callback`;

// Permissions the bot asks for when invited:
// View Channel, Send Messages, Embed Links, Attach Files, Read Message History,
// Use External Emojis, Manage Channels (voice rooms), Manage Roles (tier roles), Move Members,
// Change Nickname (per-server bot name).
const BOT_PERMISSIONS = (
  (1n << 10n) | (1n << 11n) | (1n << 14n) | (1n << 15n) | (1n << 16n) |
  (1n << 18n) | (1n << 4n) | (1n << 28n) | (1n << 24n) | (1n << 26n)
).toString();

const PERM_ADMINISTRATOR = 1n << 3n;
const PERM_MANAGE_GUILD = 1n << 5n;

const REGIONS = ['ap', 'br', 'eu', 'kr', 'latam', 'na'];
const BOT_COLLECTIONS = ['players', 'scrims', 'parties', 'duels', 'clubs', 'tournaments', 'roleLog', 'seasons'];

if (!SESSION_SECRET) {
  console.warn('[config] SESSION_SECRET is empty. Set it in .env before running in production.');
}
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('[config] DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET missing: dashboard login is disabled.');
}
if (!BOT_TOKEN) {
  console.warn('[config] DISCORD_BOT_TOKEN missing: server lists, channels, roles and public stats are disabled.');
}
if (!HENRIK_KEY) {
  console.warn('[config] HENRIK_API_KEY missing: live rank lookup is disabled.');
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

class HttpError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function ttlCache(ms) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return undefined;
      if (Date.now() > hit.expires) {
        store.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key, value) {
      store.set(key, { value, expires: Date.now() + ms });
    },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* JSON file store                                                     */
/* ------------------------------------------------------------------ */

const isSnowflake = (v) => typeof v === 'string' && /^\d{15,25}$/.test(v);

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2));
  await fs.rename(tmp, file);
}

const guildFile = (id) => path.join(DATA_DIR, 'guilds', `${id}.json`);
const auditFile = (id) => path.join(DATA_DIR, 'audit', `${id}.json`);
// The bot process writes these files; the dashboard only reads them.
const botFile = (id, name) => path.join(DATA_DIR, 'bot', id, `${name}.json`);

const TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'ascendant', 'immortal', 'radiant'];

function defaultSettings() {
  return {
    general: {
      language: 'auto',
      timezone: 'Asia/Seoul',
      region: 'kr',
      defaultRanking: 'rr',
      publicStats: false,
    },
    features: {
      autoRoles: true,
      notifications: true,
      scrims: true,
      parties: true,
      duels: true,
      clubs: true,
      tournaments: true,
      analytics: true,
    },
    tierRoles: {
      ...Object.fromEntries(TIERS.map((t) => [t, null])),
      unlinked: null,
      peakRole: false,
      restoreManualEdits: true,
    },
    panels: {
      hub: null,
      leaderboard: null,
      scrims: null,
      lfg: null,
      duels: null,
      clubs: null,
      tournament: null,
      admin: null,
    },
    notifications: {
      channel: null,
      rankUp: true,
      rankDown: false,
      rrChange: false,
      matchEnd: false,
      streak: true,
      streakThreshold: 5,
      seasonEnd: true,
      events: true,
      tournament: true,
      cooldownMinutes: 10,
    },
    weeklyRecap: {
      enabled: false,
      channel: null,
      day: 0,
      hour: 20,
    },
  };
}

const ENUMS = {
  'general.language': ['auto', 'ko', 'en'],
  'general.region': REGIONS,
  'general.defaultRanking': ['rr', 'tier', 'winrate', 'kd', 'acs'],
};
const NUMBER_RANGES = {
  'notifications.streakThreshold': [2, 20],
  'notifications.cooldownMinutes': [0, 1440],
  'weeklyRecap.day': [0, 6],
  'weeklyRecap.hour': [0, 23],
};

// Keep only known keys, with the same type as the default. Discord IDs may be null or a snowflake string.
function sanitize(defaults, input, prefix = '') {
  const out = {};
  for (const [key, def] of Object.entries(defaults)) {
    const at = prefix ? `${prefix}.${key}` : key;
    const val = input && Object.prototype.hasOwnProperty.call(input, key) ? input[key] : undefined;
    if (def !== null && typeof def === 'object') {
      out[key] = sanitize(def, val && typeof val === 'object' ? val : {}, at);
    } else if (def === null) {
      out[key] = val === null || val === undefined || val === '' ? null : isSnowflake(val) ? val : null;
    } else if (typeof def === 'boolean') {
      out[key] = typeof val === 'boolean' ? val : def;
    } else if (typeof def === 'number') {
      const range = NUMBER_RANGES[at];
      const n = Number(val);
      out[key] = Number.isInteger(n) && (!range || (n >= range[0] && n <= range[1])) ? n : def;
    } else if (typeof def === 'string') {
      const allowed = ENUMS[at];
      if (allowed) out[key] = allowed.includes(val) ? val : def;
      else if (at === 'general.timezone') out[key] = isValidTimeZone(val) ? val : def;
      else out[key] = typeof val === 'string' ? val.slice(0, 200) : def;
    }
  }
  return out;
}

function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

async function loadSettings(guildId) {
  const saved = await readJson(guildFile(guildId), null);
  return { settings: sanitize(defaultSettings(), saved ? saved.settings : {}), updatedAt: saved ? saved.updatedAt : null };
}

function diffKeys(a, b, prefix = '') {
  const changed = [];
  for (const key of Object.keys(a)) {
    const at = prefix ? `${prefix}.${key}` : key;
    if (a[key] !== null && typeof a[key] === 'object') changed.push(...diffKeys(a[key], b[key] || {}, at));
    else if (a[key] !== b[key]) changed.push({ key: at, from: b[key] ?? null, to: a[key] });
  }
  return changed;
}

async function appendAudit(guildId, entry) {
  const log = await readJson(auditFile(guildId), []);
  log.unshift({ ...entry, at: new Date().toISOString() });
  await writeJson(auditFile(guildId), log.slice(0, 500));
}

/* ------------------------------------------------------------------ */
/* Discord API                                                         */
/* ------------------------------------------------------------------ */

async function discord(pathname, { userToken, bot, method = 'GET', body } = {}) {
  const headers = { 'User-Agent': 'ValorantHubWebsite (https://github.com, 1.0)' };
  if (userToken) headers.Authorization = `Bearer ${userToken}`;
  else if (bot) {
    if (!BOT_TOKEN) throw new HttpError(503, 'bot_token_missing', 'DISCORD_BOT_TOKEN is not set on the server.');
    headers.Authorization = `Bot ${BOT_TOKEN}`;
  }
  if (body) headers['Content-Type'] = 'application/json';

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${DISCORD_API}${pathname}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429 && attempt === 0) {
      const data = await res.json().catch(() => ({}));
      await sleep(Math.min(5000, Math.ceil((data.retry_after || 1) * 1000)));
      continue;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new HttpError(res.status === 401 ? 401 : 502, 'discord_error', `Discord API ${res.status}: ${text.slice(0, 200)}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new HttpError(429, 'discord_rate_limited', 'Discord rate limit. Try again shortly.');
}

const botGuildCache = ttlCache(60_000);
async function getBotGuildIds() {
  const cached = botGuildCache.get('ids');
  if (cached) return cached;
  const ids = new Set();
  let after = '0';
  // Paginate through every server the bot is in (200 per page).
  for (;;) {
    const page = await discord(`/users/@me/guilds?limit=200&after=${after}`, { bot: true });
    page.forEach((g) => ids.add(g.id));
    if (page.length < 200) break;
    after = page[page.length - 1].id;
  }
  botGuildCache.set('ids', ids);
  return ids;
}

function canManage(guild) {
  if (guild.owner) return true;
  try {
    const p = BigInt(guild.permissions);
    return (p & PERM_ADMINISTRATOR) === PERM_ADMINISTRATOR || (p & PERM_MANAGE_GUILD) === PERM_MANAGE_GUILD;
  } catch {
    return false;
  }
}

function inviteUrl(guildId) {
  if (!CLIENT_ID) return null;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    permissions: BOT_PERMISSIONS,
    scope: 'bot applications.commands',
  });
  if (guildId) {
    params.set('guild_id', guildId);
    params.set('disable_guild_select', 'true');
  }
  return `https://discord.com/oauth2/authorize?${params}`;
}

async function getUserGuilds(req) {
  const s = req.session;
  if (s.guilds && s.guildsFetchedAt && Date.now() - s.guildsFetchedAt < 60_000) return s.guilds;
  const guilds = await discord('/users/@me/guilds', { userToken: s.accessToken });
  s.guilds = guilds.map((g) => ({ id: g.id, name: g.name, icon: g.icon, owner: g.owner, permissions: g.permissions }));
  s.guildsFetchedAt = Date.now();
  return s.guilds;
}

/* ------------------------------------------------------------------ */
/* HenrikDev API                                                       */
/* ------------------------------------------------------------------ */

const mmrCache = ttlCache(120_000);

/* One paced queue for every request this website makes to the stats service. */
let henrikChain = Promise.resolve();
let henrikLast = 0;
function henrikGet(pathname) {
  if (!HENRIK_KEY) return Promise.reject(new HttpError(503, 'henrik_key_missing', 'Stats are not set up yet.'));
  const run = async () => {
    const gap = Math.ceil(60_000 / HENRIK_PER_MIN);
    const wait = henrikLast + gap - Date.now();
    if (wait > 0) await sleep(wait);
    henrikLast = Date.now();
    const res = await fetch(`${HENRIK_API}${pathname}`, { headers: { Authorization: HENRIK_KEY, Accept: 'application/json' } });
    const body = await res.json().catch(() => null);
    if (res.status === 404) throw new HttpError(404, 'player_not_found', 'Player not found. Check the Riot ID and region.');
    if (res.status === 429) throw new HttpError(429, 'henrik_rate_limited', 'Too many requests. Try again in a minute.');
    if (!res.ok || !body) throw new HttpError(502, 'henrik_error', 'Could not load data. Try again later.');
    return body.data;
  };
  const p = henrikChain.then(run, run);
  henrikChain = p.catch(() => {});
  return p;
}

async function henrikMmr(region, name, tag) {
  if (!HENRIK_KEY) throw new HttpError(503, 'henrik_key_missing', 'HENRIK_API_KEY is not set on the server.');
  const key = `${region}|${name.toLowerCase()}|${tag.toLowerCase()}`;
  const cached = mmrCache.get(key);
  if (cached) return { ...cached, cache: 'hit' };

  const url = `${HENRIK_API}/valorant/v3/mmr/${region}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: { Authorization: HENRIK_KEY, Accept: 'application/json' } });
  const body = await res.json().catch(() => null);

  if (res.status === 404) throw new HttpError(404, 'player_not_found', 'No player found with that Riot ID in this region.');
  if (res.status === 429) throw new HttpError(429, 'henrik_rate_limited', 'HenrikDev rate limit reached. Try again in a minute.');
  if (!res.ok || !body || !body.data) {
    const msg = body && body.errors && body.errors[0] ? body.errors[0].message : `HenrikDev API ${res.status}`;
    throw new HttpError(502, 'henrik_error', msg);
  }

  const d = body.data;
  const result = {
    account: d.account ? { name: d.account.name, tag: d.account.tag } : null,
    current: d.current
      ? {
          tier: d.current.tier ? d.current.tier.name : null,
          tierId: d.current.tier ? d.current.tier.id : null,
          rr: d.current.rr ?? null,
          lastChange: d.current.last_change ?? null,
          gamesNeededForRating: d.current.games_needed_for_rating ?? null,
          leaderboardRank: d.current.leaderboard_placement ? d.current.leaderboard_placement.rank : null,
        }
      : null,
    peak: d.peak
      ? {
          tier: d.peak.tier ? d.peak.tier.name : null,
          season: d.peak.season ? d.peak.season.short : null,
        }
      : null,
    region,
    fetchedAt: new Date().toISOString(),
    source: 'HenrikDev API v3 MMR',
  };
  mmrCache.set(key, result);
  return { ...result, cache: 'miss' };
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
const jsonSmall = express.json({ limit: '64kb' });
const jsonLarge = express.json({ limit: '24mb' }); // two images up to 8 MB each, base64-encoded
app.use((req, res, next) => (req.path.endsWith('/branding') ? jsonLarge : jsonSmall)(req, res, next));
app.use(
  session({
    name: 'vh.sid',
    secret: SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: PUBLIC_URL.startsWith('https://'),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// Simple per-IP rate limit for the public lookup.
const lookupHits = new Map();
function lookupLimiter(req, res, next) {
  const now = Date.now();
  const key = req.ip;
  const hits = (lookupHits.get(key) || []).filter((t) => now - t < 60_000);
  if (hits.length >= 10) return res.status(429).json({ error: 'too_many_requests', message: 'Too many lookups. Wait a minute.' });
  hits.push(now);
  lookupHits.set(key, hits);
  next();
}

function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'not_logged_in' });
  next();
}

const requireGuildAdmin = wrap(async (req, res, next) => {
  const id = req.params.id;
  if (!isSnowflake(id)) throw new HttpError(400, 'bad_guild_id');
  const guilds = await getUserGuilds(req);
  const guild = guilds.find((g) => g.id === id);
  if (!guild || !canManage(guild)) throw new HttpError(403, 'no_permission', 'You need Manage Server permission in this server.');
  const botIds = await getBotGuildIds();
  if (!botIds.has(id)) throw new HttpError(409, 'bot_not_in_guild', 'The bot is not in this server yet.');
  req.guild = guild;
  next();
});

/* ---------- Auth ---------- */

app.get('/auth/login', (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) return res.status(503).send('Discord login is not configured on this server.');
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds',
    state,
    prompt: 'none',
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get(
  '/auth/callback',
  wrap(async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state || state !== req.session.oauthState) {
      return res.status(400).send('Login failed: invalid or expired state. Go back and try again.');
    }
    delete req.session.oauthState;

    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => '');
      return res.status(502).send(`Login failed: Discord token exchange returned ${tokenRes.status}. ${text.slice(0, 200)}`);
    }
    const token = await tokenRes.json();
    const user = await discord('/users/@me', { userToken: token.access_token });

    await new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
    req.session.accessToken = token.access_token;
    req.session.user = {
      id: user.id,
      username: user.username,
      globalName: user.global_name || null,
      avatar: user.avatar || null,
    };
    res.redirect('/dashboard.html');
  })
);

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/* ---------- Public API ---------- */

app.get('/api/config', (req, res) => {
  res.json({
    loginEnabled: Boolean(CLIENT_ID && CLIENT_SECRET),
    lookupEnabled: Boolean(HENRIK_KEY),
    botConnected: Boolean(BOT_TOKEN),
    inviteUrl: inviteUrl(),
    regions: REGIONS,
    // Two plans exist; right now every server gets Premium.
    plan: String(process.env.EVERYONE_PREMIUM ?? 'true').toLowerCase() !== 'false' ? 'premium' : 'free',
  });
});

app.get(
  '/api/public/stats',
  wrap(async (req, res) => {
    const ids = await getBotGuildIds();
    res.json({ servers: ids.size, source: 'Discord API: servers the bot is in', fetchedAt: new Date().toISOString() });
  })
);

app.get(
  '/api/valorant/mmr/:region/:name/:tag',
  lookupLimiter,
  wrap(async (req, res) => {
    const region = String(req.params.region).toLowerCase();
    const name = String(req.params.name).trim();
    const tag = String(req.params.tag).trim().replace(/^#/, '');
    if (!REGIONS.includes(region)) throw new HttpError(400, 'bad_region', 'Unknown region.');
    if (!name || name.length > 16 || !tag || tag.length > 5) {
      throw new HttpError(400, 'bad_riot_id', 'Riot ID must be name (3-16 chars) and tag (3-5 chars).');
    }
    res.json(await henrikMmr(region, name, tag));
  })
);

/* ---------- Dashboard API ---------- */

app.get('/api/me', requireLogin, (req, res) => res.json({ user: req.session.user }));

app.get(
  '/api/guilds',
  requireLogin,
  wrap(async (req, res) => {
    const guilds = (await getUserGuilds(req)).filter(canManage);
    let botIds = null;
    let botError = null;
    try {
      botIds = await getBotGuildIds();
    } catch (err) {
      botError = err.message;
    }
    res.json({
      botError,
      guilds: guilds
        .map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          botInstalled: botIds ? botIds.has(g.id) : null,
          inviteUrl: inviteUrl(g.id),
        }))
        .sort((a, b) => Number(b.botInstalled) - Number(a.botInstalled) || a.name.localeCompare(b.name)),
    });
  })
);

app.get(
  '/api/guilds/:id/overview',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const id = req.params.id;
    const [guild, channels] = await Promise.all([
      discord(`/guilds/${id}?with_counts=true`, { bot: true }),
      discord(`/guilds/${id}/channels`, { bot: true }),
    ]);

    // Bot-written data. Absent file = bot has not written it yet; the UI shows that honestly.
    const collections = {};
    for (const name of BOT_COLLECTIONS) {
      const list = await readJson(botFile(id, name), null);
      collections[name] = list === null ? { available: false } : { available: true, count: Array.isArray(list) ? list.length : 0 };
    }
    const { settings, updatedAt } = await loadSettings(id);
    const panelsSet = Object.values(settings.panels).filter(Boolean).length;

    res.json({
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        approximateMemberCount: guild.approximate_member_count ?? null,
        approximatePresenceCount: guild.approximate_presence_count ?? null,
        roleCount: Array.isArray(guild.roles) ? guild.roles.length : null,
        textChannelCount: channels.filter((c) => c.type === 0 || c.type === 5).length,
        voiceChannelCount: channels.filter((c) => c.type === 2).length,
      },
      collections,
      panels: { configured: panelsSet, total: Object.keys(settings.panels).length },
      settingsUpdatedAt: updatedAt,
      fetchedAt: new Date().toISOString(),
    });
  })
);

app.get(
  '/api/guilds/:id/discord',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const id = req.params.id;
    const [channels, roles] = await Promise.all([
      discord(`/guilds/${id}/channels`, { bot: true }),
      discord(`/guilds/${id}/roles`, { bot: true }),
    ]);
    const categories = new Map(channels.filter((c) => c.type === 4).map((c) => [c.id, c.name]));
    res.json({
      textChannels: channels
        .filter((c) => c.type === 0 || c.type === 5)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({ id: c.id, name: c.name, category: categories.get(c.parent_id) || null })),
      roles: roles
        .filter((r) => r.id !== id && !r.managed)
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: r.color })),
    });
  })
);

app.get(
  '/api/guilds/:id/settings',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => res.json(await loadSettings(req.params.id)))
);

app.put(
  '/api/guilds/:id/settings',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const id = req.params.id;
    const before = (await loadSettings(id)).settings;
    const next = sanitize(defaultSettings(), req.body && req.body.settings);
    const changes = diffKeys(next, before);
    const updatedAt = new Date().toISOString();
    await writeJson(guildFile(id), { settings: next, updatedAt, updatedBy: req.session.user.id });
    if (changes.length) {
      await appendAudit(id, {
        userId: req.session.user.id,
        username: req.session.user.globalName || req.session.user.username,
        action: 'settings.update',
        changes,
      });
    }
    res.json({ settings: next, updatedAt, changes: changes.length });
  })
);

app.get(
  '/api/guilds/:id/collection/:name',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const name = req.params.name;
    if (!BOT_COLLECTIONS.includes(name)) throw new HttpError(404, 'unknown_collection');
    const list = await readJson(botFile(req.params.id, name), null);
    res.json(list === null ? { available: false, items: [] } : { available: true, items: Array.isArray(list) ? list : [] });
  })
);

app.get(
  '/api/guilds/:id/audit',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => res.json({ items: await readJson(auditFile(req.params.id), []) }))
);

/* ---------- Per-server bot profile (name, image, banner, bio) ---------- */

let botUserCache = null;
async function botUser() {
  if (botUserCache) return botUserCache;
  const u = await discord('/users/@me', { bot: true });
  botUserCache = { id: u.id, username: u.username, globalName: u.global_name || null, avatar: u.avatar || null };
  return botUserCache;
}

const IMAGE_RE = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const brandingFile = (id) => botFile(id, 'branding');

function checkImage(v) {
  if (v === null) return null;
  if (typeof v !== 'string' || !IMAGE_RE.test(v)) throw new HttpError(400, 'bad_image', 'Use a PNG, JPG, GIF or WEBP image.');
  const bytes = Math.floor((v.length - v.indexOf(',') - 1) * 3 / 4);
  if (bytes > MAX_IMAGE_BYTES) throw new HttpError(400, 'image_too_large', 'Images must be under 8 MB.');
  return v;
}

async function brandingView(guildId) {
  const bot = await botUser();
  const m = await discord(`/guilds/${guildId}/members/${bot.id}`, { bot: true });
  const stored = await readJson(brandingFile(guildId), {});
  const globalAvatar = bot.avatar
    ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(bot.id) >> 22n) % 6n)}.png`;
  return {
    defaultName: bot.globalName || bot.username,
    nick: m.nick || null,
    avatarUrl: m.avatar ? `https://cdn.discordapp.com/guilds/${guildId}/users/${bot.id}/avatars/${m.avatar}.png?size=256` : globalAvatar,
    customAvatar: Boolean(m.avatar),
    bannerUrl: m.banner ? `https://cdn.discordapp.com/guilds/${guildId}/users/${bot.id}/banners/${m.banner}.png?size=1024` : null,
    bio: stored.bio ?? null,
    updatedAt: stored.updatedAt || null,
  };
}

app.get(
  '/api/guilds/:id/branding',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => res.json(await brandingView(req.params.id)))
);

app.put(
  '/api/guilds/:id/branding',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const patch = {};
    if ('nick' in body) {
      const nick = body.nick === null ? null : String(body.nick).trim();
      if (nick && nick.length > 32) throw new HttpError(400, 'nick_too_long', 'Name: max 32 characters.');
      patch.nick = nick || null;
    }
    if ('bio' in body) {
      const bio = body.bio === null ? null : String(body.bio).trim();
      if (bio && bio.length > 190) throw new HttpError(400, 'bio_too_long', 'Bio: max 190 characters.');
      patch.bio = bio || null;
    }
    if ('avatar' in body) patch.avatar = checkImage(body.avatar);
    if ('banner' in body) patch.banner = checkImage(body.banner);
    if (!Object.keys(patch).length) return res.json(await brandingView(id));

    try {
      await discord(`/guilds/${id}/members/@me`, { bot: true, method: 'PATCH', body: patch });
    } catch (err) {
      if (/429/.test(err.message)) throw new HttpError(429, 'profile_rate_limited', 'Discord limits how often the profile can change. Try again in a few minutes.');
      throw err;
    }

    const stored = await readJson(brandingFile(id), {});
    if ('nick' in patch) stored.nick = patch.nick;
    if ('bio' in patch) stored.bio = patch.bio;
    if ('avatar' in patch) stored.avatar = patch.avatar ? 'custom' : null;
    if ('banner' in patch) stored.banner = patch.banner ? 'custom' : null;
    stored.updatedAt = new Date().toISOString();
    stored.updatedBy = req.session.user.id;
    await writeJson(brandingFile(id), stored);
    await appendAudit(id, {
      userId: req.session.user.id,
      username: req.session.user.globalName || req.session.user.username,
      action: 'botprofile.update',
      changes: Object.keys(patch).map((k) => ({ key: `botProfile.${k}`, from: null, to: k === 'avatar' || k === 'banner' ? (patch[k] ? 'new image' : 'default') : patch[k] })),
    });
    res.json(await brandingView(id));
  })
);

/* ---------- Player pages (tracker) ---------- */

function toRecord(match, puuid) {
  if (!match || !match.metadata || !Array.isArray(match.players)) return null;
  const p = match.players.find((x) => x.puuid === puuid);
  if (!p) return null;
  const team = (match.teams || []).find((x) => x.team_id === p.team_id) || null;
  const s = p.stats || {};
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    matchId: match.metadata.match_id,
    startedAt: match.metadata.started_at || null,
    map: match.metadata.map ? match.metadata.map.name : null,
    queue: match.metadata.queue ? match.metadata.queue.id || match.metadata.queue.name : null,
    agent: p.agent ? p.agent.name : null,
    tier: p.tier ? p.tier.name : null,
    won: team ? team.won === true : null,
    draw: team && team.rounds ? team.rounds.won === team.rounds.lost : false,
    roundsWon: team && team.rounds ? team.rounds.won : null,
    roundsLost: team && team.rounds ? team.rounds.lost : null,
    rounds: team && team.rounds ? (team.rounds.won || 0) + (team.rounds.lost || 0) : null,
    score: n(s.score), kills: n(s.kills), deaths: n(s.deaths), assists: n(s.assists),
    headshots: n(s.headshots), bodyshots: n(s.bodyshots), legshots: n(s.legshots),
    damage: s.damage ? n(s.damage.dealt) : null,
  };
}

function aggregate(list) {
  const decided = list.filter((m) => m.won !== null && !m.draw);
  const wins = decided.filter((m) => m.won).length;
  const sum = (k, arr) => arr.reduce((a, m) => a + (m[k] || 0), 0);
  const kd = list.filter((m) => m.kills !== null && m.deaths !== null);
  const sc = list.filter((m) => m.rounds && m.score !== null);
  const dm = list.filter((m) => m.rounds && m.damage !== null);
  const sh = list.filter((m) => m.headshots !== null && m.bodyshots !== null && m.legshots !== null);
  const shots = sum('headshots', sh) + sum('bodyshots', sh) + sum('legshots', sh);
  const deaths = sum('deaths', kd);
  return {
    n: list.length, wins, losses: decided.length - wins,
    winRate: decided.length ? wins / decided.length : null,
    kd: kd.length && deaths ? sum('kills', kd) / deaths : null,
    kills: sum('kills', kd), deaths, assists: sum('assists', list),
    acs: sc.length ? sum('score', sc) / sum('rounds', sc) : null,
    adr: dm.length ? sum('damage', dm) / sum('rounds', dm) : null,
    hs: shots ? sum('headshots', sh) / shots : null,
  };
}

function groupBy(list, key) {
  const g = new Map();
  for (const m of list) { if (!m[key]) continue; if (!g.has(m[key])) g.set(m[key], []); g.get(m[key]).push(m); }
  return [...g.entries()].map(([name, l]) => ({ name, ...aggregate(l) })).sort((a, b) => b.n - a.n);
}

const playerCache = ttlCache(180_000);

app.get(
  '/api/player/:region/:name/:tag',
  lookupLimiter,
  wrap(async (req, res) => {
    const region = String(req.params.region).toLowerCase();
    const name = String(req.params.name).trim();
    const tag = String(req.params.tag).trim().replace(/^#/, '');
    if (!REGIONS.includes(region)) throw new HttpError(400, 'bad_region', 'Unknown region.');
    if (!name || name.length > 16 || !tag || tag.length > 5) throw new HttpError(400, 'bad_riot_id', 'Use Name#TAG.');
    const key = `${region}|${name.toLowerCase()}|${tag.toLowerCase()}`;
    const hit = playerCache.get(key);
    if (hit) return res.json({ ...hit, cache: true });

    const acc = await henrikGet(`/valorant/v2/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`);
    const puuid = acc.puuid;
    const enc = encodeURIComponent(puuid);
    const [mmr, hist, page1, page2] = await Promise.all([
      henrikGet(`/valorant/v3/by-puuid/mmr/${region}/pc/${enc}`).catch(() => null),
      henrikGet(`/valorant/v2/by-puuid/mmr-history/${region}/pc/${enc}`).catch(() => null),
      henrikGet(`/valorant/v4/by-puuid/matches/${region}/pc/${enc}?mode=competitive&size=10&start=0`).catch(() => []),
      henrikGet(`/valorant/v4/by-puuid/matches/${region}/pc/${enc}?mode=competitive&size=10&start=10`).catch(() => []),
    ]);

    // Merge with matches the bot already stored for this player (same source, kept longer).
    const byId = new Map();
    for (const m of await readJson(path.join(DATA_DIR, 'bot', '_global', 'matches', `${puuid}.json`), [])) if (m.queue === 'competitive') byId.set(m.matchId, m);
    for (const raw of [].concat(page1 || [], page2 || [])) { const r = toRecord(raw, puuid); if (r && r.matchId) byId.set(r.matchId, r); }
    const matches = [...byId.values()].sort((a, b) => Date.parse(b.startedAt || 0) - Date.parse(a.startedAt || 0)).slice(0, 100);
    const recent = matches.slice(0, 20);

    const cur = mmr && mmr.current ? mmr.current : null;
    const out = {
      account: { name: acc.name, tag: acc.tag, level: typeof acc.account_level === 'number' ? acc.account_level : null, region },
      current: cur ? {
        tier: cur.tier ? cur.tier.name : null, tierId: cur.tier ? cur.tier.id : null, rr: cur.rr ?? null, elo: cur.elo ?? null,
        lastChange: cur.last_change ?? null, gamesNeeded: cur.games_needed_for_rating ?? null,
        leaderboardRank: cur.leaderboard_placement ? cur.leaderboard_placement.rank : null,
      } : null,
      peak: mmr && mmr.peak && mmr.peak.tier ? { tier: mmr.peak.tier.name, season: mmr.peak.season ? mmr.peak.season.short : null } : null,
      seasons: mmr && Array.isArray(mmr.seasonal) ? mmr.seasonal.slice(-8).reverse().map((x) => ({
        season: x.season ? x.season.short || x.season.id : null, wins: x.wins ?? null, games: x.games ?? null,
        endTier: x.end_tier ? x.end_tier.name : null, endRr: x.end_rr ?? null,
      })) : [],
      history: hist && Array.isArray(hist.history) ? hist.history.filter((h) => h.date).map((h) => ({
        date: h.date, tier: h.tier ? h.tier.name : null, rr: h.rr ?? null, elo: h.elo ?? null, change: h.last_change ?? null, map: h.map ? h.map.name : null,
      })).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)) : [],
      summary: aggregate(recent),
      agents: groupBy(matches, 'agent'),
      maps: groupBy(matches, 'map'),
      matches,
      fetchedAt: new Date().toISOString(),
    };
    playerCache.set(key, out);
    res.json(out);
  })
);

const sendPage = (file) => (req, res) => res.sendFile(path.join(__dirname, 'public', file));
app.get('/p/:region/:name/:tag', sendPage('profile.html'));
app.get('/p', sendPage('profile.html'));
app.get('/s/:guildId', sendPage('server.html'));

/* ---------- Public server pages ---------- */

app.get(
  '/api/public/server/:id',
  wrap(async (req, res) => {
    const id = req.params.id;
    if (!isSnowflake(id)) throw new HttpError(400, 'bad_guild_id');
    const { settings } = await loadSettings(id);
    if (!settings.general.publicStats) throw new HttpError(403, 'not_public', 'This server keeps its stats private.');
    const data = await readJson(botFile(id, 'public'), null);
    if (!data) throw new HttpError(404, 'no_data', 'No data yet.');
    res.json(data);
  })
);

/* ---------- Requests to the bot (one file per request) ---------- */

async function enqueue(scope, request) {
  const id = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const dir = path.join(DATA_DIR, 'bot', scope, 'queue');
  await writeJson(path.join(dir, `${id}.json`), { id, ...request, createdAt: new Date().toISOString() });
  return id;
}

async function requestStatus(scope, ids) {
  const out = {};
  for (const id of ids) {
    const done = await readJson(path.join(DATA_DIR, 'bot', scope, 'queue', 'done', `${id}.json`), null);
    if (done) out[id] = { status: done.status, message: done.message, finishedAt: done.finishedAt };
    else out[id] = { status: (await readJson(path.join(DATA_DIR, 'bot', scope, 'queue', `${id}.json`), null)) ? 'waiting' : 'unknown' };
  }
  return out;
}

/* My Riot accounts (member, from the website) */
app.get(
  '/api/me/accounts',
  requireLogin,
  wrap(async (req, res) => {
    const users = await readJson(path.join(DATA_DIR, 'bot', '_global', 'users.json'), {});
    const playersDb = await readJson(path.join(DATA_DIR, 'bot', '_global', 'players.json'), {});
    const u = users[req.session.user.id] || { accounts: [] };
    res.json({
      private: Boolean(u.private),
      lang: u.lang || 'auto',
      accounts: (u.accounts || []).map((a) => {
        const p = playersDb[a.puuid] || {};
        return { puuid: a.puuid, main: Boolean(a.main), region: a.region, name: p.name || null, tag: p.tag || null, tier: p.current ? p.current.tier : null, rr: p.current ? p.current.rr : null, lastSyncAt: p.lastSyncAt || null };
      }),
    });
  })
);

app.post(
  '/api/me/requests',
  requireLogin,
  wrap(async (req, res) => {
    const b = req.body || {};
    const userId = req.session.user.id;
    let request;
    if (b.type === 'link') {
      if (!/^(.{3,16})#([^#\s]{3,5})$/u.test(String(b.riotId || '').trim())) throw new HttpError(400, 'bad_riot_id', 'Use Name#TAG.');
      request = { type: 'link', userId, riotId: String(b.riotId).trim(), region: REGIONS.includes(b.region) ? b.region : null };
    } else if (b.type === 'unlink' || b.type === 'main') request = { type: b.type, userId, puuid: String(b.puuid || '') };
    else if (b.type === 'privacy') request = { type: 'privacy', userId, value: Boolean(b.value) };
    else if (b.type === 'lang') request = { type: 'lang', userId, lang: ['ko', 'en'].includes(b.lang) ? b.lang : 'auto' };
    else throw new HttpError(400, 'bad_request');
    res.json({ id: await enqueue('_global', request) });
  })
);

app.get(
  '/api/me/requests/:id',
  requireLogin,
  wrap(async (req, res) => {
    const id = String(req.params.id);
    if (!/^\d+-[0-9a-f]{6}$/.test(id)) throw new HttpError(400, 'bad_id');
    const done = await readJson(path.join(DATA_DIR, 'bot', '_global', 'queue', 'done', `${id}.json`), null);
    if (done && done.userId !== req.session.user.id) throw new HttpError(404, 'not_found');
    res.json((await requestStatus('_global', [id]))[id]);
  })
);

/* Admin actions (dashboard) */
app.post(
  '/api/guilds/:id/actions',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const b = req.body || {};
    let request;
    if (b.type === 'announce') {
      if (!isSnowflake(b.channelId)) throw new HttpError(400, 'bad_channel', 'Pick a channel.');
      const text = String(b.text || '').trim();
      if (!text) throw new HttpError(400, 'empty', 'Write a message.');
      request = { type: 'announce', channelId: b.channelId, title: String(b.title || '').slice(0, 100), text: text.slice(0, 3500) };
    } else if (b.type === 'repostPanels' || b.type === 'syncRoles') request = { type: b.type };
    else throw new HttpError(400, 'bad_request');
    request.by = req.session.user.id;
    const id = await enqueue(req.params.id, request);
    await appendAudit(req.params.id, { userId: req.session.user.id, username: req.session.user.globalName || req.session.user.username, action: `action.${request.type}`, changes: [] });
    res.json({ id });
  })
);

app.get(
  '/api/guilds/:id/actions',
  requireLogin,
  requireGuildAdmin,
  wrap(async (req, res) => {
    const dir = path.join(DATA_DIR, 'bot', req.params.id, 'queue', 'done');
    let files = [];
    try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')).sort().reverse().slice(0, 20); } catch (e) { files = []; }
    const items = [];
    for (const f of files) { const d = await readJson(path.join(dir, f), null); if (d) items.push({ id: d.id, type: d.type, status: d.status, message: d.message, createdAt: d.createdAt, finishedAt: d.finishedAt }); }
    let waiting = [];
    try { waiting = (await fs.readdir(path.join(DATA_DIR, 'bot', req.params.id, 'queue'))).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')); } catch (e) { waiting = []; }
    res.json({ items, waiting });
  })
);

/* ---------- Static site ---------- */

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.use('/api', (req, res) => res.status(404).json({ error: 'not_found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500 && status !== 503) console.error(err);
  res.status(status).json({ error: err.code || 'server_error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Valorant Hub website running at ${PUBLIC_URL}`);
  });
}

module.exports = { app, sanitize, defaultSettings, diffKeys };
