'use strict';
/*
 * Persistent panels. Admins choose a channel per panel in the dashboard (or with /panel post);
 * the bot posts the panel, re-posts it if deleted, moves it if the channel changes, and keeps live panels current.
 */
const crypto = require('crypto');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { add, tr } = require('../lib/i18n');
const store = require('../lib/store');
const settings = require('../lib/settings');
const ranks = require('../lib/ranks');
const { UserError, needAdmin, ui, players, guildPlayers } = require('./common');

const { card, v2, row, button, ButtonStyle, md, SEP } = ui;

const TYPES = ['hub', 'leaderboard', 'scrims', 'lfg', 'duels', 'clubs', 'tournament', 'admin'];

add({
  en: {
    'pn.hub.title': 'Valorant Hub',
    'pn.hub.text': 'Link your Riot ID once. Then use everything below.',
    'pn.hub.link': 'Link Riot ID', 'pn.hub.profile': 'My profile', 'pn.hub.analysis': 'My analysis', 'pn.hub.board': 'Leaderboard', 'pn.hub.help': 'Help', 'pn.hub.web': 'Website',
    'pn.lb.title': 'Leaderboard',
    'pn.lb.full': 'Full leaderboard',
    'pn.sc.title': 'Scrims',
    'pn.sc.text': 'Open scrims',
    'pn.sc.none': 'No open scrims. Start one.',
    'pn.sc.new': 'New scrim',
    'pn.pa.title': 'Party Finder',
    'pn.pa.none': 'No open parties. Post one.',
    'pn.pa.new': 'New party',
    'pn.du.title': 'Duel Arena',
    'pn.du.text': 'Top Duel Rating',
    'pn.du.new': 'Challenge someone',
    'pn.cl.title': 'Clubs',
    'pn.cl.browse': 'Browse clubs',
    'pn.cl.none': 'No clubs yet. Create one with /club create.',
    'pn.tn.title': 'Tournament',
    'pn.tn.none': 'No tournament right now.',
    'pn.tn.signup': 'Sign up team',
    'pn.tn.bracket': 'Bracket',
    'pn.ad.title': 'Server setup',
    'pn.ad.roles': 'Create tier roles',
    'pn.ad.post': 'Post all panels',
    'pn.ad.check.roles': 'Tier roles',
    'pn.ad.check.alerts': 'Alert channel',
    'pn.ad.check.panels': 'Panels with a channel',
    'pn.ad.check.lang': 'Language',
    'pn.ad.ok': 'set', 'pn.ad.missing': 'not set',
    'pn.ad.roles_done': 'Tier roles ready ({n} added).',
    'pn.ad.panels_done': 'Panels posted: {n}.',
    'pn.ad.no_perm': 'I need Manage Roles to create tier roles.',
    'pn.posted': 'Panel posted.',
    'pn.updated': '-# Updated {time}',
  },
  ko: {
    'pn.hub.title': 'Valorant Hub',
    'pn.hub.text': 'Riot ID를 한 번 연결하면 아래 기능을 모두 쓸 수 있습니다.',
    'pn.hub.link': 'Riot ID 연결', 'pn.hub.profile': '내 프로필', 'pn.hub.analysis': '내 분석', 'pn.hub.board': '랭킹', 'pn.hub.help': '도움말', 'pn.hub.web': '웹사이트',
    'pn.lb.title': '랭킹',
    'pn.lb.full': '전체 랭킹',
    'pn.sc.title': '내전',
    'pn.sc.text': '모집 중인 내전',
    'pn.sc.none': '모집 중인 내전이 없습니다. 새로 만들어 보세요.',
    'pn.sc.new': '내전 만들기',
    'pn.pa.title': '파티 모집',
    'pn.pa.none': '모집 중인 파티가 없습니다. 새로 올려 보세요.',
    'pn.pa.new': '파티 만들기',
    'pn.du.title': '대결 아레나',
    'pn.du.text': 'Duel Rating 상위',
    'pn.du.new': '대결 신청',
    'pn.cl.title': '클럽',
    'pn.cl.browse': '클럽 둘러보기',
    'pn.cl.none': '아직 클럽이 없습니다. /club create로 만들어 보세요.',
    'pn.tn.title': '대회',
    'pn.tn.none': '진행 중인 대회가 없습니다.',
    'pn.tn.signup': '팀 신청',
    'pn.tn.bracket': '대진표',
    'pn.ad.title': '서버 설정',
    'pn.ad.roles': '티어 역할 만들기',
    'pn.ad.post': '패널 모두 게시',
    'pn.ad.check.roles': '티어 역할',
    'pn.ad.check.alerts': '알림 채널',
    'pn.ad.check.panels': '채널이 지정된 패널',
    'pn.ad.check.lang': '언어',
    'pn.ad.ok': '설정됨', 'pn.ad.missing': '미설정',
    'pn.ad.roles_done': '티어 역할 준비 완료 ({n}개 추가).',
    'pn.ad.panels_done': '패널 {n}개를 게시했습니다.',
    'pn.ad.no_perm': '티어 역할을 만들려면 역할 관리 권한이 필요합니다.',
    'pn.posted': '패널을 게시했습니다.',
    'pn.updated': '-# {time} 갱신',
  },
});

