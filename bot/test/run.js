'use strict';
/*
 * Offline tests: run with `npm test`. Uses a temporary data folder and test doubles for Discord objects.
 * Nothing here is shipped data; it checks logic and that every message passes discord.js validation.
 */
const os = require('os');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vh-test-'));
process.env.HENRIK_API_KEY = '';

const { Collection } = require('discord.js');
const store = require('../src/lib/store');
const { tr } = require('../src/lib/i18n');
const ui = require('../src/lib/ui');
const players = require('../src/services/players');
const stats = require('../src/lib/stats');

let passed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log(`ok  ${name}`); } catch (e) { console.error(`FAIL ${name}\n`, e); process.exitCode = 1; } };

function countComponents(json) {
  let n = 0;
  const walk = (c) => { n++; (c.components || []).forEach(walk); if (c.accessory) walk(c.accessory); (c.items || []).forEach(() => {}); };
  walk(json);
  return n;
}
function textLen(json) {
  let n = 0;
  const walk = (c) => { if (c.type === 10) n += c.content.length; (c.components || []).forEach(walk); };
  walk(json);
  return n;
}
function checkPayload(name, payload) {
  const comps = payload.components.map((c) => (c.toJSON ? c.toJSON() : c));
  const total = comps.reduce((a, c) => a + countComponents(c), 0);
  const chars = comps.reduce((a, c) => a + textLen(c), 0);
  assert.ok(total <= 40, `${name}: ${total} components`);
  assert.ok(chars <= 4000, `${name}: ${chars} chars`);
}

// ---- test doubles for a guild with linked members ----
const GUILD = '100000000000000001';
const users = ['200000000000000001', '200000000000000002', '200000000000000003', '200000000000000004', '200000000000000005', '200000000000000006'];
const members = new Collection(users.map((id) => [id, { id, user: { id, username: `u${id.slice(-1)}`, bot: false }, roles: { cache: new Collection() } }]));
const guild = { id: GUILD, name: 'Test', members: { cache: members, me: null }, roles: { cache: new Collection() }, channels: { cache: new Collection() } };

// Linked accounts with stored records shaped like the real API output
const tiers = [['Gold 1', 12, 1200], ['Diamond 2', 19, 1900], ['Silver 3', 11, 1100], ['Platinum 1', 15, 1500], ['Ascendant 1', 21, 2100]];
users.slice(0, 5).forEach((id, i) => {
  const puuid = `puuid-${i}`;
  players.users.data[id] = { accounts: [{ puuid, region: 'kr', main: true, linkedAt: new Date().toISOString() }], private: false };
  players.players.data[puuid] = { puuid, name: `P${i}`, tag: 'KR1', region: 'kr', current: { tier: tiers[i][0], tierId: tiers[i][1], rr: 50, elo: tiers[i][2], lastChange: 10 }, peak: { tier: 'Diamond 3', season: 'e9a1' }, lastSyncAt: new Date().toISOString() };
  const recs = [];
  for (let k = 0; k < 12; k++) {
    recs.push({ matchId: `m${i}-${k}`, startedAt: new Date(Date.now() - k * 3600_000).toISOString(), map: ['Ascent', 'Bind', 'Haven'][k % 3], queue: 'competitive', agent: ['Jett', 'Sova'][k % 2], won: k % 3 !== 0, draw: false, roundsWon: 13, roundsLost: 9, rounds: 22, score: 5000 + k * 10, kills: 18, deaths: 14, assists: 5, headshots: 10, bodyshots: 30, legshots: 2, damage: 3300 });
  }
  store.perPuuid('matches', puuid, []).data = recs;
  store.perPuuid('rank', puuid, []).data = [{ at: new Date(Date.now() - 8 * 86400_000).toISOString(), elo: tiers[i][2] - 40 * i, tierId: tiers[i][1], tier: tiers[i][0], rr: 10 }];
});

const t = tr('ko');
const te = tr('en');

test('stats aggregate', () => {
  const a = stats.aggregate(players.competitive('puuid-0', 20));
  assert.strictEqual(a.n, 12);
  assert.strictEqual(a.wins, 8);
  assert.ok(Math.abs(a.acs - stats.aggregate(players.competitive('puuid-0')).acs) < 1e-9);
});

test('leaderboard rr order', () => {
  const { compute } = require('../src/features/ranking');
  const rows = compute(guild, 'rr', 'week', {});
  assert.deepStrictEqual(rows.map((r) => r.userId), [users[4], users[1], users[3], users[0], users[2]]);
  const gain = compute(guild, 'rrgain', 'week', {});
  assert.ok(gain.length === 5 && gain[0].value >= gain[4].value);
});

