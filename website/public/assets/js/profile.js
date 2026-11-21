/* Valorant Hub — player page (/p/<region>/<name>/<tag>). Every value comes from the player's real games. */
(function () {
  'use strict';
  window.VH.addStrings({
    en: {
      'pf.search.ph': 'Name#TAG', 'pf.search.go': 'Search',
      'pf.start.title': 'Find a player',
      'pf.loading': 'Loading player…',
      'pf.level': 'Level {n}',
      'pf.rank': 'Current rank', 'pf.unrated': 'Unrated', 'pf.needgames': '{n} games to rank', 'pf.lb': 'Leaderboard #{n}',
      'pf.peak': 'Peak', 'pf.copy': 'Copy link', 'pf.copied': 'Link copied', 'pf.updated': 'Updated {time}',
      'tab.overview': 'Overview', 'tab.matches': 'Matches', 'tab.agents': 'Agents', 'tab.maps': 'Maps', 'tab.seasons': 'Seasons',
      'st.wr': 'Win rate', 'st.kd': 'K/D', 'st.acs': 'ACS', 'st.adr': 'ADR', 'st.hs': 'HS%', 'st.games': 'Games',
      'st.wl': '{w}W {l}L', 'st.last': 'Last {n} competitive',
      'pf.history': 'Rank history', 'pf.history.none': 'No rank history yet.',
      'pf.topagents': 'Top agents', 'pf.topmaps': 'Top maps',
      'pf.nomatch': 'No competitive games found.',
      'pf.win': 'Win', 'pf.loss': 'Loss', 'pf.draw': 'Draw',
      'pf.col.name': 'Name', 'pf.col.games': 'Games', 'pf.col.wr': 'Win rate', 'pf.col.kd': 'K/D', 'pf.col.acs': 'ACS', 'pf.col.adr': 'ADR', 'pf.col.hs': 'HS%',
      'pf.col.season': 'Act', 'pf.col.end': 'Final rank', 'pf.col.wins': 'Wins',
      'pf.small': 'Fewer than 5 games',
      'pf.err.bad': 'Use Name#TAG.',
      'pf.ago.m': '{n}m ago', 'pf.ago.h': '{n}h ago', 'pf.ago.d': '{n}d ago',
    },
    ko: {
      'pf.search.ph': '이름#태그', 'pf.search.go': '검색',
      'pf.start.title': '플레이어 검색',
      'pf.loading': '불러오는 중…',
      'pf.level': '레벨 {n}',
      'pf.rank': '현재 랭크', 'pf.unrated': '언레이티드', 'pf.needgames': '배치까지 {n}경기', 'pf.lb': '리더보드 {n}위',
      'pf.peak': '최고', 'pf.copy': '링크 복사', 'pf.copied': '링크를 복사했습니다', 'pf.updated': '{time} 갱신',
      'tab.overview': '개요', 'tab.matches': '경기', 'tab.agents': '요원', 'tab.maps': '맵', 'tab.seasons': '시즌',
      'st.wr': '승률', 'st.kd': 'K/D', 'st.acs': 'ACS', 'st.adr': 'ADR', 'st.hs': 'HS%', 'st.games': '경기',
      'st.wl': '{w}승 {l}패', 'st.last': '최근 경쟁전 {n}경기',
      'pf.history': '랭크 변화', 'pf.history.none': '아직 랭크 기록이 없습니다.',
      'pf.topagents': '주력 요원', 'pf.topmaps': '주력 맵',
      'pf.nomatch': '경쟁전 기록이 없습니다.',
      'pf.win': '승리', 'pf.loss': '패배', 'pf.draw': '무승부',
      'pf.col.name': '이름', 'pf.col.games': '경기', 'pf.col.wr': '승률', 'pf.col.kd': 'K/D', 'pf.col.acs': 'ACS', 'pf.col.adr': 'ADR', 'pf.col.hs': 'HS%',
      'pf.col.season': '액트', 'pf.col.end': '최종 랭크', 'pf.col.wins': '승리',
      'pf.small': '5경기 미만',
      'pf.err.bad': '이름#태그 형식으로 입력하세요.',
      'pf.ago.m': '{n}분 전', 'pf.ago.h': '{n}시간 전', 'pf.ago.d': '{n}일 전',
    },
  });

  const t = (k, v) => window.VH.t(k, v);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.getElementById('pf');
  const TIER_COLORS = { iron: '#8a8a8a', bronze: '#b98a5b', silver: '#c9cfd6', gold: '#e9c05a', platinum: '#47c1ce', diamond: '#b997f3', ascendant: '#39c97f', immortal: '#e35a6c', radiant: '#ffe9a3' };
  const tierKey = (n) => (n ? String(n).split(' ')[0].toLowerCase() : null);
  const tierColor = (n) => TIER_COLORS[tierKey(n)] || '#4e5058';
  const pct = (v) => (v === null || v === undefined ? '-' : `${(v * 100).toFixed(1)}%`);
  const dec = (v) => (v === null || v === undefined ? '-' : v.toFixed(2));
  const int = (v) => (v === null || v === undefined ? '-' : String(Math.round(v)));

  let data = null;
  let tab = 'overview';
  let target = null;

  function ago(iso) {
    const m = Math.floor((Date.now() - Date.parse(iso)) / 60000);
    if (!Number.isFinite(m)) return '';
    if (m < 60) return t('pf.ago.m', { n: Math.max(1, m) });
    if (m < 1440) return t('pf.ago.h', { n: Math.floor(m / 60) });
    return t('pf.ago.d', { n: Math.floor(m / 1440) });
  }

  function parsePath() {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'p' || parts.length < 4) return null;
    return { region: decodeURIComponent(parts[1]).toLowerCase(), name: decodeURIComponent(parts[2]), tag: decodeURIComponent(parts[3]) };
  }

  function go(riot, region) {
    const m = String(riot || '').trim().match(/^(.{3,16})#([^#\s]{3,5})$/u);
    if (!m) { toast(t('pf.err.bad')); return; }
    location.href = `/p/${encodeURIComponent(region)}/${encodeURIComponent(m[1].trim())}/${encodeURIComponent(m[2])}`;
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  /* ---------- Views ---------- */

  function startView() {
    root.innerHTML = `<div class="container pf-start"><h1>${esc(t('pf.start.title'))}</h1>
      <form id="start-form"><input class="input" id="sf-riot" placeholder="${esc(t('pf.search.ph'))}" maxlength="22">
      <select class="select" id="sf-region"><option value="kr">KR</option><option value="ap">AP</option><option value="na">NA</option><option value="eu">EU</option><option value="latam">LATAM</option><option value="br">BR</option></select>
      <button class="btn btn-primary" type="submit">${esc(t('pf.search.go'))}</button></form></div>`;
    document.getElementById('start-form').addEventListener('submit', (e) => { e.preventDefault(); go(document.getElementById('sf-riot').value, document.getElementById('sf-region').value); });
  }

  function chart(history) {
    const pts = history.filter((h) => typeof h.elo === 'number');
    if (pts.length < 2) return `<p class="pf-empty" style="padding:30px 0">${esc(t('pf.history.none'))}</p>`;
    const W = 720; const H = 240; const P = { l: 46, r: 16, t: 14, b: 28 };
    const xs = pts.map((p) => Date.parse(p.date)); const ys = pts.map((p) => p.elo);
    const x0 = Math.min(...xs); const x1 = Math.max(...xs);
    const y0 = Math.min(...ys) - 20; const y1 = Math.max(...ys) + 20;
    const X = (v) => P.l + ((v - x0) / Math.max(1, x1 - x0)) * (W - P.l - P.r);
    const Y = (v) => H - P.b - ((v - y0) / Math.max(1, y1 - y0)) * (H - P.t - P.b);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(Date.parse(p.date)).toFixed(1)} ${Y(p.elo).toFixed(1)}`).join(' ');
    const area = `${line} L${X(x1).toFixed(1)} ${H - P.b} L${X(x0).toFixed(1)} ${H - P.b} Z`;
    const ticks = [y0 + 20, (y0 + y1) / 2, y1 - 20].map((v) => Math.round(v));
    const fmt = (ms) => new Date(ms).toLocaleDateString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('pf.history'))}">
      <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d5a" stop-opacity=".35"/><stop offset="1" stop-color="#ff4d5a" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map((v) => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#1c2534"/><text x="${P.l - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#6f7c91">${v}</text>`).join('')}
      <path d="${area}" fill="url(#ga)"/>
      <path d="${line}" fill="none" stroke="#ff4d5a" stroke-width="2.2" stroke-linejoin="round"/>
      ${pts.map((p) => `<circle cx="${X(Date.parse(p.date)).toFixed(1)}" cy="${Y(p.elo).toFixed(1)}" r="3.2" fill="${tierColor(p.tier)}"><title>${esc(p.tier || '')} ${p.rr ?? ''} RR (${p.change > 0 ? '+' : ''}${p.change ?? ''}) · ${new Date(p.date).toLocaleString()}</title></circle>`).join('')}
      <text x="${P.l}" y="${H - 8}" font-size="11" fill="#6f7c91">${fmt(x0)}</text>
      <text x="${W - P.r}" y="${H - 8}" font-size="11" fill="#6f7c91" text-anchor="end">${fmt(x1)}</text>
    </svg>`;
  }

  function miniList(list) {
    const top = list.slice(0, 5);
    const max = Math.max(1, ...top.map((x) => x.n));
    return `<div class="mini-list">${top.map((x) => `<div class="mini-row"><span class="n">${esc(x.name)}</span><span class="m">${x.n} · ${pct(x.winRate)}</span><span class="m">ACS ${int(x.acs)}</span><div class="bar"><i style="width:${(x.n / max) * 100}%"></i></div></div>`).join('') || '-'}</div>`;
  }

  function overview() {
    const s = data.summary;
    const box = (k, v, sub) => `<div class="sbox"><div class="k">${esc(k)}</div><div class="v">${v}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>`;
    const small = s.n < 5;
    return `
      <div class="stats-grid">
        ${box(t('st.wr'), small ? '-' : pct(s.winRate), small ? t('pf.small') : t('st.wl', { w: s.wins, l: s.losses }))}
        ${box(t('st.kd'), small ? '-' : dec(s.kd), small ? '' : `${s.kills} / ${s.deaths}`)}
        ${box(t('st.acs'), small ? '-' : int(s.acs))}
        ${box(t('st.adr'), small ? '-' : int(s.adr))}
        ${box(t('st.hs'), small ? '-' : pct(s.hs))}
        ${box(t('st.games'), String(s.n), t('st.last', { n: s.n }))}
      </div>
      <div class="pf-cols">
        <div class="box chart"><h3>${esc(t('pf.history'))}</h3>${chart(data.history)}</div>
        <div class="box"><h3>${esc(t('pf.topagents'))}</h3>${miniList(data.agents)}<h3 style="margin-top:22px">${esc(t('pf.topmaps'))}</h3>${miniList(data.maps)}</div>
      </div>`;
  }

  function matches() {
    if (!data.matches.length) return `<div class="pf-empty">${esc(t('pf.nomatch'))}</div>`;
    return `<div class="matches">${data.matches.map((m) => {
      const cls = m.draw ? 'draw' : m.won ? 'win' : m.won === false ? 'loss' : 'draw';
      const acs = m.rounds && m.score !== null ? Math.round(m.score / m.rounds) : null;
      const shots = (m.headshots ?? 0) + (m.bodyshots ?? 0) + (m.legshots ?? 0);
      const kd = m.deaths ? (m.kills / m.deaths).toFixed(2) : '-';
      return `<div class="mrow ${cls}"><span class="edge"></span>
        <div><div class="res">${esc(t(`pf.${cls}`))} ${m.roundsWon ?? '?'}:${m.roundsLost ?? '?'}</div><div class="sub">${esc(m.map || '')} · ${esc(ago(m.startedAt))}</div></div>
        <div><b>${esc(m.agent || '-')}</b><div class="sub">${esc(m.tier || '')}</div></div>
        <div><b>${m.kills ?? '-'} / ${m.deaths ?? '-'} / ${m.assists ?? '-'}</b><div class="sub">K/D ${kd}</div></div>
        <div class="hide-sm"><b>${acs ?? '-'}</b><div class="sub">ACS</div></div>
        <div class="hide-md"><b>${m.rounds && m.damage !== null ? Math.round(m.damage / m.rounds) : '-'}</b><div class="sub">ADR</div></div>
        <div class="hide-md"><b>${shots ? `${((m.headshots / shots) * 100).toFixed(0)}%` : '-'}</b><div class="sub">HS</div></div>
      </div>`;
    }).join('')}</div>`;
  }

  function table(list) {
    if (!list.length) return `<div class="pf-empty">${esc(t('pf.nomatch'))}</div>`;
    return `<div class="table-wrap"><table><thead><tr><th>${esc(t('pf.col.name'))}</th><th>${esc(t('pf.col.games'))}</th><th>${esc(t('pf.col.wr'))}</th><th>${esc(t('pf.col.kd'))}</th><th>${esc(t('pf.col.acs'))}</th><th>${esc(t('pf.col.adr'))}</th><th>${esc(t('pf.col.hs'))}</th></tr></thead>
      <tbody>${list.map((x) => `<tr><td><b>${esc(x.name)}</b></td><td>${x.n}</td><td>${pct(x.winRate)}</td><td>${dec(x.kd)}</td><td>${int(x.acs)}</td><td>${int(x.adr)}</td><td>${pct(x.hs)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function seasons() {
    if (!data.seasons.length) return `<div class="pf-empty">-</div>`;
    return `<div class="table-wrap"><table><thead><tr><th>${esc(t('pf.col.season'))}</th><th>${esc(t('pf.col.end'))}</th><th>${esc(t('pf.col.wins'))}</th><th>${esc(t('pf.col.games'))}</th></tr></thead>
      <tbody>${data.seasons.map((x) => `<tr><td><b>${esc(x.season || '-')}</b></td><td><span style="color:${tierColor(x.endTier)}">${esc(x.endTier || '-')}</span>${x.endRr !== null && x.endTier ? ` · ${x.endRr} RR` : ''}</td><td>${x.wins ?? '-'}</td><td>${x.games ?? '-'}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function render() {
    if (!data) return;
    const a = data.account; const c = data.current || {};
    const rankedTier = c.tier && c.tier.toLowerCase() !== 'unrated' ? c.tier : null;
    const initials = rankedTier ? rankedTier.split(' ').map((w) => w[0]).join('') : '-';
    document.title = `${a.name}#${a.tag} — Valorant Hub`;
    const change = typeof c.lastChange === 'number' ? `<span class="${c.lastChange >= 0 ? 'up' : 'down'}">${c.lastChange > 0 ? '+' : ''}${c.lastChange}</span>` : '';
    root.innerHTML = `
      <section class="pf-hero">
        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=75" alt="">
        <div class="container pf-top">
          <div>
            <div class="pf-meta"><span class="chip">${esc(a.region.toUpperCase())}</span>${a.level !== null ? `<span class="chip">${esc(t('pf.level', { n: a.level }))}</span>` : ''}${typeof c.leaderboardRank === 'number' ? `<span class="chip">${esc(t('pf.lb', { n: c.leaderboardRank }))}</span>` : ''}</div>
            <h1 class="pf-name">${esc(a.name)}<span class="tag">#${esc(a.tag)}</span></h1>
            <div class="pf-actions">
              <button class="btn btn-ghost btn-sm" type="button" id="copy-link">${esc(t('pf.copy'))}</button>
              <span class="chip">${esc(t('pf.updated', { time: ago(data.fetchedAt) }))}</span>
            </div>
          </div>
          <div class="rank-card">
            <div class="rank-badge" style="background:${tierColor(rankedTier)}">${esc(initials)}</div>
            <div>
              <div class="lbl">${esc(t('pf.rank'))}</div>
              <div class="tier" style="color:${tierColor(rankedTier)}">${esc(rankedTier || t('pf.unrated'))}</div>
              <div class="rr">${rankedTier && c.rr !== null ? `${c.rr} RR ${change}` : c.gamesNeeded ? esc(t('pf.needgames', { n: c.gamesNeeded })) : ''}</div>
            </div>
            <div class="peak"><span>${esc(t('pf.peak'))}</span><span style="color:${tierColor(data.peak && data.peak.tier)}">${esc(data.peak ? `${data.peak.tier}${data.peak.season ? ` · ${data.peak.season}` : ''}` : '-')}</span></div>
          </div>
        </div>
      </section>
      <div class="container pf-body">
        <div class="pf-tabs" role="tablist">
          ${['overview', 'matches', 'agents', 'maps', 'seasons'].map((x) => `<button type="button" role="tab" data-tab="${x}" aria-selected="${x === tab}">${esc(t(`tab.${x}`))}</button>`).join('')}
        </div>
        <div id="pf-tab">${tab === 'overview' ? overview() : tab === 'matches' ? matches() : tab === 'agents' ? table(data.agents) : tab === 'maps' ? table(data.maps) : seasons()}</div>
      </div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
    document.getElementById('copy-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast(t('pf.copied')); } catch (e) { toast(location.href); }
    });
  }

  async function load() {
    target = parsePath();
    if (!target) return startView();
    document.getElementById('ns-region').value = target.region;
    document.getElementById('ns-riot').value = `${target.name}#${target.tag}`;
    root.innerHTML = `<div class="pf-loading"><div class="spin"></div>${esc(t('pf.loading'))}</div>`;
    try {
      data = await window.VH_API(`/api/player/${encodeURIComponent(target.region)}/${encodeURIComponent(target.name)}/${encodeURIComponent(target.tag)}`);
      render();
    } catch (err) {
      root.innerHTML = `<div class="container pf-start"><h1>${esc(`${target.name}#${target.tag}`)}</h1><div class="alert alert-bad">${esc(window.VH_ERR(err))}</div></div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-search').addEventListener('submit', (e) => {
      e.preventDefault();
      go(document.getElementById('ns-riot').value, document.getElementById('ns-region').value);
    });
    load();
  });
  window.VH.onLang(() => { if (data) render(); else if (!target) startView(); });
})();
