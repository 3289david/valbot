'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { add } = require('../lib/i18n');
const store = require('../lib/store');
const premium = require('../lib/premium');
const { UserError, needFeature, isMod, ui, players } = require('./common');
const scrim = require('./scrim');
const duel = require('./duel');

const { card, v2, row, select, md, absTime, SEP } = ui;

add({
  en: {
    'cl.created': 'Club **{name}** [{tag}] created.',
    'cl.joined': 'You joined **{name}**.',
    'cl.left': 'You left **{name}**.',
    'cl.disbanded': 'Club **{name}** disbanded.',
    'cl.kicked': '{user} removed from **{name}**.',
    'cl.taken': 'That name or tag is taken.',
    'cl.in_club': 'You are already in a club. Leave it first.',
    'cl.not_in': 'You are not in a club.',
    'cl.none': 'No clubs yet.',
    'cl.notfound': 'Club not found.',
    'cl.captain_only': 'Only the captain can do that.',
    'cl.captain_leave': 'Captains disband the club instead of leaving.',
    'cl.limit': 'Your plan allows {n} clubs per server.',
    'cl.full': 'This club is full ({n}).',
    'cl.members': 'Members ({n})',
    'cl.captain': 'Captain',
    'cl.score': 'Club score: {score} (scrim wins + duel wins)',
    'cl.lb.title': 'Club leaderboard',
    'cl.pick': 'Join a club',
    'cl.since': 'Since {date}',
  },
  ko: {
    'cl.created': '**{name}** [{tag}] 클럽을 만들었습니다.',
    'cl.joined': '**{name}** 클럽에 가입했습니다.',
    'cl.left': '**{name}** 클럽에서 나왔습니다.',
    'cl.disbanded': '**{name}** 클럽을 해체했습니다.',
    'cl.kicked': '{user} 님을 **{name}**에서 내보냈습니다.',
    'cl.taken': '이미 있는 이름이나 태그입니다.',
    'cl.in_club': '이미 클럽에 가입되어 있습니다. 먼저 탈퇴하세요.',
    'cl.not_in': '가입한 클럽이 없습니다.',
    'cl.none': '아직 클럽이 없습니다.',
    'cl.notfound': '클럽을 찾을 수 없습니다.',
    'cl.captain_only': '클럽장만 할 수 있습니다.',
    'cl.captain_leave': '클럽장은 탈퇴 대신 해체해야 합니다.',
    'cl.limit': '현재 요금제는 서버당 클럽 {n}개까지 가능합니다.',
    'cl.full': '인원이 다 찼습니다 ({n}명).',
    'cl.members': '멤버 ({n})',
    'cl.captain': '클럽장',
    'cl.score': '클럽 점수: {score} (내전 승리 + 대결 승리)',
    'cl.lb.title': '클럽 랭킹',
    'cl.pick': '가입할 클럽 선택',
    'cl.since': '{date} 창단',
  },
});

const MAX_MEMBERS = 30;
const doc = (g) => store.guild(g, 'clubs', []);
const active = (g) => doc(g).data.filter((c) => !c.disbandedAt);
const clubOf = (g, userId) => active(g).find((c) => c.members.includes(userId));

function score(g, club) {
  const sc = scrim.recordFor(g);
  const ratings = duel.ratingsDoc(g).data;
  return club.members.reduce((sum, id) => sum + ((sc[id] && sc[id].w) || 0) + ((ratings[id] && ratings[id].wins) || 0), 0);
}

function clubCard(t, g, c) {
  return card([
    `## ${md(c.name)} [${md(c.tag)}]`,
    `-# ${t('cl.captain')}: <@${c.captainId}> · ${t('cl.since', { date: absTime(c.createdAt, 'D') })}`,
    SEP,
    `**${t('cl.members', { n: c.members.length })}**\n${c.members.map((id) => {
      const p = players.playerOf(id);
      return `<@${id}>${p && p.current && p.current.tier ? ` · ${md(p.current.tier)}` : ''}`;
    }).join('\n')}`,
    SEP,
    t('cl.score', { score: score(g, c) }),
  ], ui.COLORS.teal);
}

