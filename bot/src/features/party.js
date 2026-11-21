'use strict';
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { add, tr } = require('../lib/i18n');
const ranks = require('../lib/ranks');
const store = require('../lib/store');
const notify = require('../services/notify');
const { UserError, needFeature, isMod, ui, players } = require('./common');

const { card, v2, row, button, select, ButtonStyle, md, relTime, SEP } = ui;

const MODES = ['competitive', 'unrated', 'swiftplay', 'spikerush', 'deathmatch', 'premier', 'custom'];

add({
  en: {
    'pa.mode.competitive': 'Competitive', 'pa.mode.unrated': 'Unrated', 'pa.mode.swiftplay': 'Swiftplay', 'pa.mode.spikerush': 'Spike Rush', 'pa.mode.deathmatch': 'Deathmatch', 'pa.mode.premier': 'Premier', 'pa.mode.custom': 'Custom',
    'pa.title': '{mode} party',
    'pa.open': 'Looking for {n} more', 'pa.full': 'Full', 'pa.closed': 'Closed', 'pa.expired': 'Expired',
    'pa.tier': 'Tier', 'pa.any': 'Any', 'pa.mic': 'Mic', 'pa.mic_yes': 'Required', 'pa.mic_no': 'Optional',
    'pa.ends': 'Closes {time}',
    'pa.fits': 'in range', 'pa.outside': 'outside range',
    'pa.join': 'Join', 'pa.leave': 'Leave', 'pa.close': 'Close', 'pa.voice': 'Voice room',
    'pa.already': 'You are already in this party.',
    'pa.in_other': 'You are already in another open party.',
    'pa.is_full': 'This party is full.',
    'pa.not_open': 'This party is closed.',
    'pa.host_only': 'Only the host or a moderator can do that.',
    'pa.not_in': 'You are not in this party.',
    'pa.voice_fail': 'Could not create a voice room (missing permission).',
    'pa.none': 'No open parties.',
    'pa.cfg.title': 'New party',
    'pa.cfg.mode': 'Mode', 'pa.cfg.size': 'Party size', 'pa.cfg.min': 'Lowest tier', 'pa.cfg.max': 'Highest tier', 'pa.cfg.mic': 'Mic',
    'pa.cfg.post': 'Post party',
    'pa.host_tag': 'host',
    'pa.new': 'New party: {title}',
  },
  ko: {
    'pa.mode.competitive': '경쟁전', 'pa.mode.unrated': '일반전', 'pa.mode.swiftplay': '신속 플레이', 'pa.mode.spikerush': '스파이크 돌격', 'pa.mode.deathmatch': '데스매치', 'pa.mode.premier': '프리미어', 'pa.mode.custom': '사용자 설정',
    'pa.title': '{mode} 파티',
    'pa.open': '{n}명 더 모집', 'pa.full': '모집 완료', 'pa.closed': '마감', 'pa.expired': '시간 만료',
    'pa.tier': '티어', 'pa.any': '제한 없음', 'pa.mic': '마이크', 'pa.mic_yes': '필수', 'pa.mic_no': '선택',
    'pa.ends': '{time} 마감',
    'pa.fits': '범위 안', 'pa.outside': '범위 밖',
    'pa.join': '참가', 'pa.leave': '나가기', 'pa.close': '마감', 'pa.voice': '음성 채널',
    'pa.already': '이미 참가한 파티입니다.',
    'pa.in_other': '이미 다른 파티에 참가 중입니다.',
    'pa.is_full': '인원이 다 찼습니다.',
    'pa.not_open': '마감된 파티입니다.',
    'pa.host_only': '파티장이나 운영진만 할 수 있습니다.',
    'pa.not_in': '이 파티에 참가하지 않았습니다.',
    'pa.voice_fail': '음성 채널을 만들 권한이 없습니다.',
    'pa.none': '모집 중인 파티가 없습니다.',
    'pa.cfg.title': '새 파티',
    'pa.cfg.mode': '모드', 'pa.cfg.size': '인원', 'pa.cfg.min': '최저 티어', 'pa.cfg.max': '최고 티어', 'pa.cfg.mic': '마이크',
    'pa.cfg.post': '파티 올리기',
    'pa.host_tag': '파티장',
    'pa.new': '새 파티: {title}',
  },
});

const doc = (guildId) => store.guild(guildId, 'parties', []);
const find = (guildId, id) => doc(guildId).data.find((p) => p.id === id);

function fits(party, userId) {
  if (!party.tierMin && !party.tierMax) return null;
  const p = players.playerOf(userId);
  const k = ranks.tierKey(p && p.current && p.current.tier);
  if (k === null) return false;
  const i = ranks.tierIndex(k);
  return (!party.tierMin || i >= ranks.tierIndex(party.tierMin)) && (!party.tierMax || i <= ranks.tierIndex(party.tierMax));
}

