'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { add, tr } = require('../lib/i18n');
const store = require('../lib/store');
const { UserError, needFeature, isMod, ui, players } = require('./common');
const { knownValues } = require('./ranking');

const { card, v2, row, button, ButtonStyle, md, relTime, SEP } = ui;

const START = 1000;
const K = 32;

add({
  en: {
    'du.title': 'Duel',
    'du.vs': '{a} vs {b}',
    'du.format.bo1': 'Best of 1', 'du.format.bo3': 'Best of 3', 'du.format.bo5': 'Best of 5',
    'du.rule.classic': 'Classic', 'du.rule.agent': 'Random agent', 'du.rule.map': 'Random map',
    'du.pending': 'Waiting for {user} to accept', 'du.accepted': 'In progress', 'du.done': 'Finished', 'du.declined': 'Declined', 'du.expired': 'Expired', 'du.disputed': 'Results do not match. A moderator will decide.', 'du.cancelled': 'Cancelled',
    'du.accept': 'Accept', 'du.decline': 'Decline', 'du.won': 'I won', 'du.lost': 'I lost', 'du.cancel': 'Cancel',
    'du.rematch': 'Rematch',
    'du.reported': '{user} reported.',
    'du.winner': '**{user}** won · {a} {da} · {b} {db}',
    'du.agents': 'Agents: {a} / {b}',
    'du.map': 'Map: {map}',
    'du.self': 'You cannot duel yourself.',
    'du.bot': 'You cannot duel a bot.',
    'du.not_for_you': 'This duel is not for you.',
    'du.not_in': 'You are not in this duel.',
    'du.not_open': 'This duel is no longer open.',
    'du.open_exists': 'You already have an open duel with this player.',
    'du.none': 'No pending duels.',
    'du.resolve': '{user} won',
    'du.lb.title': 'Duel Rating',
    'du.history.title': 'Duel history',
    'du.history.none': 'No duels yet.',
    'du.record': '{w}W {l}L · best streak {s}',
    'du.champ': 'Champion of the month: {user} ({n} wins)',
  },
  ko: {
    'du.title': '1대1 대결',
    'du.vs': '{a} vs {b}',
    'du.format.bo1': '단판', 'du.format.bo3': '3판 2선승', 'du.format.bo5': '5판 3선승',
    'du.rule.classic': '일반', 'du.rule.agent': '랜덤 요원', 'du.rule.map': '랜덤 맵',
    'du.pending': '{user} 님의 수락을 기다리는 중', 'du.accepted': '진행 중', 'du.done': '종료', 'du.declined': '거절됨', 'du.expired': '시간 만료', 'du.disputed': '결과가 서로 다릅니다. 운영진이 결정합니다.', 'du.cancelled': '취소됨',
    'du.accept': '수락', 'du.decline': '거절', 'du.won': '내가 이김', 'du.lost': '내가 짐', 'du.cancel': '취소',
    'du.rematch': '재대결',
    'du.reported': '{user} 님 결과 제출.',
    'du.winner': '**{user}** 승리 · {a} {da} · {b} {db}',
    'du.agents': '요원: {a} / {b}',
    'du.map': '맵: {map}',
    'du.self': '자신과는 대결할 수 없습니다.',
    'du.bot': '봇과는 대결할 수 없습니다.',
    'du.not_for_you': '나에게 온 대결이 아닙니다.',
    'du.not_in': '이 대결의 참가자가 아닙니다.',
    'du.not_open': '이미 끝난 대결입니다.',
    'du.open_exists': '이 플레이어와 진행 중인 대결이 있습니다.',
    'du.none': '대기 중인 대결이 없습니다.',
    'du.resolve': '{user} 승리',
    'du.lb.title': 'Duel Rating 랭킹',
    'du.history.title': '대결 기록',
    'du.history.none': '아직 대결 기록이 없습니다.',
    'du.record': '{w}승 {l}패 · 최고 연승 {s}',
    'du.champ': '이달의 챔피언: {user} ({n}승)',
  },
});

const doc = (g) => store.guild(g, 'duels', []);
const ratingsDoc = (g) => store.guild(g, 'duelRatings', {});
const find = (g, id) => doc(g).data.find((d) => d.id === id);
const rating = (g, userId) => {
  const r = ratingsDoc(g).data[userId];
  return r || { rating: START, wins: 0, losses: 0, streak: 0, bestStreak: 0 };
};

function elo(ra, rb, aWon) {
  const ea = 1 / (1 + 10 ** ((rb - ra) / 400));
  const delta = Math.round(K * ((aWon ? 1 : 0) - ea));
  return delta;
}

