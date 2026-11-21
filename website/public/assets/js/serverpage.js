/* Valorant Hub — public server page (/s/<guildId>). Shown only when the server turned public stats on. */
(function () {
  'use strict';
  window.VH.addStrings({
    en: {
      'pf.search.ph': 'Name#TAG', 'pf.search.go': 'Search', 'pf.err.bad': 'Use Name#TAG.',
      'sv.loading': 'Loading server…', 'sv.updated': 'Updated {time}',
      'sv.tab.board': 'Leaderboard', 'sv.tab.season': 'Season', 'sv.tab.tournament': 'Tournament', 'sv.tab.duels': 'Duels', 'sv.tab.scrims': 'Scrims', 'sv.tab.clubs': 'Clubs',
      'sv.type.rr': 'Rank (RR)', 'sv.type.winrate': 'Win rate', 'sv.type.kd': 'K/D', 'sv.type.acs': 'ACS', 'sv.type.rrgain': 'RR gained (week)',
      'sv.col.player': 'Player', 'sv.col.rank': 'Rank', 'sv.col.value': 'Value', 'sv.col.games': 'Games', 'sv.col.score': 'Score',
      'sv.col.rating': 'Rating', 'sv.col.wl': 'W-L', 'sv.col.club': 'Club', 'sv.col.members': 'Members',
      'sv.empty': 'Nothing here yet.', 'sv.ends': 'Ends {date}', 'sv.champion': 'Champion: {team}',
      'sv.round': 'Round {n}', 'sv.final': 'Final', 'sv.semi': 'Semifinal', 'sv.bye': 'bye', 'sv.tbd': 'TBD',
      'sv.metric.rrgain': 'RR gained', 'sv.metric.wins': 'Wins', 'sv.metric.acs': 'Average ACS',
      'sv.status.signup': 'Sign-ups open', 'sv.status.live': 'In progress', 'sv.status.done': 'Finished',
    },
    ko: {
      'pf.search.ph': '이름#태그', 'pf.search.go': '검색', 'pf.err.bad': '이름#태그 형식으로 입력하세요.',
      'sv.loading': '불러오는 중…', 'sv.updated': '{time} 갱신',
      'sv.tab.board': '랭킹', 'sv.tab.season': '시즌', 'sv.tab.tournament': '대회', 'sv.tab.duels': '대결', 'sv.tab.scrims': '내전', 'sv.tab.clubs': '클럽',
      'sv.type.rr': '랭크 (RR)', 'sv.type.winrate': '승률', 'sv.type.kd': 'K/D', 'sv.type.acs': 'ACS', 'sv.type.rrgain': 'RR 상승 (주간)',
      'sv.col.player': '플레이어', 'sv.col.rank': '랭크', 'sv.col.value': '기록', 'sv.col.games': '경기', 'sv.col.score': '점수',
      'sv.col.rating': '레이팅', 'sv.col.wl': '승-패', 'sv.col.club': '클럽', 'sv.col.members': '인원',
      'sv.empty': '아직 기록이 없습니다.', 'sv.ends': '{date} 종료', 'sv.champion': '우승: {team}',
      'sv.round': '{n}라운드', 'sv.final': '결승', 'sv.semi': '준결승', 'sv.bye': '부전승', 'sv.tbd': '미정',
      'sv.metric.rrgain': 'RR 상승량', 'sv.metric.wins': '승리 수', 'sv.metric.acs': '평균 ACS',
      'sv.status.signup': '참가 신청 중', 'sv.status.live': '진행 중', 'sv.status.done': '종료',
    },
  });
  const t = (k, v) => window.VH.t(k, v);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.getElementById('sv');
  const TABS = ['board', 'season', 'tournament', 'duels', 'scrims', 'clubs'];
  let data = null;
  let tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'board';
  let type = 'rr';

  const playerLink = (riotId, region) => {
    const i = riotId.lastIndexOf('#');
    return `<a href="/p/${encodeURIComponent(region || 'ap')}/${encodeURIComponent(riotId.slice(0, i))}/${encodeURIComponent(riotId.slice(i + 1))}" style="color:var(--text);font-weight:600">${esc(riotId)}</a>`;
  };
  const tableHtml = (head, rows) => (rows.length
    ? `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
    : `<div class="pf-empty">${esc(t('sv.empty'))}</div>`);

  function board() {
    const rows = (data.leaderboards[type] || []).map((r, i) => `<tr><td>${i + 1}</td><td>${playerLink(r.riotId, r.region)}${r.name ? `<div class="sub" style="color:var(--text-3);font-size:12.5px">${esc(r.name)}</div>` : ''}</td><td>${esc(r.tier || '-')}</td><td><b>${esc(r.display)}</b></td><td>${r.games ?? '-'}</td></tr>`);
    return `<div class="filter-pills" style="margin-bottom:16px">${['rr', 'winrate', 'kd', 'acs', 'rrgain'].map((x) => `<button type="button" class="pill" data-type="${x}" aria-pressed="${x === type}">${esc(t(`sv.type.${x}`))}</button>`).join('')}</div>`
      + tableHtml(['#', t('sv.col.player'), t('sv.col.rank'), t('sv.col.value'), t('sv.col.games')], rows);
  }
  function season() {
    if (!data.seasons.length) return `<div class="pf-empty">${esc(t('sv.empty'))}</div>`;
    return data.seasons.map((s) => `<div class="box" style="margin-bottom:16px"><h3>${esc(s.name)} · ${esc(t(`sv.metric.${s.metric}`))} · ${esc(t('sv.ends', { date: new Date(s.endAt).toLocaleDateString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US') }))}</h3>`
      + tableHtml(['#', t('sv.col.player'), t('sv.col.score')], s.standings.map((r, i) => `<tr><td>${i + 1}</td><td>${playerLink(r.riotId, r.region)}</td><td><b>${s.metric === 'rrgain' ? `${r.score >= 0 ? '+' : ''}${r.score} RR` : s.metric === 'acs' ? Math.round(r.score) : r.score}</b></td></tr>`)) + '</div>').join('');
  }
  function tournament() {
    const tn = data.tournament;
    if (!tn) return `<div class="pf-empty">${esc(t('sv.empty'))}</div>`;
    let body = '';
    if (tn.format === 'single' && tn.rounds) {
      const label = (r) => (r === tn.rounds ? t('sv.final') : r === tn.rounds - 1 ? t('sv.semi') : t('sv.round', { n: r }));
      body = `<div style="display:grid;grid-template-columns:repeat(${tn.rounds},minmax(200px,1fr));gap:16px;overflow-x:auto">${Array.from({ length: tn.rounds }, (_, i) => i + 1).map((r) => `<div><div class="kicker" style="margin-bottom:10px">${esc(label(r))}</div>${tn.matches.filter((m) => m.round === r).map((m) => `<div class="box" style="padding:12px 14px;margin-bottom:10px">
        <div style="${m.winner && m.winner === m.a ? 'color:var(--good);font-weight:700' : ''}">${esc(m.a || t('sv.tbd'))}</div>
        <div style="${m.winner && m.winner === m.b ? 'color:var(--good);font-weight:700' : 'color:var(--text-2)'}">${m.bye ? `<i>${esc(t('sv.bye'))}</i>` : esc(m.b || t('sv.tbd'))}</div></div>`).join('')}</div>`).join('')}</div>`;
    } else {
      const rec = {};
      tn.teams.forEach((x) => { rec[x] = { w: 0, l: 0 }; });
      tn.matches.filter((m) => m.status === 'done' && !m.bye && m.winner).forEach((m) => { rec[m.winner].w++; rec[m.winner === m.a ? m.b : m.a].l++; });
      body = tableHtml(['#', t('sv.col.club'), t('sv.col.wl')], Object.entries(rec).sort((a, b) => b[1].w - a[1].w).map(([n, r], i) => `<tr><td>${i + 1}</td><td><b>${esc(n)}</b></td><td>${r.w}-${r.l}</td></tr>`));
    }
    return `<div class="box"><h3>${esc(tn.name)} · ${esc(t(`sv.status.${tn.status}`) || tn.status)}</h3>${tn.champion ? `<p style="color:var(--good);font-weight:700">${esc(t('sv.champion', { team: tn.champion }))}</p>` : ''}${body}</div>`;
  }
  const duels = () => tableHtml(['#', t('sv.col.player'), t('sv.col.rating'), t('sv.col.wl')], data.duels.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name || '-')}</td><td><b>${r.rating}</b></td><td>${r.wins}-${r.losses}</td></tr>`));
  const scrims = () => tableHtml(['#', t('sv.col.player'), t('sv.col.wl')], data.scrims.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name || '-')}</td><td><b>${r.wins}-${r.losses}</b></td></tr>`));
  const clubs = () => tableHtml([t('sv.col.club'), t('sv.col.members')], data.clubs.map((c) => `<tr><td><b>${esc(c.name)}</b> [${esc(c.tag)}]</td><td>${c.members}</td></tr>`));

  function render() {
    const g = data.guild;
    const icon = g.icon ? `<img src="https://cdn.discordapp.com/icons/${esc(g.id)}/${esc(g.icon)}.png?size=128" alt="" style="width:72px;height:72px;border-radius:18px">` : `<div class="rank-badge" style="background:var(--surface-2);color:var(--text)">${esc(g.name.slice(0, 2))}</div>`;
    document.title = `${g.name} — Valorant Hub`;
    root.innerHTML = `
      <section class="pf-hero">
        <img src="https://images.unsplash.com/photo-1780766382547-a0ffa16bd32d?auto=format&fit=crop&w=2000&q=75" alt="">
        <div class="container" style="display:flex;gap:20px;align-items:center">${icon}<div><h1 class="pf-name" style="margin:0">${esc(g.name)}</h1><span class="chip">${esc(t('sv.updated', { time: new Date(data.generatedAt).toLocaleString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US') }))}</span></div></div>
      </section>
      <div class="container pf-body">
        <div class="pf-tabs" role="tablist">${TABS.map((x) => `<button type="button" role="tab" data-tab="${x}" aria-selected="${x === tab}">${esc(t(`sv.tab.${x}`))}</button>`).join('')}</div>
        <div>${tab === 'board' ? board() : tab === 'season' ? season() : tab === 'tournament' ? tournament() : tab === 'duels' ? duels() : tab === 'scrims' ? scrims() : clubs()}</div>
      </div>`;
    root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; history.replaceState(null, '', `#${tab}`); render(); }));
    root.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => { type = b.dataset.type; render(); }));
  }

  async function load() {
    const id = location.pathname.split('/').filter(Boolean)[1];
    root.innerHTML = `<div class="pf-loading"><div class="spin"></div>${esc(t('sv.loading'))}</div>`;
    try {
      data = await window.VH_API(`/api/public/server/${encodeURIComponent(id)}`);
      render();
    } catch (err) {
      root.innerHTML = `<div class="container pf-start"><div class="alert alert-warn">${esc(window.VH_ERR(err))}</div></div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nav-search').addEventListener('submit', (e) => {
      e.preventDefault();
      const m = document.getElementById('ns-riot').value.trim().match(/^(.{3,16})#([^#\s]{3,5})$/u);
      if (!m) return;
      location.href = `/p/${encodeURIComponent(document.getElementById('ns-region').value)}/${encodeURIComponent(m[1].trim())}/${encodeURIComponent(m[2])}`;
    });
    load();
  });
  window.VH.onLang(() => { if (data) render(); });
})();
