'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { add } = require('../lib/i18n');
const { aggregate, groupBy, streak, acsOf, fmt, MIN_SAMPLE } = require('../lib/stats');
const ranks = require('../lib/ranks');
const { UserError, needFeature, targetPlayer, guildPlayers, avatar, ui, players, settings } = require('./common');
const scrim = require('./scrim');
const party = require('./party');

const { card, v2, md, absTime, SEP } = ui;

add({
  en: {
    'an.title': 'Analysis',
    'an.window': 'Last {n} competitive games',
    'an.trend': 'Trend (last 10 vs before)',
    'an.best_agent': 'Best agent',
    'an.weak_map': 'Weakest map',
    'an.best_match': 'Best game',
    'an.streak': 'Streak',
    'an.streak.W': '{n} wins', 'an.streak.L': '{n} losses',
    'an.time': 'By time of day',
    'an.morning': 'Morning', 'an.afternoon': 'Afternoon', 'an.evening': 'Evening', 'an.night': 'Night',
    'an.need3': 'Needs 3+ games each.',
    'ss.title': 'Server stats',
    'ss.linked': 'Linked players',
    'ss.active': 'Played this week',
    'ss.tiers': 'Tiers',
    'ss.agents': 'Most played agents (30 days)',
    'ss.maps': 'Most played maps (30 days)',
    'ss.scrims': 'Scrims (30 days)',
    'ss.scrims_v': '{done} finished / {all} created',
    'ss.parties': 'Parties filled (30 days)',
    'ss.parties_v': '{full} of {all}',
    'ss.most_active': 'Most games this week',
    'ss.none': 'No data yet.',
  },
  ko: {
    'an.title': '분석',
    'an.window': '최근 경쟁전 {n}경기',
    'an.trend': '추세 (최근 10경기 vs 이전)',
    'an.best_agent': '가장 잘한 요원',
    'an.weak_map': '가장 약한 맵',
    'an.best_match': '최고 경기',
    'an.streak': '연속 기록',
    'an.streak.W': '{n}연승', 'an.streak.L': '{n}연패',
    'an.time': '시간대별',
    'an.morning': '오전', 'an.afternoon': '오후', 'an.evening': '저녁', 'an.night': '새벽',
    'an.need3': '각 3경기 이상 필요',
    'ss.title': '서버 통계',
    'ss.linked': '연결된 플레이어',
    'ss.active': '이번 주 플레이',
    'ss.tiers': '티어 분포',
    'ss.agents': '많이 쓴 요원 (30일)',
    'ss.maps': '많이 한 맵 (30일)',
    'ss.scrims': '내전 (30일)',
    'ss.scrims_v': '종료 {done} / 생성 {all}',
    'ss.parties': '파티 모집 성공 (30일)',
    'ss.parties_v': '{all}개 중 {full}개',
    'ss.most_active': '이번 주 최다 경기',
    'ss.none': '아직 데이터가 없습니다.',
  },
});

const arrow = (a, b, higherBetter = true) => {
  if (a === null || b === null) return '';
  if (Math.abs(a - b) < 1e-9) return ' =';
  return (a > b) === higherBetter ? ' ▲' : ' ▼';
};

function hourIn(tz, iso) {
  try {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date(iso)));
  } catch (e) { return new Date(iso).getUTCHours(); }
}

