/* Valorant Hub — landing page: live lookup, live server count, panel preview, commands preview */
(function () {
  'use strict';
  const t = (k, v) => window.VH.t(k, v);
  const api = (p) => window.VH_API(p);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Only **bold** is supported, on our own strings.
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b style="color:#f2f3f5">$1</b>');

  /* ---------- Live server count (real: servers the bot is in, from Discord) ---------- */
  async function loadServerCount() {
    try {
      const stats = await api('/api/public/stats');
      if (typeof stats.servers === 'number') {
        document.getElementById('server-count').textContent = stats.servers.toLocaleString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US');
        document.getElementById('server-count-chip').hidden = false;
      }
    } catch (e) {
      /* Not available (no server / no bot token): the chip stays hidden. */
    }
  }

  /* ---------- Rank lookup ---------- */
  let lastResult = null;
  let lastError = null;

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return iso;
    }
  }

  function renderResult() {
    const box = document.getElementById('lookup-result');
    if (lastError) {
      box.innerHTML = `<div class="alert ${lastError.kind === 'warn' ? 'alert-warn' : 'alert-bad'}">${esc(lastError.text)}</div>`;
      return;
    }
    if (!lastResult) return;
    const r = lastResult;
    const na = `<span class="value muted">${esc(t('lookup.unavailable'))}</span>`;
    const cur = r.current || {};
    const tierText = cur.tier
      ? `<div class="value">${esc(cur.tier)}</div>`
      : cur.gamesNeededForRating
        ? `<div class="value muted">${esc(t('lookup.unrated'))} · ${esc(t('lookup.needgames', { n: cur.gamesNeededForRating }))}</div>`
        : na;
    const rr = typeof cur.rr === 'number' ? `<div class="value">${cur.rr} RR</div>` : na;
    let last = na;
    if (typeof cur.lastChange === 'number') {
      const cls = cur.lastChange > 0 ? 'up' : cur.lastChange < 0 ? 'down' : '';
      last = `<div class="value ${cls}">${cur.lastChange > 0 ? '+' : ''}${cur.lastChange}</div>`;
    }
    const peak = r.peak && r.peak.tier
      ? `<div class="value">${esc(r.peak.tier)}</div>${r.peak.season ? `<div class="source">${esc(r.peak.season)}</div>` : ''}`
      : na;
    const name = r.account ? r.account.name : '';
    const tag = r.account ? r.account.tag : '';
    const lb = typeof cur.leaderboardRank === 'number' ? `<span class="chip" style="margin-left:auto">${esc(t('lookup.leaderboard', { n: cur.leaderboardRank }))}</span>` : '';

    box.innerHTML = `
      <div class="result-head"><h3>${esc(name)}</h3><span class="tag">#${esc(tag)}</span><span class="chip">${esc(r.region.toUpperCase())}</span>${lb}</div>
      <div class="result-grid">
        <div class="stat"><div class="label">${esc(t('lookup.current'))}</div>${tierText}</div>
        <div class="stat"><div class="label">${esc(t('lookup.rr'))}</div>${rr}</div>
        <div class="stat"><div class="label">${esc(t('lookup.last'))}</div>${last}</div>
        <div class="stat"><div class="label">${esc(t('lookup.peak'))}</div>${peak}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div class="source">${esc(t('lookup.source', { time: fmtTime(r.fetchedAt) }))}</div>
        <a class="btn btn-ghost btn-sm" href="/p/${encodeURIComponent(r.region)}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}">${esc(t('lookup.full'))}</a>
      </div>`;
  }

  async function onLookup(e) {
    e.preventDefault();
    const input = document.getElementById('riot-id');
    const region = document.getElementById('region').value;
    const raw = input.value.trim();
    const m = raw.match(/^(.{3,16})#([^#\s]{3,5})$/u);
    lastResult = null;
    if (!m) {
      lastError = { text: t('lookup.err.format'), kind: 'warn' };
      renderResult();
      input.focus();
      return;
    }
    const btn = document.getElementById('lookup-btn');
    btn.disabled = true;
    btn.textContent = t('lookup.loading');
    try {
      lastResult = await api(`/api/valorant/mmr/${encodeURIComponent(region)}/${encodeURIComponent(m[1].trim())}/${encodeURIComponent(m[2])}`);
      lastError = null;
    } catch (err) {
      if (!err.status) lastError = { text: t('lookup.err.offline'), kind: 'warn' };
      else if (err.code === 'henrik_key_missing') lastError = { text: t('lookup.err.disabled'), kind: 'warn' };
      else lastError = { text: err.message, kind: 'bad' };
    } finally {
      btn.disabled = false;
      btn.textContent = t('lookup.go');
    }
    renderResult();
  }

  /* ---------- Panel preview ---------- */
  const PV = { scrim: { ch: 'panels.channel.scrim', cmd: '/scrim create' }, hub: { ch: 'panels.channel.hub', cmd: '/hub' }, party: { ch: 'panels.channel.party', cmd: '/party create' } };
  let pvCurrent = 'scrim';

  function showPanel(name) {
    pvCurrent = name;
    document.querySelectorAll('[data-pv]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.pv === name)));
    document.querySelectorAll('[data-pv-panel]').forEach((p) => { p.hidden = p.dataset.pvPanel !== name; });
    const ch = t(PV[name].ch);
    document.getElementById('pv-channel').textContent = ch;
    document.getElementById('pv-used').textContent = name === 'scrim' ? t('panels.used') : '';
    document.getElementById('pv-cmdline').innerHTML = `<b>${esc(PV[name].cmd)}</b>`;
  }

  /* ---------- Commands preview ---------- */
  function renderCommandGroups() {
    const wrap = document.getElementById('cmd-groups');
    if (!wrap || !window.VH_COMMANDS) return;
    const groups = ['Player', 'Scrim', 'Party', 'Duel', 'Ranking', 'Tournament', 'Club', 'Utility'];
    wrap.innerHTML = groups.map((g) => {
      const cmds = window.VH_COMMANDS.filter((c) => c.group === g).slice(0, 5);
      return `<div class="cmd-group reveal in"><h4>${esc(g)}</h4><ul>${cmds.map((c) => `<li><code>${esc(c.cmd)}</code></li>`).join('')}</ul></div>`;
    }).join('');
  }

  /* ---------- Plans (limits mirror the bot's plan settings) ---------- */
  const PLAN_ROWS = [
    ['plan.row.core', 'plan.v.yes', 'plan.v.yes'],
    ['plan.row.play', 'plan.v.yes', 'plan.v.yes'],
    ['plan.row.panels', 'plan.v.yes', 'plan.v.yes'],
    ['plan.row.brand', 'plan.v.yes', 'plan.v.yes'],
    ['plan.row.seasons', 'plan.v.1', 'plan.v.unlimited'],
    ['plan.row.tourn', 'plan.v.tf', 'plan.v.tp'],
    ['plan.row.clubs', 'plan.v.5', 'plan.v.unlimited'],
    ['plan.row.stats', 'plan.v.g20', 'plan.v.g100'],
    ['plan.row.history', 'plan.v.h10', 'plan.v.h50'],
  ];
  function renderPlans() {
    const li = (row, col) => `<li><span>${esc(t(row[0]))}</span><strong>${esc(t(row[col]))}</strong></li>`;
    const f = document.getElementById('plan-free');
    const p = document.getElementById('plan-premium');
    if (f) f.innerHTML = PLAN_ROWS.map((r) => li(r, 1)).join('');
    if (p) p.innerHTML = PLAN_ROWS.map((r) => li(r, 2)).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderPlans();
    document.getElementById('lookup-form').addEventListener('submit', onLookup);
    document.querySelectorAll('[data-pv]').forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.pv)));
    showPanel('scrim');
    renderCommandGroups();
    loadServerCount();
    window.VH_CONFIG.then((cfg) => {
      const sel = document.getElementById('region');
      if (cfg && Array.isArray(cfg.regions)) {
        [...sel.options].forEach((o) => { if (!cfg.regions.includes(o.value)) o.remove(); });
      }
    });
  });

  window.VH.onLang(() => {
    renderPlans();
    showPanel(pvCurrent);
    renderResult();
  });
})();
