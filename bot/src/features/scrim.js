'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { add, tr } = require('../lib/i18n');
const ranks = require('../lib/ranks');
const store = require('../lib/store');
const notify = require('../services/notify');
const { UserError, needFeature, isMod, ui, players } = require('./common');
const { knownValues } = require('./ranking');

const { card, v2, row, button, select, ButtonStyle, md, absTime, SEP } = ui;

add({
  en: {
    'sc.title': '{size}v{size} Scrim',
    'sc.open': 'Open', 'sc.locked': 'Teams set', 'sc.pending': 'Result waiting for confirmation', 'sc.done': 'Finished', 'sc.cancelled': 'Cancelled', 'sc.disputed': 'Result disputed',
    'sc.joined': 'Joined ({n}/{max})',
    'sc.teamA': 'Team A', 'sc.teamB': 'Team B',
    'sc.empty': 'No one yet',
    'sc.map': 'Map: {map}',
    'sc.random_map': 'Random',
    'sc.host': 'Host: {user}',
    'sc.starts': 'Starts {time}',
    'sc.min_tier': 'Min. {tier}',
    'sc.join': 'Join', 'sc.leave': 'Leave', 'sc.balance': 'Balance teams', 'sc.shuffle': 'Random teams', 'sc.voice': 'Voice rooms', 'sc.report': 'Report result', 'sc.cancel': 'Cancel', 'sc.reopen': 'Reopen',
    'sc.confirm': 'Confirm', 'sc.dispute': 'Dispute',
    'sc.full': 'This scrim is full.',
    'sc.already': 'You are already in.',
    'sc.not_in': 'You are not in this scrim.',
    'sc.closed': 'This scrim is not open.',
    'sc.tier_low': 'This scrim needs {tier} or higher.',
    'sc.host_only': 'Only the host or a moderator can do that.',
    'sc.need_two': 'Need at least 2 players.',
    'sc.need_teams': 'Set the teams first.',
    'sc.unlinked_note': 'Not linked: placed evenly, not by rank.',
    'sc.pick_winner': 'Who won?',
    'sc.reported': '{user} reported **{team}** won. A player from the other team or a moderator must confirm.',
    'sc.confirm_wrong': 'A player from the other team or a moderator must confirm.',
    'sc.result': '**{team}** won',
    'sc.voice_made': 'Voice rooms created.',
    'sc.voice_fail': 'Could not create voice rooms (missing permission).',
    'sc.none_open': 'No open scrims.',
    'sc.stats.title': 'Scrim leaderboard',
    'sc.stats.line': '{w}W {l}L',
    'sc.new': 'New scrim: {title}',
    'sc.cfg.title': 'New scrim',
    'sc.cfg.size': 'Team size',
    'sc.cfg.assign': 'Teams',
    'sc.assign.balanced': 'Balanced by rank',
    'sc.assign.random': 'Random',
    'sc.cfg.post': 'Post scrim',
  },
  ko: {
    'sc.title': '{size}v{size} 내전',
    'sc.open': '모집 중', 'sc.locked': '팀 확정', 'sc.pending': '결과 확인 대기', 'sc.done': '종료', 'sc.cancelled': '취소됨', 'sc.disputed': '결과 이의 제기됨',
    'sc.joined': '참가자 ({n}/{max})',
    'sc.teamA': 'A팀', 'sc.teamB': 'B팀',
    'sc.empty': '아직 없음',
    'sc.map': '맵: {map}',
    'sc.random_map': '랜덤',
    'sc.host': '주최: {user}',
    'sc.starts': '시작 {time}',
    'sc.min_tier': '{tier} 이상',
    'sc.join': '참가', 'sc.leave': '취소', 'sc.balance': '팀 밸런스', 'sc.shuffle': '랜덤 팀', 'sc.voice': '음성 채널', 'sc.report': '결과 등록', 'sc.cancel': '내전 취소', 'sc.reopen': '다시 모집',
    'sc.confirm': '확인', 'sc.dispute': '이의 제기',
    'sc.full': '인원이 다 찼습니다.',
    'sc.already': '이미 참가했습니다.',
    'sc.not_in': '이 내전에 참가하지 않았습니다.',
    'sc.closed': '모집 중인 내전이 아닙니다.',
    'sc.tier_low': '{tier} 이상만 참가할 수 있습니다.',
    'sc.host_only': '주최자나 운영진만 할 수 있습니다.',
    'sc.need_two': '최소 2명이 필요합니다.',
    'sc.need_teams': '먼저 팀을 나누세요.',
    'sc.unlinked_note': '미연결: 랭크 없이 균등 배치',
    'sc.pick_winner': '이긴 팀은?',
    'sc.reported': '{user} 님이 **{team}** 승리로 등록했습니다. 상대 팀 플레이어나 운영진이 확인해야 합니다.',
    'sc.confirm_wrong': '상대 팀 플레이어나 운영진만 확인할 수 있습니다.',
    'sc.result': '**{team}** 승리',
    'sc.voice_made': '음성 채널을 만들었습니다.',
    'sc.voice_fail': '음성 채널을 만들 권한이 없습니다.',
    'sc.none_open': '모집 중인 내전이 없습니다.',
    'sc.stats.title': '내전 랭킹',
    'sc.stats.line': '{w}승 {l}패',
    'sc.new': '새 내전: {title}',
    'sc.cfg.title': '새 내전',
    'sc.cfg.size': '팀 인원',
    'sc.cfg.assign': '팀 배정',
    'sc.assign.balanced': '랭크 기반 밸런스',
    'sc.assign.random': '랜덤',
    'sc.cfg.post': '내전 올리기',
  },
});

