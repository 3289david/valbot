'use strict';
const {
  SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
} = require('discord.js');
const { add } = require('../lib/i18n');
const { aggregate, groupBy, fmt, MIN_SAMPLE, acsOf, byNewest } = require('../lib/stats');
const ranks = require('../lib/ranks');
const premium = require('../lib/premium');
const { UserError, targetPlayer, avatar, ui, players, settings } = require('./common');

const { card, v2, row, button, select, ButtonStyle, md, relTime, absTime, SEP } = ui;
const REGIONS = ['kr', 'ap', 'na', 'eu', 'latam', 'br'];

add({
  en: {
    'pl.reg.title': 'Link Riot ID',
    'pl.reg.riot': 'Riot ID (Name#TAG)',
    'pl.reg.region': 'Region (kr, ap, na, eu, latam, br)',
    'pl.reg.bad': 'Use the format Name#TAG.',
    'pl.reg.ok': 'Linked **{id}**.',
    'pl.reg.again': 'Updated **{id}**.',
    'pl.reg.note': 'Linked, not verified. Anyone can type a Riot ID.',
    'pl.unreg.pick': 'Which account do you want to unlink?',
    'pl.unreg.confirm': 'Unlink **{id}**?',
    'pl.unreg.btn': 'Unlink',
    'pl.unreg.ok': 'Unlinked.',
    'pl.unreg.none': 'You have no linked account.',
    'pl.privacy.on': 'Your profile is now private.',
    'pl.privacy.off': 'Your profile is now public.',
    'pl.main.ok': 'Main account set to **{id}**.',
    'pl.main.pick': 'Main account',
    'pl.tab.profile': 'Profile',
    'pl.tab.matches': 'Matches',
    'pl.tab.agents': 'Agents',
    'pl.tab.maps': 'Maps',
    'pl.tab.history': 'Rank history',
    'pl.refresh': 'Refresh',
    'pl.rank': 'Rank',
    'pl.peak': 'Peak',
    'pl.level': 'Level',
    'pl.unrated': 'Unrated',
    'pl.needgames': '{n} games to rank',
    'pl.lb': 'Leaderboard #{n}',
    'pl.recent': 'Last {n} competitive games',
    'pl.wr': 'Win rate',
    'pl.agents_top': 'Top agents',
    'pl.maps_top': 'Top maps',
    'pl.nomatches': 'No competitive games yet.',
    'pl.synced': 'Updated {time}',
    'pl.match.pick': 'Open a match',
    'pl.match.title': '{map} · {result}',
    'pl.win': 'Win',
    'pl.loss': 'Loss',
    'pl.draw': 'Draw',
    'pl.hist.none': 'No rank changes yet.',
    'pl.compare.title': 'Compare',
    'pl.compare.same': 'Pick two different players.',
    'pl.verify': 'Rank checked {time}.',
    'pl.shared': 'Shared by {user}',
    'pl.web': 'Open on web',
  },
  ko: {
    'pl.reg.title': 'Riot ID 연결',
    'pl.reg.riot': 'Riot ID (이름#태그)',
    'pl.reg.region': '지역 (kr, ap, na, eu, latam, br)',
    'pl.reg.bad': '이름#태그 형식으로 입력하세요.',
    'pl.reg.ok': '**{id}** 연결 완료.',
    'pl.reg.again': '**{id}** 정보를 갱신했습니다.',
    'pl.reg.note': '연결됨 (본인 인증은 아님).',
    'pl.unreg.pick': '연결 해제할 계정을 고르세요.',
    'pl.unreg.confirm': '**{id}** 연결을 해제할까요?',
    'pl.unreg.btn': '연결 해제',
    'pl.unreg.ok': '연결을 해제했습니다.',
    'pl.unreg.none': '연결된 계정이 없습니다.',
    'pl.privacy.on': '프로필을 비공개로 바꿨습니다.',
    'pl.privacy.off': '프로필을 공개로 바꿨습니다.',
    'pl.main.ok': '대표 계정: **{id}**',
    'pl.main.pick': '대표 계정',
    'pl.tab.profile': '프로필',
    'pl.tab.matches': '경기',
    'pl.tab.agents': '요원',
    'pl.tab.maps': '맵',
    'pl.tab.history': '랭크 기록',
    'pl.refresh': '새로고침',
    'pl.rank': '랭크',
    'pl.peak': '최고',
    'pl.level': '레벨',
    'pl.unrated': '언레이티드',
    'pl.needgames': '배치까지 {n}경기',
    'pl.lb': '리더보드 {n}위',
    'pl.recent': '최근 경쟁전 {n}경기',
    'pl.wr': '승률',
    'pl.agents_top': '주력 요원',
    'pl.maps_top': '주력 맵',
    'pl.nomatches': '아직 경쟁전 기록이 없습니다.',
    'pl.synced': '{time} 갱신',
    'pl.match.pick': '경기 열기',
    'pl.match.title': '{map} · {result}',
    'pl.win': '승리',
    'pl.loss': '패배',
    'pl.draw': '무승부',
    'pl.hist.none': '아직 랭크 변동이 없습니다.',
    'pl.compare.title': '비교',
    'pl.compare.same': '서로 다른 두 플레이어를 고르세요.',
    'pl.verify': '{time} 랭크 확인.',
    'pl.shared': '{user} 님이 공유',
    'pl.web': '웹에서 보기',
  },
});

