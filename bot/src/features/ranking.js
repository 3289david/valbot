'use strict';
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { add } = require('../lib/i18n');
const { aggregate, fmt, MIN_SAMPLE } = require('../lib/stats');
const ranks = require('../lib/ranks');
const premium = require('../lib/premium');
const store = require('../lib/store');
const { UserError, needGuild, needAdmin, guildPlayers, ui, players, settings } = require('./common');

const { card, v2, row, button, select, ButtonStyle, md, relTime, absTime, SEP } = ui;

add({
  en: {
    'lb.title': 'Leaderboard',
    'lb.type.rr': 'Rank (RR)', 'lb.type.tier': 'Tier', 'lb.type.winrate': 'Win rate', 'lb.type.kd': 'K/D', 'lb.type.acs': 'ACS',
    'lb.type.wins': 'Most wins', 'lb.type.kills': 'Most kills', 'lb.type.rrgain': 'RR gained',
    'lb.period.day': 'Today', 'lb.period.week': 'This week', 'lb.period.month': 'This month', 'lb.period.all': 'All',
    'lb.empty': 'No one qualifies yet.',
    'lb.min': 'Min. {n} games',
    'lb.you': 'You: #{pos}',
    'lb.you_none': 'You are not on this board.',
    'lb.pick_type': 'Ranking',
    'lb.pick_period': 'Period',
    'lb.games': '{n}g',
    'lb.web': 'Open on web',
    'mvp.title': 'MVP',
    'mvp.week': 'Week',
    'mvp.month': 'Month',
    'mvp.none': 'No one yet',
    'season.title': 'Seasons',
    'season.none': 'No active season.',
    'season.created': 'Season **{name}** started. Ends {end}.',
    'season.ended': 'Season **{name}** ended.',
    'season.metric.rrgain': 'RR gained', 'season.metric.wins': 'Wins', 'season.metric.acs': 'Average ACS',
    'season.ends': 'Ends {time}',
    'season.ended_at': 'Ended {time}',
    'season.reward': 'Top {n} get {role}',
    'season.limit': 'Your plan allows {n} active season(s).',
    'season.results': '## Season {name} results',
    'season.ending_soon': 'Season **{name}** ends {time}.',
    'season.notfound': 'Season not found.',
  },
  ko: {
    'lb.title': '랭킹',
    'lb.type.rr': '랭크 (RR)', 'lb.type.tier': '티어', 'lb.type.winrate': '승률', 'lb.type.kd': 'K/D', 'lb.type.acs': 'ACS',
    'lb.type.wins': '최다 승리', 'lb.type.kills': '최다 킬', 'lb.type.rrgain': 'RR 상승',
    'lb.period.day': '오늘', 'lb.period.week': '이번 주', 'lb.period.month': '이번 달', 'lb.period.all': '전체',
    'lb.empty': '아직 조건을 만족하는 사람이 없습니다.',
    'lb.min': '최소 {n}경기',
    'lb.you': '내 순위: {pos}위',
    'lb.you_none': '이 랭킹에 내 기록이 없습니다.',
    'lb.pick_type': '랭킹 종류',
    'lb.pick_period': '기간',
    'lb.games': '{n}경기',
    'lb.web': '웹에서 보기',
    'mvp.title': 'MVP',
    'mvp.week': '주간',
    'mvp.month': '월간',
    'mvp.none': '아직 없음',
    'season.title': '시즌',
    'season.none': '진행 중인 시즌이 없습니다.',
    'season.created': '**{name}** 시즌 시작. 종료: {end}',
    'season.ended': '**{name}** 시즌이 끝났습니다.',
    'season.metric.rrgain': 'RR 상승량', 'season.metric.wins': '승리 수', 'season.metric.acs': '평균 ACS',
    'season.ends': '종료 {time}',
    'season.ended_at': '{time} 종료',
    'season.reward': '상위 {n}명에게 {role}',
    'season.limit': '현재 요금제는 동시에 {n}개 시즌까지 가능합니다.',
    'season.results': '## {name} 시즌 결과',
    'season.ending_soon': '**{name}** 시즌이 {time} 끝납니다.',
    'season.notfound': '시즌을 찾을 수 없습니다.',
  },
});