const stateDoc = (g) => store.guild(g, 'panels', {});
const lastHash = new Map();

function panelCard(type, guild) {
  const t = tr(guild.id);
  const s = settings.get(guild.id);
  const updated = t('pn.updated', { time: `<t:${Math.floor(Date.now() / 1000)}:R>` });
  switch (type) {
    case 'hub':
      return card([
        `# ${t('pn.hub.title')}`,
        t('pn.hub.text'),
        SEP,
        row(button('pl:register', t('pn.hub.link'), ButtonStyle.Success), button('pl:me', t('pn.hub.profile'), ButtonStyle.Primary), button('an:me', t('pn.hub.analysis')), button('lb:open', t('pn.hub.board')), button('ut:help', t('pn.hub.help'))),
        ui.webButton('x', '/') ? row(ui.webButton(t('pn.hub.web'), s.general.publicStats ? `/s/${guild.id}` : '/')) : null,
      ], ui.COLORS.brand);
    case 'leaderboard': {
      const { compute } = require('./ranking');
      const type2 = s.general.defaultRanking;
      const rows = compute(guild, type2, 'week', {}).slice(0, 10);
      return card([
        `## ${t('pn.lb.title')} · ${t(`lb.type.${type2}`)}`,
        SEP,
        rows.length ? rows.map((r, i) => `${i + 1}. <@${r.userId}> · ${md(r.player.name)} · **${r.display}**`).join('\n') : t('lb.empty'),
        SEP,
        updated,
        row(button('lb:open', t('pn.lb.full'), ButtonStyle.Primary), button('pl:me', t('pn.hub.profile'))),
      ], ui.COLORS.brand);
    }
    case 'scrims': {
      const list = require('./scrim').doc(guild.id).data.filter((x) => x.status === 'open').slice(-8).reverse();
      return card([
        `## ${t('pn.sc.title')}`,
        SEP,
        list.length ? list.map((x) => `**${md(x.title)}** · ${x.players.length}/${x.size * 2} · https://discord.com/channels/${guild.id}/${x.channelId}/${x.messageId}`).join('\n') : t('pn.sc.none'),
        SEP,
        row(button('sc:new', t('pn.sc.new'), ButtonStyle.Success)),
      ], ui.COLORS.brand);
    }
    case 'lfg': {
      const list = require('./party').doc(guild.id).data.filter((x) => x.status === 'open').slice(-8).reverse();
      return card([
        `## ${t('pn.pa.title')}`,
        SEP,
        list.length ? list.map((x) => `**${t('pa.title', { mode: t(`pa.mode.${x.mode}`) })}** · ${x.members.length}/${x.size} · <@${x.hostId}> · https://discord.com/channels/${guild.id}/${x.channelId}/${x.messageId}`).join('\n') : t('pn.pa.none'),
        SEP,
        row(button('pa:new', t('pn.pa.new'), ButtonStyle.Success)),
      ], ui.COLORS.blurple);
    }
    case 'duels': {
      const r = Object.entries(require('./duel').ratingsDoc(guild.id).data).filter(([, x]) => x.wins + x.losses > 0).sort((a, b) => b[1].rating - a[1].rating).slice(0, 5);
      return card([
        `## ${t('pn.du.title')}`,
        `-# ${t('pn.du.text')}`,
        SEP,
        r.length ? r.map(([id, x], i) => `${i + 1}. <@${id}> · **${x.rating}** · ${x.wins}W ${x.losses}L`).join('\n') : t('lb.empty'),
        SEP,
        row(button('du:new', t('pn.du.new'), ButtonStyle.Danger)),
      ], ui.COLORS.brand);
    }
    case 'clubs': {
      const clubs = require('./club').doc(guild.id).data.filter((c) => !c.disbandedAt).slice(0, 8);
      return card([
        `## ${t('pn.cl.title')}`,
        SEP,
        clubs.length ? clubs.map((c) => `**${md(c.name)}** [${md(c.tag)}] · ${c.members.length}`).join('\n') : t('pn.cl.none'),
        SEP,
        row(button('cl:browse', t('pn.cl.browse'), ButtonStyle.Primary)),
      ], ui.COLORS.teal);
    }
    case 'tournament': {
      const tn = require('./tournament').current(guild.id);
      if (!tn) return card([`## ${t('pn.tn.title')}`, SEP, t('pn.tn.none')], ui.COLORS.grey);
      return card([
        `## ${t('pn.tn.title')} · ${md(tn.name)}`,
        `-# ${t(`tn.format.${tn.format}`)} · ${t(`tn.${tn.status}`)} · ${t('tn.teams', { n: tn.teams.length, max: tn.maxTeams, size: tn.teamSize })}`,
        SEP,
        row(button(`tn:signup:${tn.id}`, t('pn.tn.signup'), ButtonStyle.Success, { disabled: tn.status !== 'signup' }), button('tn:open', t('pn.tn.bracket'))),
      ], ui.COLORS.brand);
    }
    case 'admin':
      return adminCard(t, guild);
    default:
      return card(['?']);
  }
}