/* ---------------- Formatting helpers ---------------- */

function rankLine(t, p) {
  const c = p.current;
  if (!c || !c.tier || c.tier.toLowerCase() === 'unrated') {
    return c && c.gamesNeeded ? `${t('pl.unrated')} · ${t('pl.needgames', { n: c.gamesNeeded })}` : t('pl.unrated');
  }
  let s = `**${md(c.tier)}**`;
  if (typeof c.rr === 'number') s += ` · ${c.rr} RR`;
  if (typeof c.lastChange === 'number') s += ` (${c.lastChange > 0 ? '+' : ''}${c.lastChange})`;
  if (typeof c.leaderboardRank === 'number') s += ` · ${t('pl.lb', { n: c.leaderboardRank })}`;
  return s;
}

function statsLine(t, agg) {
  const parts = [];
  if (agg.winRate !== null) parts.push(`${t('pl.wr')} **${fmt.pct(agg.winRate)}** (${agg.wins}W ${agg.losses}L)`);
  if (agg.kd !== null) parts.push(`K/D **${fmt.dec(agg.kd)}**`);
  if (agg.acs !== null) parts.push(`ACS **${fmt.int(agg.acs)}**`);
  if (agg.adr !== null) parts.push(`ADR **${fmt.int(agg.adr)}**`);
  if (agg.hs !== null) parts.push(`HS **${fmt.pct(agg.hs)}**`);
  return parts.join(' · ');
}

function resultWord(t, m) { return m.draw ? t('pl.draw') : m.won ? t('pl.win') : m.won === false ? t('pl.loss') : '?'; }

function tabs(t, userId, active) {
  const ids = ['profile', 'matches', 'agents', 'maps', 'history'];
  return row(ids.map((id) => button(`pl:tab:${id}:${userId}`, t(`pl.tab.${id}`), id === active ? ButtonStyle.Primary : ButtonStyle.Secondary)));
}

/* ---------------- Views ---------------- */