const TYPES = ['rr', 'tier', 'winrate', 'kd', 'acs', 'wins', 'kills', 'rrgain'];
const PERIODS = ['day', 'week', 'month', 'all'];
const PERIOD_MS = { day: 86400_000, week: 7 * 86400_000, month: 30 * 86400_000, all: Infinity };
const PAGE = 10;

function matchesSince(puuid, since, filter) {
  return players.competitive(puuid).filter((m) => (since === -Infinity || Date.parse(m.startedAt) >= since)
    && (!filter.agent || m.agent === filter.agent) && (!filter.map || m.map === filter.map));
}

/** Build ranked rows. Each row: { userId, player, value, display, n } */
function compute(guild, type, period, filter = {}) {
  const since = period === 'all' ? -Infinity : Date.now() - PERIOD_MS[period];
  let list = guildPlayers(guild);
  if (filter.tier) list = list.filter((x) => ranks.tierKey(x.player.current && x.player.current.tier) === filter.tier);
  const rows = [];
  for (const x of list) {
    const p = x.player;
    const c = p.current || {};
    if (type === 'rr') {
      if (typeof c.elo === 'number') rows.push({ ...x, value: c.elo, display: `${md(c.tier || '-')} · ${c.rr ?? '-'} RR` });
    } else if (type === 'tier') {
      if (typeof c.tierId === 'number' && c.tierId > 0) rows.push({ ...x, value: c.tierId * 1000 + (c.rr || 0), display: md(c.tier) });
    } else if (type === 'rrgain') {
      if (period === 'all' || typeof c.elo !== 'number') continue;
      const base = players.eloAt(p.puuid, since);
      if (base) rows.push({ ...x, value: c.elo - base.elo, display: `${c.elo - base.elo >= 0 ? '+' : ''}${c.elo - base.elo} RR` });
    } else {
      const ms = matchesSince(p.puuid, since, filter).slice(0, type === 'wins' || type === 'kills' ? undefined : 20);
      const agg = aggregate(ms);
      if (type === 'wins' && agg.wins > 0) rows.push({ ...x, value: agg.wins, display: `${agg.wins}W`, n: agg.n });
      else if (type === 'kills' && agg.kills > 0) rows.push({ ...x, value: agg.kills, display: `${agg.kills}`, n: agg.n });
      else if (agg.n >= MIN_SAMPLE) {
        if (type === 'winrate' && agg.winRate !== null) rows.push({ ...x, value: agg.winRate, display: fmt.pct(agg.winRate), n: agg.n });
        if (type === 'kd' && agg.kd !== null) rows.push({ ...x, value: agg.kd, display: fmt.dec(agg.kd), n: agg.n });
        if (type === 'acs' && agg.acs !== null) rows.push({ ...x, value: agg.acs, display: fmt.int(agg.acs), n: agg.n });
      }
    }
  }
  return rows.sort((a, b) => b.value - a.value);
}

function encodeFilter(f) { return f.tier ? `t-${f.tier}` : f.agent ? `a-${f.agent}` : f.map ? `m-${f.map}` : '-'; }
function decodeFilter(s) {
  if (!s || s === '-') return {};
  const [k, ...v] = s.split('-');
  const val = v.join('-');
  return k === 't' ? { tier: val } : k === 'a' ? { agent: val } : k === 'm' ? { map: val } : {};
}