const doc = (guildId) => store.guild(guildId, 'scrims', []);
const find = (guildId, id) => doc(guildId).data.find((s) => s.id === id);
const eloOf = (userId) => { const p = players.playerOf(userId); return p && p.current && typeof p.current.elo === 'number' ? p.current.elo : null; };

/* Split players into two teams. Known ranks are balanced; unlinked players are spread evenly. */
function balance(ids) {
  const n = ids.length;
  const half = Math.floor(n / 2);
  let best = null;
  for (let mask = 0; mask < 1 << n; mask++) {
    let bits = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) bits++;
    if (bits !== half) continue;
    let sa = 0; let sb = 0; let ua = 0; let ub = 0;
    for (let i = 0; i < n; i++) {
      const e = eloOf(ids[i]);
      const inA = Boolean(mask & (1 << i));
      if (e === null) { if (inA) ua++; else ub++; } else if (inA) sa += e; else sb += e;
    }
    const cost = Math.abs(ua - ub) * 1e9 + Math.abs(sa - sb);
    if (!best || cost < best.cost) best = { cost, mask };
  }
  const a = []; const b = [];
  ids.forEach((id, i) => ((best.mask & (1 << i)) ? a : b).push(id));
  return [a, b];
}

function shuffle(ids) {
  const arr = ids.slice();
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  const half = Math.ceil(arr.length / 2);
  return [arr.slice(0, half), arr.slice(half)];
}

function who(userId) {
  const p = players.playerOf(userId);
  return p ? `<@${userId}> · ${md(p.current && p.current.tier ? p.current.tier : '-')}` : `<@${userId}> · *-*`;
}

