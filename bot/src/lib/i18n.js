'use strict';
/*
 * Korean / English strings. Each feature module registers its own strings with add().
 * Language = the server's setting (dashboard), falling back to the user's Discord locale in DMs.
 */
const settings = require('./settings');

const STRINGS = { en: {}, ko: {} };

function add(table) {
  for (const lang of Object.keys(table)) Object.assign(STRINGS[lang] || (STRINGS[lang] = {}), table[lang]);
}

function format(s, vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined || vars[k] === null ? m : String(vars[k])));
}

/*
 * Language rules
 *  - A member's own choice (/language) always wins for replies to that member.
 *  - Server setting "ko" or "en" fixes the language; "auto" follows each member's Discord language.
 *  - Messages everyone sees (panels, scrim cards, alerts) use the server language:
 *    the setting, or in "auto" the server's Discord community language.
 */
const guildLocales = new Map();
function setGuildLocale(guildId, locale) { if (guildId && locale) guildLocales.set(guildId, locale); }
const norm = (loc) => (String(loc || '').toLowerCase().startsWith('ko') ? 'ko' : 'en');

function langForGuild(guildId) {
  if (!guildId) return 'ko';
  const s = settings.get(guildId).general.language;
  if (s === 'ko' || s === 'en') return s;
  const loc = guildLocales.get(guildId);
  return loc ? norm(loc) : 'ko';
}

function userPref(userId) {
  try {
    const u = require('../services/players').userEntry(userId);
    return u && (u.lang === 'ko' || u.lang === 'en') ? u.lang : null;
  } catch (e) { return null; }
}

function langFor(ctx) {
  if (!ctx) return 'ko';
  if (ctx.user) {
    const pref = userPref(ctx.user.id);
    if (pref) return pref;
    const s = ctx.guildId ? settings.get(ctx.guildId).general.language : 'auto';
    if (s === 'ko' || s === 'en') return s;
    if (typeof ctx.locale === 'string') return norm(ctx.locale);
  }
  if (ctx.guildId) return langForGuild(ctx.guildId);
  if (typeof ctx.locale === 'string') return norm(ctx.locale);
  return 'ko';
}

/** t(ctx, key, vars) where ctx is an interaction, a guild id string, or { guildId } */
function t(ctx, key, vars) {
  const lang = typeof ctx === 'string' ? (ctx === 'en' || ctx === 'ko' ? ctx : langForGuild(ctx)) : langFor(ctx);
  const s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  return format(s, vars);
}

/** Bound translator for one context */
function make(lang) {
  const fn = (key, vars) => format((STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key, vars);
  fn.lang = lang;
  fn.locale = lang === 'ko' ? 'ko-KR' : 'en-US';
  return fn;
}

/** Translator for a context. t.guild is the translator for messages everyone in the server sees. */
function tr(ctx) {
  let lang;
  if (typeof ctx === 'string') lang = ctx === 'en' || ctx === 'ko' ? ctx : langForGuild(ctx);
  else lang = langFor(ctx);
  const fn = make(lang);
  const guildId = typeof ctx === 'string' ? (/^\d+$/.test(ctx) ? ctx : null) : ctx && ctx.guildId;
  fn.guild = guildId ? make(langForGuild(guildId)) : fn;
  return fn;
}

add({
  en: {
    'common.unavailable': 'Unavailable',
    'common.none': 'None',
    'common.unlinked': 'Not linked',
    'common.error': 'Something went wrong: {msg}',
    'common.noperm': 'You do not have permission to do that.',
    'common.admin_only': 'Only server managers (Manage Server) can do that.',
    'common.disabled': 'This feature is turned off for this server.',
    'common.guild_only': 'This command only works inside a server.',
    'common.not_found': 'That no longer exists.',
    'common.matches_n': '{n} games',
    'common.sample_small': 'Not enough games yet ({n}/{min}).',
    'common.updated': 'Updated {time}',
    'common.never': 'not yet',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.page': 'Page {p}/{total}',
    'common.prev': 'Previous',
    'common.next': 'Next',
    'common.dashboard': 'Open dashboard',
    'common.cancelled': 'Cancelled.',
    'common.done': 'Done.',
    'common.need_link': 'Link your Riot ID first with /register.',
    'common.user_not_linked': '{user} has not linked a Riot ID.',
    'common.private': 'This player keeps their profile private.',
    'err.not_found': 'Player not found. Check the Riot ID and region.',
    'err.rate_limited': 'Too many requests. Try again in a minute.',
    'err.api_error': 'Could not load data. Try again later.',
    'err.no_key': 'Stats are not set up on this bot yet.',
    'err.network': 'Could not load data. Try again later.',
  },
  ko: {
    'common.unavailable': '제공되지 않음',
    'common.none': '없음',
    'common.unlinked': '미연결',
    'common.error': '문제가 발생했습니다: {msg}',
    'common.noperm': '권한이 없습니다.',
    'common.admin_only': '서버 관리 권한이 있는 사람만 할 수 있습니다.',
    'common.disabled': '이 서버에서는 꺼져 있는 기능입니다.',
    'common.guild_only': '서버 안에서만 쓸 수 있는 명령어입니다.',
    'common.not_found': '더 이상 존재하지 않습니다.',
    'common.matches_n': '{n}경기',
    'common.sample_small': '경기 수가 부족합니다 ({n}/{min}).',
    'common.updated': '{time} 갱신',
    'common.never': '아직 없음',
    'common.yes': '예',
    'common.no': '아니요',
    'common.page': '{p}/{total} 페이지',
    'common.prev': '이전',
    'common.next': '다음',
    'common.dashboard': '대시보드 열기',
    'common.cancelled': '취소했습니다.',
    'common.done': '완료했습니다.',
    'common.need_link': '먼저 /register로 Riot ID를 연결하세요.',
    'common.user_not_linked': '{user} 님은 Riot ID를 연결하지 않았습니다.',
    'common.private': '이 플레이어는 프로필을 비공개로 설정했습니다.',
    'err.not_found': '플레이어를 찾을 수 없습니다. Riot ID와 지역을 확인하세요.',
    'err.rate_limited': '요청이 많습니다. 1분 뒤 다시 시도하세요.',
    'err.api_error': '데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.',
    'err.no_key': '아직 전적 기능이 설정되지 않았습니다.',
    'err.network': '데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.',
  },
});

module.exports = { t, tr, add, langFor, langForGuild, setGuildLocale };