function boardCard(t, guild, viewerId, type, period, filter, page) {
  const rows = compute(guild, type, period, filter);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pg = Math.min(Math.max(0, page), pages - 1);
  const slice = rows.slice(pg * PAGE, pg * PAGE + PAGE);
  const filterLabel = filter.tier ? ranks.NAMES[filter.tier] : filter.agent || filter.map || null;
  const head = `## ${t('lb.title')} · ${t(`lb.type.${type}`)}`;
  const sub = [type === 'rr' || type === 'tier' ? null : t(`lb.period.${period}`), filterLabel, ['winrate', 'kd', 'acs'].includes(type) ? t('lb.min', { n: MIN_SAMPLE }) : null].filter(Boolean).join(' · ');
  const body = slice.length
    ? slice.map((r, i) => {
      const pos = pg * PAGE + i + 1;
      const medal = pos <= 3 ? ['**1**', '**2**', '**3**'][pos - 1] : `${pos}`;
      return `${medal}. <@${r.userId}> · ${md(r.player.name)}#${md(r.player.tag)} · **${r.display}**${r.n ? ` · ${t('lb.games', { n: r.n })}` : ''}`;
    }).join('\n')
    : t('lb.empty');
  const mine = rows.findIndex((r) => r.userId === viewerId);
  const enc = encodeFilter(filter);
  const typeSel = select(`lb:type:${period}:${enc}`, t('lb.pick_type'), TYPES.map((x) => ({ label: t(`lb.type.${x}`), value: x, default: x === type })));
  const periodSel = select(`lb:period:${type}:${enc}`, t('lb.pick_period'), PERIODS.filter((x) => !(type === 'rrgain' && x === 'all')).map((x) => ({ label: t(`lb.period.${x}`), value: x, default: x === period })));
  const parts = [head, sub ? `-# ${sub}` : null, SEP, body, SEP, `-# ${mine >= 0 ? t('lb.you', { pos: mine + 1 }) : t('lb.you_none')}`, row(typeSel)];
  if (settings.get(guild.id).general.publicStats && ui.webButton('x', '/')) parts.push(row(ui.webButton(t('lb.web'), `/s/${guild.id}`)));
  if (!(type === 'rr' || type === 'tier')) parts.push(row(periodSel));
  if (pages > 1) {
    parts.push(row(
      button(`lb:page:${type}:${period}:${enc}:${pg - 1}`, t('common.prev'), ButtonStyle.Secondary, { disabled: pg === 0 }),
      button(`noop:pg`, t('common.page', { p: pg + 1, total: pages }), ButtonStyle.Secondary, { disabled: true }),
      button(`lb:page:${type}:${period}:${enc}:${pg + 1}`, t('common.next'), ButtonStyle.Secondary, { disabled: pg >= pages - 1 }),
    ));
  }
  return card(parts, ui.COLORS.brand);
}

/* ---------------- Seasons ---------------- */

const seasonsDoc = (guildId) => store.guild(guildId, 'seasons', []);

function seasonScore(season, entry, player) {
  if (!player) return null;
  if (season.metric === 'rrgain') {
    const c = player.current;
    return c && typeof c.elo === 'number' && typeof entry.startElo === 'number' ? c.elo - entry.startElo : null;
  }
  const ms = players.competitive(player.puuid).filter((m) => Date.parse(m.startedAt) >= Date.parse(entry.startAt) && (!season.endedAt || Date.parse(m.startedAt) <= Date.parse(season.endedAt)));
  const agg = aggregate(ms);
  if (season.metric === 'wins') return agg.wins;
  if (season.metric === 'acs') return agg.n >= MIN_SAMPLE ? agg.acs : null;
  return null;
}

/** Make sure every linked member has an entry (start snapshot = their rank when they joined the season). */
function enroll(guild, season) {
  let changed = false;
  for (const x of guildPlayers(guild, { includePrivate: true })) {
    if (season.entries[x.userId]) continue;
    const c = x.player.current;
    season.entries[x.userId] = { puuid: x.player.puuid, startElo: c && typeof c.elo === 'number' ? c.elo : null, startAt: new Date().toISOString() };
    changed = true;
  }
  return changed;
}

function standings(guild, season) {
  return Object.entries(season.entries)
    .filter(([userId]) => !players.isPrivate(userId))
    .map(([userId, entry]) => ({ userId, entry, player: players.player(entry.puuid), score: seasonScore(season, entry, players.player(entry.puuid)) }))
    .filter((r) => r.player && r.score !== null)
    .sort((a, b) => b.score - a.score);
}

function scoreText(season, s) {
  if (season.metric === 'rrgain') return `${s >= 0 ? '+' : ''}${s} RR`;
  if (season.metric === 'acs') return `ACS ${Math.round(s)}`;
  return `${s}W`;
}