test('scrim balance splits evenly and fairly', () => {
  const { balance } = require('../src/features/scrim');
  const [a, b] = balance(users.slice(0, 5).concat(users[5]));
  assert.strictEqual(a.length, 3); assert.strictEqual(b.length, 3);
  const sum = (ids) => ids.reduce((s, id) => s + ((players.playerOf(id) || { current: { elo: 0 } }).current.elo), 0);
  assert.ok(Math.abs(sum(a) - sum(b)) <= 500, 'balanced within 500');
  // unlinked player users[5] goes to one side only once
  assert.strictEqual([a.includes(users[5]), b.includes(users[5])].filter(Boolean).length, 1);
});

test('single elimination with 5 teams: byes and champion', () => {
  const tn = require('../src/features/tournament');
  const x = { format: 'single', teams: [1, 2, 3, 4, 5].map((n) => ({ id: `t${n}`, name: `T${n}`, captainId: users[n - 1], members: [users[n - 1]] })), matches: [], status: 'live' };
  tn.buildSingle(x);
  assert.strictEqual(x.rounds, 3);
  const byes = x.matches.filter((m) => m.bye);
  assert.strictEqual(byes.length, 3);
  // Play every ready match: team "a" wins
  for (let guard = 0; guard < 20 && x.status !== 'done'; guard++) {
    for (const m of x.matches.filter((mm) => mm.status === 'ready')) { m.winner = m.a; m.status = 'done'; tn.advance(x, m); }
  }
  assert.strictEqual(x.status, 'done');
  assert.ok(x.championId);
});

test('round robin standings', () => {
  const tn = require('../src/features/tournament');
  const x = { format: 'roundrobin', teams: [1, 2, 3, 4].map((n) => ({ id: `t${n}`, name: `T${n}`, members: [] })), matches: [] };
  tn.buildRoundRobin(x);
  assert.strictEqual(x.matches.length, 6);
  x.matches.forEach((m) => { m.winner = m.a; m.status = 'done'; });
  const s = tn.standings(x);
  assert.strictEqual(s[0].team.id, 't1');
  assert.strictEqual(s[0].w, 3);
});

test('settings sanitize rejects bad values', () => {
  const settings = require('../src/lib/settings');
  const out = settings.sanitize(settings.defaults(), { general: { language: 'xx', timezone: 'Nope/Zone' }, tierRoles: { gold: 'abc', iron: '123456789012345678' } });
  assert.strictEqual(out.general.language, 'auto');
  assert.strictEqual(out.general.timezone, 'Asia/Seoul');
  assert.strictEqual(out.tierRoles.gold, null);
  assert.strictEqual(out.tierRoles.iron, '123456789012345678');
});

