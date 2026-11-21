'use strict';
const { SlashCommandBuilder } = require('discord.js');
const { add } = require('../lib/i18n');
const henrik = require('../lib/henrik');
const premium = require('../lib/premium');
const ranks = require('../lib/ranks');
const { dashboardUrl } = require('../config');
const { needAdmin, ui, players, settings } = require('./common');

const { card, v2, row, button, ButtonStyle, SEP } = ui;
const started = Date.now();

add({
  en: {
    'ut.help.title': 'Valorant Hub',
    'ut.help.start': '**Start:** /register Name#TAG',
    'ut.help.player': '**Player:** /profile /rank /stats /matches /agents /maps /history /compare /analysis',
    'ut.help.rank': '**Ranking:** /leaderboard /myrank /mvp /season',
    'ut.help.play': '**Play:** /scrim /party /duel /club /tournament',
    'ut.help.admin': '**Admin:** /setup /panel post /settings /botprofile',
    'ut.help.privacy': '**Privacy:** /privacy · /unregister · **Language:** /language',
    'ut.docs': 'Guide',
    'ut.status.title': 'Status',
    'ut.status.ping': 'Ping', 'ut.status.uptime': 'Uptime', 'ut.status.servers': 'Servers', 'ut.status.players': 'Linked players',
    'ut.status.data': 'Stats updates', 'ut.status.ok': 'Working', 'ut.status.slow': 'Delayed', 'ut.status.off': 'Off',
    'ut.status.plan': 'Plan',
    'ut.plan.premium': 'Premium (free for everyone right now)',
    'ut.plan.free': 'Free',
    'ut.set.title': 'Settings',
    'ut.set.lang': 'Language', 'ut.set.region': 'Region', 'ut.set.tz': 'Time zone', 'ut.set.rank': 'Default leaderboard',
    'ut.set.features': 'Features', 'ut.set.alerts': 'Alerts', 'ut.set.roles': 'Tier roles',
    'ut.set.edit': 'Change these in the dashboard.',
    'ut.on': 'on', 'ut.off': 'off',
    'ut.lang.ko': 'Bot replies to you in Korean now.',
    'ut.lang.en': 'Bot replies to you in English now.',
    'ut.lang.auto': 'Bot replies follow your Discord language (or the server setting).',
  },
  ko: {
    'ut.help.title': 'Valorant Hub',
    'ut.help.start': '**시작:** /register 이름#태그',
    'ut.help.player': '**전적:** /profile /rank /stats /matches /agents /maps /history /compare /analysis',
    'ut.help.rank': '**랭킹:** /leaderboard /myrank /mvp /season',
    'ut.help.play': '**플레이:** /scrim /party /duel /club /tournament',
    'ut.help.admin': '**관리:** /setup /panel post /settings /botprofile',
    'ut.help.privacy': '**개인정보:** /privacy · /unregister · **언어:** /language',
    'ut.docs': '가이드',
    'ut.status.title': '상태',
    'ut.status.ping': '핑', 'ut.status.uptime': '가동 시간', 'ut.status.servers': '서버', 'ut.status.players': '연결된 플레이어',
    'ut.status.data': '전적 갱신', 'ut.status.ok': '정상', 'ut.status.slow': '지연', 'ut.status.off': '꺼짐',
    'ut.status.plan': '요금제',
    'ut.plan.premium': 'Premium (현재 모두 무료)',
    'ut.plan.free': 'Free',
    'ut.set.title': '설정',
    'ut.set.lang': '언어', 'ut.set.region': '지역', 'ut.set.tz': '시간대', 'ut.set.rank': '기본 랭킹',
    'ut.set.features': '기능', 'ut.set.alerts': '알림', 'ut.set.roles': '티어 역할',
    'ut.set.edit': '대시보드에서 바꿀 수 있습니다.',
    'ut.on': '켜짐', 'ut.off': '꺼짐',
    'ut.lang.ko': '이제 봇이 한국어로 답합니다.',
    'ut.lang.en': '이제 봇이 영어로 답합니다.',
    'ut.lang.auto': '봇 답변이 디스코드 언어(또는 서버 설정)를 따릅니다.',
  },
});

function helpCard(t, guildId) {
  const links = [];
  if (dashboardUrl) {
    links.push(button(`${dashboardUrl}/docs.html`, t('ut.docs'), ButtonStyle.Link));
    links.push(ui.dashboardButton(t('common.dashboard'), guildId));
  }
  return card([
    `## ${t('ut.help.title')}`,
    SEP,
    [t('ut.help.start'), t('ut.help.player'), t('ut.help.rank'), t('ut.help.play'), t('ut.help.privacy'), t('ut.help.admin')].join('\n'),
    links.length ? row(links) : null,
  ], ui.COLORS.brand);
}