function adminCard(t, guild) {
  const s = settings.get(guild.id);
  const rolesSet = ranks.ORDER.filter((k) => s.tierRoles[k]).length;
  const panelsSet = Object.values(s.panels).filter(Boolean).length;
  const ok = (v) => t(v ? 'pn.ad.ok' : 'pn.ad.missing');
  return card([
    `## ${t('pn.ad.title')}`,
    SEP,
    [
      `**${t('pn.ad.check.roles')}** · ${rolesSet}/9`,
      `**${t('pn.ad.check.alerts')}** · ${s.notifications.channel ? `<#${s.notifications.channel}>` : ok(false)}`,
      `**${t('pn.ad.check.panels')}** · ${panelsSet}/${TYPES.length}`,
      `**${t('pn.ad.check.lang')}** · ${s.general.language === 'ko' ? '한국어' : 'English'}`,
    ].join('\n'),
    SEP,
    row(button('ad:roles', t('pn.ad.roles'), ButtonStyle.Primary), button('ad:panels', t('pn.ad.post')), ui.dashboardButton(t('common.dashboard'), guild.id)),
  ], ui.COLORS.teal);
}

async function postOrUpdate(guild, type, { force = false } = {}) {
  const s = settings.get(guild.id);
  const channelId = s.panels[type];
  const st = stateDoc(guild.id);
  const cur = st.data[type];
  // Channel removed in settings: delete the old panel message.
  if (!channelId) {
    if (cur) {
      await deleteMessage(guild, cur);
      delete st.data[type];
      st.save();
    }
    return false;
  }
  const payload = ui.v2(panelCard(type, guild));
  const hash = crypto.createHash('sha1').update(JSON.stringify(payload.components.map((c) => c.toJSON())).replace(/<t:\d+:R>/g, '')).digest('hex');
  if (cur && cur.channelId === channelId && !force) {
    if (lastHash.get(`${guild.id}|${type}`) === hash) return false;
    const ch = guild.channels.cache.get(channelId);
    const msg = ch ? await ch.messages.fetch(cur.messageId).catch(() => null) : null;
    if (msg) {
      await msg.edit(payload).catch(() => {});
      lastHash.set(`${guild.id}|${type}`, hash);
      return false;
    }
  }
  if (cur) await deleteMessage(guild, cur);
  const ch = guild.channels.cache.get(channelId);
  if (!ch || !ch.isTextBased()) return false;
  const msg = await ch.send(payload).catch(() => null);
  if (!msg) return false;
  st.data[type] = { channelId, messageId: msg.id, postedAt: new Date().toISOString() };
  st.save();
  lastHash.set(`${guild.id}|${type}`, hash);
  return true;
}