function scrimCard(t, s) {
  const max = s.size * 2;
  const statusKey = `sc.${s.status}`;
  const accent = s.status === 'open' ? ui.COLORS.brand : s.status === 'done' ? ui.COLORS.good : s.status === 'cancelled' ? ui.COLORS.grey : ui.COLORS.teal;
  const meta = [t('sc.map', { map: s.map ? md(s.map) : t('sc.random_map') }), t('sc.host', { user: `<@${s.hostId}>` }), s.minTier ? t('sc.min_tier', { tier: ranks.NAMES[s.minTier] }) : null, s.startsAt ? t('sc.starts', { time: absTime(s.startsAt) }) : null].filter(Boolean).join(' · ');
  const parts = [`## ${md(s.title)}`, `-# ${t(statusKey)} · ${meta}`, SEP];
  if (s.teamA.length || s.teamB.length) {
    parts.push(`**${t('sc.teamA')}** (${s.teamA.length})\n${s.teamA.map(who).join('\n') || t('sc.empty')}`);
    parts.push(`**${t('sc.teamB')}** (${s.teamB.length})\n${s.teamB.map(who).join('\n') || t('sc.empty')}`);
    if ([...s.teamA, ...s.teamB].some((id) => eloOf(id) === null)) parts.push(`-# ${t('sc.unlinked_note')}`);
  } else {
    parts.push(`**${t('sc.joined', { n: s.players.length, max })}**\n${s.players.map(who).join('\n') || t('sc.empty')}`);
  }
  if (s.result && s.result.winner) parts.push(SEP, t('sc.result', { team: t(s.result.winner === 'A' ? 'sc.teamA' : 'sc.teamB') }));
  if (s.status === 'pending' && s.result) parts.push(t('sc.reported', { user: `<@${s.result.reportedBy}>`, team: t(s.result.winner === 'A' ? 'sc.teamA' : 'sc.teamB') }));
  parts.push(SEP);
  if (s.status === 'open') {
    parts.push(row(
      button(`sc:join:${s.id}`, t('sc.join'), ButtonStyle.Success, { disabled: s.players.length >= max }),
      button(`sc:leave:${s.id}`, t('sc.leave')),
      button(`sc:balance:${s.id}`, t('sc.balance'), ButtonStyle.Primary),
      button(`sc:shuffle:${s.id}`, t('sc.shuffle')),
      button(`sc:cancel:${s.id}`, t('sc.cancel'), ButtonStyle.Danger),
    ));
  } else if (s.status === 'locked') {
    parts.push(row(
      button(`sc:report:${s.id}`, t('sc.report'), ButtonStyle.Success),
      button(`sc:voice:${s.id}`, t('sc.voice'), ButtonStyle.Secondary, { disabled: Boolean(s.voice) }),
      button(`sc:reopen:${s.id}`, t('sc.reopen')),
      button(`sc:cancel:${s.id}`, t('sc.cancel'), ButtonStyle.Danger),
    ));
  } else if (s.status === 'pending' || s.status === 'disputed') {
    parts.push(row(
      button(`sc:confirm:${s.id}`, t('sc.confirm'), ButtonStyle.Success),
      button(`sc:dispute:${s.id}`, t('sc.dispute'), ButtonStyle.Danger, { disabled: s.status === 'disputed' }),
      button(`sc:report:${s.id}`, t('sc.report')),
    ));
  }
  return card(parts, accent);
}

async function refresh(client, s) {
  try {
    const ch = await client.channels.fetch(s.channelId);
    const msg = await ch.messages.fetch(s.messageId);
    await msg.edit(ui.v2(scrimCard(tr(s.guildId), s)));
  } catch (e) { /* message gone */ }
}

async function deleteVoice(guild, s) {
  if (!s.voice) return;
  for (const id of [s.voice.a, s.voice.b]) {
    const ch = guild.channels.cache.get(id);
    if (ch) await ch.delete('Scrim finished').catch(() => {});
  }
  s.voice = null;
}

function canManage(interaction, s) { return interaction.user.id === s.hostId || isMod(interaction.member); }