async function joinClub(interaction, t, c) {
  if (!c || c.disbandedAt) throw new UserError(t('cl.notfound'));
  if (clubOf(interaction.guildId, interaction.user.id)) throw new UserError(t('cl.in_club'));
  if (c.members.length >= MAX_MEMBERS) throw new UserError(t('cl.full', { n: MAX_MEMBERS }));
  c.members.push(interaction.user.id);
  doc(interaction.guildId).save();
  if (c.roleId) {
    const member = interaction.member;
    await member.roles.add(c.roleId, 'Joined club').catch(() => {});
  }
}

const commands = [
  new SlashCommandBuilder().setName('club').setDescription('Clubs').setDescriptionLocalizations({ ko: '클럽' })
    .addSubcommand((s) => s.setName('create').setDescription('Create a club').setDescriptionLocalizations({ ko: '클럽 만들기' })
      .addStringOption((o) => o.setName('name').setDescription('Name').setDescriptionLocalizations({ ko: '이름' }).setRequired(true).setMaxLength(32))
      .addStringOption((o) => o.setName('tag').setDescription('Short tag (2-5)').setDescriptionLocalizations({ ko: '태그 (2-5자)' }).setRequired(true).setMinLength(2).setMaxLength(5))
      .addRoleOption((o) => o.setName('role').setDescription('Role for members (optional)').setDescriptionLocalizations({ ko: '멤버 역할 (선택)' })))
    .addSubcommand((s) => s.setName('join').setDescription('Join a club').setDescriptionLocalizations({ ko: '클럽 가입' })
      .addStringOption((o) => o.setName('club').setDescription('Club').setDescriptionLocalizations({ ko: '클럽' }).setRequired(true).setAutocomplete(true)))
    .addSubcommand((s) => s.setName('leave').setDescription('Leave your club').setDescriptionLocalizations({ ko: '클럽 탈퇴' }))
    .addSubcommand((s) => s.setName('info').setDescription('Club info').setDescriptionLocalizations({ ko: '클럽 정보' })
      .addStringOption((o) => o.setName('club').setDescription('Club (default: yours)').setDescriptionLocalizations({ ko: '클럽 (기본: 내 클럽)' }).setAutocomplete(true)))
    .addSubcommand((s) => s.setName('kick').setDescription('Remove a member (captain)').setDescriptionLocalizations({ ko: '멤버 내보내기 (클럽장)' })
      .addUserOption((o) => o.setName('user').setDescription('Member').setDescriptionLocalizations({ ko: '멤버' }).setRequired(true)))
    .addSubcommand((s) => s.setName('disband').setDescription('Disband your club (captain)').setDescriptionLocalizations({ ko: '클럽 해체 (클럽장)' }))
    .addSubcommand((s) => s.setName('leaderboard').setDescription('Club leaderboard').setDescriptionLocalizations({ ko: '클럽 랭킹' })),
];

const onAutocomplete = {
  async club(interaction) {
    const q = String(interaction.options.getFocused() || '').toLowerCase();
    return interaction.respond(active(interaction.guildId).filter((c) => `${c.name} ${c.tag}`.toLowerCase().includes(q)).slice(0, 25).map((c) => ({ name: `${c.name} [${c.tag}] · ${c.members.length}`.slice(0, 100), value: c.id })));
  },
};