function uptime(ms) {
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440); const h = Math.floor((m % 1440) / 60);
  return d ? `${d}d ${h}h` : `${h}h ${m % 60}m`;
}

const commands = [
  new SlashCommandBuilder().setName('help').setDescription('How to use the bot').setDescriptionLocalizations({ ko: '사용법' }),
  new SlashCommandBuilder().setName('status').setDescription('Bot status').setDescriptionLocalizations({ ko: '봇 상태' }),
  new SlashCommandBuilder().setName('language').setDescription('Your bot language').setDescriptionLocalizations({ ko: '내 봇 언어' })
    .addStringOption((o) => o.setName('language').setDescription('Language').setDescriptionLocalizations({ ko: '언어' }).setRequired(true)
      .addChoices({ name: '한국어', value: 'ko' }, { name: 'English', value: 'en' }, { name: 'Auto / 자동', value: 'auto' })),
  new SlashCommandBuilder().setName('settings').setDescription('Server settings (admins)').setDescriptionLocalizations({ ko: '서버 설정 (관리자)' }),
];

const onCommand = {
  help: (i, t) => i.reply(v2(helpCard(t, i.guildId), { ephemeral: true })),
  async language(interaction) {
    const v = interaction.options.getString('language', true);
    players.setLang(interaction.user.id, v);
    const t2 = require('../lib/i18n').tr(interaction);
    return interaction.reply(ui.notice(t2(`ut.lang.${v === 'auto' ? 'auto' : v}`), 'ok', { ephemeral: true }));
  },
  async status(interaction, t) {
    const st = henrik.stats;
    const recentErr = st.lastErrorAt && Date.now() - Date.parse(st.lastErrorAt) < 10 * 60_000 && (!st.lastOkAt || Date.parse(st.lastErrorAt) > Date.parse(st.lastOkAt));
    const data = !require('../config').henrikKey ? t('ut.status.off') : recentErr || henrik.queueLength() > 50 ? t('ut.status.slow') : t('ut.status.ok');
    const planKey = premium.plan(interaction.guildId) === 'premium' ? 'ut.plan.premium' : 'ut.plan.free';
    return interaction.reply(v2(card([
      `## ${t('ut.status.title')}`,
      SEP,
      [
        `**${t('ut.status.ping')}** ${Math.round(interaction.client.ws.ping)}ms`,
        `**${t('ut.status.uptime')}** ${uptime(Date.now() - started)}`,
        `**${t('ut.status.servers')}** ${interaction.client.guilds.cache.size}`,
        `**${t('ut.status.players')}** ${players.linkedUserIds().length}`,
        `**${t('ut.status.data')}** ${data}`,
        `**${t('ut.status.plan')}** ${t(planKey)}`,
      ].join('\n'),
    ], ui.COLORS.teal), { ephemeral: true }));
  },
  async settings(interaction, t) {
    needAdmin(interaction, t);
    const s = settings.get(interaction.guildId);
    const on = (v) => t(v ? 'ut.on' : 'ut.off');
    const feats = Object.entries(s.features).map(([k, v]) => `${k} ${on(v)}`).join(' · ');
    return interaction.reply(v2(card([
      `## ${t('ut.set.title')}`,
      SEP,
      [
        `**${t('ut.set.lang')}** ${s.general.language === 'ko' ? '한국어' : s.general.language === 'en' ? 'English' : 'Auto'} · **${t('ut.set.region')}** ${s.general.region.toUpperCase()} · **${t('ut.set.tz')}** ${s.general.timezone}`,
        `**${t('ut.set.rank')}** ${t(`lb.type.${s.general.defaultRanking}`)}`,
        `**${t('ut.set.features')}** ${feats}`,
        `**${t('ut.set.alerts')}** ${s.notifications.channel ? `<#${s.notifications.channel}>` : '-'}`,
        `**${t('ut.set.roles')}** ${ranks.ORDER.filter((k) => s.tierRoles[k]).length}/9`,
      ].join('\n'),
      `-# ${t('ut.set.edit')}`,
      ui.dashboardButton(t('common.dashboard'), interaction.guildId) ? row(ui.dashboardButton(t('common.dashboard'), interaction.guildId)) : null,
    ], ui.COLORS.teal), { ephemeral: true }));
  },
};

const onButton = {
  'ut:help': (i, t) => i.reply(v2(helpCard(t, i.guildId), { ephemeral: true })),
};

module.exports = { commands, onCommand, onButton, helpCard };