function applyResult(g, duel, winnerId) {
  const loserId = winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
  const rd = ratingsDoc(g);
  const w = { ...rating(g, winnerId) };
  const l = { ...rating(g, loserId) };
  const d = elo(w.rating, l.rating, true);
  w.rating += d; l.rating -= d;
  w.wins++; l.losses++;
  w.streak = w.streak > 0 ? w.streak + 1 : 1;
  l.streak = l.streak < 0 ? l.streak - 1 : -1;
  w.bestStreak = Math.max(w.bestStreak || 0, w.streak);
  w.lastAt = l.lastAt = new Date().toISOString();
  rd.data[winnerId] = w;
  rd.data[loserId] = l;
  rd.save();
  duel.winnerId = winnerId;
  duel.delta = d;
  duel.status = 'done';
  duel.doneAt = new Date().toISOString();
  doc(g).save();
}

function nameOf(userId) {
  const p = players.playerOf(userId);
  return p ? `<@${userId}> (${md(p.name)})` : `<@${userId}>`;
}

function duelCard(t, d) {
  const status = d.status === 'pending' ? t('du.pending', { user: `<@${d.opponentId}>` }) : t(`du.${d.status}`);
  const parts = [
    `## ${t('du.title')}`,
    t('du.vs', { a: nameOf(d.challengerId), b: nameOf(d.opponentId) }),
    `-# ${t(`du.format.${d.format}`)} · ${t(`du.rule.${d.rule}`)} · ${status}`,
  ];
  if (d.agents) parts.push(t('du.agents', { a: md(d.agents[0]), b: md(d.agents[1]) }));
  if (d.map) parts.push(t('du.map', { map: md(d.map) }));
  if (d.reports && Object.keys(d.reports).length && d.status !== 'done') parts.push(Object.keys(d.reports).map((id) => t('du.reported', { user: `<@${id}>` })).join(' '));
  if (d.status === 'done') {
    const loserId = d.winnerId === d.challengerId ? d.opponentId : d.challengerId;
    parts.push(SEP, t('du.winner', { user: `<@${d.winnerId}>`, a: `<@${d.winnerId}>`, da: `+${d.delta}`, b: `<@${loserId}>`, db: `-${d.delta}` }));
  }
  if (d.status === 'pending') {
    parts.push(row(button(`du:accept:${d.id}`, t('du.accept'), ButtonStyle.Success), button(`du:decline:${d.id}`, t('du.decline'), ButtonStyle.Danger), button(`du:cancel:${d.id}`, t('du.cancel'))));
  } else if (d.status === 'accepted') {
    parts.push(row(button(`du:report:${d.id}:win`, t('du.won'), ButtonStyle.Success), button(`du:report:${d.id}:lose`, t('du.lost'), ButtonStyle.Danger)));
  } else if (d.status === 'disputed') {
    parts.push(row(button(`du:resolve:${d.id}:${d.challengerId}`, t('du.resolve', { user: '1' }).replace('1', 'A')), button(`du:resolve:${d.id}:${d.opponentId}`, t('du.resolve', { user: '1' }).replace('1', 'B'))));
    parts.push(`-# A = <@${d.challengerId}> · B = <@${d.opponentId}>`);
  } else if (d.status === 'done') {
    parts.push(row(button(`du:rematch:${d.id}`, t('du.rematch'))));
  }
  const accent = d.status === 'done' ? ui.COLORS.good : d.status === 'disputed' ? ui.COLORS.warn : ['declined', 'expired', 'cancelled'].includes(d.status) ? ui.COLORS.grey : ui.COLORS.brand;
  return card(parts, accent);
}

function pickRandom(list) { return list.length ? list[Math.floor(Math.random() * list.length)] : null; }

async function challenge(interaction, t, opponent, format, rule) {
  needFeature(interaction, t, 'duels');
  if (opponent.id === interaction.user.id) throw new UserError(t('du.self'));
  if (opponent.bot) throw new UserError(t('du.bot'));
  const open = doc(interaction.guildId).data.find((d) => ['pending', 'accepted', 'disputed'].includes(d.status)
    && [d.challengerId, d.opponentId].includes(interaction.user.id) && [d.challengerId, d.opponentId].includes(opponent.id));
  if (open) throw new UserError(t('du.open_exists'));
  const d = {
    id: store.newId('du'),
    guildId: interaction.guildId,
    challengerId: interaction.user.id,
    opponentId: opponent.id,
    format: format || 'bo1',
    rule: rule || 'classic',
    status: 'pending',
    reports: {},
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
  };
  if (d.rule === 'agent') {
    const pool = knownValues('agent');
    if (pool.length) d.agents = [pickRandom(pool), pickRandom(pool)];
  }
  if (d.rule === 'map') d.map = pickRandom(knownValues('map'));
  const msg = await interaction.channel.send({ ...ui.v2(duelCard(t.guild || t, d)), allowedMentions: { users: [opponent.id] } });
  d.channelId = interaction.channel.id;
  d.messageId = msg.id;
  const dd = doc(interaction.guildId);
  dd.data.push(d);
  if (dd.data.length > 1000) dd.data.splice(0, dd.data.length - 1000);
  dd.save();
  return d;
}