const onCommand = {
  async club(interaction, t) {
    needFeature(interaction, t, 'clubs');
    const g = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') {
      if (clubOf(g, interaction.user.id)) throw new UserError(t('cl.in_club'));
      const lim = premium.limits(g).clubs;
      if (active(g).length >= lim) throw new UserError(t('cl.limit', { n: lim }));
      const name = interaction.options.getString('name', true).trim();
      const tag = interaction.options.getString('tag', true).trim().toUpperCase();
      if (active(g).some((c) => c.name.toLowerCase() === name.toLowerCase() || c.tag === tag)) throw new UserError(t('cl.taken'));
      const role = interaction.options.getRole('role');
      if (role && !isMod(interaction.member)) throw new UserError(t('common.noperm'));
      const c = { id: store.newId('cl'), name, tag, captainId: interaction.user.id, members: [interaction.user.id], roleId: role ? role.id : null, createdAt: new Date().toISOString() };
      doc(g).data.push(c);
      doc(g).save();
      if (c.roleId) await interaction.member.roles.add(c.roleId).catch(() => {});
      const tg = t.guild || t;
      return interaction.reply(v2([card([tg('cl.created', { name: md(name), tag: md(tag) })], ui.COLORS.good), clubCard(tg, g, c)]));
    }
    if (sub === 'join') {
      const c = active(g).find((x) => x.id === interaction.options.getString('club', true));
      await joinClub(interaction, t, c);
      return interaction.reply(ui.notice((t.guild || t)('cl.joined', { name: md(c.name) }), 'ok'));
    }
    if (sub === 'leave') {
      const c = clubOf(g, interaction.user.id);
      if (!c) throw new UserError(t('cl.not_in'));
      if (c.captainId === interaction.user.id) throw new UserError(t('cl.captain_leave'));
      c.members = c.members.filter((m) => m !== interaction.user.id);
      doc(g).save();
      if (c.roleId) await interaction.member.roles.remove(c.roleId).catch(() => {});
      return interaction.reply(ui.notice(t('cl.left', { name: md(c.name) }), 'ok', { ephemeral: true }));
    }
    if (sub === 'info') {
      const id = interaction.options.getString('club');
      const c = id ? active(g).find((x) => x.id === id) : clubOf(g, interaction.user.id);
      if (!c) throw new UserError(id ? t('cl.notfound') : t('cl.not_in'));
      return interaction.reply(v2(clubCard(t.guild || t, g, c)));
    }
    if (sub === 'kick') {
      const c = clubOf(g, interaction.user.id);
      if (!c) throw new UserError(t('cl.not_in'));
      if (c.captainId !== interaction.user.id && !isMod(interaction.member)) throw new UserError(t('cl.captain_only'));
      const user = interaction.options.getUser('user', true);
      if (user.id === c.captainId) throw new UserError(t('cl.captain_leave'));
      c.members = c.members.filter((m) => m !== user.id);
      doc(g).save();
      if (c.roleId) { const m = interaction.guild.members.cache.get(user.id); if (m) await m.roles.remove(c.roleId).catch(() => {}); }
      return interaction.reply(ui.notice((t.guild || t)('cl.kicked', { user: `<@${user.id}>`, name: md(c.name) }), 'ok'));
    }
    if (sub === 'disband') {
      const c = clubOf(g, interaction.user.id);
      if (!c) throw new UserError(t('cl.not_in'));
      if (c.captainId !== interaction.user.id && !isMod(interaction.member)) throw new UserError(t('cl.captain_only'));
      c.disbandedAt = new Date().toISOString();
      doc(g).save();
      return interaction.reply(ui.notice((t.guild || t)('cl.disbanded', { name: md(c.name) }), 'ok'));
    }
    if (sub === 'leaderboard') {
      t = t.guild || t;
      const list = active(g).map((c) => ({ c, s: score(g, c) })).sort((a, b) => b.s - a.s).slice(0, 15);
      return interaction.reply(v2(card([`## ${t('cl.lb.title')}`, SEP, list.length ? list.map((x, i) => `${i + 1}. **${md(x.c.name)}** [${md(x.c.tag)}] · ${x.s} · ${x.c.members.length}`).join('\n') : t('cl.none')], ui.COLORS.teal)));
    }
    return null;
  },
};

const onButton = {
  'cl:browse': async (interaction, t) => {
    needFeature(interaction, t, 'clubs');
    const list = active(interaction.guildId);
    if (!list.length) return interaction.reply(ui.notice(t('cl.none'), 'info', { ephemeral: true }));
    return interaction.reply(v2(card([
      list.slice(0, 15).map((c) => `**${md(c.name)}** [${md(c.tag)}] · ${c.members.length} · ${score(interaction.guildId, c)}`).join('\n'),
      row(select('cl:join', t('cl.pick'), list.slice(0, 25).map((c) => ({ label: `${c.name} [${c.tag}]`, value: c.id })))),
    ], ui.COLORS.teal), { ephemeral: true }));
  },
};

const onSelect = {
  'cl:join': async (interaction, t) => {
    const c = active(interaction.guildId).find((x) => x.id === interaction.values[0]);
    await joinClub(interaction, t, c);
    return interaction.update(ui.notice(t('cl.joined', { name: md(c.name) }), 'ok'));
  },
};

module.exports = { commands, onCommand, onButton, onSelect, onAutocomplete, doc };
