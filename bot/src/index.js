'use strict';
const { Client, GatewayIntentBits, Partials, Events, ActivityType } = require('discord.js');
const config = require('./config');
const store = require('./lib/store');
const router = require('./router');
const players = require('./services/players');
const roles = require('./services/roles');
const notify = require('./services/notify');
const recap = require('./services/recap');
const ranking = require('./features/ranking');
const party = require('./features/party');
const duel = require('./features/duel');
const panels = require('./features/panels');
const queue = require('./services/queue');
const publicExport = require('./services/public');
const { setGuildLocale } = require('./lib/i18n');

if (!config.token) {
  console.error('DISCORD_TOKEN is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!config.henrikKey) console.warn('[config] HENRIK_API_KEY is missing: player stats will not load.');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember],
});

/* Write the per-server player list the dashboard shows. */
function exportPlayers(guild) {
  const doc = store.guild(guild.id, 'players', []);
  doc.data = players.linkedUserIds().filter((id) => guild.members.cache.has(id)).map((id) => {
    const p = players.playerOf(id);
    const acc = players.mainAccount(id);
    const m = guild.members.cache.get(id);
    return {
      userId: id,
      discord: m ? m.user.username : null,
      riotId: p ? `${p.name}#${p.tag}` : null,
      region: acc.region,
      tier: p && p.current ? p.current.tier : null,
      rr: p && p.current ? p.current.rr : null,
      elo: p && p.current ? p.current.elo : null,
      linkedAt: acc.linkedAt,
      lastSyncAt: p ? p.lastSyncAt : null,
      private: players.isPrivate(id),
    };
  });
  doc.save();
}

function every(ms, name, fn) {
  setInterval(() => Promise.resolve(fn()).catch((e) => console.error(`[${name}]`, e)), ms);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user.tag} in ${c.guilds.cache.size} servers`);
  c.user.setActivity('/help', { type: ActivityType.Listening });

  for (const guild of c.guilds.cache.values()) {
    setGuildLocale(guild.id, guild.preferredLocale);
    await guild.members.fetch().catch((e) => console.warn(`[members] ${guild.id}: ${e.message}`));
    exportPlayers(guild);
    publicExport.exportGuild(guild);
  }

  notify.attach(c);
  players.bus.on('linked', ({ userId }) => roles.syncUserEverywhere(c, userId, 'link').catch(() => {}));
  players.bus.on('unlinked', ({ userId }) => roles.syncUserEverywhere(c, userId, 'unlink').catch(() => {}));
  players.bus.on('rankChanged', ({ puuid }) => {
    for (const userId of players.userIdsForPuuid(puuid)) roles.syncUserEverywhere(c, userId, 'rank').catch(() => {});
  });

  players.startLoop();
  every(60_000, 'seasons', () => ranking.tickSeasons(c, notify.send));
  every(60_000, 'parties', () => party.tick(c));
  every(60_000, 'duels', () => duel.tick(c));
  every(5 * 60_000, 'recap', () => recap.tick(c));
  every(2 * 60_000, 'panels', () => panels.refreshAll(c));
  every(10 * 60_000, 'export', () => { for (const g of c.guilds.cache.values()) { exportPlayers(g); publicExport.exportGuild(g); } });
  every(5_000, 'queue', () => queue.tick(c));
  every(6 * 3600_000, 'roles', () => roles.sweep(c));
  setTimeout(() => panels.refreshAll(c).catch((e) => console.error('[panels]', e)), 10_000);
});

client.on(Events.InteractionCreate, (interaction) => router.handle(interaction));

client.on(Events.GuildMemberAdd, (member) => roles.syncMember(member, 'join').catch(() => {}));

client.on(Events.GuildUpdate, (oldG, guild) => setGuildLocale(guild.id, guild.preferredLocale));

client.on(Events.GuildCreate, async (guild) => {
  setGuildLocale(guild.id, guild.preferredLocale);
  await guild.members.fetch().catch(() => {});
  exportPlayers(guild);
});

client.on(Events.Error, (e) => console.error('[discord]', e));

async function shutdown() {
  console.log('Shutting down...');
  await store.flush().catch(() => {});
  client.destroy();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('unhandledRejection', (e) => console.error('[unhandled]', e));

client.login(config.token);
