'use strict';
/* Weekly Recap: posted once a week at the day/hour the server chose, from the real week's data. */
const settings = require('../lib/settings');
const store = require('../lib/store');
const { tr, add } = require('../lib/i18n');
const ui = require('../lib/ui');
const players = require('./players');

add({
  en: {
    'wr.title': 'Weekly Recap',
    'wr.climbs': 'Biggest climbs',
    'wr.games': 'Most games',
    'wr.scrims': 'Scrims finished: {n}',
    'wr.duels': 'Duels played: {n}',
    'wr.nothing': 'A quiet week. No games recorded.',
  },
  ko: {
    'wr.title': '주간 요약',
    'wr.climbs': 'RR 상승 TOP',
    'wr.games': '최다 경기',
    'wr.scrims': '종료된 내전: {n}',
    'wr.duels': '대결: {n}',
    'wr.nothing': '조용한 한 주였습니다. 기록된 경기가 없습니다.',
  },
});

function localParts(tz) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = Object.fromEntries(f.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { day, hour: Number(parts.hour), date: `${parts.year}-${parts.month}-${parts.day}` };
}

function build(guild) {
  const t = tr(guild.id);
  const { guildPlayers } = require('../features/common');
  const weekAgo = Date.now() - 7 * 86400_000;
  const list = guildPlayers(guild);
  const climbs = list.map((x) => {
    const base = players.eloAt(x.player.puuid, weekAgo);
    const c = x.player.current;
    return base && c && typeof c.elo === 'number' ? { ...x, gain: c.elo - base.elo } : null;
  }).filter((x) => x && x.gain > 0).sort((a, b) => b.gain - a.gain).slice(0, 3);
  const games = list.map((x) => ({ ...x, n: players.competitive(x.player.puuid).filter((m) => Date.parse(m.startedAt) >= weekAgo).length }))
    .filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 3);
  const scrims = store.guild(guild.id, 'scrims', []).data.filter((s) => s.status === 'done' && Date.parse(s.doneAt) >= weekAgo).length;
  const duels = store.guild(guild.id, 'duels', []).data.filter((d) => d.status === 'done' && Date.parse(d.doneAt) >= weekAgo).length;
  if (!climbs.length && !games.length && !scrims && !duels) return ui.card([`## ${t('wr.title')}`, t('wr.nothing')], ui.COLORS.grey);
  return ui.card([
    `## ${t('wr.title')}`,
    ui.SEP,
    climbs.length ? `**${t('wr.climbs')}**\n${climbs.map((x, i) => `${i + 1}. <@${x.userId}> · +${x.gain} RR · ${ui.md(x.player.current.tier || '')}`).join('\n')}` : null,
    games.length ? `**${t('wr.games')}**\n${games.map((x, i) => `${i + 1}. <@${x.userId}> · ${t('common.matches_n', { n: x.n })}`).join('\n')}` : null,
    [scrims ? t('wr.scrims', { n: scrims }) : null, duels ? t('wr.duels', { n: duels }) : null].filter(Boolean).join(' · ') || null,
  ], ui.COLORS.brand);
}

async function tick(client) {
  for (const guild of client.guilds.cache.values()) {
    const s = settings.get(guild.id);
    if (!s.weeklyRecap.enabled || !s.weeklyRecap.channel) continue;
    const now = localParts(s.general.timezone);
    if (now.day !== s.weeklyRecap.day || now.hour !== s.weeklyRecap.hour) continue;
    const st = store.guild(guild.id, 'recap', {});
    if (st.data.lastDate === now.date) continue;
    const ch = guild.channels.cache.get(s.weeklyRecap.channel);
    if (!ch || !ch.isTextBased()) continue;
    await ch.send(ui.v2(build(guild))).catch(() => {});
    st.data.lastDate = now.date;
    st.data.lastAt = new Date().toISOString();
    st.save();
  }
}

module.exports = { tick, build };