async function tick(client) {
  for (const guild of client.guilds.cache.values()) {
    const dd = doc(guild.id);
    let dirty = false;
    for (const d of dd.data.filter((x) => x.status === 'pending' && Date.parse(x.expiresAt) < Date.now())) {
      d.status = 'expired';
      dirty = true;
      try {
        const ch = await client.channels.fetch(d.channelId);
        const msg = await ch.messages.fetch(d.messageId);
        await msg.edit(ui.v2(duelCard(tr(guild.id), d)));
      } catch (e) { /* gone */ }
    }
    if (dirty) dd.save();
  }
}

function monthChampion(g) {
  const start = new Date();
  start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const wins = {};
  for (const d of doc(g).data) if (d.status === 'done' && Date.parse(d.doneAt) >= start.getTime()) wins[d.winnerId] = (wins[d.winnerId] || 0) + 1;
  const top = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
  return top ? { userId: top[0], wins: top[1] } : null;
}

const commands = [
  new SlashCommandBuilder().setName('duel').setDescription('1v1 duels').setDescriptionLocalizations({ ko: '1대1 대결' })
    .addSubcommand((s) => s.setName('challenge').setDescription('Challenge someone').setDescriptionLocalizations({ ko: '대결 신청' })
      .addUserOption((o) => o.setName('user').setDescription('Opponent').setDescriptionLocalizations({ ko: '상대' }).setRequired(true))
      .addStringOption((o) => o.setName('format').setDescription('Format').setDescriptionLocalizations({ ko: '방식' }).addChoices({ name: 'Best of 1', value: 'bo1' }, { name: 'Best of 3', value: 'bo3' }, { name: 'Best of 5', value: 'bo5' }))
      .addStringOption((o) => o.setName('rule').setDescription('Rule').setDescriptionLocalizations({ ko: '규칙' }).addChoices({ name: 'Classic', value: 'classic' }, { name: 'Random agent', value: 'agent' }, { name: 'Random map', value: 'map' })))
    .addSubcommand((s) => s.setName('accept').setDescription('Accept your latest challenge').setDescriptionLocalizations({ ko: '받은 대결 수락' }))
    .addSubcommand((s) => s.setName('history').setDescription('Duel history').setDescriptionLocalizations({ ko: '대결 기록' })
      .addUserOption((o) => o.setName('user').setDescription('Player').setDescriptionLocalizations({ ko: '플레이어' })))
    .addSubcommand((s) => s.setName('leaderboard').setDescription('Duel Rating leaderboard').setDescriptionLocalizations({ ko: 'Duel Rating 랭킹' })),
];

const onCommand = {
  async duel(interaction, t) {
    needFeature(interaction, t, 'duels');
    const sub = interaction.options.getSubcommand();
    if (sub === 'challenge') {
      await interaction.deferReply({ flags: 64 });
      await challenge(interaction, t, interaction.options.getUser('user', true), interaction.options.getString('format'), interaction.options.getString('rule'));
      return interaction.editReply(ui.notice(t('common.done'), 'ok'));
    }
    if (sub === 'accept') {
      const d = doc(interaction.guildId).data.slice().reverse().find((x) => x.status === 'pending' && x.opponentId === interaction.user.id);
      if (!d) throw new UserError(t('du.none'));
      d.status = 'accepted';
      doc(interaction.guildId).save();
      try {
        const ch = await interaction.client.channels.fetch(d.channelId);
        const msg = await ch.messages.fetch(d.messageId);
        await msg.edit(ui.v2(duelCard(t.guild || t, d)));
      } catch (e) { /* gone */ }
      return interaction.reply(ui.notice(t('common.done'), 'ok', { ephemeral: true }));
    }
    if (sub === 'history') {
      const user = interaction.options.getUser('user') || interaction.user;
      const list = doc(interaction.guildId).data.filter((d) => d.status === 'done' && [d.challengerId, d.opponentId].includes(user.id)).slice(-15).reverse();
      const r = rating(interaction.guildId, user.id);
      const body = list.length ? list.map((d) => {
        const other = d.challengerId === user.id ? d.opponentId : d.challengerId;
        const won = d.winnerId === user.id;
        return `**${won ? 'W' : 'L'}** vs <@${other}> · ${won ? '+' : '-'}${d.delta} · ${relTime(d.doneAt)}`;
      }).join('\n') : t('du.history.none');
      return interaction.reply(v2(card([`## ${t('du.history.title')}`, `<@${user.id}> · **${r.rating}** · ${t('du.record', { w: r.wins, l: r.losses, s: r.bestStreak || 0 })}`, SEP, body], ui.COLORS.brand), { ephemeral: true }));
    }
    if (sub === 'leaderboard') {
      t = t.guild || t;
      const all = Object.entries(ratingsDoc(interaction.guildId).data).filter(([, r]) => r.wins + r.losses > 0).sort((a, b) => b[1].rating - a[1].rating).slice(0, 15);
      const champ = monthChampion(interaction.guildId);
      return interaction.reply(v2(card([
        `## ${t('du.lb.title')}`,
        SEP,
        all.length ? all.map(([id, r], i) => `${i + 1}. <@${id}> · **${r.rating}** · ${r.wins}W ${r.losses}L`).join('\n') : t('lb.empty'),
        champ ? `-# ${t('du.champ', { user: `<@${champ.userId}>`, n: champ.wins })}` : null,
      ], ui.COLORS.brand)));
    }
    return null;
  },
};

