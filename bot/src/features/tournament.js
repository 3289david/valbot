'use strict';
const {
  SlashCommandBuilder, PermissionFlagsBits, UserSelectMenuBuilder, ActionRowBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');
const { add, tr } = require('../lib/i18n');
const store = require('../lib/store');
const premium = require('../lib/premium');
const notify = require('../services/notify');
const { UserError, needFeature, ui, players } = require('./common');

const { card, v2, row, button, select, ButtonStyle, md, absTime, SEP } = ui;

add({
  en: {
    'tn.format.single': 'Single elimination', 'tn.format.roundrobin': 'Round robin',
    'tn.signup': 'Sign-ups open', 'tn.live': 'In progress', 'tn.done': 'Finished', 'tn.cancelled': 'Cancelled',
    'tn.teams': 'Teams {n}/{max} · {size} per team',
    'tn.join': 'Sign up team', 'tn.bracket': 'Bracket',
    'tn.created': 'Tournament **{name}** created.',
    'tn.staff_only': 'Only tournament staff (Manage Server or Manage Events) can do that.',
    'tn.not_signup': 'Sign-ups are closed.',
    'tn.full': 'The tournament is full.',
    'tn.size': 'A team needs exactly {n} players including you.',
    'tn.dupe': 'A player is already on another team.',
    'tn.name_taken': 'That team name is taken.',
    'tn.need_two': 'Need at least 2 teams to start.',
    'tn.started': 'Tournament **{name}** started.',
    'tn.none': 'No tournament right now.',
    'tn.limit_format': 'Your plan does not include this format.',
    'tn.limit_teams': 'Your plan allows up to {n} teams.',
    'tn.round': 'Round {n}', 'tn.final': 'Final', 'tn.semi': 'Semifinal',
    'tn.bye': 'bye', 'tn.tbd': 'TBD',
    'tn.standings': 'Standings',
    'tn.match_pick': 'Match',
    'tn.not_captain': 'Only a captain of this match or staff can report it.',
    'tn.match_not_ready': 'That match is not ready.',
    'tn.reported': '{user} reported **{team}** won {match}. The other captain or staff must confirm.',
    'tn.confirm': 'Confirm', 'tn.reject': 'Reject',
    'tn.confirm_wrong': 'The other captain or staff must confirm.',
    'tn.result': '{match}: **{team}** won',
    'tn.rejected': 'Report rejected. Report again.',
    'tn.champion': '**{team}** won {name}!',
    'tn.team_name': 'Team name',
    'tn.pick_members': 'Pick your {n} teammates',
    'tn.registered': 'Team **{team}** signed up.',
    'tn.withdrawn': 'Team withdrawn.',
    'tn.no_team': 'You are not a team captain here.',
    'tn.wl': '{w}W {l}L',
    'tn.winners': 'Champions',
  },
  ko: {
    'tn.format.single': '싱글 엘리미네이션', 'tn.format.roundrobin': '풀리그',
    'tn.signup': '참가 신청 중', 'tn.live': '진행 중', 'tn.done': '종료', 'tn.cancelled': '취소됨',
    'tn.teams': '팀 {n}/{max} · 팀당 {size}명',
    'tn.join': '팀 신청', 'tn.bracket': '대진표',
    'tn.created': '**{name}** 대회를 만들었습니다.',
    'tn.staff_only': '대회 운영진(서버 관리 또는 이벤트 관리 권한)만 할 수 있습니다.',
    'tn.not_signup': '참가 신청이 마감되었습니다.',
    'tn.full': '참가 팀이 다 찼습니다.',
    'tn.size': '본인 포함 정확히 {n}명이 필요합니다.',
    'tn.dupe': '이미 다른 팀에 있는 플레이어가 있습니다.',
    'tn.name_taken': '이미 있는 팀 이름입니다.',
    'tn.need_two': '최소 2팀이 필요합니다.',
    'tn.started': '**{name}** 대회를 시작했습니다.',
    'tn.none': '진행 중인 대회가 없습니다.',
    'tn.limit_format': '현재 요금제에서 쓸 수 없는 방식입니다.',
    'tn.limit_teams': '현재 요금제는 최대 {n}팀까지 가능합니다.',
    'tn.round': '{n}라운드', 'tn.final': '결승', 'tn.semi': '준결승',
    'tn.bye': '부전승', 'tn.tbd': '미정',
    'tn.standings': '순위',
    'tn.match_pick': '경기',
    'tn.not_captain': '이 경기의 팀장이나 운영진만 결과를 등록할 수 있습니다.',
    'tn.match_not_ready': '아직 진행할 수 없는 경기입니다.',
    'tn.reported': '{user} 님이 {match} **{team}** 승리로 등록했습니다. 상대 팀장이나 운영진이 확인해야 합니다.',
    'tn.confirm': '확인', 'tn.reject': '거부',
    'tn.confirm_wrong': '상대 팀장이나 운영진만 확인할 수 있습니다.',
    'tn.result': '{match}: **{team}** 승리',
    'tn.rejected': '결과가 거부되었습니다. 다시 등록하세요.',
    'tn.champion': '**{team}** 팀이 {name} 우승!',
    'tn.team_name': '팀 이름',
    'tn.pick_members': '팀원 {n}명을 고르세요',
    'tn.registered': '**{team}** 팀 신청 완료.',
    'tn.withdrawn': '팀 신청을 취소했습니다.',
    'tn.no_team': '이 대회의 팀장이 아닙니다.',
    'tn.wl': '{w}승 {l}패',
    'tn.winners': '역대 우승',
  },
});

const doc = (g) => store.guild(g, 'tournaments', []);
const current = (g) => doc(g).data.filter((x) => ['signup', 'live'].includes(x.status)).slice(-1)[0] || null;
const isStaff = (m) => Boolean(m && m.permissions && (m.permissions.has(PermissionFlagsBits.ManageGuild) || m.permissions.has(PermissionFlagsBits.ManageEvents)));
const teamById = (tn, id) => tn.teams.find((x) => x.id === id);
const teamName = (t, tn, id) => (id ? md((teamById(tn, id) || {}).name || '?') : t('tn.tbd'));

function avgElo(team) {
  const vals = team.members.map((id) => players.playerOf(id)).map((p) => (p && p.current && typeof p.current.elo === 'number' ? p.current.elo : null)).filter((v) => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

function buildSingle(tn) {
  // Seed by average rank of members; teams with no ranked members go last in sign-up order.
  const seeded = tn.teams.slice().sort((a, b) => {
    const ea = avgElo(a); const eb = avgElo(b);
    if (ea === null && eb === null) return 0;
    if (ea === null) return 1;
    if (eb === null) return -1;
    return eb - ea;
  });
  let size = 1;
  while (size < seeded.length) size *= 2;
  const rounds = Math.log2(size);
  const matches = [];
  for (let r = 1; r <= rounds; r++) {
    const count = size / 2 ** r;
    for (let k = 0; k < count; k++) matches.push({ id: `R${r}-${k + 1}`, round: r, slot: k, a: null, b: null, winner: null, status: 'waiting' });
  }
  const first = matches.filter((m) => m.round === 1);
  for (let k = 0; k < size / 2; k++) {
    const m = first[k];
    m.a = seeded[k] ? seeded[k].id : null;
    m.b = seeded[size - 1 - k] ? seeded[size - 1 - k].id : null;
  }
  tn.matches = matches;
  tn.rounds = rounds;
  for (const m of first) {
    if (m.a && !m.b) { m.winner = m.a; m.status = 'done'; m.bye = true; advance(tn, m); }
    else if (m.a && m.b) m.status = 'ready';
  }
}

function advance(tn, m) {
  if (tn.format !== 'single') return;
  if (m.round === tn.rounds) { tn.championId = m.winner; tn.status = 'done'; tn.doneAt = new Date().toISOString(); return; }
  const next = tn.matches.find((x) => x.round === m.round + 1 && x.slot === Math.floor(m.slot / 2));
  if (m.slot % 2 === 0) next.a = m.winner; else next.b = m.winner;
  if (next.a && next.b) next.status = 'ready';
}

function buildRoundRobin(tn) {
  const matches = [];
  let n = 1;
  for (let i = 0; i < tn.teams.length; i++) {
    for (let j = i + 1; j < tn.teams.length; j++) {
      matches.push({ id: `M${n++}`, round: 1, a: tn.teams[i].id, b: tn.teams[j].id, winner: null, status: 'ready' });
    }
  }
  tn.matches = matches;
}

function standings(tn) {
  const rec = Object.fromEntries(tn.teams.map((x) => [x.id, { w: 0, l: 0 }]));
  for (const m of tn.matches || []) {
    if (m.status !== 'done' || m.bye) continue;
    rec[m.winner].w++;
    rec[m.winner === m.a ? m.b : m.a].l++;
  }
  return tn.teams.map((x) => ({ team: x, ...rec[x.id] })).sort((a, b) => b.w - a.w || a.l - b.l);
}

function finishRoundRobinIfDone(tn) {
  if (tn.format !== 'roundrobin') return;
  if (tn.matches.every((m) => m.status === 'done')) {
    tn.championId = standings(tn)[0].team.id;
    tn.status = 'done';
    tn.doneAt = new Date().toISOString();
  }
}

function roundLabel(t, tn, r) {
  if (tn.format !== 'single') return t('tn.round', { n: r });
  if (r === tn.rounds) return t('tn.final');
  if (r === tn.rounds - 1) return t('tn.semi');
  return t('tn.round', { n: r });
}

function tnCard(t, tn) {
  const lim = tn.maxTeams;
  const parts = [
    `## ${md(tn.name)}`,
    `-# ${t(`tn.format.${tn.format}`)} · ${t(`tn.${tn.status}`)} · ${t('tn.teams', { n: tn.teams.length, max: lim, size: tn.teamSize })}`,
  ];
  if (tn.championId) parts.push(t('tn.champion', { team: teamName(t, tn, tn.championId), name: md(tn.name) }));
  parts.push(SEP);
  if (tn.status === 'signup') {
    parts.push(tn.teams.length ? tn.teams.map((x, i) => `${i + 1}. **${md(x.name)}** · ${x.members.map((id) => `<@${id}>`).join(' ')}`).join('\n') : '-');
    parts.push(row(button(`tn:signup:${tn.id}`, t('tn.join'), ButtonStyle.Success), tn.guildId && require('../lib/settings').get(tn.guildId).general.publicStats ? ui.webButton(t('tn.bracket'), `/s/${tn.guildId}#tournament`) : null));
  } else if (tn.format === 'single') {
    for (let r = 1; r <= tn.rounds; r++) {
      const ms = tn.matches.filter((m) => m.round === r);
      parts.push(`**${roundLabel(t, tn, r)}**\n${ms.map((m) => {
        if (m.bye) return `${m.id} · ${teamName(t, tn, m.a)} (${t('tn.bye')})`;
        const a = m.winner === m.a ? `**${teamName(t, tn, m.a)}**` : teamName(t, tn, m.a);
        const b = m.winner === m.b ? `**${teamName(t, tn, m.b)}**` : teamName(t, tn, m.b);
        return `${m.id} · ${a} vs ${b}${m.status === 'pending' ? ' · (…)' : ''}`;
      }).join('\n')}`);
    }
  } else {
    parts.push(`**${t('tn.standings')}**\n${standings(tn).map((s, i) => `${i + 1}. ${md(s.team.name)} · ${t('tn.wl', { w: s.w, l: s.l })}`).join('\n')}`);
    const open = tn.matches.filter((m) => m.status !== 'done').slice(0, 12);
    if (open.length) parts.push(open.map((m) => `${m.id} · ${teamName(t, tn, m.a)} vs ${teamName(t, tn, m.b)}${m.status === 'pending' ? ' · (…)' : ''}`).join('\n'));
  }
  return card(parts, tn.status === 'done' ? ui.COLORS.good : ui.COLORS.brand);
}

async function refresh(client, tn) {
  if (!tn.channelId || !tn.messageId) return;
  try {
    const ch = await client.channels.fetch(tn.channelId);
    const msg = await ch.messages.fetch(tn.messageId);
    await msg.edit(ui.v2(tnCard(tr(tn.guildId), tn)));
  } catch (e) { /* gone */ }
}

function captainOf(tn, userId) { return tn.teams.find((x) => x.captainId === userId) || null; }

async function registerTeam(interaction, t, tn, name, memberIds) {
  if (!tn || tn.status !== 'signup') throw new UserError(t('tn.not_signup'));
  if (tn.teams.length >= tn.maxTeams) throw new UserError(t('tn.full'));
  const members = [...new Set([interaction.user.id, ...memberIds])];
  if (members.length !== tn.teamSize) throw new UserError(t('tn.size', { n: tn.teamSize }));
  const taken = new Set(tn.teams.flatMap((x) => x.members));
  if (members.some((id) => taken.has(id))) throw new UserError(t('tn.dupe'));
  if (tn.teams.some((x) => x.name.toLowerCase() === name.toLowerCase())) throw new UserError(t('tn.name_taken'));
  tn.teams.push({ id: store.newId('tm'), name: name.slice(0, 40), captainId: interaction.user.id, members, joinedAt: new Date().toISOString() });
  doc(tn.guildId).save();
  await refresh(interaction.client, tn);
}

function reportMatch(interaction, t, tn, matchId, winnerSide) {
  const m = tn.matches.find((x) => x.id === matchId);
  if (!m || !['ready', 'pending'].includes(m.status) || !m.a || !m.b) throw new UserError(t('tn.match_not_ready'));
  const winner = winnerSide === 'a' ? m.a : winnerSide === 'b' ? m.b : winnerSide;
  if (![m.a, m.b].includes(winner)) throw new UserError(t('tn.match_not_ready'));
  const staff = isStaff(interaction.member);
  const capA = teamById(tn, m.a).captainId;
  const capB = teamById(tn, m.b).captainId;
  if (staff) {
    m.winner = winner; m.status = 'done'; m.approvedBy = interaction.user.id; m.doneAt = new Date().toISOString();
    advance(tn, m); finishRoundRobinIfDone(tn);
    return { done: true, m };
  }
  if (![capA, capB].includes(interaction.user.id)) throw new UserError(t('tn.not_captain'));
  m.status = 'pending'; m.reportWinner = winner; m.reportedBy = interaction.user.id;
  return { done: false, m };
}

async function afterResult(interaction, t, tn, m) {
  doc(tn.guildId).save();
  await refresh(interaction.client, tn);
  if (tn.status === 'done') notify.send(interaction.guild, 'tournament', card([t('tn.champion', { team: teamName(t, tn, tn.championId), name: md(tn.name) })], ui.COLORS.good));
}

function pendingCard(t, tn, m) {
  return card([
    t('tn.reported', { user: `<@${m.reportedBy}>`, team: teamName(t, tn, m.reportWinner), match: m.id }),
    row(button(`tn:confirm:${tn.id}:${m.id}`, t('tn.confirm'), ButtonStyle.Success), button(`tn:reject:${tn.id}:${m.id}`, t('tn.reject'), ButtonStyle.Danger)),
  ], ui.COLORS.warn);
}

const commands = [
  new SlashCommandBuilder().setName('tournament').setDescription('Tournaments').setDescriptionLocalizations({ ko: '대회' })
    .addSubcommand((s) => s.setName('create').setDescription('Create a tournament (staff)').setDescriptionLocalizations({ ko: '대회 만들기 (운영진)' })
      .addStringOption((o) => o.setName('name').setDescription('Name').setDescriptionLocalizations({ ko: '이름' }).setRequired(true).setMaxLength(60))
      .addIntegerOption((o) => o.setName('team_size').setDescription('Players per team').setDescriptionLocalizations({ ko: '팀당 인원' }).setRequired(true).setMinValue(1).setMaxValue(5))
      .addIntegerOption((o) => o.setName('max_teams').setDescription('Max teams').setDescriptionLocalizations({ ko: '최대 팀 수' }).setRequired(true).setMinValue(2).setMaxValue(32))
      .addStringOption((o) => o.setName('format').setDescription('Format').setDescriptionLocalizations({ ko: '방식' }).addChoices({ name: 'Single elimination', value: 'single' }, { name: 'Round robin', value: 'roundrobin' })))
    .addSubcommand((s) => s.setName('join').setDescription('Sign up your team').setDescriptionLocalizations({ ko: '팀 참가 신청' })
      .addStringOption((o) => o.setName('team_name').setDescription('Team name').setDescriptionLocalizations({ ko: '팀 이름' }).setRequired(true).setMaxLength(40))
      .addUserOption((o) => o.setName('member2').setDescription('Teammate').setDescriptionLocalizations({ ko: '팀원' }))
      .addUserOption((o) => o.setName('member3').setDescription('Teammate').setDescriptionLocalizations({ ko: '팀원' }))
      .addUserOption((o) => o.setName('member4').setDescription('Teammate').setDescriptionLocalizations({ ko: '팀원' }))
      .addUserOption((o) => o.setName('member5').setDescription('Teammate').setDescriptionLocalizations({ ko: '팀원' })))
    .addSubcommand((s) => s.setName('withdraw').setDescription('Withdraw your team').setDescriptionLocalizations({ ko: '팀 신청 취소' }))
    .addSubcommand((s) => s.setName('start').setDescription('Close sign-ups and start (staff)').setDescriptionLocalizations({ ko: '신청 마감 후 시작 (운영진)' }))
    .addSubcommand((s) => s.setName('bracket').setDescription('Show the bracket').setDescriptionLocalizations({ ko: '대진표 보기' }))
    .addSubcommand((s) => s.setName('result').setDescription('Report a match result').setDescriptionLocalizations({ ko: '경기 결과 등록' })
      .addStringOption((o) => o.setName('match').setDescription('Match').setDescriptionLocalizations({ ko: '경기' }).setRequired(true).setAutocomplete(true))
      .addStringOption((o) => o.setName('winner').setDescription('Winning team').setDescriptionLocalizations({ ko: '이긴 팀' }).setRequired(true).setAutocomplete(true)))
    .addSubcommand((s) => s.setName('cancel').setDescription('Cancel the tournament (staff)').setDescriptionLocalizations({ ko: '대회 취소 (운영진)' }))
    .addSubcommand((s) => s.setName('history').setDescription('Past champions').setDescriptionLocalizations({ ko: '역대 우승' })),
];

const onAutocomplete = {
  async tournament(interaction) {
    const tn = current(interaction.guildId);
    if (!tn || tn.status !== 'live') return interaction.respond([]);
    const focused = interaction.options.getFocused(true);
    const t = tr(interaction);
    if (focused.name === 'match') {
      return interaction.respond(tn.matches.filter((m) => ['ready', 'pending'].includes(m.status) && m.a && m.b).slice(0, 25)
        .map((m) => ({ name: `${m.id} · ${teamName(t, tn, m.a)} vs ${teamName(t, tn, m.b)}`.replace(/\\/g, '').slice(0, 100), value: m.id })));
    }
    const m = tn.matches.find((x) => x.id === interaction.options.getString('match'));
    if (!m) return interaction.respond([]);
    return interaction.respond([m.a, m.b].filter(Boolean).map((id) => ({ name: teamById(tn, id).name.slice(0, 100), value: id })));
  },
};

const onCommand = {
  async tournament(interaction, t) {
    needFeature(interaction, t, 'tournaments');
    const g = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    const tn = current(g);
    if (sub === 'create') {
      if (!isStaff(interaction.member)) throw new UserError(t('tn.staff_only'));
      if (tn) throw new UserError(`${md(tn.name)}: ${t(`tn.${tn.status}`)}`);
      const lim = premium.limits(g);
      const format = interaction.options.getString('format') || 'single';
      const maxTeams = interaction.options.getInteger('max_teams', true);
      if (!lim.tournamentFormats.includes(format)) throw new UserError(t('tn.limit_format'));
      if (maxTeams > lim.tournamentTeams) throw new UserError(t('tn.limit_teams', { n: lim.tournamentTeams }));
      const x = { id: store.newId('tn'), guildId: g, name: interaction.options.getString('name', true), format, teamSize: interaction.options.getInteger('team_size', true), maxTeams, status: 'signup', teams: [], matches: [], createdBy: interaction.user.id, createdAt: new Date().toISOString() };
      await interaction.deferReply({ flags: 64 });
      const msg = await interaction.channel.send(ui.v2(tnCard(t.guild || t, x)));
      x.channelId = interaction.channel.id; x.messageId = msg.id;
      doc(g).data.push(x); doc(g).save();
      notify.send(interaction.guild, 'tournament', card([(t.guild || t)('tn.created', { name: md(x.name) }), `https://discord.com/channels/${g}/${x.channelId}/${x.messageId}`], ui.COLORS.brand));
      return interaction.editReply(ui.notice(t('tn.created', { name: md(x.name) }), 'ok'));
    }
    if (!tn && sub !== 'history') throw new UserError(t('tn.none'));
    if (sub === 'join') {
      const ids = ['member2', 'member3', 'member4', 'member5'].map((k) => interaction.options.getUser(k)).filter(Boolean).map((u) => u.id);
      await registerTeam(interaction, t, tn, interaction.options.getString('team_name', true), ids);
      return interaction.reply(ui.notice(t('tn.registered', { team: md(interaction.options.getString('team_name', true)) }), 'ok', { ephemeral: true }));
    }
    if (sub === 'withdraw') {
      if (tn.status !== 'signup') throw new UserError(t('tn.not_signup'));
      const team = captainOf(tn, interaction.user.id);
      if (!team) throw new UserError(t('tn.no_team'));
      tn.teams = tn.teams.filter((x) => x.id !== team.id);
      doc(g).save();
      await refresh(interaction.client, tn);
      return interaction.reply(ui.notice(t('tn.withdrawn'), 'ok', { ephemeral: true }));
    }
    if (sub === 'start') {
      if (!isStaff(interaction.member)) throw new UserError(t('tn.staff_only'));
      if (tn.status !== 'signup') throw new UserError(t('tn.not_signup'));
      if (tn.teams.length < 2) throw new UserError(t('tn.need_two'));
      if (tn.format === 'single') buildSingle(tn); else buildRoundRobin(tn);
      if (tn.status === 'signup') tn.status = 'live';
      tn.startedAt = new Date().toISOString();
      doc(g).save();
      await refresh(interaction.client, tn);
      notify.send(interaction.guild, 'tournament', card([(t.guild || t)('tn.started', { name: md(tn.name) })], ui.COLORS.brand));
      return interaction.reply(v2(tnCard(t.guild || t, tn)));
    }
    if (sub === 'bracket') return interaction.reply(v2(tnCard(t, tn), { ephemeral: true }));
    if (sub === 'result') {
      if (tn.status !== 'live') throw new UserError(t('tn.match_not_ready'));
      const { done, m } = reportMatch(interaction, t, tn, interaction.options.getString('match', true), interaction.options.getString('winner', true));
      const tg = t.guild || t;
      await afterResult(interaction, tg, tn, m);
      if (done) return interaction.reply(v2(card([tg('tn.result', { match: m.id, team: teamName(tg, tn, m.winner) })], ui.COLORS.good)));
      return interaction.reply(v2(pendingCard(tg, tn, m)));
    }
    if (sub === 'cancel') {
      if (!isStaff(interaction.member)) throw new UserError(t('tn.staff_only'));
      tn.status = 'cancelled';
      doc(g).save();
      await refresh(interaction.client, tn);
      return interaction.reply(ui.notice(t('common.done'), 'ok', { ephemeral: true }));
    }
    if (sub === 'history') {
      const past = doc(g).data.filter((x) => x.status === 'done').slice(-15).reverse();
      return interaction.reply(v2(card([`## ${t('tn.winners')}`, SEP, past.length ? past.map((x) => `**${md(x.name)}** · ${teamName(t, x, x.championId)} · ${absTime(x.doneAt, 'd')}`).join('\n') : '-'], ui.COLORS.good), { ephemeral: true }));
    }
    return null;
  },
};

const pendingMembers = new Map();

const onButton = {
  'tn:signup': async (interaction, t, [id]) => {
    needFeature(interaction, t, 'tournaments');
    const tn = doc(interaction.guildId).data.find((x) => x.id === id);
    if (!tn || tn.status !== 'signup') throw new UserError(t('tn.not_signup'));
    if (tn.teamSize === 1) {
      return interaction.showModal(new ModalBuilder().setCustomId(`tn:teamname:${tn.id}`).setTitle(t('tn.join')).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel(t('tn.team_name')).setStyle(TextInputStyle.Short).setMaxLength(40).setRequired(true))));
    }
    const sel = new UserSelectMenuBuilder().setCustomId(`tn:members:${tn.id}`).setPlaceholder(t('tn.pick_members', { n: tn.teamSize - 1 })).setMinValues(tn.teamSize - 1).setMaxValues(tn.teamSize - 1);
    return interaction.reply(v2(card([t('tn.pick_members', { n: tn.teamSize - 1 }), new ActionRowBuilder().addComponents(sel)]), { ephemeral: true }));
  },
  'tn:open': async (interaction, t) => {
    const tn = current(interaction.guildId);
    if (!tn) throw new UserError(t('tn.none'));
    return interaction.reply(v2(tnCard(t, tn), { ephemeral: true }));
  },
  'tn:confirm': async (interaction, t, [id, mid]) => {
    const tn = doc(interaction.guildId).data.find((x) => x.id === id);
    const m = tn && tn.matches.find((x) => x.id === mid);
    if (!m || m.status !== 'pending') throw new UserError(t('tn.match_not_ready'));
    const reporterTeam = [m.a, m.b].find((tid) => teamById(tn, tid).captainId === m.reportedBy);
    const otherCaptain = teamById(tn, reporterTeam === m.a ? m.b : m.a).captainId;
    if (interaction.user.id !== otherCaptain && !isStaff(interaction.member)) throw new UserError(t('tn.confirm_wrong'));
    m.winner = m.reportWinner; m.status = 'done'; m.approvedBy = interaction.user.id; m.doneAt = new Date().toISOString();
    advance(tn, m); finishRoundRobinIfDone(tn);
    await afterResult(interaction, t, tn, m);
    return interaction.update(v2(card([t('tn.result', { match: m.id, team: teamName(t, tn, m.winner) })], ui.COLORS.good)));
  },
  'tn:reject': async (interaction, t, [id, mid]) => {
    const tn = doc(interaction.guildId).data.find((x) => x.id === id);
    const m = tn && tn.matches.find((x) => x.id === mid);
    if (!m || m.status !== 'pending') throw new UserError(t('tn.match_not_ready'));
    const reporterTeam = [m.a, m.b].find((tid) => teamById(tn, tid).captainId === m.reportedBy);
    const otherCaptain = teamById(tn, reporterTeam === m.a ? m.b : m.a).captainId;
    if (interaction.user.id !== otherCaptain && !isStaff(interaction.member)) throw new UserError(t('tn.confirm_wrong'));
    m.status = 'ready'; delete m.reportWinner; delete m.reportedBy;
    doc(tn.guildId).save();
    await refresh(interaction.client, tn);
    return interaction.update(ui.notice(t('tn.rejected'), 'warn'));
  },
};

const onSelect = {
  'tn:members': async (interaction, t, [id]) => {
    pendingMembers.set(`${interaction.user.id}|${id}`, interaction.values);
    return interaction.showModal(new ModalBuilder().setCustomId(`tn:teamname:${id}`).setTitle(t('tn.join')).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel(t('tn.team_name')).setStyle(TextInputStyle.Short).setMaxLength(40).setRequired(true))));
  },
};

const onModal = {
  'tn:teamname': async (interaction, t, [id]) => {
    const tn = doc(interaction.guildId).data.find((x) => x.id === id);
    const ids = pendingMembers.get(`${interaction.user.id}|${id}`) || [];
    pendingMembers.delete(`${interaction.user.id}|${id}`);
    const name = interaction.fields.getTextInputValue('name').trim();
    await registerTeam(interaction, t, tn, name, ids);
    return interaction.reply(ui.notice(t('tn.registered', { team: md(name) }), 'ok', { ephemeral: true }));
  },
};

module.exports = { commands, onCommand, onButton, onSelect, onModal, onAutocomplete, doc, current, tnCard, buildSingle, buildRoundRobin, advance, standings };