function viewProfile(t, user, p, viewerId) {
  const recent = players.competitive(p.puuid, 20);
  const agg = aggregate(recent);
  const head = [`## ${md(p.name)}#${md(p.tag)}`, rankLine(t, p)];
  const sub = [];
  if (p.peak && p.peak.tier) sub.push(`${t('pl.peak')}: ${md(p.peak.tier)}${p.peak.season ? ` (${p.peak.season})` : ''}`);
  if (typeof p.accountLevel === 'number') sub.push(`${t('pl.level')} ${p.accountLevel}`);
  sub.push(p.region ? p.region.toUpperCase() : null);

  const parts = [
    { section: [head.join('\n'), sub.filter(Boolean).join(' · ') || '​'], thumb: avatar(user) },
    SEP,
  ];
  if (agg.n >= MIN_SAMPLE) {
    parts.push(`**${t('pl.recent', { n: agg.n })}**\n${statsLine(t, agg)}`);
    const agents = groupBy(recent, 'agent').sort((a, b) => b.n - a.n).slice(0, 3);
    const maps = groupBy(recent, 'map').sort((a, b) => b.n - a.n).slice(0, 3);
    const list = (arr) => arr.map((x) => `${md(x.name)} · ${t('common.matches_n', { n: x.n })} · ${fmt.pct(x.winRate) || '-'}`).join('\n');
    parts.push(`**${t('pl.agents_top')}**\n${list(agents)}\n\n**${t('pl.maps_top')}**\n${list(maps)}`);
  } else {
    parts.push(agg.n ? t('common.sample_small', { n: agg.n, min: MIN_SAMPLE }) : t('pl.nomatches'));
  }
  parts.push(SEP, `-# ${t('pl.synced', { time: relTime(p.lastSyncAt) || t('common.never') })}`);
  if (viewerId) parts.push(tabs(t, user.id, 'profile'), row(button(`pl:refresh:${user.id}`, t('pl.refresh')), ui.webButton(t('pl.web'), ui.playerPath(p))));
  const own = viewerId && viewerId === user.id ? players.userEntry(user.id) : null;
  if (own && own.accounts.length > 1) {
    parts.push(row(select('pl:main', t('pl.main.pick'), own.accounts.map((a) => {
      const ap = players.player(a.puuid);
      return { label: ap ? `${ap.name}#${ap.tag}` : a.puuid.slice(0, 8), value: a.puuid, default: Boolean(a.main) };
    }))));
  }
  return card(parts, ranks.accent(p.current && p.current.tier));
}

function viewMatches(t, user, p) {
  const list = players.competitive(p.puuid, 10);
  const parts = [`## ${md(p.name)}#${md(p.tag)} · ${t('pl.tab.matches')}`, SEP];
  if (!list.length) parts.push(t('pl.nomatches'));
  else {
    parts.push(list.map((m) => {
      const acs = acsOf(m);
      return `**${resultWord(t, m)}** ${m.roundsWon ?? '?'}-${m.roundsLost ?? '?'} · ${md(m.map || '?')} · ${md(m.agent || '?')} · ${m.kills ?? '-'}/${m.deaths ?? '-'}/${m.assists ?? '-'}${acs !== null ? ` · ACS ${Math.round(acs)}` : ''} · ${relTime(m.startedAt) || ''}`;
    }).join('\n'));
    parts.push(row(select(`pl:match:${user.id}`, t('pl.match.pick'), list.map((m, i) => ({ label: `${i + 1}. ${resultWord(t, m)} ${m.roundsWon ?? '?'}-${m.roundsLost ?? '?'} ${m.map || ''}`, value: m.matchId, description: `${m.agent || ''} ${m.kills ?? '-'}/${m.deaths ?? '-'}/${m.assists ?? '-'}` })))));
  }
  parts.push(tabs(t, user.id, 'matches'));
  return card(parts, ranks.accent(p.current && p.current.tier));
}