function partyCard(t, pa) {
  const left = pa.size - pa.members.length;
  const status = pa.status === 'open' ? t('pa.open', { n: left }) : t(`pa.${pa.status}`);
  const tierText = pa.tierMin || pa.tierMax ? `${pa.tierMin ? ranks.NAMES[pa.tierMin] : '…'} ~ ${pa.tierMax ? ranks.NAMES[pa.tierMax] : '…'}` : t('pa.any');
  const memberLines = pa.members.map((id) => {
    const p = players.playerOf(id);
    const f = fits(pa, id);
    return `<@${id}>${id === pa.hostId ? ` (${t('pa.host_tag')})` : ''} · ${p && p.current && p.current.tier ? md(p.current.tier) : '-'}${f === null ? '' : ` · ${t(f ? 'pa.fits' : 'pa.outside')}`}`;
  });
  const parts = [
    `## ${t('pa.title', { mode: t(`pa.mode.${pa.mode}`) })}`,
    `-# ${status} · ${pa.members.length}/${pa.size}${pa.status === 'open' && pa.expiresAt ? ` · ${t('pa.ends', { time: relTime(pa.expiresAt) })}` : ''}`,
    SEP,
    `**${t('pa.tier')}** ${tierText} · **${t('pa.mic')}** ${t(pa.mic ? 'pa.mic_yes' : 'pa.mic_no')}${pa.region ? ` · **${pa.region.toUpperCase()}**` : ''}`,
    pa.note ? `> ${md(pa.note)}` : null,
    SEP,
    memberLines.join('\n'),
  ];
  if (pa.status === 'open' || pa.status === 'full') {
    parts.push(row(
      button(`pa:join:${pa.id}`, t('pa.join'), ButtonStyle.Success, { disabled: pa.status !== 'open' }),
      button(`pa:leave:${pa.id}`, t('pa.leave')),
      button(`pa:voice:${pa.id}`, t('pa.voice'), ButtonStyle.Secondary, { disabled: Boolean(pa.voiceId) }),
      button(`pa:close:${pa.id}`, t('pa.close'), ButtonStyle.Danger),
    ));
  }
  return card(parts, pa.status === 'open' ? ui.COLORS.blurple : ui.COLORS.grey);
}

async function refresh(client, pa) {
  try {
    const ch = await client.channels.fetch(pa.channelId);
    const msg = await ch.messages.fetch(pa.messageId);
    await msg.edit(ui.v2(partyCard(tr(pa.guildId), pa)));
  } catch (e) { /* gone */ }
}

function openPartyOf(guildId, userId) {
  return doc(guildId).data.find((p) => ['open', 'full'].includes(p.status) && p.members.includes(userId));
}

async function create(interaction, t, o) {
  needFeature(interaction, t, 'parties');
  if (openPartyOf(interaction.guildId, interaction.user.id)) throw new UserError(t('pa.in_other'));
  const pa = {
    id: store.newId('pa'),
    guildId: interaction.guildId,
    hostId: interaction.user.id,
    mode: MODES.includes(o.mode) ? o.mode : 'competitive',
    size: o.size || 5,
    tierMin: o.tierMin || null,
    tierMax: o.tierMax || null,
    mic: Boolean(o.mic),
    region: o.region || null,
    note: o.note ? o.note.slice(0, 200) : null,
    members: [interaction.user.id],
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (o.minutes || 60) * 60_000).toISOString(),
    voiceId: null,
  };
  const msg = await interaction.channel.send(ui.v2(partyCard(t.guild || t, pa)));
  pa.channelId = interaction.channel.id;
  pa.messageId = msg.id;
  const d = doc(interaction.guildId);
  d.data.push(pa);
  if (d.data.length > 500) d.data.splice(0, d.data.length - 500);
  d.save();
  const tg = t.guild || t;
  notify.send(interaction.guild, 'events', card([tg('pa.new', { title: tg('pa.title', { mode: tg(`pa.mode.${pa.mode}`) }) }), `https://discord.com/channels/${pa.guildId}/${pa.channelId}/${pa.messageId}`], ui.COLORS.blurple));
  return pa;
}

async function closeParty(guild, pa, status) {
  pa.status = status;
  pa.closedAt = new Date().toISOString();
  if (pa.voiceId) {
    const ch = guild.channels.cache.get(pa.voiceId);
    if (ch && ch.members && ch.members.size === 0) await ch.delete('Party closed').catch(() => {});
  }
}

