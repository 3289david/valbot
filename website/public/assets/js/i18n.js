/* Valorant Hub — English / Korean strings and language switch */
(function () {
  'use strict';

  const STRINGS = {
    en: {
      'meta.title': 'Valorant Hub — Valorant community bot for Discord',
      'nav.features': 'Features',
      'nav.players': 'Player search',
      'hero.find': 'Find a player',
      'lookup.full': 'Full profile',
      'nav.panels': 'Panels',
      'nav.premium': 'Pricing',
      'nav.commands': 'Commands',
      'nav.docs': 'Docs',
      'nav.faq': 'FAQ',
      'nav.dashboard': 'Dashboard',
      'nav.add': 'Add to Discord',
      'nav.menu': 'Menu',

      'hero.eyebrow': 'Premium is free for everyone right now',
      'hero.title': 'Your <span class="hl">Valorant community</span>, inside Discord.',
      'hero.lead': 'Scrims, parties, duels, seasons, tournaments and rank roles. All in one bot.',
      'hero.add': 'Add to Discord',
      'hero.dashboard': 'Dashboard',
      'hero.chip.servers': 'Servers:',

      'lookup.kicker': 'Rank lookup',
      'lookup.title': 'Check any rank.',
      'lookup.riotid': 'Riot ID',
      'lookup.riotid.ph': 'Name#TAG',
      'lookup.region': 'Region',
      'lookup.go': 'Search',
      'lookup.loading': 'Searching…',
      'lookup.empty': 'Enter a Riot ID.',
      'lookup.current': 'Rank',
      'lookup.rr': 'RR',
      'lookup.last': 'Last game',
      'lookup.peak': 'Peak',
      'lookup.unavailable': '-',
      'lookup.unrated': 'Unrated',
      'lookup.needgames': '{n} games to rank',
      'lookup.leaderboard': 'Leaderboard #{n}',
      'lookup.source': 'Updated {time}',
      'lookup.cached': '',
      'lookup.err.format': 'Use Name#TAG.',
      'lookup.err.offline': 'Search is unavailable right now.',
      'lookup.err.disabled': 'Search is unavailable right now.',

      'features.kicker': 'Features',
      'features.title': 'Play together. Compete together.',
      'features.lead': '',
      'f.scrims.tag': 'Scrims',
      'f.scrims.title': 'Fair teams, every time',
      'f.scrims.text': '1v1 to 5v5. Teams split by rank. Voice rooms and confirmed results.',
      'f.party.tag': 'Party Finder',
      'f.party.title': 'Find a squad fast',
      'f.party.text': 'Pick mode, tier and mic. One click to join.',
      'f.tourn.tag': 'Tournaments',
      'f.tourn.title': 'Run real tournaments',
      'f.tourn.text': 'Brackets, round robin, results and champions.',
      'f.duel.tag': 'Duels',
      'f.duel.title': '1v1 with a rating',
      'f.duel.text': 'Challenge anyone. Climb the Duel Rating.',
      'f.season.tag': 'Seasons',
      'f.season.title': 'Seasons and rewards',
      'f.season.text': 'Race for RR, wins or ACS. Top players get a role.',
      'm.roles.title': 'Tier roles',
      'm.roles.text': 'Iron to Radiant roles that update on their own.',
      'm.alerts.title': 'Alerts',
      'm.alerts.text': 'Rank ups, streaks and new scrims.',
      'm.analytics.title': 'Analysis',
      'm.analytics.text': 'Win rate, K/D, ACS, ADR, HS% and trends.',
      'm.clubs.title': 'Clubs',
      'm.clubs.text': 'Small teams with their own ranking.',
      'm.recap.title': 'Weekly Recap',
      'm.recap.text': 'Top climbs and MVP every week.',
      'm.passport.title': 'Your bot, your look',
      'm.passport.text': 'Name, image and banner per server.',

      'panels.kicker': 'Panels + commands',
      'panels.title': 'Buttons or commands. Your choice.',
      'panels.lead': 'Post a panel once. Members click. Power users type.',
      'panels.p1.title': 'One click',
      'panels.p1.text': 'Join, leave, balance and report with buttons.',
      'panels.p2.title': 'Always up to date',
      'panels.p2.text': 'Panels update themselves.',
      'panels.p3.title': 'Private',
      'panels.p3.text': 'Your profile opens only for you.',
      'panels.tab.scrim': 'Scrim',
      'panels.tab.hub': 'Hub',
      'panels.tab.party': 'Party',
      'panels.channel.scrim': 'scrims',
      'panels.channel.hub': 'valorant-hub',
      'panels.channel.party': 'lfg',
      'panels.used': 'used /scrim create',
      'pv.scrim.title': '5v5 Scrim',
      'pv.scrim.sub': 'Open · Map: Random',
      'pv.scrim.teamA': 'Joined · 0/10',
      'pv.scrim.teamB': '',
      'pv.scrim.open': 'Open slot',
      'pv.btn.join': 'Join',
      'pv.btn.leave': 'Leave',
      'pv.btn.balance': 'Balance teams',
      'pv.btn.voice': 'Random teams',
      'pv.select.map': '',
      'pv.hub.title': 'Valorant Hub',
      'pv.hub.sub': 'Link your Riot ID once. Then use everything below.',
      'pv.hub.s1': '',
      'pv.hub.s2': '',
      'pv.btn.register': 'Link Riot ID',
      'pv.btn.profile': 'My profile',
      'pv.btn.leaderboard': 'Leaderboard',
      'pv.btn.help': 'Help',
      'pv.party.title': 'Competitive party',
      'pv.party.sub': 'Looking for 4 more · 1/5',
      'pv.party.f1': 'Tier',
      'pv.party.f1v': 'Any',
      'pv.party.f2': 'Mic',
      'pv.party.f2v': 'Required',
      'pv.party.f3': 'Region',
      'pv.party.f3v': 'KR',
      'pv.btn.joinparty': 'Join',
      'pv.btn.details': 'Leave',

      'premium.kicker': 'Pricing',
      'premium.title': 'Premium is free for everyone right now.',
      'premium.text': 'Two plans. Every server gets Premium today.',
      'premium.badge': 'Everyone has this now',
      'plan.free': 'Free',
      'plan.premium': 'Premium',
      'plan.free.price': '0',
      'plan.premium.price': 'Free now',
      'plan.row.core': 'Profiles, stats, rank roles, alerts',
      'plan.row.play': 'Scrims, parties, duels',
      'plan.row.panels': 'Panels and dashboard',
      'plan.row.brand': 'Bot name and image per server',
      'plan.row.seasons': 'Seasons at once',
      'plan.row.tourn': 'Tournaments',
      'plan.row.clubs': 'Clubs per server',
      'plan.row.stats': 'Agent and map stats',
      'plan.row.history': 'Rank history',
      'plan.v.yes': 'Included',
      'plan.v.1': '1',
      'plan.v.unlimited': 'Unlimited',
      'plan.v.tf': 'Single elim, 8 teams',
      'plan.v.tp': '+ Round robin, 32 teams',
      'plan.v.5': '5',
      'plan.v.g20': 'Last 20 games',
      'plan.v.g100': 'Last 100 games',
      'plan.v.h10': '10 entries',
      'plan.v.h50': '50 entries',

      'steps.kicker': 'Setup',
      'steps.title': 'Ready in 3 steps',
      'steps.s1.title': 'Add the bot',
      'steps.s1.text': 'Click Add to Discord.',
      'steps.s2.title': 'Run /setup',
      'steps.s2.text': 'Create tier roles. Pick channels.',
      'steps.s3.title': 'Post panels',
      'steps.s3.text': 'Members do the rest.',

      'cmds.kicker': 'Commands',
      'cmds.title': 'Every panel has a command',
      'cmds.all': 'All commands',

      'faq.kicker': 'FAQ',
      'faq.title': 'Questions',
      'faq.q1': 'Is this made by Riot Games?',
      'faq.a1': 'No. It is an independent project.',
      'faq.q2': 'Where do stats come from?',
      'faq.a2': 'Your real competitive games. If a value is missing, we show nothing instead of guessing.',
      'faq.q3': 'Does linking prove I own the account?',
      'faq.a3': 'No. Accounts show as "Linked", not "Verified".',
      'faq.q4': 'Is it free?',
      'faq.a4': 'Yes. Premium is free for every server right now.',
      'faq.q5': 'Korean support?',
      'faq.a5': 'Yes. Pick Korean or English per server.',

      'cta.title': 'Start your first scrim tonight.',
      'cta.text': '',

      'foot.tagline': 'Valorant community bot for Discord.',
      'foot.product': 'Product',
      'foot.resources': 'Help',
      'foot.disclaimer': 'Valorant Hub is not endorsed by Riot Games. VALORANT and Riot Games are trademarks of Riot Games, Inc.',
      'foot.photos': 'Photos',
      'foot.on': 'on',

      'commands.title': 'Commands',
      'commands.lead': 'Every command and the panel that does the same.',
      'commands.search': 'Search',
      'commands.all': 'All',
      'commands.col.cmd': 'Command',
      'commands.col.group': 'Group',
      'commands.col.desc': 'What it does',
      'commands.col.panel': 'Panel',
      'commands.none': 'No results.',

      'invite.missing': 'The invite link is not ready yet.',
    },

    ko: {
      'meta.title': 'Valorant Hub — 디스코드 발로란트 커뮤니티 봇',
      'nav.features': '기능',
      'nav.players': '전적 검색',
      'hero.find': '전적 검색',
      'lookup.full': '전체 전적 보기',
      'nav.panels': '패널',
      'nav.premium': '요금제',
      'nav.commands': '명령어',
      'nav.docs': '가이드',
      'nav.faq': 'FAQ',
      'nav.dashboard': '대시보드',
      'nav.add': '디스코드에 추가',
      'nav.menu': '메뉴',

      'hero.eyebrow': '지금은 모든 서버 Premium 무료',
      'hero.title': '디스코드 안의 <span class="hl">발로란트 커뮤니티</span>.',
      'hero.lead': '내전, 파티, 대결, 시즌, 대회, 랭크 역할. 봇 하나로 끝.',
      'hero.add': '디스코드에 추가',
      'hero.dashboard': '대시보드',
      'hero.chip.servers': '사용 서버:',

      'lookup.kicker': '랭크 검색',
      'lookup.title': '누구든 랭크 확인.',
      'lookup.riotid': 'Riot ID',
      'lookup.riotid.ph': '이름#태그',
      'lookup.region': '지역',
      'lookup.go': '검색',
      'lookup.loading': '검색 중…',
      'lookup.empty': 'Riot ID를 입력하세요.',
      'lookup.current': '랭크',
      'lookup.rr': 'RR',
      'lookup.last': '최근 경기',
      'lookup.peak': '최고',
      'lookup.unavailable': '-',
      'lookup.unrated': '언레이티드',
      'lookup.needgames': '배치까지 {n}경기',
      'lookup.leaderboard': '리더보드 {n}위',
      'lookup.source': '{time} 갱신',
      'lookup.cached': '',
      'lookup.err.format': '이름#태그 형식으로 입력하세요.',
      'lookup.err.offline': '지금은 검색할 수 없습니다.',
      'lookup.err.disabled': '지금은 검색할 수 없습니다.',

      'features.kicker': '기능',
      'features.title': '같이 하고, 같이 경쟁하세요.',
      'features.lead': '',
      'f.scrims.tag': '내전',
      'f.scrims.title': '매번 공정한 팀',
      'f.scrims.text': '1v1부터 5v5까지. 랭크로 팀 배정. 음성 채널, 결과 확인까지.',
      'f.party.tag': '파티 모집',
      'f.party.title': '빠르게 파티 구하기',
      'f.party.text': '모드, 티어, 마이크만 고르세요. 클릭 한 번으로 참가.',
      'f.tourn.tag': '대회',
      'f.tourn.title': '진짜 대회 운영',
      'f.tourn.text': '대진표, 풀리그, 결과, 우승팀까지.',
      'f.duel.tag': '대결',
      'f.duel.title': '레이팅이 있는 1대1',
      'f.duel.text': '누구에게나 도전. Duel Rating을 올리세요.',
      'f.season.tag': '시즌',
      'f.season.title': '시즌과 보상',
      'f.season.text': 'RR, 승리, ACS로 경쟁. 상위권은 역할 보상.',
      'm.roles.title': '티어 역할',
      'm.roles.text': '아이언부터 레디언트까지 자동으로 바뀝니다.',
      'm.alerts.title': '알림',
      'm.alerts.text': '승급, 연승, 새 내전 소식.',
      'm.analytics.title': '분석',
      'm.analytics.text': '승률, K/D, ACS, ADR, HS%, 추세.',
      'm.clubs.title': '클럽',
      'm.clubs.text': '서버 안의 작은 팀과 클럽 랭킹.',
      'm.recap.title': '주간 요약',
      'm.recap.text': '매주 랭크 상승 TOP과 MVP.',
      'm.passport.title': '서버별 봇 꾸미기',
      'm.passport.text': '서버마다 이름, 이미지, 배너를 따로.',

      'panels.kicker': '패널 + 명령어',
      'panels.title': '버튼이든 명령어든 편한 대로.',
      'panels.lead': '패널은 한 번만 올리면 됩니다. 멤버는 클릭, 숙련자는 명령어.',
      'panels.p1.title': '클릭 한 번',
      'panels.p1.text': '참가, 취소, 팀 밸런스, 결과 등록까지 버튼으로.',
      'panels.p2.title': '항상 최신',
      'panels.p2.text': '패널이 알아서 갱신됩니다.',
      'panels.p3.title': '나만 보기',
      'panels.p3.text': '내 프로필은 나에게만 보입니다.',
      'panels.tab.scrim': '내전',
      'panels.tab.hub': '허브',
      'panels.tab.party': '파티',
      'panels.channel.scrim': '내전',
      'panels.channel.hub': '발로란트-허브',
      'panels.channel.party': '파티-모집',
      'panels.used': '/scrim create 사용',
      'pv.scrim.title': '5v5 내전',
      'pv.scrim.sub': '모집 중 · 맵: 랜덤',
      'pv.scrim.teamA': '참가자 · 0/10',
      'pv.scrim.teamB': '',
      'pv.scrim.open': '빈 자리',
      'pv.btn.join': '참가',
      'pv.btn.leave': '취소',
      'pv.btn.balance': '팀 밸런스',
      'pv.btn.voice': '랜덤 팀',
      'pv.select.map': '',
      'pv.hub.title': 'Valorant Hub',
      'pv.hub.sub': 'Riot ID를 한 번 연결하면 아래 기능을 모두 쓸 수 있습니다.',
      'pv.hub.s1': '',
      'pv.hub.s2': '',
      'pv.btn.register': 'Riot ID 연결',
      'pv.btn.profile': '내 프로필',
      'pv.btn.leaderboard': '랭킹',
      'pv.btn.help': '도움말',
      'pv.party.title': '경쟁전 파티',
      'pv.party.sub': '4명 더 모집 · 1/5',
      'pv.party.f1': '티어',
      'pv.party.f1v': '제한 없음',
      'pv.party.f2': '마이크',
      'pv.party.f2v': '필수',
      'pv.party.f3': '지역',
      'pv.party.f3v': 'KR',
      'pv.btn.joinparty': '참가',
      'pv.btn.details': '나가기',

      'premium.kicker': '요금제',
      'premium.title': '지금은 모두 Premium 무료.',
      'premium.text': '요금제는 두 가지. 현재 모든 서버가 Premium입니다.',
      'premium.badge': '현재 모두 적용 중',
      'plan.free': 'Free',
      'plan.premium': 'Premium',
      'plan.free.price': '0원',
      'plan.premium.price': '현재 무료',
      'plan.row.core': '프로필, 전적, 랭크 역할, 알림',
      'plan.row.play': '내전, 파티, 대결',
      'plan.row.panels': '패널과 대시보드',
      'plan.row.brand': '서버별 봇 이름·이미지',
      'plan.row.seasons': '동시 진행 시즌',
      'plan.row.tourn': '대회',
      'plan.row.clubs': '서버당 클럽',
      'plan.row.stats': '요원·맵 통계',
      'plan.row.history': '랭크 기록',
      'plan.v.yes': '포함',
      'plan.v.1': '1개',
      'plan.v.unlimited': '무제한',
      'plan.v.tf': '싱글 엘리미네이션, 8팀',
      'plan.v.tp': '+ 풀리그, 32팀',
      'plan.v.5': '5개',
      'plan.v.g20': '최근 20경기',
      'plan.v.g100': '최근 100경기',
      'plan.v.h10': '10개',
      'plan.v.h50': '50개',

      'steps.kicker': '시작하기',
      'steps.title': '3단계면 끝',
      'steps.s1.title': '봇 추가',
      'steps.s1.text': '디스코드에 추가를 누르세요.',
      'steps.s2.title': '/setup 실행',
      'steps.s2.text': '티어 역할 만들고 채널 고르기.',
      'steps.s3.title': '패널 올리기',
      'steps.s3.text': '나머지는 멤버들이 합니다.',

      'cmds.kicker': '명령어',
      'cmds.title': '모든 패널에는 명령어가 있습니다',
      'cmds.all': '전체 명령어',

      'faq.kicker': 'FAQ',
      'faq.title': '자주 묻는 질문',
      'faq.q1': 'Riot Games가 만든 건가요?',
      'faq.a1': '아니요. 독립 프로젝트입니다.',
      'faq.q2': '전적은 어디서 오나요?',
      'faq.a2': '실제 경쟁전 기록입니다. 없는 값은 추측하지 않고 비워 둡니다.',
      'faq.q3': '연결하면 본인 계정이 인증되나요?',
      'faq.a3': '아니요. "인증됨"이 아니라 "연결됨"으로 표시됩니다.',
      'faq.q4': '무료인가요?',
      'faq.a4': '네. 지금은 모든 서버에 Premium이 무료입니다.',
      'faq.q5': '한국어 되나요?',
      'faq.a5': '네. 서버마다 한국어나 영어를 고를 수 있습니다.',

      'cta.title': '오늘 밤 첫 내전을 열어 보세요.',
      'cta.text': '',

      'foot.tagline': '디스코드 발로란트 커뮤니티 봇.',
      'foot.product': '제품',
      'foot.resources': '도움말',
      'foot.disclaimer': 'Valorant Hub는 Riot Games의 보증을 받지 않았습니다. VALORANT 및 Riot Games는 Riot Games, Inc.의 상표입니다.',
      'foot.photos': '사진',
      'foot.on': '출처',

      'commands.title': '명령어',
      'commands.lead': '모든 명령어와 같은 일을 하는 패널.',
      'commands.search': '검색',
      'commands.all': '전체',
      'commands.col.cmd': '명령어',
      'commands.col.group': '그룹',
      'commands.col.desc': '기능',
      'commands.col.panel': '패널',
      'commands.none': '결과가 없습니다.',

      'invite.missing': '초대 링크가 아직 준비되지 않았습니다.',
    },
  };

  const KEY = 'vh-lang';
  const listeners = [];

  function initialLang() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'en' || saved === 'ko') return saved;
    } catch (e) { /* storage unavailable */ }
    return (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  let lang = initialLang();

  function t(key, vars) {
    const table = STRINGS[lang] || STRINGS.en;
    let s = key in table ? table[key] : key in STRINGS.en ? STRINGS.en[key] : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  }

  function apply(root) {
    const scope = root || document;
    document.documentElement.lang = lang;
    scope.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    scope.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    const titleKey = document.querySelector('meta[name="vh-title-key"]');
    if (titleKey) document.title = t(titleKey.content);
    document.querySelectorAll('.lang-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }

  function setLang(next) {
    if (next !== 'en' && next !== 'ko') return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* ignore */ }
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  function addStrings(extra) {
    for (const l of Object.keys(extra)) Object.assign(STRINGS[l] = STRINGS[l] || {}, extra[l]);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.lang-toggle button');
    if (b) setLang(b.dataset.lang);
  });

  window.VH = {
    t,
    apply,
    setLang,
    addStrings,
    get lang() { return lang; },
    onLang(fn) { listeners.push(fn); },
  };

  document.addEventListener('DOMContentLoaded', () => apply());
})();