function viewGroup(t, user, p, key) {
  const recent = players.competitive(p.puuid, premium.limits(null).analysisGames);
  const groups = groupBy(recent, key).sort((a, b) => b.n - a.n).slice(0, 12);
  const parts = [`## ${md(p.name)}#${md(p.tag)} · ${t(key === 'agent' ? 'pl.tab.agents' : 'pl.tab.maps')}`, `-# ${t('pl.recent', { n: recent.length })}`, SEP];
  if (!groups.length) parts.push(t('pl.nomatches'));
  else {
    parts.push(groups.map((g) => {
      const bits = [`**${md(g.name)}** · ${t('common.matches_n', { n: g.n })}`];
      if (g.winRate !== null) bits.push(`${t('pl.wr')} ${fmt.pct(g.winRate)}`);
      if (g.kd !== null) bits.push(`K/D ${fmt.dec(g.kd)}`);
      if (g.acs !== null) bits.push(`ACS ${fmt.int(g.acs)}`);
      return bits.join(' · ');
    }).join('\n'));
  }
  parts.push(tabs(t, user.id, key === 'agent' ? 'agents' : 'maps'));
  return card(parts, ranks.accent(p.current && p.current.tier));
}

function viewHistory(t, user, p) {
  const snaps = players.snapshots(p.puuid).filter((s) => s.tier).slice().sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, premium.limits(null).historyEntries);
  const parts = [`## ${md(p.name)}#${md(p.tag)} · ${t('pl.tab.history')}`, SEP];
  if (!snaps.length) parts.push(t('pl.hist.none'));
  else {
    parts.push(snaps.slice(0, 20).map((s) => {
      const ch = typeof s.lastChange === 'number' ? ` (${s.lastChange > 0 ? '+' : ''}${s.lastChange})` : '';
      return `${absTime(s.at, 'd')} · **${md(s.tier)}**${typeof s.rr === 'number' ? ` ${s.rr} RR` : ''}${ch}${s.map ? ` · ${md(s.map)}` : ''}`;
    }).join('\n'));
  }
  parts.push(tabs(t, user.id, 'history'));
  return card(parts, ranks.accent(p.current && p.current.tier));
}

function viewMatch(t, p, m) {
  const acs = acsOf(m);
  const shots = (m.headshots ?? 0) + (m.bodyshots ?? 0) + (m.legshots ?? 0);
  const lines = [
    `## ${t('pl.match.title', { map: md(m.map || '?'), result: resultWord(t, m) })}`,
    `${m.roundsWon ?? '?'} - ${m.roundsLost ?? '?'} · ${absTime(m.startedAt) || ''}`,
    'sep',
    `**${md(m.agent || '?')}**${m.tier ? ` · ${md(m.tier)}` : ''}`,
    [
      `K/D/A **${m.kills ?? '-'}/${m.deaths ?? '-'}/${m.assists ?? '-'}**`,
      acs !== null ? `ACS **${Math.round(acs)}**` : null,
      m.damage !== null && m.rounds ? `ADR **${Math.round(m.damage / m.rounds)}**` : null,
      shots ? `HS **${((m.headshots / shots) * 100).toFixed(1)}%**` : null,
    ].filter(Boolean).join(' · '),
  ];
  return card(lines, m.won ? ui.COLORS.good : m.draw ? ui.COLORS.grey : ui.COLORS.bad);
}

const VIEWS = {
  profile: (t, u, p, viewer) => viewProfile(t, u, p, viewer),
  matches: viewMatches,
  agents: (t, u, p) => viewGroup(t, u, p, 'agent'),
  maps: (t, u, p) => viewGroup(t, u, p, 'map'),
  history: viewHistory,
};

async function sendView(interaction, t, tab, user, opts = {}) {
  const { player } = targetPlayer(interaction, t, user);
  const view = VIEWS[tab](opts.share ? (t.guild || t) : t, user, player, interaction.user.id);
  if (opts.update) return interaction.update(v2(view));
  return interaction.reply(v2(view, { ephemeral: !opts.share }));
}

function registerModal(t) {
  return new ModalBuilder().setCustomId('pl:regmodal').setTitle(t('pl.reg.title')).addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('riot').setLabel(t('pl.reg.riot')).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(22).setPlaceholder('Name#TAG')),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('region').setLabel(t('pl.reg.region')).setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(5)),
  );
}