/** Every minute: expire old parties, remove empty voice rooms of closed parties. */
async function tick(client) {
  for (const guild of client.guilds.cache.values()) {
    const d = doc(guild.id);
    let dirty = false;
    for (const pa of d.data.filter((p) => ['open', 'full'].includes(p.status))) {
      if (pa.expiresAt && Date.parse(pa.expiresAt) < Date.now()) {
        await closeParty(guild, pa, 'expired');
        dirty = true;
        await refresh(client, pa);
      }
    }
    if (dirty) d.save();
  }
}

const tierChoices = ranks.ORDER.map((x) => ({ name: ranks.NAMES[x], value: x }));

const commands = [
  new SlashCommandBuilder().setName('party').setDescription('Party Finder').setDescriptionLocalizations({ ko: '파티 모집' })
    .addSubcommand((s) => s.setName('create').setDescription('Post a party').setDescriptionLocalizations({ ko: '파티 모집 글 올리기' })
      .addStringOption((o) => o.setName('mode').setDescription('Mode').setDescriptionLocalizations({ ko: '모드' }).setRequired(true).addChoices(...MODES.map((m) => ({ name: m, value: m }))))
      .addIntegerOption((o) => o.setName('size').setDescription('Party size').setDescriptionLocalizations({ ko: '인원' }).setMinValue(2).setMaxValue(10))
      .addStringOption((o) => o.setName('min_tier').setDescription('Lowest tier').setDescriptionLocalizations({ ko: '최저 티어' }).addChoices(...tierChoices))
      .addStringOption((o) => o.setName('max_tier').setDescription('Highest tier').setDescriptionLocalizations({ ko: '최고 티어' }).addChoices(...tierChoices))
      .addBooleanOption((o) => o.setName('mic').setDescription('Mic required').setDescriptionLocalizations({ ko: '마이크 필수' }))
      .addStringOption((o) => o.setName('note').setDescription('Note').setDescriptionLocalizations({ ko: '메모' }).setMaxLength(200))
      .addIntegerOption((o) => o.setName('minutes').setDescription('Open for (minutes)').setDescriptionLocalizations({ ko: '모집 시간 (분)' }).setMinValue(5).setMaxValue(720)))
    .addSubcommand((s) => s.setName('list').setDescription('Open parties').setDescriptionLocalizations({ ko: '모집 중인 파티' }))
    .addSubcommand((s) => s.setName('close').setDescription('Close your party').setDescriptionLocalizations({ ko: '내 파티 마감' })),
];

const onCommand = {
  async party(interaction, t) {
    needFeature(interaction, t, 'parties');
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') {
      await interaction.deferReply({ flags: 64 });
      const s = require('../lib/settings').get(interaction.guildId);
      await create(interaction, t, {
        mode: interaction.options.getString('mode', true),
        size: interaction.options.getInteger('size') || 5,
        tierMin: interaction.options.getString('min_tier'),
        tierMax: interaction.options.getString('max_tier'),
        mic: interaction.options.getBoolean('mic'),
        note: interaction.options.getString('note'),
        minutes: interaction.options.getInteger('minutes') || 60,
        region: s.general.region,
      });
      return interaction.editReply(ui.notice(t('common.done'), 'ok'));
    }
    if (sub === 'list') {
      const list = doc(interaction.guildId).data.filter((p) => p.status === 'open').slice(-15).reverse();
      if (!list.length) return interaction.reply(ui.notice(t('pa.none'), 'info', { ephemeral: true }));
      return interaction.reply(v2(card([list.map((p) => `**${t('pa.title', { mode: t(`pa.mode.${p.mode}`) })}** · ${p.members.length}/${p.size} · <@${p.hostId}> · https://discord.com/channels/${p.guildId}/${p.channelId}/${p.messageId}`).join('\n')], ui.COLORS.blurple), { ephemeral: true }));
    }
    if (sub === 'close') {
      const pa = doc(interaction.guildId).data.find((p) => ['open', 'full'].includes(p.status) && p.hostId === interaction.user.id);
      if (!pa) throw new UserError(t('pa.none'));
      await closeParty(interaction.guild, pa, 'closed');
      doc(interaction.guildId).save();
      await refresh(interaction.client, pa);
      return interaction.reply(ui.notice(t('common.done'), 'ok', { ephemeral: true }));
    }
    return null;
  },
};

/* Panel flow */
const drafts = new Map();
function cfgCard(t, d) {
  const tierOpts = (sel) => [{ label: t('pa.any'), value: 'any', default: !sel }].concat(ranks.ORDER.map((x) => ({ label: ranks.NAMES[x], value: x, default: x === sel })));
  return card([
    `## ${t('pa.cfg.title')}`,
    row(select('pa:cfg:mode', t('pa.cfg.mode'), MODES.map((m) => ({ label: t(`pa.mode.${m}`), value: m, default: m === d.mode })))),
    row(select('pa:cfg:size', t('pa.cfg.size'), [2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n), default: n === d.size })))),
    row(select('pa:cfg:min', t('pa.cfg.min'), tierOpts(d.tierMin))),
    row(select('pa:cfg:max', t('pa.cfg.max'), tierOpts(d.tierMax))),
    row(button('pa:cfgmic', `${t('pa.cfg.mic')}: ${t(d.mic ? 'pa.mic_yes' : 'pa.mic_no')}`), button('pa:post', t('pa.cfg.post'), ButtonStyle.Success)),
  ], ui.COLORS.blurple);
}
const draft = (id) => drafts.get(id) || { mode: 'competitive', size: 5, tierMin: null, tierMax: null, mic: false };