function seasonCard(t, guild, season) {
  const list = standings(guild, season).slice(0, 15);
  return card([
    `## ${md(season.name)}`,
    `-# ${t(`season.metric.${season.metric}`)} · ${season.status === 'active' ? t('season.ends', { time: absTime(season.endAt) }) : t('season.ended_at', { time: absTime(season.endedAt) })}${season.rewardRoleId ? ` · ${t('season.reward', { n: season.rewardTop, role: `<@&${season.rewardRoleId}>` })}` : ''}`,
    SEP,
    list.length ? list.map((r, i) => `${i + 1}. <@${r.userId}> · ${md(r.player.name)} · **${scoreText(season, r.score)}**`).join('\n') : t('lb.empty'),
  ], season.status === 'active' ? ui.COLORS.teal : ui.COLORS.grey);
}

async function endSeason(guild, season, notify) {
  season.status = 'ended';
  season.endedAt = new Date().toISOString();
  const final = standings(guild, season);
  season.results = final.slice(0, 50).map((r, i) => ({ place: i + 1, userId: r.userId, riotId: `${r.player.name}#${r.player.tag}`, score: r.score }));
  if (season.rewardRoleId) {
    const role = guild.roles.cache.get(season.rewardRoleId);
    if (role) {
      for (const r of final.slice(0, season.rewardTop || 3)) {
        const member = guild.members.cache.get(r.userId);
        if (member) await member.roles.add(role, `Season ${season.name} reward`).catch(() => {});
      }
    }
  }
  if (notify) await notify(guild, 'seasonEnd', seasonCard(require('../lib/i18n').tr(guild.id), guild, season));
}

/** Called every minute: enroll new members, end finished seasons, send "ending soon". */
async function tickSeasons(client, notify) {
  for (const guild of client.guilds.cache.values()) {
    const doc = seasonsDoc(guild.id);
    let dirty = false;
    for (const s of doc.data.filter((x) => x.status === 'active')) {
      if (enroll(guild, s)) dirty = true;
      const left = Date.parse(s.endAt) - Date.now();
      if (left <= 0) { await endSeason(guild, s, notify); dirty = true; }
      else if (left <= 86400_000 && !s.warned) {
        s.warned = true; dirty = true;
        const t = require('../lib/i18n').tr(guild.id);
        if (notify) await notify(guild, 'seasonEnd', ui.card([t('season.ending_soon', { name: md(s.name), time: relTime(s.endAt) })], ui.COLORS.warn));
      }
    }
    if (dirty) doc.save();
  }
}

/* ---------------- MVP ---------------- */

function mvp(guild, days) {
  const since = Date.now() - days * 86400_000;
  let best = null;
  for (const x of guildPlayers(guild)) {
    const c = x.player.current;
    const base = players.eloAt(x.player.puuid, since);
    if (!c || typeof c.elo !== 'number' || !base) continue;
    const gain = c.elo - base.elo;
    if (gain > 0 && (!best || gain > best.gain)) best = { ...x, gain };
  }
  return best;
}

/* ---------------- Commands ---------------- */