function analysisCard(t, user, p, tz) {
  const recent = players.competitive(p.puuid, 20);
  const agg = aggregate(recent);
  const parts = [{ section: [`## ${t('an.title')} · ${md(p.name)}#${md(p.tag)}`, `-# ${t('an.window', { n: agg.n })}`], thumb: avatar(user) }, SEP];
  if (agg.n < MIN_SAMPLE) {
    parts.push(t('common.sample_small', { n: agg.n, min: MIN_SAMPLE }));
    return card(parts, ui.COLORS.grey);
  }
  parts.push(require('./player').statsLine(t, agg));

  if (recent.length >= 15) {
    const now = aggregate(recent.slice(0, 10));
    const before = aggregate(recent.slice(10));
    parts.push(`**${t('an.trend')}**\n${[
      now.winRate !== null && before.winRate !== null ? `${t('pl.wr')} ${fmt.pct(before.winRate)} → **${fmt.pct(now.winRate)}**${arrow(now.winRate, before.winRate)}` : null,
      now.kd !== null && before.kd !== null ? `K/D ${fmt.dec(before.kd)} → **${fmt.dec(now.kd)}**${arrow(now.kd, before.kd)}` : null,
      now.acs !== null && before.acs !== null ? `ACS ${fmt.int(before.acs)} → **${fmt.int(now.acs)}**${arrow(now.acs, before.acs)}` : null,
    ].filter(Boolean).join('\n')}`);
  }

  const agents = groupBy(recent, 'agent').filter((g) => g.n >= 3 && g.acs !== null).sort((a, b) => b.acs - a.acs);
  const maps = groupBy(recent, 'map').filter((g) => g.n >= 3 && g.winRate !== null).sort((a, b) => a.winRate - b.winRate);
  const best = recent.filter((m) => acsOf(m) !== null).sort((a, b) => acsOf(b) - acsOf(a))[0];
  const st = streak(recent);
  parts.push([
    `**${t('an.best_agent')}** · ${agents[0] ? `${md(agents[0].name)} · ACS ${fmt.int(agents[0].acs)} · ${t('common.matches_n', { n: agents[0].n })}` : t('an.need3')}`,
    `**${t('an.weak_map')}** · ${maps[0] ? `${md(maps[0].name)} · ${fmt.pct(maps[0].winRate)} · ${t('common.matches_n', { n: maps[0].n })}` : t('an.need3')}`,
    best ? `**${t('an.best_match')}** · ${md(best.agent || '')} · ${md(best.map || '')} · ${best.kills}/${best.deaths}/${best.assists} · ACS ${Math.round(acsOf(best))} · ${absTime(best.startedAt, 'd')}` : null,
    st ? `**${t('an.streak')}** · ${t(`an.streak.${st.type}`, { n: st.count })}` : null,
  ].filter(Boolean).join('\n'));

  const buckets = { night: [], morning: [], afternoon: [], evening: [] };
  for (const m of recent) {
    if (!m.startedAt) continue;
    const h = hourIn(tz, m.startedAt);
    buckets[h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'].push(m);
  }
  const lines = Object.entries(buckets).filter(([, l]) => l.length >= 3).map(([k, l]) => {
    const a = aggregate(l);
    return `${t(`an.${k}`)} · ${fmt.pct(a.winRate) || '-'} · ACS ${fmt.int(a.acs) || '-'} · ${t('common.matches_n', { n: a.n })}`;
  });
  parts.push(`**${t('an.time')}** (${tz})\n${lines.length ? lines.join('\n') : t('an.need3')}`);
  return card(parts, ranks.accent(p.current && p.current.tier));
}

function serverCard(t, guild) {
  const list = guildPlayers(guild, { includePrivate: true });
  const weekAgo = Date.now() - 7 * 86400_000;
  const monthAgo = Date.now() - 30 * 86400_000;
  const tiers = {};
  for (const x of list) {
    const k = ranks.tierKey(x.player.current && x.player.current.tier);
    if (k) tiers[k] = (tiers[k] || 0) + 1;
  }
  const month = list.flatMap((x) => players.competitive(x.player.puuid).filter((m) => Date.parse(m.startedAt) >= monthAgo));
  const top = (key) => groupBy(month, key).sort((a, b) => b.n - a.n).slice(0, 5).map((g) => `${md(g.name)} ${g.n}`).join(' · ');
  const weekCounts = list.map((x) => ({ x, n: players.competitive(x.player.puuid).filter((m) => Date.parse(m.startedAt) >= weekAgo).length })).filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  const scr = scrim.doc(guild.id).data.filter((s) => Date.parse(s.createdAt) >= monthAgo);
  const par = party.doc(guild.id).data.filter((p) => Date.parse(p.createdAt) >= monthAgo);
  const fullParties = par.filter((p) => p.filledAt).length;

  return card([
    `## ${t('ss.title')} · ${md(guild.name)}`,
    SEP,
    `**${t('ss.linked')}** ${list.length} · **${t('ss.active')}** ${weekCounts.length}`,
    `**${t('ss.tiers')}**\n${ranks.ORDER.slice().reverse().filter((k) => tiers[k]).map((k) => `${ranks.NAMES[k]} ${tiers[k]}`).join(' · ') || t('ss.none')}`,
    `**${t('ss.agents')}**\n${top('agent') || t('ss.none')}`,
    `**${t('ss.maps')}**\n${top('map') || t('ss.none')}`,
    `**${t('ss.scrims')}** ${t('ss.scrims_v', { done: scr.filter((s) => s.status === 'done').length, all: scr.length })}`,
    `**${t('ss.parties')}** ${par.length ? t('ss.parties_v', { full: fullParties, all: par.length }) : '-'}`,
    `**${t('ss.most_active')}**\n${weekCounts.slice(0, 5).map((r, i) => `${i + 1}. <@${r.x.userId}> · ${t('common.matches_n', { n: r.n })}`).join('\n') || t('ss.none')}`,
  ], ui.COLORS.teal);
}

const commands = [
  new SlashCommandBuilder().setName('analysis').setDescription('Your play analysis').setDescriptionLocalizations({ ko: '내 플레이 분석' })
    .addUserOption((o) => o.setName('user').setDescription('Player (default: you)').setDescriptionLocalizations({ ko: '플레이어 (기본: 나)' }))
    .addBooleanOption((o) => o.setName('share').setDescription('Post in the channel').setDescriptionLocalizations({ ko: '채널에 공유' })),
  new SlashCommandBuilder().setName('serverstats').setDescription('Server stats').setDescriptionLocalizations({ ko: '서버 통계' }),
];

const onCommand = {
  async analysis(interaction, t) {
    if (interaction.guildId) needFeature(interaction, t, 'analytics');
    const { user, player } = targetPlayer(interaction, t, interaction.options.getUser('user'));
    const tz = settings.get(interaction.guildId).general.timezone;
    const share = interaction.options.getBoolean('share');
    return interaction.reply(v2(analysisCard(share ? (t.guild || t) : t, user, player, tz), { ephemeral: !share }));
  },
  async serverstats(interaction, t) {
    needFeature(interaction, t, 'analytics');
    if (!interaction.guild) throw new UserError(t('common.guild_only'));
    return interaction.reply(v2(serverCard(t.guild || t, interaction.guild)));
  },
};

const onButton = {
  'an:me': async (interaction, t) => {
    const { user, player } = targetPlayer(interaction, t, interaction.user);
    return interaction.reply(v2(analysisCard(t, user, player, settings.get(interaction.guildId).general.timezone), { ephemeral: true }));
  },
};

module.exports = { commands, onCommand, onButton, serverCard };