const onButton = {
  'pa:new': async (interaction, t) => {
    needFeature(interaction, t, 'parties');
    const d = draft(interaction.user.id);
    drafts.set(interaction.user.id, d);
    return interaction.reply(v2(cfgCard(t, d), { ephemeral: true }));
  },
  'pa:cfgmic': async (interaction, t) => {
    const d = draft(interaction.user.id);
    d.mic = !d.mic;
    drafts.set(interaction.user.id, d);
    return interaction.update(v2(cfgCard(t, d)));
  },
  'pa:post': async (interaction, t) => {
    const d = draft(interaction.user.id);
    drafts.delete(interaction.user.id);
    await interaction.deferUpdate();
    await create(interaction, t, { ...d, region: require('../lib/settings').get(interaction.guildId).general.region, minutes: 60 });
    return interaction.editReply(ui.notice(t('common.done'), 'ok'));
  },
  'pa:join': async (interaction, t, [id]) => {
    const pa = find(interaction.guildId, id);
    if (!pa || pa.status !== 'open') throw new UserError(t('pa.not_open'));
    if (pa.members.includes(interaction.user.id)) throw new UserError(t('pa.already'));
    if (openPartyOf(interaction.guildId, interaction.user.id)) throw new UserError(t('pa.in_other'));
    pa.members.push(interaction.user.id);
    if (pa.members.length >= pa.size) { pa.status = 'full'; pa.filledAt = new Date().toISOString(); }
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(partyCard(t, pa)));
  },
  'pa:leave': async (interaction, t, [id]) => {
    const pa = find(interaction.guildId, id);
    if (!pa || !['open', 'full'].includes(pa.status)) throw new UserError(t('pa.not_open'));
    if (!pa.members.includes(interaction.user.id)) throw new UserError(t('pa.not_in'));
    pa.members = pa.members.filter((m) => m !== interaction.user.id);
    if (!pa.members.length) await closeParty(interaction.guild, pa, 'closed');
    else {
      if (pa.hostId === interaction.user.id) pa.hostId = pa.members[0];
      if (pa.status === 'full') pa.status = 'open';
    }
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(partyCard(t, pa)));
  },
  'pa:close': async (interaction, t, [id]) => {
    const pa = find(interaction.guildId, id);
    if (!pa || !['open', 'full'].includes(pa.status)) throw new UserError(t('pa.not_open'));
    if (pa.hostId !== interaction.user.id && !isMod(interaction.member)) throw new UserError(t('pa.host_only'));
    await closeParty(interaction.guild, pa, 'closed');
    doc(interaction.guildId).save();
    return interaction.update(ui.v2(partyCard(t, pa)));
  },
  'pa:voice': async (interaction, t, [id]) => {
    const pa = find(interaction.guildId, id);
    if (!pa || !['open', 'full'].includes(pa.status)) throw new UserError(t('pa.not_open'));
    if (pa.hostId !== interaction.user.id && !isMod(interaction.member)) throw new UserError(t('pa.host_only'));
    try {
      const ch = await interaction.guild.channels.create({
        name: t('pa.title', { mode: t(`pa.mode.${pa.mode}`) }).slice(0, 90),
        type: ChannelType.GuildVoice,
        parent: interaction.channel && interaction.channel.parentId ? interaction.channel.parentId : null,
        userLimit: pa.size,
        reason: 'Party voice',
      });
      pa.voiceId = ch.id;
      doc(interaction.guildId).save();
    } catch (e) {
      throw new UserError(t('pa.voice_fail'));
    }
    return interaction.update(ui.v2(partyCard(t, pa)));
  },
};

const onSelect = {
  'pa:cfg': async (interaction, t, [field]) => {
    const d = draft(interaction.user.id);
    const v = interaction.values[0];
    if (field === 'mode') d.mode = v;
    if (field === 'size') d.size = Number(v) || 5;
    if (field === 'min') d.tierMin = v === 'any' ? null : v;
    if (field === 'max') d.tierMax = v === 'any' ? null : v;
    drafts.set(interaction.user.id, d);
    return interaction.update(v2(cfgCard(t, d)));
  },
};

module.exports = { commands, onCommand, onButton, onSelect, tick, doc, partyCard, cfgCard };
