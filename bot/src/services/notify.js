'use strict';
/* Alerts: rank changes, streaks, season end, events. Respects per-type toggles and per-player cooldown. */
const settings = require('../lib/settings');
const { tr, add } = require('../lib/i18n');
const ui = require('../lib/ui');
const ranks = require('../lib/ranks');
const { streak } = require('../lib/stats');
const players = require('./players');

add({
  en: {
    'nt.rankup': 'Rank up',
    'nt.rankdown': 'Rank down',
    'nt.rr': 'RR change',
    'nt.match': 'Match finished',
    'nt.streak.W': '{n} wins in a row',
    'nt.streak.L': '{n} losses in a row',
  },
  ko: {
    'nt.rankup': '승급',
    'nt.rankdown': '강등',
    'nt.rr': 'RR 변동',
    'nt.match': '경기 종료',
    'nt.streak.W': '{n}연승',
    'nt.streak.L': '{n}연패',
  },
});

const lastSent = new Map(); // `${guildId}|${userId}|${type}` -> ms

function channelFor(guild, s) {
  const id = s.notifications.channel;
  const ch = id ? guild.channels.cache.get(id) : null;
  return ch && ch.isTextBased() ? ch : null;
}

/** Generic send used by other modules (seasons, events, tournaments). */
async function send(guild, type, container) {
  const s = settings.get(guild.id);
  if (!s.features.notifications) return;
  if (type && s.notifications[type] === false) return;
  const ch = channelFor(guild, s);
  if (!ch) return;
  await ch.send(ui.v2(container)).catch(() => {});
}

function cooled(guildId, userId, type, minutes) {
  const key = `${guildId}|${userId}|${type}`;
  const last = lastSent.get(key) || 0;
  if (Date.now() - last < minutes * 60_000) return false;
  lastSent.set(key, Date.now());
  return true;
}

async function forPlayer(client, puuid, type, build) {
  for (const userId of players.userIdsForPuuid(puuid)) {
    if (players.isPrivate(userId)) continue;
    for (const guild of client.guilds.cache.values()) {
      if (!guild.members.cache.has(userId)) continue;
      const s = settings.get(guild.id);
      if (!s.features.notifications || !s.notifications[type]) continue;
      const ch = channelFor(guild, s);
      if (!ch) continue;
      const container = build(tr(guild.id), userId, s);
      if (!container) continue;
      if (!cooled(guild.id, userId, type, s.notifications.cooldownMinutes)) continue;
      await ch.send(ui.v2(container)).catch(() => {});
    }
  }
}

function attach(client) {
  players.bus.on('rankChanged', ({ puuid, before, after }) => {
    const up = (after.tierId || 0) > (before.tierId || 0);
    const p = players.player(puuid);
    forPlayer(client, puuid, up ? 'rankUp' : 'rankDown', (t, userId) => ui.card([
      `## ${t(up ? 'nt.rankup' : 'nt.rankdown')}`,
      `<@${userId}> · ${ui.md(p.name)}#${ui.md(p.tag)}`,
      `${ui.md(before.tier || '-')} → **${ui.md(after.tier || '-')}**`,
    ], up ? ranks.accent(after.tier) : ui.COLORS.grey));
  });

  players.bus.on('newMatches', ({ puuid, records }) => {
    const p = players.player(puuid);
    const newest = records.slice().sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0];
    if (newest) {
      forPlayer(client, puuid, 'matchEnd', (t, userId) => ui.card([
        `## ${t('nt.match')}`,
        `<@${userId}> · **${newest.won ? 'W' : newest.draw ? 'D' : 'L'}** ${newest.roundsWon ?? '?'}-${newest.roundsLost ?? '?'} · ${ui.md(newest.map || '')} · ${ui.md(newest.agent || '')} · ${newest.kills ?? '-'}/${newest.deaths ?? '-'}/${newest.assists ?? '-'}`,
      ], newest.won ? ui.COLORS.good : ui.COLORS.grey));
      if (p.current && typeof p.current.lastChange === 'number') {
        forPlayer(client, puuid, 'rrChange', (t, userId) => ui.card([
          `**${t('nt.rr')}** · <@${userId}> · ${p.current.lastChange > 0 ? '+' : ''}${p.current.lastChange} RR → ${ui.md(p.current.tier || '')} ${p.current.rr ?? ''} RR`,
        ], ranks.accent(p.current.tier)));
      }
    }
    const st = streak(players.competitive(puuid, 30));
    if (st) {
      forPlayer(client, puuid, 'streak', (t, userId, s) => (st.count === s.notifications.streakThreshold
        ? ui.card([`## ${t(`nt.streak.${st.type}`, { n: st.count })}`, `<@${userId}> · ${ui.md(p.name)}#${ui.md(p.tag)}`], st.type === 'W' ? ui.COLORS.good : ui.COLORS.bad)
        : null));
    }
  });
}

module.exports = { attach, send };