async function create(interaction, t, { size, map, assign, minTier, title, channel }) {
  needFeature(interaction, t, 'scrims');
  const s = {
    id: store.newId('sc'),
    guildId: interaction.guildId,
    title: title || t('sc.title', { size }),
    size,
    map: map || null,
    assign: assign || 'balanced',
    minTier: minTier || null,
    status: 'open',
    hostId: interaction.user.id,
    players: [],
    teamA: [],
    teamB: [],
    voice: null,
    result: null,
    createdAt: new Date().toISOString(),
  };
  if (!s.map) {
    const pool = knownValues('map');
    if (pool.length) s.map = pool[Math.floor(Math.random() * pool.length)];
  }
  if (eloOkFor(s, interaction.user.id)) s.players.push(interaction.user.id);
  const target = channel || interaction.channel;
  const msg = await target.send(ui.v2(scrimCard(t.guild || t, s)));
  s.channelId = target.id;
  s.messageId = msg.id;
  const d = doc(interaction.guildId);
  d.data.push(s);
  if (d.data.length > 500) d.data.splice(0, d.data.length - 500);
  d.save();
  notify.send(interaction.guild, 'events', card([(t.guild || t)('sc.new', { title: md(s.title) }), `https://discord.com/channels/${interaction.guildId}/${s.channelId}/${s.messageId}`], ui.COLORS.brand));
  return s;
}

function eloOkFor(s, userId) {
  if (!s.minTier) return true;
  const p = players.playerOf(userId);
  const k = ranks.tierKey(p && p.current && p.current.tier);
  return k !== null && ranks.tierIndex(k) >= ranks.tierIndex(s.minTier);
}

function recordFor(guildId) {
  const rec = {};
  for (const s of doc(guildId).data.filter((x) => x.status === 'done' && x.result)) {
    const win = s.result.winner === 'A' ? s.teamA : s.teamB;
    const lose = s.result.winner === 'A' ? s.teamB : s.teamA;
    for (const id of win) (rec[id] = rec[id] || { w: 0, l: 0 }).w++;
    for (const id of lose) (rec[id] = rec[id] || { w: 0, l: 0 }).l++;
  }
  return rec;
}

/* ---------------- Commands ---------------- */

const commands = [
  new SlashCommandBuilder().setName('scrim').setDescription('Scrims').setDescriptionLocalizations({ ko: '내전' })
    .addSubcommand((s) => s.setName('create').setDescription('Create a scrim').setDescriptionLocalizations({ ko: '내전 만들기' })
      .addIntegerOption((o) => o.setName('size').setDescription('Players per team').setDescriptionLocalizations({ ko: '팀당 인원' }).setMinValue(1).setMaxValue(5).setRequired(true))
      .addStringOption((o) => o.setName('title').setDescription('Title').setDescriptionLocalizations({ ko: '제목' }).setMaxLength(60))
      .addStringOption((o) => o.setName('map').setDescription('Map (empty: random)').setDescriptionLocalizations({ ko: '맵 (비우면 랜덤)' }).setAutocomplete(true))
      .addStringOption((o) => o.setName('teams').setDescription('How teams are made').setDescriptionLocalizations({ ko: '팀 배정 방식' }).addChoices({ name: 'Balanced by rank', value: 'balanced' }, { name: 'Random', value: 'random' }))
      .addStringOption((o) => o.setName('min_tier').setDescription('Lowest tier allowed').setDescriptionLocalizations({ ko: '최소 티어' }).addChoices(...ranks.ORDER.map((x) => ({ name: ranks.NAMES[x], value: x }))))
      .addIntegerOption((o) => o.setName('starts_in').setDescription('Starts in (minutes)').setDescriptionLocalizations({ ko: '몇 분 뒤 시작' }).setMinValue(0).setMaxValue(10080)))
    .addSubcommand((s) => s.setName('join').setDescription('Join a scrim').setDescriptionLocalizations({ ko: '내전 참가' })
      .addStringOption((o) => o.setName('scrim').setDescription('Scrim').setDescriptionLocalizations({ ko: '내전' }).setAutocomplete(true).setRequired(true)))
    .addSubcommand((s) => s.setName('leave').setDescription('Leave a scrim').setDescriptionLocalizations({ ko: '참가 취소' })
      .addStringOption((o) => o.setName('scrim').setDescription('Scrim').setDescriptionLocalizations({ ko: '내전' }).setAutocomplete(true).setRequired(true)))
    .addSubcommand((s) => s.setName('teams').setDescription('Show open scrims').setDescriptionLocalizations({ ko: '진행 중인 내전 보기' }))
    .addSubcommand((s) => s.setName('result').setDescription('Report a result').setDescriptionLocalizations({ ko: '결과 등록' })
      .addStringOption((o) => o.setName('scrim').setDescription('Scrim').setDescriptionLocalizations({ ko: '내전' }).setAutocomplete(true).setRequired(true))
      .addStringOption((o) => o.setName('winner').setDescription('Winning team').setDescriptionLocalizations({ ko: '이긴 팀' }).setRequired(true).addChoices({ name: 'Team A', value: 'A' }, { name: 'Team B', value: 'B' })))
    .addSubcommand((s) => s.setName('stats').setDescription('Scrim leaderboard').setDescriptionLocalizations({ ko: '내전 랭킹' })),
];

