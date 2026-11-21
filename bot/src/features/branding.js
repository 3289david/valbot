'use strict';
/*
 * Per-server bot profile: name (nickname), avatar, banner and bio for this server only.
 * Uses Discord's "modify current member" route through guild.members.editMe().
 */
const { SlashCommandBuilder } = require('discord.js');
const { add } = require('../lib/i18n');
const store = require('../lib/store');
const { UserError, needAdmin, ui } = require('./common');

const { card, v2, md, relTime, SEP } = ui;
const MAX_IMAGE = 8 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

add({
  en: {
    'bp.title': 'Bot profile in this server',
    'bp.name': 'Name', 'bp.bio': 'Bio', 'bp.avatar': 'Image', 'bp.banner': 'Banner',
    'bp.default': 'Default',
    'bp.custom': 'Custom',
    'bp.saved': 'Bot profile updated.',
    'bp.reset': 'Bot profile reset to default.',
    'bp.bad_image': 'Use a PNG, JPG, GIF or WEBP image under 8 MB.',
    'bp.too_long': 'Too long (max {n} characters).',
    'bp.failed': 'Discord refused the change: {msg}',
    'bp.slow': 'Discord limits how often a profile can change. Try again in a few minutes.',
    'bp.updated': 'Last change {time}',
  },
  ko: {
    'bp.title': '이 서버의 봇 프로필',
    'bp.name': '이름', 'bp.bio': '소개', 'bp.avatar': '이미지', 'bp.banner': '배너',
    'bp.default': '기본값',
    'bp.custom': '사용자 지정',
    'bp.saved': '봇 프로필을 바꿨습니다.',
    'bp.reset': '봇 프로필을 기본값으로 되돌렸습니다.',
    'bp.bad_image': 'PNG, JPG, GIF, WEBP 이미지(8MB 이하)만 쓸 수 있습니다.',
    'bp.too_long': '너무 깁니다 (최대 {n}자).',
    'bp.failed': '디스코드가 변경을 거부했습니다: {msg}',
    'bp.slow': '디스코드는 프로필 변경 횟수를 제한합니다. 몇 분 뒤 다시 시도하세요.',
    'bp.updated': '마지막 변경 {time}',
  },
});

const doc = (g) => store.guild(g, 'branding', {});

async function imageFromAttachment(t, att) {
  if (!att) return undefined;
  if (!IMAGE_TYPES.includes((att.contentType || '').split(';')[0]) || att.size > MAX_IMAGE) throw new UserError(t('bp.bad_image'));
  const res = await fetch(att.url);
  if (!res.ok) throw new UserError(t('bp.bad_image'));
  return Buffer.from(await res.arrayBuffer());
}

async function apply(guild, t, changes, actor) {
  try {
    await guild.members.editMe({ ...changes, reason: `Bot profile changed by ${actor.username}` });
  } catch (err) {
    if (err.status === 429 || /rate/i.test(err.message)) throw new UserError(t('bp.slow'));
    throw new UserError(t('bp.failed', { msg: err.message.slice(0, 150) }));
  }
  const d = doc(guild.id);
  for (const [k, v] of Object.entries(changes)) {
    if (k === 'nick' || k === 'bio') d.data[k] = v;
    else d.data[k] = v === null ? null : 'custom';
  }
  d.data.updatedAt = new Date().toISOString();
  d.data.updatedBy = actor.id;
  d.save();
}