async function doRegister(interaction, t, raw, regionRaw) {
  const m = String(raw || '').trim().match(/^(.{3,16})#([^#\s]{3,5})$/u);
  if (!m) throw new UserError(t('pl.reg.bad'));
  const region = REGIONS.includes(String(regionRaw || '').trim().toLowerCase())
    ? String(regionRaw).trim().toLowerCase()
    : interaction.guildId ? settings.get(interaction.guildId).general.region : null;
  await interaction.deferReply({ flags: 64 });
  const res = await players.link(interaction.user.id, m[1].trim(), m[2], region);
  const id = `${res.player.name}#${res.player.tag}`;
  await interaction.editReply(v2([
    card([t(res.isNew ? 'pl.reg.ok' : 'pl.reg.again', { id: md(id) }), `-# ${t('pl.reg.note')}`], ui.COLORS.good),
    viewProfile(t, interaction.user, players.player(res.player.puuid), interaction.user.id),
  ]));
}

/* ---------------- Commands ---------------- */

const userOpt = (o, desc = 'Player (default: you)') => o.setName('user').setDescription(desc).setDescriptionLocalizations({ ko: '플레이어 (기본: 나)' });
const shareOpt = (o) => o.setName('share').setDescription('Post in the channel').setDescriptionLocalizations({ ko: '채널에 공유' });

const simple = (name, en, ko) => new SlashCommandBuilder().setName(name).setDescription(en).setDescriptionLocalizations({ ko })
  .addUserOption((o) => userOpt(o)).addBooleanOption((o) => shareOpt(o));

const commands = [
  new SlashCommandBuilder().setName('register').setDescription('Link your Riot ID').setDescriptionLocalizations({ ko: 'Riot ID 연결' })
    .addStringOption((o) => o.setName('riot_id').setDescription('Name#TAG').setDescriptionLocalizations({ ko: '이름#태그' }).setMaxLength(22))
    .addStringOption((o) => o.setName('region').setDescription('Region').setDescriptionLocalizations({ ko: '지역' }).addChoices(...REGIONS.map((r) => ({ name: r.toUpperCase(), value: r })))),
  new SlashCommandBuilder().setName('unregister').setDescription('Unlink your Riot ID').setDescriptionLocalizations({ ko: 'Riot ID 연결 해제' }),
  new SlashCommandBuilder().setName('privacy').setDescription('Hide or show your profile').setDescriptionLocalizations({ ko: '프로필 공개 설정' })
    .addBooleanOption((o) => o.setName('private').setDescription('Hide your profile from others').setDescriptionLocalizations({ ko: '다른 사람에게 숨기기' }).setRequired(true)),
  simple('profile', 'Player profile', '플레이어 프로필'),
  simple('rank', 'Current rank', '현재 랭크'),
  simple('peak', 'Peak rank', '최고 랭크'),
  simple('stats', 'Stats from recent games', '최근 경기 통계'),
  simple('matches', 'Recent matches', '최근 경기'),
  simple('match', 'Match details', '경기 상세'),
  simple('agents', 'Stats by agent', '요원별 통계'),
  simple('maps', 'Stats by map', '맵별 통계'),
  simple('history', 'Rank history', '랭크 기록'),
  new SlashCommandBuilder().setName('compare').setDescription('Compare two players').setDescriptionLocalizations({ ko: '두 플레이어 비교' })
    .addUserOption((o) => o.setName('player1').setDescription('First player').setDescriptionLocalizations({ ko: '첫 번째' }).setRequired(true))
    .addUserOption((o) => o.setName('player2').setDescription('Second player (default: you)').setDescriptionLocalizations({ ko: '두 번째 (기본: 나)' }))
    .addBooleanOption((o) => shareOpt(o)),
  new SlashCommandBuilder().setName('verify-rank').setDescription('Refresh your rank now').setDescriptionLocalizations({ ko: '랭크 즉시 갱신' }),
];

async function rankOnly(interaction, t, kind) {
  const user = interaction.options.getUser('user');
  const { user: u, player: p } = targetPlayer(interaction, t, user);
  const lines = [`## ${md(p.name)}#${md(p.tag)}`];
  if (kind === 'rank') lines.push(rankLine(t, p));
  else lines.push(p.peak && p.peak.tier ? `${t('pl.peak')}: **${md(p.peak.tier)}**${p.peak.season ? ` (${p.peak.season})` : ''}` : `${t('pl.peak')}: ${t('common.unavailable')}`);
  lines.push(`-# ${t('pl.synced', { time: relTime(p.lastSyncAt) || t('common.never') })}`);
  const tierName = kind === 'rank' ? p.current && p.current.tier : p.peak && p.peak.tier;
  return interaction.reply(v2(card([{ section: lines, thumb: avatar(u) }], ranks.accent(tierName)), { ephemeral: !interaction.options.getBoolean('share') }));
}

function compareCard(t, a, b) {
  const aggA = aggregate(players.competitive(a.player.puuid, 20));
  const aggB = aggregate(players.competitive(b.player.puuid, 20));
  const val = (agg, k, f) => (agg.n >= MIN_SAMPLE && agg[k] !== null ? f(agg[k]) : '-');
  const line = (label, k, f) => `**${label}** · ${val(aggA, k, f)} vs ${val(aggB, k, f)}`;
  return card([
    `## ${t('pl.compare.title')}`,
    `${md(a.player.name)}#${md(a.player.tag)} vs ${md(b.player.name)}#${md(b.player.tag)}`,
    SEP,
    `**${t('pl.rank')}** · ${md((a.player.current && a.player.current.tier) || '-')} vs ${md((b.player.current && b.player.current.tier) || '-')}`,
    `**RR** · ${a.player.current && a.player.current.rr !== null ? a.player.current.rr : '-'} vs ${b.player.current && b.player.current.rr !== null ? b.player.current.rr : '-'}`,
    line(t('pl.wr'), 'winRate', fmt.pct),
    line('K/D', 'kd', (v) => fmt.dec(v)),
    line('ACS', 'acs', fmt.int),
    line('ADR', 'adr', fmt.int),
    line('HS', 'hs', fmt.pct),
    `-# ${t('pl.recent', { n: `${aggA.n} / ${aggB.n}` })}`,
  ], ui.COLORS.teal);
}

const onCommand = {
  async register(interaction, t) {
    const riot = interaction.options.getString('riot_id');
    if (!riot) return interaction.showModal(registerModal(t));
    return doRegister(interaction, t, riot, interaction.options.getString('region'));
  },
  async unregister(interaction, t) {
    const u = players.userEntry(interaction.user.id);
    if (!u || !u.accounts.length) throw new UserError(t('pl.unreg.none'));
    const opts = u.accounts.map((a) => { const p = players.player(a.puuid); return { label: p ? `${p.name}#${p.tag}` : a.puuid.slice(0, 8), value: a.puuid }; });
    return interaction.reply(v2(card([t('pl.unreg.pick'), row(select('pl:unreg', t('pl.unreg.pick'), opts))]), { ephemeral: true }));
  },
  async privacy(interaction, t) {
    const value = interaction.options.getBoolean('private', true);
    if (!players.setPrivate(interaction.user.id, value)) throw new UserError(t('common.need_link'));
    return interaction.reply(ui.notice(t(value ? 'pl.privacy.on' : 'pl.privacy.off'), 'ok', { ephemeral: true }));
  },
  profile: (i, t) => sendView(i, t, 'profile', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  stats: (i, t) => sendView(i, t, 'profile', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  matches: (i, t) => sendView(i, t, 'matches', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  match: (i, t) => sendView(i, t, 'matches', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  agents: (i, t) => sendView(i, t, 'agents', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  maps: (i, t) => sendView(i, t, 'maps', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  history: (i, t) => sendView(i, t, 'history', i.options.getUser('user') || i.user, { share: i.options.getBoolean('share') }),
  rank: (i, t) => rankOnly(i, t, 'rank'),
  peak: (i, t) => rankOnly(i, t, 'peak'),
  async compare(interaction, t) {
    const u1 = interaction.options.getUser('player1', true);
    const u2 = interaction.options.getUser('player2') || interaction.user;
    if (u1.id === u2.id) throw new UserError(t('pl.compare.same'));
    const a = targetPlayer(interaction, t, u1);
    const b = targetPlayer(interaction, t, u2);
    const share = interaction.options.getBoolean('share');
    return interaction.reply(v2(compareCard(share ? (t.guild || t) : t, a, b), { ephemeral: !share }));
  },
  async 'verify-rank'(interaction, t) {
    const { player: p } = targetPlayer(interaction, t, interaction.user);
    await interaction.deferReply({ flags: 64 });
    await players.sync(p.puuid, { priority: true, force: true });
    const fresh = players.player(p.puuid);
    await interaction.editReply(v2(card([`## ${md(fresh.name)}#${md(fresh.tag)}`, rankLine(t, fresh), `-# ${t('pl.verify', { time: relTime(fresh.lastSyncAt) })}`], ranks.accent(fresh.current && fresh.current.tier))));
  },
};

const onButton = {
  'pl:tab': async (interaction, t, [tab, userId]) => {
    const user = userId === interaction.user.id ? interaction.user : await interaction.client.users.fetch(userId);
    if (!VIEWS[tab]) return interaction.deferUpdate();
    return sendView(interaction, t, tab, user, { update: true });
  },
  'pl:refresh': async (interaction, t, [userId]) => {
    const user = userId === interaction.user.id ? interaction.user : await interaction.client.users.fetch(userId);
    const { player: p } = targetPlayer(interaction, t, user);
    await interaction.deferUpdate();
    await players.sync(p.puuid, { priority: true, force: true });
    await interaction.editReply(v2(viewProfile(t, user, players.player(p.puuid), interaction.user.id)));
  },
  'pl:register': async (interaction, t) => interaction.showModal(registerModal(t)),
  'pl:me': async (interaction, t) => sendView(interaction, t, 'profile', interaction.user),
  'pl:unregyes': async (interaction, t, [puuid]) => {
    players.unlink(interaction.user.id, puuid);
    return interaction.update(ui.notice(t('pl.unreg.ok'), 'ok'));
  },
};

const onSelect = {
  'pl:match': async (interaction, t, [userId]) => {
    const user = userId === interaction.user.id ? interaction.user : await interaction.client.users.fetch(userId);
    const { player: p } = targetPlayer(interaction, t, user);
    const m = players.matches(p.puuid).find((x) => x.matchId === interaction.values[0]);
    if (!m) throw new UserError(t('common.not_found'));
    return interaction.reply(v2(viewMatch(t, p, m), { ephemeral: true }));
  },
  'pl:unreg': async (interaction, t) => {
    const puuid = interaction.values[0];
    const p = players.player(puuid);
    return interaction.update(v2(card([t('pl.unreg.confirm', { id: p ? md(`${p.name}#${p.tag}`) : puuid }), row(button(`pl:unregyes:${puuid}`, t('pl.unreg.btn'), ButtonStyle.Danger))], ui.COLORS.warn)));
  },
  'pl:main': async (interaction, t) => {
    players.setMain(interaction.user.id, interaction.values[0]);
    const p = players.player(interaction.values[0]);
    return interaction.reply(ui.notice(t('pl.main.ok', { id: md(`${p.name}#${p.tag}`) }), 'ok', { ephemeral: true }));
  },
};

const onModal = {
  'pl:regmodal': (interaction, t) => doRegister(interaction, t, interaction.fields.getTextInputValue('riot'), interaction.fields.getTextInputValue('region')),
};

module.exports = { commands, onCommand, onButton, onSelect, onModal, rankLine, statsLine, viewProfile, registerModal };
