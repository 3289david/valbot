'use strict';
/* Auto tier roles: gives each linked member the role for their current tier (and peak tier if enabled). */
const settings = require('../lib/settings');
const ranks = require('../lib/ranks');
const store = require('../lib/store');
const players = require('./players');

function tierRoleIds(s) {
  return ranks.ORDER.map((k) => s.tierRoles[k]).filter(Boolean);
}

function desiredRoles(s, userId) {
  const want = new Set();
  const p = players.playerOf(userId);
  if (!p) {
    if (s.tierRoles.unlinked) want.add(s.tierRoles.unlinked);
    return want;
  }
  const cur = ranks.tierKey(p.current && p.current.tier);
  if (cur && s.tierRoles[cur]) want.add(s.tierRoles[cur]);
  if (s.tierRoles.peakRole && p.peak) {
    const pk = ranks.tierKey(p.peak.tier);
    if (pk && s.tierRoles[pk]) want.add(s.tierRoles[pk]);
  }
  return want;
}

function log(guildId, entry) {
  const doc = store.guild(guildId, 'roleLog', []);
  doc.data.unshift({ at: new Date().toISOString(), ...entry });
  if (doc.data.length > 1000) doc.data.length = 1000;
  doc.save();
}

/**
 * Sync one member. reason: 'rank' (tier changed) | 'link' | 'unlink' | 'periodic' | 'join'.
 * With restoreManualEdits off, periodic syncs leave hand-edited roles alone.
 */
async function syncMember(member, reason = 'periodic') {
  if (!member || member.user.bot) return;
  const s = settings.get(member.guild.id);
  if (!s.features.autoRoles) return;
  if (reason === 'periodic' && !s.tierRoles.restoreManualEdits) return;
  const managed = new Set([...tierRoleIds(s), s.tierRoles.unlinked].filter(Boolean));
  if (!managed.size) return;
  const want = desiredRoles(s, member.id);
  const me = member.guild.members.me;
  const usable = (id) => {
    const role = member.guild.roles.cache.get(id);
    return role && me && role.comparePositionTo(me.roles.highest) < 0 && !role.managed;
  };
  const toAdd = [...want].filter((id) => !member.roles.cache.has(id) && usable(id));
  const toRemove = [...managed].filter((id) => !want.has(id) && member.roles.cache.has(id) && usable(id));
  if (!toAdd.length && !toRemove.length) return;
  try {
    if (toRemove.length) await member.roles.remove(toRemove, 'Valorant Hub tier role');
    if (toAdd.length) await member.roles.add(toAdd, 'Valorant Hub tier role');
    const p = players.playerOf(member.id);
    log(member.guild.id, {
      userId: member.id,
      riotId: p ? `${p.name}#${p.tag}` : null,
      tier: p && p.current ? p.current.tier : null,
      added: toAdd.map((id) => member.guild.roles.cache.get(id)?.name || id).join(', ') || null,
      removed: toRemove.map((id) => member.guild.roles.cache.get(id)?.name || id).join(', ') || null,
      reason,
    });
  } catch (err) {
    log(member.guild.id, { userId: member.id, error: err.message.slice(0, 200), reason });
  }
}

async function syncUserEverywhere(client, userId, reason) {
  for (const guild of client.guilds.cache.values()) {
    const member = guild.members.cache.get(userId);
    if (member) await syncMember(member, reason);
  }
}

/** Slow pass over every member with a managed role or a link, to repair drift. */
async function sweep(client) {
  for (const guild of client.guilds.cache.values()) {
    const s = settings.get(guild.id);
    if (!s.features.autoRoles || !s.tierRoles.restoreManualEdits) continue;
    for (const member of guild.members.cache.values()) {
      await syncMember(member, 'periodic');
    }
  }
}

/** Create the nine tier roles (and an unlinked role) for a server that has none mapped yet. */
async function createTierRoles(guild, actor) {
  const s = settings.get(guild.id);
  const created = {};
  for (const key of ranks.ORDER.slice().reverse()) {
    if (s.tierRoles[key] && guild.roles.cache.has(s.tierRoles[key])) continue;
    const existing = guild.roles.cache.find((r) => r.name === ranks.NAMES[key] && !r.managed);
    const role = existing || await guild.roles.create({ name: ranks.NAMES[key], color: ranks.COLORS[key], hoist: true, reason: 'Valorant Hub tier roles' });
    created[key] = role.id;
  }
  await settings.update(guild.id, (next) => { Object.assign(next.tierRoles, created); }, actor);
  return Object.keys(created).length;
}

module.exports = { syncMember, syncUserEverywhere, sweep, createTierRoles };
