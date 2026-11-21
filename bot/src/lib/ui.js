'use strict';
/* Components V2 helpers. Every bot message is a Container-based layout sent with IS_COMPONENTS_V2. */
const {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, SectionBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MediaGalleryBuilder,
  MessageFlags,
} = require('discord.js');
const { dashboardUrl } = require('../config');

const COLORS = { brand: 0xff4d5a, teal: 0x2fe0c4, blurple: 0x5865f2, good: 0x34d399, warn: 0xfbbf24, bad: 0xf87171, grey: 0x4e5058 };

const MAX_TEXT = 3800;
const clip = (s, n = MAX_TEXT) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Escape user/API text for Discord markdown. */
const md = (s) => String(s ?? '').replace(/([\\*_`~|>#\[\]()-])/g, '\\$1');

function text(content) { return new TextDisplayBuilder().setContent(clip(content)); }
function sep(divider = true, large = false) {
  return new SeparatorBuilder().setDivider(divider).setSpacing(large ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small);
}

function button(customId, label, style = ButtonStyle.Secondary, opts = {}) {
  const b = new ButtonBuilder().setLabel(label.slice(0, 80)).setStyle(style);
  if (style === ButtonStyle.Link) b.setURL(customId); else b.setCustomId(customId);
  if (opts.disabled) b.setDisabled(true);
  if (opts.emoji) b.setEmoji(opts.emoji);
  return b;
}
function row(...components) { return new ActionRowBuilder().addComponents(components.flat().filter(Boolean).slice(0, 5)); }

function select(customId, placeholder, options, { min = 1, max = 1, disabled = false } = {}) {
  const s = new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder.slice(0, 150)).setMinValues(min).setMaxValues(Math.min(max, Math.max(1, options.length)));
  s.addOptions(options.slice(0, 25).map((o) => ({ label: String(o.label).slice(0, 100), value: String(o.value).slice(0, 100), description: o.description ? String(o.description).slice(0, 100) : undefined, default: Boolean(o.default) })));
  if (disabled) s.setDisabled(true);
  return s;
}

/**
 * Build a container from a list of parts:
 *  string -> text display, 'sep' -> divider, { section, thumb?, button? } -> section,
 *  ActionRowBuilder -> row, { gallery: [urls] } -> media gallery
 */
function card(parts, accent = COLORS.brand) {
  const c = new ContainerBuilder().setAccentColor(accent);
  for (const p of parts.filter((x) => x !== null && x !== undefined && x !== false)) {
    if (p === SEP || p === 'sep') c.addSeparatorComponents(sep());
    else if (typeof p === 'string') c.addTextDisplayComponents(text(p));
    else if (p instanceof ActionRowBuilder) c.addActionRowComponents(p);
    else if (p.gallery) c.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(p.gallery.slice(0, 10).map((url) => ({ media: { url } }))));
    else if (p.section) {
      const s = new SectionBuilder().addTextDisplayComponents(...[].concat(p.section).slice(0, 3).map((x) => text(x)));
      if (p.thumb) s.setThumbnailAccessory((th) => th.setURL(p.thumb));
      else if (p.button) s.setButtonAccessory(p.button);
      else s.setButtonAccessory(button(`noop:${Math.random().toString(36).slice(2, 8)}`, '​', ButtonStyle.Secondary, { disabled: true }));
      c.addSectionComponents(s);
    }
  }
  return c;
}
const SEP = Symbol('sep');

/** Message payload for a V2 message. */
function v2(containers, { ephemeral = false, files } = {}) {
  let flags = MessageFlags.IsComponentsV2;
  if (ephemeral) flags |= MessageFlags.Ephemeral;
  const payload = { components: [].concat(containers), flags, allowedMentions: { parse: [] } };
  if (files) payload.files = files;
  return payload;
}

/** Plain notice card */
function notice(message, kind = 'info', opts = {}) {
  const accent = kind === 'error' ? COLORS.bad : kind === 'ok' ? COLORS.good : kind === 'warn' ? COLORS.warn : COLORS.teal;
  return v2(card([message], accent), opts);
}

/** Link to a page on the website, or null when no website URL is configured. */
function webButton(label, pathname) {
  if (!dashboardUrl) return null;
  return button(`${dashboardUrl}${pathname}`, label, ButtonStyle.Link);
}
const playerPath = (p) => `/p/${encodeURIComponent(p.region || 'ap')}/${encodeURIComponent(p.name)}/${encodeURIComponent(p.tag)}`;

function dashboardButton(label, guildId) {
  if (!dashboardUrl) return null;
  return button(`${dashboardUrl}/dashboard.html${guildId ? `#/g/${guildId}/overview` : ''}`, label, ButtonStyle.Link);
}

/** Reply or follow up depending on interaction state */
async function respond(interaction, payload) {
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(payload).catch(() => interaction.followUp(payload));
  }
  return interaction.reply(payload);
}

function relTime(iso) {
  if (!iso) return null;
  const s = Math.floor(Date.parse(iso) / 1000);
  return Number.isFinite(s) ? `<t:${s}:R>` : null;
}
function absTime(iso, style = 'f') {
  if (!iso) return null;
  const s = Math.floor(Date.parse(iso) / 1000);
  return Number.isFinite(s) ? `<t:${s}:${style}>` : null;
}

module.exports = { COLORS, md, text, sep, button, row, select, card, v2, notice, respond, dashboardButton, webButton, playerPath, relTime, absTime, ButtonStyle, SEP, clip };
