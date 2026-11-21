/* Valorant Hub — docs page: sidebar, search, one section at a time with prev/next */
(function () {
  'use strict';
  const t = (k, v) => window.VH.t(k, v);
  const DOCS = window.VH_DOCS;
  const GROUPS = window.VH_DOCS_GROUPS;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  let query = '';

  const lang = () => window.VH.lang;
  const currentId = () => {
    const id = (location.hash || '').slice(1);
    return DOCS.some((d) => d.id === id) ? id : DOCS[0].id;
  };

  function renderSide() {
    const side = document.getElementById('docs-side');
    const cur = currentId();
    const q = query.toLowerCase();
    const match = (d) => !q || (d.title[lang()] + ' ' + strip(d[lang()])).toLowerCase().includes(q);
    let html = '';
    let total = 0;
    for (const g of Object.keys(GROUPS)) {
      const items = DOCS.filter((d) => d.group === g && match(d));
      if (!items.length) continue;
      total += items.length;
      html += `<div class="docs-group">${esc(GROUPS[g][lang()])}</div>`;
      html += items.map((d) => `<a href="#${d.id}" ${d.id === cur ? 'aria-current="page"' : ''}>${esc(d.title[lang()])}</a>`).join('');
    }
    if (q) html = `<div class="docs-count">${esc(t('docs.results', { n: total }))}</div>` + (html || `<p class="docs-empty">${esc(t('docs.none'))}</p>`);
    side.innerHTML = html;
  }

  function highlight(root, q) {
    if (!q) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    for (const n of nodes) {
      if (!re.test(n.nodeValue)) continue;
      re.lastIndex = 0;
      const span = document.createElement('span');
      span.innerHTML = esc(n.nodeValue).replace(re, (m) => `<mark>${m}</mark>`);
      n.replaceWith(...span.childNodes);
    }
  }

  function renderMain() {
    const main = document.getElementById('docs-main');
    const id = currentId();
    const i = DOCS.findIndex((d) => d.id === id);
    const d = DOCS[i];
    const prev = DOCS[i - 1];
    const next = DOCS[i + 1];
    main.innerHTML = `
      <article class="docs-article">
        <div class="docs-crumb">${esc(GROUPS[d.group][lang()])}</div>
        <h2>${esc(d.title[lang()])}</h2>
        <div class="docs-body">${d[lang()]}</div>
      </article>
      <nav class="docs-pager">
        ${prev ? `<a class="pager prev" href="#${prev.id}"><span>${esc(t('docs.prev'))}</span><b>${esc(prev.title[lang()])}</b></a>` : '<span></span>'}
        ${next ? `<a class="pager next" href="#${next.id}"><span>${esc(t('docs.next'))}</span><b>${esc(next.title[lang()])}</b></a>` : '<span></span>'}
      </nav>`;
    highlight(main.querySelector('.docs-body'), query.trim());
    document.title = `${d.title[lang()]} — ${t('docs.title')}`;
  }

  function render() { renderSide(); renderMain(); }

  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.getElementById('docs-q').addEventListener('input', (e) => {
      query = e.target.value.trim();
      renderSide();
      // Jump to the first match
      if (query) {
        const first = document.querySelector('#docs-side a');
        if (first && first.getAttribute('href') !== location.hash) history.replaceState(null, '', first.getAttribute('href'));
      }
      renderMain();
    });
  });
  window.addEventListener('hashchange', () => {
    render();
    const main = document.getElementById('docs-main');
    if (main.getBoundingClientRect().top < 0) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.VH.onLang(render);
})();