function activeList(guildId, statuses) {
  return doc(guildId).data.filter((s) => statuses.includes(s.status)).slice(-25).reverse();
}

const onAutocomplete = {
  async scrim(interaction) {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'map') {
      const q = String(focused.value || '').toLowerCase();
      return interaction.respond(knownValues('map').filter((v) => v.toLowerCase().includes(q)).slice(0, 25).map((v) => ({ name: v, value: v })));
    }
    const sub = interaction.options.getSubcommand();
    const statuses = sub === 'result' ? ['locked', 'pending', 'disputed'] : ['open'];
    return interaction.respond(activeList(interaction.guildId, statuses).map((s) => ({ name: `${s.title} (${s.players.length}/${s.size * 2})`.slice(0, 100), value: s.id })));
  },
};

async function joinScrim(interaction, t, s) {
  if (!s || s.status !== 'open') throw new UserError(t('sc.closed'));
  if (s.players.includes(interaction.user.id)) throw new UserError(t('sc.already'));
  if (s.players.length >= s.size * 2) throw new UserError(t('sc.full'));
  if (!eloOkFor(s, interaction.user.id)) throw new UserError(t('sc.tier_low', { tier: ranks.NAMES[s.minTier] }));
  s.players.push(interaction.user.id);
  doc(s.guildId).save();
}

function leaveScrim(t, s, userId) {
  if (!s || s.status !== 'open') throw new UserError(t('sc.closed'));
  if (!s.players.includes(userId)) throw new UserError(t('sc.not_in'));
  s.players = s.players.filter((x) => x !== userId);
  doc(s.guildId).save();
}

function report(t, interaction, s, winner) {
  if (!s || !['locked', 'pending', 'disputed'].includes(s.status)) throw new UserError(t('sc.need_teams'));
  const inIt = [...s.teamA, ...s.teamB].includes(interaction.user.id);
  if (!inIt && !isMod(interaction.member)) throw new UserError(t('sc.not_in'));
  s.result = { winner, reportedBy: interaction.user.id, at: new Date().toISOString() };
  s.status = 'pending';
  doc(s.guildId).save();
}