function profileCard(t, guild) {
  const me = guild.members.me;
  const d = doc(guild.id).data;
  const avatar = me ? me.displayAvatarURL({ extension: 'png', size: 256 }) : null;
  const banner = me && me.displayBannerURL ? me.displayBannerURL({ extension: 'png', size: 1024 }) : null;
  const parts = [
    { section: [`## ${t('bp.title')}`, `**${t('bp.name')}** ${md(me ? me.displayName : '-')}${d.nick ? '' : ` (${t('bp.default')})`}`, `**${t('bp.bio')}** ${d.bio ? md(d.bio) : t('bp.default')}`], thumb: avatar || undefined },
    banner ? { gallery: [banner] } : null,
    d.updatedAt ? `-# ${t('bp.updated', { time: relTime(d.updatedAt) })}` : null,
    ui.dashboardButton(t('common.dashboard'), guild.id) ? ui.row(ui.dashboardButton(t('common.dashboard'), guild.id)) : null,
  ];
  return card(parts, ui.COLORS.brand);
}

const commands = [
  new SlashCommandBuilder().setName('botprofile').setDescription('Bot name and image in this server (admins)').setDescriptionLocalizations({ ko: '이 서버의 봇 이름·이미지 (관리자)' })
    .addSubcommand((s) => s.setName('show').setDescription('Show the current profile').setDescriptionLocalizations({ ko: '현재 프로필 보기' }))
    .addSubcommand((s) => s.setName('set').setDescription('Change name, image, banner or bio').setDescriptionLocalizations({ ko: '이름, 이미지, 배너, 소개 바꾸기' })
      .addStringOption((o) => o.setName('name').setDescription('Name in this server').setDescriptionLocalizations({ ko: '이 서버에서 쓸 이름' }).setMaxLength(32))
      .addAttachmentOption((o) => o.setName('image').setDescription('Profile image (PNG/JPG/GIF/WEBP)').setDescriptionLocalizations({ ko: '프로필 이미지' }))
      .addAttachmentOption((o) => o.setName('banner').setDescription('Banner image').setDescriptionLocalizations({ ko: '배너 이미지' }))
      .addStringOption((o) => o.setName('bio').setDescription('About me (max 190)').setDescriptionLocalizations({ ko: '소개 (최대 190자)' }).setMaxLength(190)))
    .addSubcommand((s) => s.setName('reset').setDescription('Back to the default profile').setDescriptionLocalizations({ ko: '기본 프로필로 되돌리기' })
      .addStringOption((o) => o.setName('what').setDescription('What to reset').setDescriptionLocalizations({ ko: '되돌릴 항목' })
        .addChoices({ name: 'All', value: 'all' }, { name: 'Name', value: 'nick' }, { name: 'Image', value: 'avatar' }, { name: 'Banner', value: 'banner' }, { name: 'Bio', value: 'bio' }))),
];

const onCommand = {
  async botprofile(interaction, t) {
    needAdmin(interaction, t);
    const sub = interaction.options.getSubcommand();
    if (sub === 'show') return interaction.reply(v2(profileCard(t, interaction.guild), { ephemeral: true }));
    await interaction.deferReply({ flags: 64 });
    if (sub === 'set') {
      const changes = {};
      const name = interaction.options.getString('name');
      const bio = interaction.options.getString('bio');
      if (name !== null) changes.nick = name.trim() || null;
      if (bio !== null) changes.bio = bio.trim() || null;
      const avatar = await imageFromAttachment(t, interaction.options.getAttachment('image'));
      const banner = await imageFromAttachment(t, interaction.options.getAttachment('banner'));
      if (avatar) changes.avatar = avatar;
      if (banner) changes.banner = banner;
      if (!Object.keys(changes).length) return interaction.editReply(v2(profileCard(t, interaction.guild)));
      await apply(interaction.guild, t, changes, interaction.user);
      return interaction.editReply(v2([card([t('bp.saved')], ui.COLORS.good), profileCard(t, interaction.guild)]));
    }
    const what = interaction.options.getString('what') || 'all';
    const changes = what === 'all' ? { nick: null, avatar: null, banner: null, bio: null } : { [what]: null };
    await apply(interaction.guild, t, changes, interaction.user);
    return interaction.editReply(v2([card([t('bp.reset')], ui.COLORS.good), profileCard(t, interaction.guild)]));
  },
};

module.exports = { commands, onCommand, profileCard, SEP };