test('every card renders and fits Discord limits (ko + en)', () => {
  const player = require('../src/features/player');
  const ranking = require('../src/features/ranking');
  const panels = require('../src/features/panels');
  const analytics = require('../src/features/analytics');
  const utility = require('../src/features/utility');
  const recap = require('../src/services/recap');
  const user = { id: users[0], username: 'u1', displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png' };
  for (const tt of [t, te]) {
    const p = players.playerOf(users[0]);
    checkPayload('profile', ui.v2(player.viewProfile(tt, user, p, users[0])));
    checkPayload('board', ui.v2(ranking.boardCard(tt, guild, users[0], 'acs', 'week', {}, 0)));
    for (const type of panels.TYPES) checkPayload(`panel ${type}`, ui.v2(panels.panelCard(type, guild)));
    checkPayload('server stats', ui.v2(analytics.serverCard(tt, guild)));
    checkPayload('help', ui.v2(utility.helpCard(tt, GUILD)));
    checkPayload('recap', ui.v2(recap.build(guild)));
  }
});

test('community cards render in every state', () => {
  const scrim = require('../src/features/scrim');
  const party = require('../src/features/party');
  const duel = require('../src/features/duel');
  const tn = require('../src/features/tournament');
  for (const tt of [t, te]) {
    for (const status of ['open', 'locked', 'pending', 'disputed', 'done', 'cancelled']) {
      const s = { id: 'sc1', guildId: GUILD, title: '5v5', size: 5, map: 'Ascent', status, hostId: users[0], players: users.slice(0, 6), teamA: status === 'open' ? [] : users.slice(0, 3), teamB: status === 'open' ? [] : users.slice(3, 6), result: status === 'open' || status === 'locked' ? null : { winner: 'A', reportedBy: users[0] }, minTier: 'gold' };
      checkPayload(`scrim ${status}`, ui.v2(scrim.scrimCard(tt, s)));
    }
    checkPayload('scrim cfg', ui.v2(scrim.cfgCard(tt, { size: 5, assign: 'balanced' })));
    for (const status of ['open', 'full', 'closed', 'expired']) {
      checkPayload(`party ${status}`, ui.v2(party.partyCard(tt, { id: 'pa1', mode: 'competitive', size: 5, members: users.slice(0, 3), hostId: users[0], status, tierMin: 'gold', tierMax: 'diamond', mic: true, region: 'kr', note: 'hi', expiresAt: new Date().toISOString() })));
    }
    checkPayload('party cfg', ui.v2(party.cfgCard(tt, { mode: 'competitive', size: 5, tierMin: null, tierMax: null, mic: false })));
    for (const status of ['pending', 'accepted', 'disputed', 'done', 'declined', 'expired', 'cancelled']) {
      checkPayload(`duel ${status}`, ui.v2(duel.duelCard(tt, { id: 'du1', challengerId: users[0], opponentId: users[1], format: 'bo3', rule: 'agent', agents: ['Jett', 'Sova'], status, reports: {}, winnerId: users[0], delta: 16 })));
    }
    const x = { id: 'tn1', name: 'Cup', format: 'single', teamSize: 1, maxTeams: 8, status: 'live', teams: [1, 2, 3, 4, 5].map((n) => ({ id: `t${n}`, name: `Team ${n}`, captainId: users[n - 1], members: [users[n - 1]] })), matches: [] };
    tn.buildSingle(x);
    checkPayload('bracket', ui.v2(tn.tnCard(tt, x)));
    checkPayload('signup', ui.v2(tn.tnCard(tt, { ...x, status: 'signup', matches: [] })));
  }
});

test('bot profile card renders', () => {
  const branding = require('../src/features/branding');
  const g = { ...guild, members: { ...guild.members, me: { displayName: 'Valo', displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/1.png', displayBannerURL: () => null } } };
  store.guild(GUILD, 'branding', {}).data = { nick: 'Valo', bio: 'hi', updatedAt: new Date().toISOString() };
  for (const tt of [t, te]) checkPayload('botprofile', ui.v2(branding.profileCard(tt, g)));
});

test('language: personal choice, Discord language, server language', () => {
  const i18n = require('../src/lib/i18n');
  i18n.setGuildLocale(GUILD, 'ko');
  const asUser = (id, locale) => i18n.tr({ user: { id }, guildId: GUILD, locale });
  assert.strictEqual(asUser('300000000000000001', 'en-US').lang, 'en');          // auto: follows Discord language
  assert.strictEqual(asUser('300000000000000001', 'en-US').guild.lang, 'ko');    // public posts: server language
  players.setLang('300000000000000002', 'ko');
  assert.strictEqual(asUser('300000000000000002', 'en-US').lang, 'ko');          // personal choice wins
  players.setLang('300000000000000002', 'auto');
  assert.strictEqual(asUser('300000000000000002', 'en-US').lang, 'en');
});

// async tests: website request queue + public export
(async () => {
  const fsp = require('fs/promises');
  const queue = require('../src/services/queue');
  const dir = path.join(store.BOT_DIR, '_global', 'queue');
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, '1-aaaaaa.json'), JSON.stringify({ id: '1-aaaaaa', type: 'lang', userId: '300000000000000009', lang: 'en', createdAt: new Date().toISOString() }));
  await fsp.writeFile(path.join(dir, '2-bbbbbb.json'), JSON.stringify({ id: '2-bbbbbb', type: 'nope', userId: '300000000000000009', createdAt: new Date().toISOString() }));
  await queue.tick({ guilds: { cache: new Collection() } });
  const ok = JSON.parse(await fsp.readFile(path.join(dir, 'done', '1-aaaaaa.json'), 'utf8'));
  const bad = JSON.parse(await fsp.readFile(path.join(dir, 'done', '2-bbbbbb.json'), 'utf8'));
  test('website request queue: runs, records result, rejects unknown', () => {
    assert.strictEqual(ok.status, 'done');
    assert.strictEqual(players.userEntry('300000000000000009').lang, 'en');
    assert.strictEqual(bad.status, 'failed');
  });
  test('public export has leaderboards and no private players', () => {
    players.setPrivate(users[4], true);
    require('../src/services/public').exportGuild(guild);
    const pub = store.guild(GUILD, 'public', {}).data;
    assert.ok(pub.leaderboards.rr.length === 4, `rows ${pub.leaderboards.rr.length}`);
    assert.ok(!pub.leaderboards.rr.some((r) => r.userId === users[4]));
    players.setPrivate(users[4], false);
  });
  console.log(`\n${passed} passed`);
  setTimeout(() => process.exit(process.exitCode || 0), 600);
})();