const onCommand = {
  async scrim(interaction, t) {
    needFeature(interaction, t, 'scrims');
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') {
      const startsIn = interaction.options.getInteger('starts_in');
      await interaction.deferReply({ flags: 64 });
      const s = await create(interaction, t, {
        size: interaction.options.getInteger('size', true),
        title: interaction.options.getString('title'),
        map: interaction.options.getString('map'),
        assign: interaction.options.getString('teams'),
        minTier: interaction.options.getString('min_tier'),
      });
      if (startsIn) { s.startsAt = new Date(Date.now() + startsIn * 60_000).toISOString(); doc(s.guildId).save(); await refresh(interaction.client, s); }
      return interaction.editReply(ui.notice(t('common.done'), 'ok'));
    }
    if (sub === 'join' || sub === 'leave') {
      const s = find(interaction.guildId, interaction.options.getString('scrim', true));
      if (sub === 'join') await joinScrim(interaction, t, s); else leaveScrim(t, s, interaction.user.id);
      await refresh(interaction.client, s);
      return interaction.reply(ui.notice(t('common.done'), 'ok', { ephemeral: true }));
    }
    if (sub === 'teams') {
      const list = activeList(interaction.guildId, ['open', 'locked', 'pending']);
      if (!list.length) return interaction.reply(ui.notice(t('sc.none_open'), 'info', { ephemeral: true }));
      return interaction.reply(v2(card([list.slice(0, 10).map((s) => `**${md(s.title)}** · ${t(`sc.${s.status}`)} · ${s.players.length}/${s.size * 2} · https://discord.com/channels/${s.guildId}/${s.channelId}/${s.messageId}`).join('\n')], ui.COLORS.teal), { ephemeral: true }));
    }
    if (sub === 'result') {
      const s = find(interaction.guildId, interaction.options.getString('scrim', true));
      report(t, interaction, s, interaction.options.getString('winner', true));
      await refresh(interaction.client, s);
      return interaction.reply(ui.notice(t('common.done'), 'ok', { ephemeral: true }));
    }
    if (sub === 'stats') {
      const rec = recordFor(interaction.guildId);
      const list = Object.entries(rec).map(([id, r]) => ({ id, ...r, wr: r.w / (r.w + r.l) })).sort((a, b) => b.w - a.w || b.wr - a.wr).slice(0, 15);
      const tg = t.guild || t;
      return interaction.reply(v2(card([`## ${tg('sc.stats.title')}`, SEP, list.length ? list.map((r, i) => `${i + 1}. <@${r.id}> · ${tg('sc.stats.line', { w: r.w, l: r.l })}`).join('\n') : tg('lb.empty')], ui.COLORS.brand)));
    }
    return null;
  },
};

/* Panel flow: ephemeral config, then post */
const drafts = new Map(); // userId -> { size, assign }
function cfgCard(t, d) {
  return card([
    `## ${t('sc.cfg.title')}`,
    row(select('sc:cfgsize', t('sc.cfg.size'), [1, 2, 3, 4, 5].map((n) => ({ label: `${n}v${n}`, value: String(n), default: n === d.size })))),
    row(select('sc:cfgassign', t('sc.cfg.assign'), ['balanced', 'random'].map((a) => ({ label: t(`sc.assign.${a}`), value: a, default: a === d.assign })))),
    row(button('sc:post', t('sc.cfg.post'), ButtonStyle.Success)),
  ], ui.COLORS.brand);
}