const commands = [
  new SlashCommandBuilder().setName('leaderboard').setDescription('Server leaderboard').setDescriptionLocalizations({ ko: '서버 랭킹' })
    .addStringOption((o) => o.setName('type').setDescription('Ranking').setDescriptionLocalizations({ ko: '종류' }).addChoices(...TYPES.map((x) => ({ name: x, value: x }))))
    .addStringOption((o) => o.setName('period').setDescription('Period').setDescriptionLocalizations({ ko: '기간' }).addChoices(...PERIODS.map((x) => ({ name: x, value: x }))))
    .addStringOption((o) => o.setName('tier').setDescription('Only this tier').setDescriptionLocalizations({ ko: '특정 티어만' }).addChoices(...ranks.ORDER.map((x) => ({ name: ranks.NAMES[x], value: x }))))
    .addStringOption((o) => o.setName('agent').setDescription('Only games on this agent').setDescriptionLocalizations({ ko: '특정 요원만' }).setAutocomplete(true))
    .addStringOption((o) => o.setName('map').setDescription('Only games on this map').setDescriptionLocalizations({ ko: '특정 맵만' }).setAutocomplete(true)),
  new SlashCommandBuilder().setName('myrank').setDescription('Your position').setDescriptionLocalizations({ ko: '내 순위' }),
  new SlashCommandBuilder().setName('mvp').setDescription('Weekly and monthly MVP').setDescriptionLocalizations({ ko: '주간·월간 MVP' }),
  new SlashCommandBuilder().setName('season').setDescription('Seasons').setDescriptionLocalizations({ ko: '시즌' })
    .addSubcommand((s) => s.setName('info').setDescription('Current season').setDescriptionLocalizations({ ko: '현재 시즌' }))
    .addSubcommand((s) => s.setName('create').setDescription('Start a season (admins)').setDescriptionLocalizations({ ko: '시즌 시작 (관리자)' })
      .addStringOption((o) => o.setName('name').setDescription('Name').setDescriptionLocalizations({ ko: '이름' }).setRequired(true).setMaxLength(60))
      .addIntegerOption((o) => o.setName('days').setDescription('Length in days').setDescriptionLocalizations({ ko: '기간 (일)' }).setRequired(true).setMinValue(1).setMaxValue(180))
      .addStringOption((o) => o.setName('metric').setDescription('Ranked by').setDescriptionLocalizations({ ko: '순위 기준' }).addChoices({ name: 'RR gained', value: 'rrgain' }, { name: 'Wins', value: 'wins' }, { name: 'Average ACS', value: 'acs' }))
      .addRoleOption((o) => o.setName('reward_role').setDescription('Role for the top players').setDescriptionLocalizations({ ko: '상위권 보상 역할' }))
      .addIntegerOption((o) => o.setName('reward_top').setDescription('How many get the reward').setDescriptionLocalizations({ ko: '보상 인원' }).setMinValue(1).setMaxValue(10)))
    .addSubcommand((s) => s.setName('end').setDescription('End the current season now (admins)').setDescriptionLocalizations({ ko: '시즌 즉시 종료 (관리자)' }))
    .addSubcommand((s) => s.setName('list').setDescription('Past seasons').setDescriptionLocalizations({ ko: '지난 시즌' })),
];

function knownValues(field) {
  const set = new Set();
  for (const id of players.linkedUserIds()) {
    const acc = players.mainAccount(id);
    for (const m of players.matches(acc.puuid)) if (m[field]) set.add(m[field]);
  }
  return [...set].sort();
}

const onAutocomplete = {
  async leaderboard(interaction) {
    const focused = interaction.options.getFocused(true);
    const field = focused.name === 'agent' ? 'agent' : 'map';
    const q = String(focused.value || '').toLowerCase();
    return interaction.respond(knownValues(field).filter((v) => v.toLowerCase().includes(q)).slice(0, 25).map((v) => ({ name: v, value: v })));
  },
};

