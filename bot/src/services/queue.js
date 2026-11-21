'use strict';
/*
 * Requests from the website. The website drops one JSON file per request into
 *   data/bot/_global/queue/      (member actions: link, unlink, privacy, main account, language)
 *   data/bot/<guildId>/queue/    (admin actions: announce, repost panels, sync roles)
 * The bot runs each one and moves it to queue/done/ with the result, so the two never write the same file.
 */
const fs = require('fs/promises');
const path = require('path');
const store = require('../lib/store');
const ui = require('../lib/ui');
const players = require('./players');
const roles = require('./roles');

const MAX_AGE = 10 * 60_000;

async function listDirs() {
  const dirs = [{ scope: '_global', dir: path.join(store.BOT_DIR, '_global', 'queue') }];
  for (const g of store.guildDirs()) dirs.push({ scope: g, dir: path.join(store.BOT_DIR, g, 'queue') });
  return dirs;
}

async function finish(dir, file, req, status, message) {
  const doneDir = path.join(dir, 'done');
  await fs.mkdir(doneDir, { recursive: true });
  const out = { ...req, status, message: message || null, finishedAt: new Date().toISOString() };
  await fs.writeFile(path.join(doneDir, file), JSON.stringify(out, null, 2));
  await fs.unlink(path.join(dir, file)).catch(() => {});
  // keep the last 200 results
  const files = (await fs.readdir(doneDir)).filter((f) => f.endsWith('.json')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - 200))) await fs.unlink(path.join(doneDir, f)).catch(() => {});
}

async function runGlobal(client, req) {
  if (!/^\d{15,25}$/.test(String(req.userId || ''))) throw new Error('bad user');
  if (req.type === 'link') {
    const m = String(req.riotId || '').trim().match(/^(.{3,16})#([^#\s]{3,5})$/u);
    if (!m) throw new Error('Use Name#TAG');
    const res = await players.link(req.userId, m[1].trim(), m[2], req.region || null);
    return `${res.player.name}#${res.player.tag}`;
  }
  if (req.type === 'unlink') { players.unlink(req.userId, req.puuid || undefined); return 'ok'; }
  if (req.type === 'main') { if (!players.setMain(req.userId, req.puuid)) throw new Error('not linked'); return 'ok'; }
  if (req.type === 'privacy') { if (!players.setPrivate(req.userId, Boolean(req.value))) throw new Error('not linked'); return 'ok'; }
  if (req.type === 'lang') { players.setLang(req.userId, req.lang); return 'ok'; }
  throw new Error('unknown request');
}

async function runGuild(client, guildId, req) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) throw new Error('bot is not in this server');
  if (req.type === 'announce') {
    const ch = guild.channels.cache.get(req.channelId);
    if (!ch || !ch.isTextBased()) throw new Error('channel not found');
    const parts = [];
    if (req.title) parts.push(`## ${ui.md(String(req.title).slice(0, 100))}`);
    parts.push(String(req.text || '').slice(0, 3500));
    const msg = await ch.send(ui.v2(ui.card(parts, ui.COLORS.brand)));
    return `https://discord.com/channels/${guildId}/${ch.id}/${msg.id}`;
  }
  if (req.type === 'repostPanels') {
    const panels = require('../features/panels');
    let n = 0;
    for (const type of panels.TYPES) if (await panels.postOrUpdate(guild, type, { force: true })) n++;
    return `${n}`;
  }
  if (req.type === 'syncRoles') {
    let n = 0;
    for (const id of players.linkedUserIds()) {
      const m = guild.members.cache.get(id);
      if (m) { await roles.syncMember(m, 'link'); n++; }
    }
    return `${n}`;
  }
  throw new Error('unknown request');
}

async function tick(client) {
  for (const { scope, dir } of await listDirs()) {
    let files;
    try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json')); } catch (e) { continue; }
    for (const file of files.sort()) {
      let req;
      try { req = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8')); } catch (e) { continue; }
      if (req.createdAt && Date.now() - Date.parse(req.createdAt) > MAX_AGE) { await finish(dir, file, req, 'failed', 'expired'); continue; }
      try {
        const message = scope === '_global' ? await runGlobal(client, req) : await runGuild(client, scope, req);
        await finish(dir, file, req, 'done', message);
      } catch (err) {
        await finish(dir, file, req, 'failed', err.message ? err.message.slice(0, 200) : 'failed');
      }
    }
  }
}

module.exports = { tick };