const onButton = {
  'sc:new': async (interaction, t) => {
    needFeature(interaction, t, 'scrims');
    const d = { size: 5, assign: 'balanced' };
    drafts.set(interaction.user.id, d);
    return interaction.reply(v2(cfgCard(t, d), { ephemeral: true }));
  },
  'sc:post': async (interaction, t) => {
    const d = drafts.get(interaction.user.id) || { size: 5, assign: 'balanced' };
    drafts.delete(interaction.user.id);
    await interaction.deferUpdate();
    await create(interaction, t, { size: d.size, assign: d.assign });
    return interaction.editReply(ui.notice(t('common.done'), 'ok'));
  },
  'sc:join': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    await joinScrim(interaction, t, s);
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:leave': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    leaveScrim(t, s, interaction.user.id);
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:balance': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || s.status !== 'open') throw new UserError(t('sc.closed'));
    if (!canManage(interaction, s)) throw new UserError(t('sc.host_only'));
    if (s.players.length < 2) throw new UserError(t('sc.need_two'));
    [s.teamA, s.teamB] = s.assign === 'random' ? shuffle(s.players) : balance(s.players);
    s.status = 'locked';
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:shuffle': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || s.status !== 'open') throw new UserError(t('sc.closed'));
    if (!canManage(interaction, s)) throw new UserError(t('sc.host_only'));
    if (s.players.length < 2) throw new UserError(t('sc.need_two'));
    [s.teamA, s.teamB] = shuffle(s.players);
    s.status = 'locked';
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:reopen': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || s.status !== 'locked') throw new UserError(t('sc.closed'));
    if (!canManage(interaction, s)) throw new UserError(t('sc.host_only'));
    s.teamA = []; s.teamB = []; s.status = 'open';
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:voice': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || s.status !== 'locked') throw new UserError(t('sc.need_teams'));
    if (!canManage(interaction, s)) throw new UserError(t('sc.host_only'));
    const parent = interaction.channel && interaction.channel.parentId ? interaction.channel.parentId : null;
    try {
      const a = await interaction.guild.channels.create({ name: `${t('sc.teamA')} · ${s.title}`.slice(0, 90), type: ChannelType.GuildVoice, parent, userLimit: s.size, reason: 'Scrim voice' });
      const b = await interaction.guild.channels.create({ name: `${t('sc.teamB')} · ${s.title}`.slice(0, 90), type: ChannelType.GuildVoice, parent, userLimit: s.size, reason: 'Scrim voice' });
      s.voice = { a: a.id, b: b.id };
      doc(s.guildId).save();
    } catch (e) {
      throw new UserError(t('sc.voice_fail'));
    }
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:report': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || !['locked', 'pending', 'disputed'].includes(s.status)) throw new UserError(t('sc.need_teams'));
    return interaction.reply(v2(card([t('sc.pick_winner'), row(
      button(`sc:win:${s.id}:A`, t('sc.teamA'), ButtonStyle.Primary),
      button(`sc:win:${s.id}:B`, t('sc.teamB'), ButtonStyle.Primary),
    )]), { ephemeral: true }));
  },
  'sc:win': async (interaction, t, [id, winner]) => {
    const s = find(interaction.guildId, id);
    report(t, interaction, s, winner === 'B' ? 'B' : 'A');
    await refresh(interaction.client, s);
    return interaction.update(ui.notice(t('common.done'), 'ok'));
  },
  'sc:confirm': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || !['pending', 'disputed'].includes(s.status) || !s.result) throw new UserError(t('sc.closed'));
    const reporterTeam = s.teamA.includes(s.result.reportedBy) ? 'A' : s.teamB.includes(s.result.reportedBy) ? 'B' : null;
    const myTeam = s.teamA.includes(interaction.user.id) ? 'A' : s.teamB.includes(interaction.user.id) ? 'B' : null;
    const ok = isMod(interaction.member) || (myTeam && reporterTeam && myTeam !== reporterTeam) || (myTeam && !reporterTeam);
    if (!ok) throw new UserError(t('sc.confirm_wrong'));
    s.result.confirmedBy = interaction.user.id;
    s.result.confirmedAt = new Date().toISOString();
    s.status = 'done';
    s.doneAt = s.result.confirmedAt;
    await deleteVoice(interaction.guild, s);
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:dispute': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || s.status !== 'pending') throw new UserError(t('sc.closed'));
    if (![...s.teamA, ...s.teamB].includes(interaction.user.id) && !isMod(interaction.member)) throw new UserError(t('sc.not_in'));
    s.status = 'disputed';
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
  'sc:cancel': async (interaction, t, [id]) => {
    const s = find(interaction.guildId, id);
    if (!s || ['done', 'cancelled'].includes(s.status)) throw new UserError(t('sc.closed'));
    if (!canManage(interaction, s)) throw new UserError(t('sc.host_only'));
    s.status = 'cancelled';
    await deleteVoice(interaction.guild, s);
    doc(s.guildId).save();
    return interaction.update(ui.v2(scrimCard(t, s)));
  },
};

const onSelect = {
  'sc:cfgsize': async (interaction, t) => {
    const d = drafts.get(interaction.user.id) || { size: 5, assign: 'balanced' };
    d.size = Number(interaction.values[0]) || 5;
    drafts.set(interaction.user.id, d);
    return interaction.update(v2(cfgCard(t, d)));
  },
  'sc:cfgassign': async (interaction, t) => {
    const d = drafts.get(interaction.user.id) || { size: 5, assign: 'balanced' };
    d.assign = interaction.values[0] === 'random' ? 'random' : 'balanced';
    drafts.set(interaction.user.id, d);
    return interaction.update(v2(cfgCard(t, d)));
  },
};

module.exports = { commands, onCommand, onButton, onSelect, onAutocomplete, recordFor, doc, balance, scrimCard, cfgCard };
