'use strict';
const { PermissionFlagsBits } = require('discord.js');
const settings = require('../lib/settings');
const players = require('../services/players');
const ui = require('../lib/ui');
const { tr } = require('../lib/i18n');

class UserError extends Error {}

function errorText(t, err) {
  if (err instanceof UserError) return err.message;
  if (err && err.code && ['not_found', 'rate_limited', 'api_error', 'no_key', 'network'].includes(err.code)) return t(`err.${err.code}`);
  console.error(err);
  return t('common.error', { msg: err && err.message ? err.message.slice(0, 150) : 'unknown' });
}

const isAdmin = (member) => Boolean(member && member.permissions && member.permissions.has(PermissionFlagsBits.ManageGuild));
const isMod = (member) => Boolean(member && member.permissions && (member.permissions.has(PermissionFlagsBits.ManageGuild) || member.permissions.has(PermissionFlagsBits.ManageMessages)));

function needGuild(interaction, t) { if (!interaction.guildId) throw new UserError(t('common.guild_only')); }
function needFeature(interaction, t, feature) {
  needGuild(interaction, t);
  if (!settings.get(interaction.guildId).features[feature]) throw new UserError(t('common.disabled'));
}
function needAdmin(interaction, t) { needGuild(interaction, t); if (!isAdmin(interaction.member)) throw new UserError(t('common.admin_only')); }

/** Player for a target user; enforces linking and privacy. */
function targetPlayer(interaction, t, user) {
  const target = user || interaction.user;
  const p = players.playerOf(target.id);
  if (!p) throw new UserError(target.id === interaction.user.id ? t('common.need_link') : t('common.user_not_linked', { user: target.username }));
  if (target.id !== interaction.user.id && players.isPrivate(target.id)) throw new UserError(t('common.private'));
  return { user: target, player: p };
}

/** Linked, non-private members of a guild (uses the member cache filled at startup). */
function guildPlayers(guild, { includePrivate = false } = {}) {
  if (!guild) return [];
  return players.linkedUserIds()
    .filter((id) => guild.members.cache.has(id))
    .filter((id) => includePrivate || !players.isPrivate(id))
    .map((id) => ({ userId: id, member: guild.members.cache.get(id), player: players.playerOf(id) }))
    .filter((x) => x.player);
}

function avatar(user) { return user && user.displayAvatarURL ? user.displayAvatarURL({ extension: 'png', size: 256 }) : null; }

module.exports = { UserError, errorText, isAdmin, isMod, needGuild, needFeature, needAdmin, targetPlayer, guildPlayers, avatar, tr, ui, settings, players };
