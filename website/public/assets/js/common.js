/* Valorant Hub — shared behaviour: nav, invite links, scroll reveal */
(function () {
  'use strict';

  window.VH_API = async function api(path, options) {
    const res = await fetch(path, Object.assign({ credentials: 'same-origin', headers: { Accept: 'application/json' } }, options || {}));
    let body = null;
    try { body = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) {
      const err = new Error((body && body.message) || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = body && body.error;
      throw err;
    }
    return body;
  };

  const ERR = {
    en: { player_not_found: 'Player not found. Check the Riot ID and region.', henrik_rate_limited: 'Too many requests. Try again in a minute.', too_many_requests: 'Too many requests. Try again in a minute.', henrik_error: 'Could not load data. Try again later.', henrik_key_missing: 'Stats are not available right now.', not_public: 'This server keeps its stats private.', no_data: 'No data yet.', bad_riot_id: 'Use Name#TAG.', bad_region: 'Unknown region.', offline: 'Unavailable right now.' },
    ko: { player_not_found: '플레이어를 찾을 수 없습니다. Riot ID와 지역을 확인하세요.', henrik_rate_limited: '요청이 많습니다. 1분 뒤 다시 시도하세요.', too_many_requests: '요청이 많습니다. 1분 뒤 다시 시도하세요.', henrik_error: '데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.', henrik_key_missing: '지금은 전적을 볼 수 없습니다.', not_public: '이 서버는 통계를 공개하지 않습니다.', no_data: '아직 데이터가 없습니다.', bad_riot_id: '이름#태그 형식으로 입력하세요.', bad_region: '알 수 없는 지역입니다.', offline: '지금은 이용할 수 없습니다.' },
  };
  /** Friendly, translated text for an API error. */
  window.VH_ERR = function errText(err) {
    const lang = window.VH && window.VH.lang === 'ko' ? 'ko' : 'en';
    const code = err && err.status ? err.code : 'offline';
    return (ERR[lang] && ERR[lang][code]) || (err && err.message) || ERR[lang].offline;
  };

  // Server config (invite URL, which features are enabled). Null when the site is opened without the server.
  window.VH_CONFIG = window.VH_API('/api/config').catch(() => null);

  document.addEventListener('DOMContentLoaded', async () => {
    const burger = document.querySelector('.nav-burger');
    const links = document.querySelector('.nav-links');
    if (burger && links) {
      burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      links.addEventListener('click', (e) => { if (e.target.closest('a')) links.classList.remove('open'); });
    }

    // Reveal on scroll
    const els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add('in'));
    }

    // Invite buttons
    const cfg = await window.VH_CONFIG;
    document.querySelectorAll('[data-invite]').forEach((a) => {
      if (cfg && cfg.inviteUrl) {
        a.href = cfg.inviteUrl;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          alert(window.VH.t('invite.missing'));
        });
      }
    });

    const year = document.querySelector('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