async function deleteMessage(guild, cur) {
  const ch = guild.channels.cache.get(cur.channelId);
  if (!ch) return;
  const msg = await ch.messages.fetch(cur.messageId).catch(() => null);
  if (msg) await msg.delete().catch(() => {});
}

async function refreshAll(client) {
  for (const guild of client.guilds.cache.values()) {
    for (const type of TYPES) await postOrUpdate(guild, type).catch((e) => console.error('[panels]', guild.id, type, e.message));
  }
}

const commands = [
  new SlashCommandBuilder().setName('panel').setDescription('Panels (admins)').setDescriptionLocalizations({ ko: '패널 (관리자)' })
    .addSubcommand((s) => s.setName('post').setDescription('Post a panel here').setDescriptionLocalizations({ ko: '이 채널에 패널 게시' })
      .addStringOption((o) => o.setName('type').setDescription('Panel').setDescriptionLocalizations({ ko: '패널 종류' }).setRequired(true).addChoices(...TYPES.map((x) => ({ name: x, value: x }))))
      .addChannelOption((o) => o.setName('channel').setDescription('Channel (default: here)').setDescriptionLocalizations({ ko: '채널 (기본: 여기)' }).addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))),
  new SlashCommandBuilder().setName('setup').setDescription('Server setup (admins)').setDescriptionLocalizations({ ko: '서버 설정 (관리자)' }),
  new SlashCommandBuilder().setName('hub').setDescription('Open the hub').setDescriptionLocalizations({ ko: '허브 열기' }),
];

const onCommand = {
  async panel(interaction, t) {
    needAdmin(interaction, t);
    const type = interaction.options.getString('type', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await interaction.deferReply({ flags: 64 });
    await settings.update(interaction.guildId, (next) => { next.panels[type] = channel.id; }, interaction.user);
    await postOrUpdate(interaction.guild, type, { force: true });
    return interaction.editReply(ui.notice(t('pn.posted'), 'ok'));
  },
  async setup(interaction, t) {
    needAdmin(interaction, t);
    return interaction.reply(v2(adminCard(t, interaction.guild), { ephemeral: true }));
  },
  async hub(interaction) {
    if (!interaction.guild) throw new UserError('guild only');
    return interaction.reply(v2(panelCard('hub', interaction.guild), { ephemeral: true }));
  },
};

const onButton = {
  'ad:roles': async (interaction, t) => {
    needAdmin(interaction, t);
    const me = interaction.guild.members.me;
    if (!me.permissions.has('ManageRoles')) throw new UserError(t('pn.ad.no_perm'));
    await interaction.deferReply({ flags: 64 });
    const n = await require('../services/roles').createTierRoles(interaction.guild, interaction.user);
    for (const id of players.linkedUserIds()) {
      const m = interaction.guild.members.cache.get(id);
      if (m) await require('../services/roles').syncMember(m, 'link');
    }
    return interaction.editReply(ui.notice(t('pn.ad.roles_done', { n }), 'ok'));
  },
  'ad:panels': async (interaction, t) => {
    needAdmin(interaction, t);
    await interaction.deferReply({ flags: 64 });
    let n = 0;
    for (const type of TYPES) if (await postOrUpdate(interaction.guild, type, { force: true })) n++;
    return interaction.editReply(ui.notice(t('pn.ad.panels_done', { n }), 'ok'));
  },
};

module.exports = { commands, onCommand, onButton, refreshAll, postOrUpdate, panelCard, TYPES, guildPlayers };