const onButton = {
  'du:new': async (interaction, t) => {
    needFeature(interaction, t, 'duels');
    const { UserSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
    const sel = new UserSelectMenuBuilder().setCustomId('du:pick').setPlaceholder(t('du.title')).setMinValues(1).setMaxValues(1);
    return interaction.reply(v2(card([`## ${t('du.title')}`, new ActionRowBuilder().addComponents(sel)]), { ephemeral: true }));
  },
  'du:accept': async (interaction, t, [id]) => {
    const d = find(interaction.guildId, id);
    if (!d || d.status !== 'pending') throw new UserError(t('du.not_open'));
    if (interaction.user.id !== d.opponentId) throw new UserError(t('du.not_for_you'));
    d.status = 'accepted';
    d.acceptedAt = new Date().toISOString();
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(duelCard(t, d)));
  },
  'du:decline': async (interaction, t, [id]) => {
    const d = find(interaction.guildId, id);
    if (!d || d.status !== 'pending') throw new UserError(t('du.not_open'));
    if (interaction.user.id !== d.opponentId) throw new UserError(t('du.not_for_you'));
    d.status = 'declined';
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(duelCard(t, d)));
  },
  'du:cancel': async (interaction, t, [id]) => {
    const d = find(interaction.guildId, id);
    if (!d || d.status !== 'pending') throw new UserError(t('du.not_open'));
    if (interaction.user.id !== d.challengerId && !isMod(interaction.member)) throw new UserError(t('du.not_in'));
    d.status = 'cancelled';
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(duelCard(t, d)));
  },
  'du:report': async (interaction, t, [id, outcome]) => {
    const d = find(interaction.guildId, id);
    if (!d || d.status !== 'accepted') throw new UserError(t('du.not_open'));
    if (![d.challengerId, d.opponentId].includes(interaction.user.id)) throw new UserError(t('du.not_in'));
    d.reports[interaction.user.id] = outcome === 'win' ? 'win' : 'lose';
    const a = d.reports[d.challengerId];
    const b = d.reports[d.opponentId];
    if (a && b) {
      if (a !== b) applyResult(interaction.guildId, d, a === 'win' ? d.challengerId : d.opponentId);
      else d.status = 'disputed';
    } else if (a || b) {
      // One report is enough when it is a loss: nobody claims a loss they did not take.
      const reporter = a ? d.challengerId : d.opponentId;
      const other = reporter === d.challengerId ? d.opponentId : d.challengerId;
      if ((a || b) === 'lose') applyResult(interaction.guildId, d, other);
    }
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(duelCard(t, d)));
  },
  'du:resolve': async (interaction, t, [id, winnerId]) => {
    const d = find(interaction.guildId, id);
    if (!d || d.status !== 'disputed') throw new UserError(t('du.not_open'));
    if (!isMod(interaction.member)) throw new UserError(t('common.noperm'));
    applyResult(interaction.guildId, d, winnerId);
    return interaction.update(ui.v2(duelCard(t, d)));
  },
  'du:rematch': async (interaction, t, [id]) => {
    const d = find(interaction.guildId, id);
    if (!d || ![d.challengerId, d.opponentId].includes(interaction.user.id)) throw new UserError(t('du.not_in'));
    const otherId = interaction.user.id === d.challengerId ? d.opponentId : d.challengerId;
    const other = await interaction.client.users.fetch(otherId);
    await interaction.deferReply({ flags: 64 });
    await challenge(interaction, t, other, d.format, d.rule);
    return interaction.editReply(ui.notice(t('common.done'), 'ok'));
  },
};

const onSelect = {
  'du:pick': async (interaction, t) => {
    const user = interaction.users.first();
    await interaction.deferUpdate();
    await challenge(interaction, t, user, 'bo1', 'classic');
    return interaction.editReply(ui.notice(t('common.done'), 'ok'));
  },
};

module.exports = { commands, onCommand, onButton, onSelect, tick, doc, ratingsDoc, monthChampion, duelCard };