const onCommand = {
  async leaderboard(interaction, t) {
    needGuild(interaction, t);
    const def = settings.get(interaction.guildId).general.defaultRanking;
    const type = interaction.options.getString('type') || def;
    let period = interaction.options.getString('period') || 'week';
    if (type === 'rrgain' && period === 'all') period = 'month';
    const filter = {};
    const tier = interaction.options.getString('tier');
    const agent = interaction.options.getString('agent');
    const map = interaction.options.getString('map');
    if (tier) filter.tier = tier; else if (agent) filter.agent = agent.slice(0, 30); else if (map) filter.map = map.slice(0, 30);
    return interaction.reply(v2(boardCard(t.guild || t, interaction.guild, interaction.user.id, type, period, filter, 0)));
  },
  async myrank(interaction, t) {
    needGuild(interaction, t);
    if (!players.playerOf(interaction.user.id)) throw new UserError(t('common.need_link'));
    const lines = ['rr', 'winrate', 'kd', 'acs', 'rrgain'].map((type) => {
      const rows = compute(interaction.guild, type, 'week', {});
      const i = rows.findIndex((r) => r.userId === interaction.user.id);
      return `**${t(`lb.type.${type}`)}** · ${i >= 0 ? `${i + 1} / ${rows.length} · ${rows[i].display}` : '-'}`;
    });
    return interaction.reply(v2(card([`## ${t('lb.title')}`, `-# ${t('lb.period.week')}`, SEP, lines.join('\n')], ui.COLORS.teal), { ephemeral: true }));
  },
  async mvp(interaction, t) {
    needGuild(interaction, t);
    t = t.guild || t;
    const w = mvp(interaction.guild, 7);
    const m = mvp(interaction.guild, 30);
    const line = (label, x) => `**${label}** · ${x ? `<@${x.userId}> · ${md(x.player.name)} · **+${x.gain} RR**` : t('mvp.none')}`;
    return interaction.reply(v2(card([`## ${t('mvp.title')}`, SEP, line(t('mvp.week'), w), line(t('mvp.month'), m)], ui.COLORS.brand)));
  },
  async season(interaction, t) {
    needGuild(interaction, t);
    const sub = interaction.options.getSubcommand();
    const doc = seasonsDoc(interaction.guildId);
    const active = doc.data.filter((s) => s.status === 'active');
    if (sub === 'info') {
      if (!active.length) return interaction.reply(ui.notice(t('season.none'), 'info', { ephemeral: true }));
      active.forEach((s) => enroll(interaction.guild, s));
      doc.save();
      return interaction.reply(v2(active.slice(0, 3).map((s) => seasonCard(t.guild || t, interaction.guild, s))));
    }
    if (sub === 'list') {
      const past = doc.data.filter((s) => s.status === 'ended').slice(-10).reverse();
      const body = past.length ? past.map((s) => `**${md(s.name)}** · ${absTime(s.endedAt, 'd')} · ${s.results && s.results[0] ? `1. <@${s.results[0].userId}>` : '-'}`).join('\n') : t('season.none');
      return interaction.reply(v2(card([`## ${t('season.title')}`, SEP, body], ui.COLORS.grey), { ephemeral: true }));
    }
    needAdmin(interaction, t);
    if (sub === 'create') {
      const lim = premium.limits(interaction.guildId).activeSeasons;
      if (active.length >= lim) throw new UserError(t('season.limit', { n: lim }));
      const days = interaction.options.getInteger('days', true);
      const role = interaction.options.getRole('reward_role');
      const season = {
        id: store.newId('s'),
        name: interaction.options.getString('name', true),
        metric: interaction.options.getString('metric') || 'rrgain',
        status: 'active',
        createdBy: interaction.user.id,
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + days * 86400_000).toISOString(),
        rewardRoleId: role ? role.id : null,
        rewardTop: interaction.options.getInteger('reward_top') || 3,
        entries: {},
      };
      enroll(interaction.guild, season);
      doc.data.push(season);
      doc.save();
      const tg = t.guild || t;
      return interaction.reply(v2([card([tg('season.created', { name: md(season.name), end: absTime(season.endAt) })], ui.COLORS.good), seasonCard(tg, interaction.guild, season)]));
    }
    if (sub === 'end') {
      if (!active.length) throw new UserError(t('season.none'));
      const s = active[0];
      await endSeason(interaction.guild, s, null);
      doc.save();
      const tg = t.guild || t;
      return interaction.reply(v2([card([tg('season.ended', { name: md(s.name) })], ui.COLORS.good), seasonCard(tg, interaction.guild, s)]));
    }
    return null;
  },
};

const onSelect = {
  'lb:type': (interaction, t, [period, enc]) => {
    const type = interaction.values[0];
    const p = type === 'rrgain' && period === 'all' ? 'month' : period;
    return interaction.update(v2(boardCard(t, interaction.guild, interaction.user.id, type, p, decodeFilter(enc), 0)));
  },
  'lb:period': (interaction, t, [type, enc]) => interaction.update(v2(boardCard(t, interaction.guild, interaction.user.id, type, interaction.values[0], decodeFilter(enc), 0))),
};

const onButton = {
  'lb:page': (interaction, t, [type, period, enc, page]) => interaction.update(v2(boardCard(t, interaction.guild, interaction.user.id, type, period, decodeFilter(enc), Number(page) || 0))),
  'lb:open': (interaction, t) => {
    needGuild(interaction, t);
    const def = settings.get(interaction.guildId).general.defaultRanking;
    return interaction.reply(v2(boardCard(t, interaction.guild, interaction.user.id, def, 'week', {}, 0), { ephemeral: true }));
  },
};

module.exports = { commands, onCommand, onSelect, onButton, onAutocomplete, compute, boardCard, mvp, tickSeasons, seasonsDoc, knownValues, PermissionFlagsBits };
