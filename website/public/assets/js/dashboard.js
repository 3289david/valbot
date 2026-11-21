/* Valorant Hub — dashboard app
 * Every number shown here comes from Discord, from the bot's data files, or from settings an admin saved.
 * When a source has no data yet, the page says so instead of showing a number.
 */
(function () {
  'use strict';

  window.VH.addStrings({
    en: {
      'd.title': 'Dashboard — Valorant Hub',
      'd.login.title': 'Server dashboard',
      'd.login.text': 'Log in to manage your servers.',
      'd.login.btn': 'Log in with Discord',
      'd.login.fine': 'We only read your name, avatar and server list.',
      'd.login.disabled': 'Login is not available yet.',
      'd.login.offline': 'The dashboard is unavailable right now.',
      'd.home': 'Back to site',
      'd.logout': 'Log out',
      'd.pick.title': 'Choose a server',
      'd.pick.text': 'Servers you manage.',
      'd.pick.none': 'You do not manage any servers.',
      'd.pick.on': 'Bot installed',
      'd.pick.off': 'Bot not installed',
      'd.pick.unknown': 'Bot status unavailable',
      'd.pick.manage': 'Manage',
      'd.pick.add': 'Add bot',
      'd.pick.boterr': 'Could not check the bot right now.',
      'd.switch': 'Switch server',
      'd.g.manage': 'Manage',
      'd.g.community': 'Community',
      'd.g.config': 'Configuration',
      'p.overview': 'Overview',
      'p.players': 'Players',
      'p.leaderboards': 'Leaderboards & Seasons',
      'p.autoroles': 'Auto Roles',
      'p.panels': 'Panels',
      'p.scrims': 'Scrims',
      'p.parties': 'Party Finder',
      'p.duels': 'Duels',
      'p.clubs': 'Clubs',
      'p.tournaments': 'Tournaments',
      'p.notifications': 'Notifications',
      'p.settings': 'Settings',
      'p.audit': 'Audit Log',
      'ov.discord': 'From Discord',
      'ov.members': 'Members (approx.)',
      'ov.online': 'Online (approx.)',
      'ov.text': 'Text channels',
      'ov.roles': 'Roles',
      'ov.bot': 'From the bot',
      'ov.players': 'Linked players',
      'ov.scrims': 'Scrims',
      'ov.parties': 'Parties',
      'ov.duels': 'Duels',
      'ov.clubs': 'Clubs',
      'ov.tournaments': 'Tournaments',
      'ov.waiting': 'Waiting for bot data',
      'ov.setup': 'Setup',
      'ov.panels': 'Panels with a channel',
      'ov.saved': 'Settings last saved',
      'ov.never': 'Not saved yet',
      'ov.plan': 'Plan',
      'ov.plan.premium': 'Premium · free for everyone now',
      'ov.plan.free': 'Free',
      'ov.fetched': 'Fetched {time}',
      'col.notreported.title': 'No data from the bot yet',
      'col.notreported.text': 'This fills in once members start using the bot.',
      'col.empty.title': 'Nothing here yet',
      'col.empty.text': 'No entries yet.',
      'col.count': '{n} entries',
      'save': 'Save changes',
      'revert': 'Discard',
      'saving': 'Saving…',
      'saved': 'Saved',
      'unsaved': 'Unsaved changes',
      'save.err': 'Could not save: {msg}',
      'none': 'None',
      'choose.channel': 'Choose a channel',
      'choose.role': 'Choose a role',
      'ar.title': 'Tier roles',
      'ar.desc': 'Each linked player gets their tier role automatically.',
      'ar.unlinked': 'Unlinked members',
      'ar.peak': 'Also give a peak-tier role',
      'ar.restore': 'Restore roles edited by hand on next sync',
      'ar.enable': 'Auto roles are turned off in Settings.',
      'pn.title': 'Panel channels',
      'pn.desc': 'Pick a channel for each panel. The bot posts it within 2 minutes.',
      'pn.hub': 'Hub', 'pn.leaderboard': 'Leaderboard', 'pn.scrims': 'Scrim Board', 'pn.lfg': 'Party Finder', 'pn.duels': 'Duel Arena', 'pn.clubs': 'Clubs', 'pn.tournament': 'Tournament', 'pn.admin': 'Admin Setup',
      'nt.title': 'Alerts',
      'nt.desc': 'Sent when something actually changes.',
      'nt.channel': 'Alert channel',
      'nt.rankUp': 'Rank up', 'nt.rankDown': 'Rank down', 'nt.rrChange': 'RR change after each match', 'nt.matchEnd': 'Match finished',
      'nt.streak': 'Win / loss streaks', 'nt.streakThreshold': 'Streak length', 'nt.seasonEnd': 'Season ending', 'nt.events': 'New scrims and parties', 'nt.tournament': 'Tournament updates',
      'nt.cooldown': 'Cooldown per player (minutes)',
      'wr.title': 'Weekly Recap',
      'wr.enabled': 'Post a weekly recap', 'wr.channel': 'Recap channel', 'wr.day': 'Day', 'wr.hour': 'Hour (server time zone)',
      'days': 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
      'st.general': 'General',
      'st.language': 'Bot language', 'st.timezone': 'Time zone', 'st.region': 'Default region', 'st.ranking': 'Default leaderboard', 'st.public': 'Public leaderboard on the website',
      'st.features': 'Features',
      'st.f.autoRoles': 'Auto tier roles', 'st.f.notifications': 'Alerts', 'st.f.scrims': 'Scrims', 'st.f.parties': 'Party Finder', 'st.f.duels': 'Duels', 'st.f.clubs': 'Clubs', 'st.f.tournaments': 'Tournaments', 'st.f.analytics': 'Analytics',
      'st.backup': 'Backup',
      'st.backup.desc': 'Save or restore these settings.',
      'st.export': 'Download backup', 'st.import': 'Restore from file', 'st.import.ok': 'Backup loaded. Review and save.', 'st.import.bad': 'That file is not a Valorant Hub settings backup.',
      'rank.rr': 'Current RR', 'rank.tier': 'Tier', 'rank.winrate': 'Win rate', 'rank.kd': 'K/D', 'rank.acs': 'ACS',
      'au.empty.title': 'No changes yet', 'au.empty.text': 'Every change is listed here.',
      'au.by': '{user} changed {n} setting(s)',
      'err.title': 'Something went wrong',
      'err.403': 'You need Manage Server permission in this server.',
      'err.409': 'The bot is not in this server yet.',
      'retry': 'Retry',
      'p.botprofile': 'Bot Profile',
      'bp.desc': 'How the bot looks in this server only.',
      'bp.name': 'Name', 'bp.name.hint': 'Max 32. Empty = default name.',
      'bp.bio': 'About me', 'bp.bio.hint': 'Max 190.',
      'bp.avatar': 'Profile image', 'bp.banner': 'Banner',
      'bp.img.hint': 'PNG, JPG, GIF or WEBP, under 8 MB.',
      'bp.choose': 'Choose image', 'bp.reset': 'Use default',
      'bp.default': 'Default', 'bp.custom': 'Custom', 'bp.none': 'No banner',
      'bp.pending': 'Will change on save',
      'bp.bad': 'Use a PNG, JPG, GIF or WEBP image under 8 MB.',
      'bp.saved': 'Saved. Discord may take a minute to show it everywhere.',
      'bp.preview': 'Preview',
      'st.lang.auto': 'Auto (each member\'s Discord language)',
      'me.title': 'My Riot accounts',
      'me.desc': 'Linked accounts follow you to every server with the bot.',
      'me.none': 'No account linked yet.',
      'me.link': 'Link', 'me.main': 'Main', 'me.makemain': 'Make main', 'me.unlink': 'Unlink', 'me.view': 'Player page',
      'me.private': 'Hide my profile from others', 'me.lang': 'Bot language for me',
      'me.lang.auto': 'Auto', 'me.waiting': 'Sending to the bot…', 'me.done': 'Done.', 'me.failed': 'Failed: {msg}',
      'me.slow': 'The bot has not picked this up yet. Is it running?',
      'p.actions': 'Actions',
      'ac.announce': 'Announcement', 'ac.announce.desc': 'Post a message as the bot.',
      'ac.channel': 'Channel', 'ac.title': 'Title (optional)', 'ac.text': 'Message', 'ac.send': 'Post',
      'ac.quick': 'Quick actions', 'ac.repost': 'Repost all panels now', 'ac.sync': 'Sync tier roles now',
      'ac.recent': 'Recent', 'ac.none': 'No actions yet.', 'ac.sent': 'Sent to the bot.',
      'ac.type.announce': 'Announcement', 'ac.type.repostPanels': 'Repost panels', 'ac.type.syncRoles': 'Sync roles',
      'ac.status.done': 'Done', 'ac.status.failed': 'Failed', 'ac.status.waiting': 'Waiting',
    },
    ko: {
      'd.title': '대시보드 — Valorant Hub',
      'd.login.title': '서버 대시보드',
      'd.login.text': '로그인하고 서버를 관리하세요.',
      'd.login.btn': '디스코드로 로그인',
      'd.login.fine': '이름, 아바타, 서버 목록만 읽습니다.',
      'd.login.disabled': '아직 로그인을 사용할 수 없습니다.',
      'd.login.offline': '지금은 대시보드를 열 수 없습니다.',
      'd.home': '사이트로 돌아가기',
      'd.logout': '로그아웃',
      'd.pick.title': '서버 선택',
      'd.pick.text': '관리 중인 서버',
      'd.pick.none': '관리 중인 서버가 없습니다.',
      'd.pick.on': '봇 설치됨',
      'd.pick.off': '봇 미설치',
      'd.pick.unknown': '봇 상태 확인 불가',
      'd.pick.manage': '관리',
      'd.pick.add': '봇 추가',
      'd.pick.boterr': '지금은 봇 상태를 확인할 수 없습니다.',
      'd.switch': '서버 변경',
      'd.g.manage': '관리',
      'd.g.community': '커뮤니티',
      'd.g.config': '구성',
      'p.overview': '개요',
      'p.players': '플레이어',
      'p.leaderboards': '랭킹과 시즌',
      'p.autoroles': '자동 역할',
      'p.panels': '패널',
      'p.scrims': '내전',
      'p.parties': '파티 모집',
      'p.duels': '대결',
      'p.clubs': '클럽',
      'p.tournaments': '대회',
      'p.notifications': '알림',
      'p.settings': '설정',
      'p.audit': '감사 로그',
      'ov.discord': '디스코드 정보',
      'ov.members': '멤버 (대략)',
      'ov.online': '온라인 (대략)',
      'ov.text': '텍스트 채널',
      'ov.roles': '역할',
      'ov.bot': '봇 데이터',
      'ov.players': '연결된 플레이어',
      'ov.scrims': '내전',
      'ov.parties': '파티',
      'ov.duels': '대결',
      'ov.clubs': '클럽',
      'ov.tournaments': '대회',
      'ov.waiting': '봇 데이터 대기 중',
      'ov.setup': '설정 현황',
      'ov.panels': '채널이 지정된 패널',
      'ov.saved': '마지막 설정 저장',
      'ov.never': '아직 저장 안 됨',
      'ov.plan': '요금제',
      'ov.plan.premium': 'Premium · 현재 모두 무료',
      'ov.plan.free': 'Free',
      'ov.fetched': '{time} 조회',
      'col.notreported.title': '아직 봇 데이터가 없습니다',
      'col.notreported.text': '멤버들이 봇을 쓰기 시작하면 채워집니다.',
      'col.empty.title': '아직 항목이 없습니다',
      'col.empty.text': '아직 항목이 없습니다.',
      'col.count': '{n}개 항목',
      'save': '변경 사항 저장',
      'revert': '취소',
      'saving': '저장 중…',
      'saved': '저장됨',
      'unsaved': '저장되지 않은 변경 사항',
      'save.err': '저장 실패: {msg}',
      'none': '없음',
      'choose.channel': '채널 선택',
      'choose.role': '역할 선택',
      'ar.title': '티어 역할',
      'ar.desc': '연결된 플레이어에게 티어 역할을 자동으로 줍니다.',
      'ar.unlinked': '미등록 멤버',
      'ar.peak': '최고 티어 역할도 지급',
      'ar.restore': '수동으로 바뀐 역할을 다음 동기화 때 복구',
      'ar.enable': '설정에서 자동 역할이 꺼져 있습니다.',
      'pn.title': '패널 채널',
      'pn.desc': '패널마다 채널을 고르세요. 2분 안에 봇이 올립니다.',
      'pn.hub': '허브', 'pn.leaderboard': '랭킹', 'pn.scrims': '내전 보드', 'pn.lfg': '파티 모집', 'pn.duels': '대결 아레나', 'pn.clubs': '클럽', 'pn.tournament': '대회', 'pn.admin': '관리자 설정',
      'nt.title': '알림',
      'nt.desc': '실제로 바뀐 게 있을 때만 보냅니다.',
      'nt.channel': '알림 채널',
      'nt.rankUp': '랭크 상승', 'nt.rankDown': '랭크 하락', 'nt.rrChange': '경기마다 RR 변화', 'nt.matchEnd': '경기 종료',
      'nt.streak': '연승 / 연패', 'nt.streakThreshold': '연속 횟수', 'nt.seasonEnd': '시즌 종료 임박', 'nt.events': '새 내전·파티', 'nt.tournament': '대회 소식',
      'nt.cooldown': '플레이어별 쿨다운 (분)',
      'wr.title': '주간 요약',
      'wr.enabled': '주간 요약 게시', 'wr.channel': '요약 채널', 'wr.day': '요일', 'wr.hour': '시각 (서버 시간대)',
      'days': '일요일,월요일,화요일,수요일,목요일,금요일,토요일',
      'st.general': '일반',
      'st.language': '봇 언어', 'st.timezone': '시간대', 'st.region': '기본 지역', 'st.ranking': '기본 랭킹', 'st.public': '웹사이트에 랭킹 공개',
      'st.features': '기능',
      'st.f.autoRoles': '티어 자동 역할', 'st.f.notifications': '알림', 'st.f.scrims': '내전', 'st.f.parties': '파티 모집', 'st.f.duels': '대결', 'st.f.clubs': '클럽', 'st.f.tournaments': '대회', 'st.f.analytics': '통계 분석',
      'st.backup': '백업',
      'st.backup.desc': '설정을 저장하거나 복원하세요.',
      'st.export': '백업 다운로드', 'st.import': '파일에서 복원', 'st.import.ok': '백업을 불러왔습니다. 확인 후 저장하세요.', 'st.import.bad': 'Valorant Hub 설정 백업 파일이 아닙니다.',
      'rank.rr': '현재 RR', 'rank.tier': '티어', 'rank.winrate': '승률', 'rank.kd': 'K/D', 'rank.acs': 'ACS',
      'au.empty.title': '아직 변경 기록이 없습니다', 'au.empty.text': '모든 변경이 여기에 남습니다.',
      'au.by': '{user} 님이 설정 {n}개를 변경',
      'err.title': '문제가 발생했습니다',
      'err.403': '이 서버의 서버 관리 권한이 필요합니다.',
      'err.409': '봇이 아직 이 서버에 없습니다.',
      'retry': '다시 시도',
      'p.botprofile': '봇 프로필',
      'bp.desc': '이 서버에서만 보이는 봇의 모습입니다.',
      'bp.name': '이름', 'bp.name.hint': '최대 32자. 비우면 기본 이름.',
      'bp.bio': '소개', 'bp.bio.hint': '최대 190자.',
      'bp.avatar': '프로필 이미지', 'bp.banner': '배너',
      'bp.img.hint': 'PNG, JPG, GIF, WEBP (8MB 이하).',
      'bp.choose': '이미지 선택', 'bp.reset': '기본값 사용',
      'bp.default': '기본값', 'bp.custom': '사용자 지정', 'bp.none': '배너 없음',
      'bp.pending': '저장하면 바뀝니다',
      'bp.bad': 'PNG, JPG, GIF, WEBP 이미지(8MB 이하)만 쓸 수 있습니다.',
      'bp.saved': '저장했습니다. 디스코드 전체에 보이기까지 1분 정도 걸릴 수 있습니다.',
      'bp.preview': '미리보기',
      'st.lang.auto': '자동 (멤버마다 디스코드 언어)',
      'me.title': '내 Riot 계정',
      'me.desc': '연결한 계정은 봇이 있는 모든 서버에서 쓰입니다.',
      'me.none': '아직 연결된 계정이 없습니다.',
      'me.link': '연결', 'me.main': '대표', 'me.makemain': '대표로', 'me.unlink': '연결 해제', 'me.view': '전적 페이지',
      'me.private': '다른 사람에게 내 프로필 숨기기', 'me.lang': '나에게 쓰는 봇 언어',
      'me.lang.auto': '자동', 'me.waiting': '봇에 전달 중…', 'me.done': '완료했습니다.', 'me.failed': '실패: {msg}',
      'me.slow': '봇이 아직 처리하지 않았습니다. 봇이 켜져 있는지 확인하세요.',
      'p.actions': '작업',
      'ac.announce': '공지', 'ac.announce.desc': '봇 이름으로 메시지를 올립니다.',
      'ac.channel': '채널', 'ac.title': '제목 (선택)', 'ac.text': '내용', 'ac.send': '올리기',
      'ac.quick': '빠른 작업', 'ac.repost': '패널 모두 다시 올리기', 'ac.sync': '티어 역할 지금 동기화',
      'ac.recent': '최근 작업', 'ac.none': '아직 작업이 없습니다.', 'ac.sent': '봇에 전달했습니다.',
      'ac.type.announce': '공지', 'ac.type.repostPanels': '패널 다시 올리기', 'ac.type.syncRoles': '역할 동기화',
      'ac.status.done': '완료', 'ac.status.failed': '실패', 'ac.status.waiting': '대기 중',
    },
  });

  const t = (k, v) => window.VH.t(k, v);
  const api = (p, o) => window.VH_API(p, o);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = document.getElementById('app');

  const ICONS = {
    overview: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    players: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.4-5.5 6.5-5.5s5.7 2.1 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4 1.6 4.5 4"/>',
    leaderboards: '<path d="M8 21V11M16 21V7M12 21V3M3 21h18"/>',
    autoroles: '<path d="M12 3l7 4v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V7l7-4z"/>',
    panels: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h4"/>',
    scrims: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/>',
    parties: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    duels: '<path d="M4 4l7 7M20 4l-7 7M8 16l-4 4M16 16l4 4M9 15l6-6"/>',
    clubs: '<path d="M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.5 6.5 19.5l1-6.3L3 8.9 9 8z"/>',
    tournaments: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    notifications: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    actions: '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>',
    botprofile: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/><path d="M17 3l1.5 1.5L21 2"/>',
    audit: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const NAV = [
    { group: 'd.g.manage', pages: ['overview', 'players', 'leaderboards', 'actions', 'audit'] },
    { group: 'd.g.community', pages: ['scrims', 'parties', 'duels', 'clubs', 'tournaments'] },
    { group: 'd.g.config', pages: ['autoroles', 'panels', 'notifications', 'botprofile', 'settings'] },
  ];
  // Bot-reported collections shown read-only
  const COLLECTION_PAGES = { players: 'players', scrims: 'scrims', parties: 'parties', duels: 'duels', clubs: 'clubs', tournaments: 'tournaments', leaderboards: 'seasons' };

  const TIERS = [
    ['iron', 'Iron', '#6b6b6b'], ['bronze', 'Bronze', '#a5774a'], ['silver', 'Silver', '#c0c6cc'], ['gold', 'Gold', '#e1b74c'],
    ['platinum', 'Platinum', '#3fb5c2'], ['diamond', 'Diamond', '#b089f0'], ['ascendant', 'Ascendant', '#2fbf71'],
    ['immortal', 'Immortal', '#d8475b'], ['radiant', 'Radiant', '#ffe28a'],
  ];
  const TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Manila', 'Australia/Sydney', 'Europe/London', 'Europe/Berlin', 'Europe/Istanbul', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Sao_Paulo', 'UTC'];

  const state = {
    me: null,
    guilds: null,
    botError: null,
    guildId: null,
    page: 'overview',
    overview: null,
    discordLists: null,
    settings: null,
    savedSettings: null,
    settingsUpdatedAt: null,
    saveStatus: '',
    saveKind: '',
  };

  const dateFmt = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return iso; }
  };
  const num = (n) => (typeof n === 'number' ? n.toLocaleString(window.VH.lang === 'ko' ? 'ko-KR' : 'en-US') : null);
  const guildIcon = (g) => g.icon
    ? `<img src="https://cdn.discordapp.com/icons/${esc(g.id)}/${esc(g.icon)}.png?size=128" alt="">`
    : esc((g.name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 3));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const dirty = () => state.settings && JSON.stringify(state.settings) !== JSON.stringify(state.savedSettings);

  /* ---------------- Routing ---------------- */

  function parseHash() {
    const m = location.hash.match(/^#\/g\/(\d+)(?:\/([a-z]+))?/);
    if (m) return { guildId: m[1], page: m[2] || 'overview' };
    return { guildId: null, page: null };
  }

  async function route() {
    const { guildId, page } = parseHash();
    if (!state.me) return;
    if (!guildId) {
      state.guildId = null;
      return renderPicker();
    }
    const guildChanged = guildId !== state.guildId;
    if (guildChanged && dirty() && !confirm(t('unsaved'))) {
      location.hash = `#/g/${state.guildId}/${state.page}`;
      return;
    }
    state.page = page;
    if (guildChanged) {
      state.guildId = guildId;
      state.overview = null;
      state.discordLists = null;
      state.settings = null;
      state.savedSettings = null;
      state.saveStatus = '';
    }
    renderShell();
    await renderPage();
  }

  /* ---------------- Login / picker ---------------- */

  function langToggle() {
    return `<div class="lang-toggle" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="${window.VH.lang === 'en'}">EN</button><button type="button" data-lang="ko" aria-pressed="${window.VH.lang === 'ko'}">KO</button></div>`;
  }

  async function renderLogin(reason) {
    const cfg = await window.VH_CONFIG;
    let note = '';
    let disabled = false;
    if (reason === 'offline' || !cfg) { note = `<div class="alert alert-warn" style="margin-bottom:18px;text-align:left">${esc(t('d.login.offline'))}</div>`; disabled = true; }
    else if (!cfg.loginEnabled) { note = `<div class="alert alert-warn" style="margin-bottom:18px;text-align:left">${esc(t('d.login.disabled'))}</div>`; disabled = true; }
    app.innerHTML = `
      <div class="login">
        <img src="https://images.unsplash.com/photo-1636489953081-c4ebbd50fa3a?auto=format&fit=crop&w=2000&q=78" alt="">
        <div class="login-top">${langToggle()}<a class="btn btn-ghost btn-sm" href="./">${esc(t('d.home'))}</a></div>
        <div class="login-card">
          <a class="brand" href="./"><img class="brand-mark" src="assets/img/favicon.svg" alt=""><span>VALORANT <b>HUB</b></span></a>
          <h1>${esc(t('d.login.title'))}</h1>
          <p>${esc(t('d.login.text'))}</p>
          ${note}
          <a class="btn btn-discord" href="/auth/login" ${disabled ? 'aria-disabled="true" style="pointer-events:none;opacity:.5"' : ''}>${esc(t('d.login.btn'))}</a>
          <p class="fine">${esc(t('d.login.fine'))}</p>
          <p class="fine">Photo: <a href="https://unsplash.com/photos/a-computer-desk-with-a-monitor-keyboard-and-mouse-JomkRNkzKhE" target="_blank" rel="noopener" style="text-decoration:underline">ELLA DON</a> / Unsplash</p>
        </div>
      </div>`;
  }

  function topbar(title) {
    const u = state.me;
    const avatar = u.avatar ? `<img src="https://cdn.discordapp.com/avatars/${esc(u.id)}/${esc(u.avatar)}.png?size=64" alt="">` : '<span class="ph"></span>';
    return `
      <div class="topbar">
        <button class="side-toggle" type="button" id="side-toggle" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
        <h2>${esc(title)}</h2>
        <div class="right">
          ${langToggle()}
          <span class="user">${avatar}<span class="uname">${esc(u.globalName || u.username)}</span></span>
          <button class="btn btn-ghost btn-sm" type="button" id="logout">${esc(t('d.logout'))}</button>
        </div>
      </div>`;
  }

  function renderPicker() {
    const list = state.guilds || [];
    const cards = list.map((g) => {
      const st = g.botInstalled === true ? `<div class="state on">${esc(t('d.pick.on'))}</div>` : g.botInstalled === false ? `<div class="state">${esc(t('d.pick.off'))}</div>` : `<div class="state">${esc(t('d.pick.unknown'))}</div>`;
      const action = g.botInstalled
        ? `<a class="btn btn-primary btn-sm" href="#/g/${esc(g.id)}/overview">${esc(t('d.pick.manage'))}</a>`
        : g.inviteUrl ? `<a class="btn btn-ghost btn-sm" href="${esc(g.inviteUrl)}" target="_blank" rel="noopener">${esc(t('d.pick.add'))}</a>` : '';
      return `<div class="gcard"><div class="gicon">${guildIcon(g)}</div><div class="info"><div class="name">${esc(g.name)}</div>${st}</div>${action}</div>`;
    }).join('');
    app.innerHTML = `
      <div class="main">
        ${topbar(t('d.pick.title')).replace('<button class="side-toggle"', '<button hidden class="side-toggle"')}
        <div class="content">
          <div id="me-accounts" class="panel" style="margin-bottom:24px"><div class="loading" style="padding:10px 0"><div class="spinner"></div></div></div>
          <p style="color:var(--text-2);margin-top:0">${esc(t('d.pick.text'))}</p>
          ${state.botError ? `<div class="alert alert-warn" style="margin-bottom:16px">${esc(t('d.pick.boterr', { msg: state.botError }))}</div>` : ''}
          ${list.length ? `<div class="picker">${cards}</div>` : `<div class="empty"><h4>${esc(t('d.pick.none'))}</h4></div>`}
        </div>
      </div>`;
    bindCommon();
    renderMyAccounts();
  }

  /* ---------------- Shell ---------------- */

  function currentGuild() {
    return (state.guilds || []).find((g) => g.id === state.guildId) || { id: state.guildId, name: state.guildId };
  }

  function renderShell() {
    const g = currentGuild();
    const nav = NAV.map((grp) => `
      <div class="side-group">${esc(t(grp.group))}</div>
      ${grp.pages.map((p) => `<a href="#/g/${esc(g.id)}/${p}" ${p === state.page ? 'aria-current="page"' : ''}>${icon(p)}<span>${esc(t('p.' + p))}</span></a>`).join('')}`).join('');
    app.innerHTML = `
      <div class="shell">
        <aside class="side" id="side">
          <a class="brand" href="./"><img class="brand-mark" src="assets/img/favicon.svg" alt=""><span>VALORANT <b>HUB</b></span></a>
          <a class="guild-switch" href="#/" title="${esc(t('d.switch'))}">
            <div class="gicon">${guildIcon(g)}</div>
            <div style="min-width:0"><div class="gname">${esc(g.name)}</div><div class="gsub">${esc(t('d.switch'))}</div></div>
          </a>
          <nav>${nav}</nav>
        </aside>
        <div class="main">
          ${topbar(t('p.' + state.page))}
          <div class="content" id="content"><div class="loading"><div class="spinner"></div></div></div>
        </div>
      </div>`;
    bindCommon();
  }

  function bindCommon() {
    const lo = document.getElementById('logout');
    if (lo) lo.addEventListener('click', async () => {
      try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
      location.href = './';
    });
    const st = document.getElementById('side-toggle');
    if (st) st.addEventListener('click', () => document.getElementById('side').classList.toggle('open'));
  }

  function showError(err) {
    const content = document.getElementById('content') || app;
    const msg = err.status === 403 ? t('err.403') : err.status === 409 ? t('err.409') : err.message;
    content.innerHTML = `<div class="panel"><h3>${esc(t('err.title'))}</h3><p class="desc" style="margin-top:8px">${esc(msg)}</p><button class="btn btn-ghost btn-sm" type="button" id="retry">${esc(t('retry'))}</button></div>`;
    document.getElementById('retry').addEventListener('click', () => renderPage());
  }

  /* ---------------- Data loaders ---------------- */

  async function ensureSettings() {
    if (state.settings) return;
    const res = await api(`/api/guilds/${state.guildId}/settings`);
    state.savedSettings = res.settings;
    state.settings = clone(res.settings);
    state.settingsUpdatedAt = res.updatedAt;
  }
  async function ensureDiscordLists() {
    if (state.discordLists) return;
    state.discordLists = await api(`/api/guilds/${state.guildId}/discord`);
  }

  /* ---------------- Pages ---------------- */

  async function renderPage() {
    const content = document.getElementById('content');
    if (!content) return;
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const p = state.page;
      if (p === 'overview') await pageOverview(content);
      else if (p === 'audit') await pageAudit(content);
      else if (p === 'autoroles') await pageAutoRoles(content);
      else if (p === 'panels') await pagePanels(content);
      else if (p === 'notifications') await pageNotifications(content);
      else if (p === 'settings') await pageSettings(content);
      else if (p === 'botprofile') await pageBotProfile(content);
      else if (p === 'actions') await pageActions(content);
      else if (COLLECTION_PAGES[p]) await pageCollection(content, COLLECTION_PAGES[p]);
      else content.innerHTML = '';
    } catch (err) {
      if (err.status === 401) { state.me = null; return renderLogin(); }
      showError(err);
    }
  }

  function kpi(label, value, src) {
    const v = value === null || value === undefined ? `<div class="value muted">${esc(t('ov.waiting'))}</div>` : `<div class="value">${esc(value)}</div>`;
    return `<div class="panel kpi"><div class="label">${esc(label)}</div>${v}${src ? `<div class="src">${esc(src)}</div>` : ''}</div>`;
  }

  async function pageOverview(content) {
    const ov = state.overview = await api(`/api/guilds/${state.guildId}/overview`);
    const cfg = await window.VH_CONFIG;
    const planKey = cfg && cfg.plan === 'free' ? 'ov.plan.free' : 'ov.plan.premium';
    const g = ov.guild;
    const col = (name) => (ov.collections[name] && ov.collections[name].available ? num(ov.collections[name].count) : null);
    const discordKpi = (label, n) => `<div class="panel kpi"><div class="label">${esc(label)}</div>${typeof n === 'number' ? `<div class="value">${esc(num(n))}</div>` : `<div class="value muted">${esc(t('lookup.unavailable'))}</div>`}</div>`;
    content.innerHTML = `
      <div class="guild-hero">
        <div class="gicon">${guildIcon(g)}</div>
        <div><h1>${esc(g.name)}</h1><div class="meta">${esc(t('ov.fetched', { time: dateFmt(ov.fetchedAt) }))}</div></div>
      </div>
      <div class="section-title">${esc(t('ov.discord'))}</div>
      <div class="grid grid-4">
        ${discordKpi(t('ov.members'), g.approximateMemberCount)}
        ${discordKpi(t('ov.online'), g.approximatePresenceCount)}
        ${discordKpi(t('ov.text'), g.textChannelCount)}
        ${discordKpi(t('ov.roles'), g.roleCount)}
      </div>
      <div class="section-title">${esc(t('ov.bot'))}</div>
      <div class="grid grid-3">
        ${kpi(t('ov.players'), col('players'))}
        ${kpi(t('ov.scrims'), col('scrims'))}
        ${kpi(t('ov.parties'), col('parties'))}
        ${kpi(t('ov.duels'), col('duels'))}
        ${kpi(t('ov.clubs'), col('clubs'))}
        ${kpi(t('ov.tournaments'), col('tournaments'))}
      </div>
      <div class="section-title">${esc(t('ov.setup'))}</div>
      <div class="grid grid-3">
        <div class="panel kpi"><div class="label">${esc(t('ov.plan'))}</div><div class="value" style="font-size:20px">${esc(t(planKey))}</div></div>
        <div class="panel kpi"><div class="label">${esc(t('ov.panels'))}</div><div class="value">${ov.panels.configured} / ${ov.panels.total}</div></div>
        <div class="panel kpi"><div class="label">${esc(t('ov.saved'))}</div>${ov.settingsUpdatedAt ? `<div class="value" style="font-size:20px">${esc(dateFmt(ov.settingsUpdatedAt))}</div>` : `<div class="value muted">${esc(t('ov.never'))}</div>`}</div>
      </div>`;
  }

  async function pageCollection(content, name) {
    const res = await api(`/api/guilds/${state.guildId}/collection/${name}`);
    const emptyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>';
    if (!res.available) {
      content.innerHTML = `<div class="panel empty">${emptyIcon}<h4>${esc(t('col.notreported.title'))}</h4><p>${esc(t('col.notreported.text'))}</p></div>`;
      return;
    }
    if (!res.items.length) {
      content.innerHTML = `<div class="panel empty">${emptyIcon}<h4>${esc(t('col.empty.title'))}</h4><p>${esc(t('col.empty.text'))}</p></div>`;
      return;
    }
    // Columns come from the bot's own records; nothing is added or computed here.
    const cols = [];
    res.items.slice(0, 50).forEach((it) => Object.keys(it).forEach((k) => { if (!cols.includes(k) && cols.length < 7) cols.push(k); }));
    const cell = (v, col, it) => {
      if (name === 'players' && col === 'riotId' && typeof v === 'string' && v.includes('#')) {
        const i = v.lastIndexOf('#');
        return `<a href="/p/${encodeURIComponent(it.region || 'ap')}/${encodeURIComponent(v.slice(0, i))}/${encodeURIComponent(v.slice(i + 1))}" style="color:var(--teal)">${esc(v)}</a>`;
      }
      if (v === null || v === undefined) return '<span style="color:var(--text-3)">—</span>';
      if (typeof v === 'object') return `<code>${esc(JSON.stringify(v).slice(0, 80))}</code>`;
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return esc(dateFmt(v));
      return esc(v);
    };
    content.innerHTML = `
      <p style="color:var(--text-3);margin-top:0">${esc(t('col.count', { n: num(res.items.length) }))}</p>
      <div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${res.items.map((it) => `<tr>${cols.map((c) => `<td>${cell(it[c], c, it)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  async function pageAudit(content) {
    const res = await api(`/api/guilds/${state.guildId}/audit`);
    if (!res.items.length) {
      content.innerHTML = `<div class="panel empty"><h4>${esc(t('au.empty.title'))}</h4><p>${esc(t('au.empty.text'))}</p></div>`;
      return;
    }
    content.innerHTML = `<div class="panel">${res.items.map((a) => `
      <div class="audit-item">
        <div><strong>${esc(t('au.by', { user: a.username || a.userId, n: (a.changes || []).length }))}</strong> <span class="when">· ${esc(dateFmt(a.at))}</span></div>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">${(a.changes || []).map((c) => `<code>${esc(c.key)}: ${esc(JSON.stringify(c.from))} → ${esc(JSON.stringify(c.to))}</code>`).join('')}</div>
      </div>`).join('')}</div>`;
  }

  /* ----- settings-bound helpers ----- */

  function getPath(path) { return path.split('.').reduce((o, k) => (o ? o[k] : undefined), state.settings); }
  function setPath(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((o, k) => o[k], state.settings)[last] = value;
  }

  function toggleRow(path, label) {
    const id = 'f-' + path.replace(/\./g, '-');
    return `<div class="form-row"><label class="lbl" for="${id}">${esc(label)}</label><label class="switch"><input type="checkbox" id="${id}" data-bind="${esc(path)}" data-type="bool" ${getPath(path) ? 'checked' : ''}><span></span></label></div>`;
  }
  function selectRow(path, label, options, hint) {
    const id = 'f-' + path.replace(/\./g, '-');
    const cur = getPath(path);
    return `<div class="form-row"><div><label class="lbl" for="${id}">${label}</label>${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>
      <select class="select" id="${id}" data-bind="${esc(path)}">${options.map((o) => `<option value="${esc(o.value)}" ${String(cur ?? '') === String(o.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></div>`;
  }
  function numberRow(path, label, min, max) {
    const id = 'f-' + path.replace(/\./g, '-');
    return `<div class="form-row"><label class="lbl" for="${id}">${esc(label)}</label><input class="input" style="max-width:140px" type="number" id="${id}" min="${min}" max="${max}" data-bind="${esc(path)}" data-type="int" value="${esc(getPath(path))}"></div>`;
  }
  const channelOptions = () => [{ value: '', label: t('none') }].concat(state.discordLists.textChannels.map((c) => ({ value: c.id, label: `# ${c.name}${c.category ? `  (${c.category})` : ''}` })));
  const roleOptions = () => [{ value: '', label: t('none') }].concat(state.discordLists.roles.map((r) => ({ value: r.id, label: `@ ${r.name}` })));

  function savebar() {
    const d = dirty();
    const status = state.saveStatus || (d ? t('unsaved') : state.settingsUpdatedAt ? `${t('ov.saved')}: ${dateFmt(state.settingsUpdatedAt)}` : t('ov.never'));
    return `<div class="savebar"><span class="status ${state.saveKind}" id="save-status">${esc(status)}</span>
      <div class="btns"><button class="btn btn-ghost btn-sm" type="button" id="revert" ${d ? '' : 'disabled'}>${esc(t('revert'))}</button>
      <button class="btn btn-primary btn-sm" type="button" id="save" ${d ? '' : 'disabled'}>${esc(t('save'))}</button></div></div>`;
  }

  function bindForm(content) {
    content.querySelectorAll('[data-bind]').forEach((el) => {
      el.addEventListener('change', () => {
        const path = el.dataset.bind;
        let v;
        if (el.dataset.type === 'bool') v = el.checked;
        else if (el.dataset.type === 'int') v = parseInt(el.value, 10);
        else v = el.value === '' ? null : el.value;
        if (path === 'weeklyRecap.day' || path === 'weeklyRecap.hour') v = parseInt(el.value, 10);
        setPath(path, v);
        state.saveStatus = '';
        state.saveKind = '';
        refreshSavebar(content);
      });
    });
    refreshSavebar(content);
  }

  function refreshSavebar(content) {
    const holder = content.querySelector('#savebar-holder');
    if (!holder) return;
    holder.innerHTML = savebar();
    holder.querySelector('#save').addEventListener('click', () => save(content));
    holder.querySelector('#revert').addEventListener('click', () => {
      state.settings = clone(state.savedSettings);
      state.saveStatus = '';
      renderPage();
    });
  }

  async function save(content) {
    state.saveStatus = t('saving');
    state.saveKind = '';
    refreshSavebar(content);
    try {
      const res = await api(`/api/guilds/${state.guildId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ settings: state.settings }),
      });
      state.savedSettings = res.settings;
      state.settings = clone(res.settings);
      state.settingsUpdatedAt = res.updatedAt;
      state.saveStatus = t('saved');
      state.saveKind = 'ok';
      renderPage();
    } catch (err) {
      state.saveStatus = t('save.err', { msg: err.message });
      state.saveKind = 'err';
      refreshSavebar(content);
    }
  }

  async function pageAutoRoles(content) {
    await Promise.all([ensureSettings(), ensureDiscordLists()]);
    const off = !state.settings.features.autoRoles;
    content.innerHTML = `
      ${off ? `<div class="alert alert-warn" style="margin-bottom:16px">${esc(t('ar.enable'))}</div>` : ''}
      <div class="panel">
        <h3>${esc(t('ar.title'))}</h3><p class="desc">${esc(t('ar.desc'))}</p>
        ${TIERS.map(([key, name, color]) => selectRow(`tierRoles.${key}`, `<span class="tier-dot" style="background:${color}"></span>${esc(name)}`, roleOptions())).join('')}
        ${selectRow('tierRoles.unlinked', esc(t('ar.unlinked')), roleOptions())}
        ${toggleRow('tierRoles.peakRole', t('ar.peak'))}
        ${toggleRow('tierRoles.restoreManualEdits', t('ar.restore'))}
      </div>
      <div id="savebar-holder"></div>`;
    bindForm(content);
  }

  async function pagePanels(content) {
    await Promise.all([ensureSettings(), ensureDiscordLists()]);
    const keys = ['hub', 'leaderboard', 'scrims', 'lfg', 'duels', 'clubs', 'tournament', 'admin'];
    content.innerHTML = `
      <div class="panel">
        <h3>${esc(t('pn.title'))}</h3><p class="desc">${esc(t('pn.desc'))}</p>
        ${keys.map((k) => selectRow(`panels.${k}`, esc(t('pn.' + k)), channelOptions())).join('')}
      </div>
      <div id="savebar-holder"></div>`;
    bindForm(content);
  }

  async function pageNotifications(content) {
    await Promise.all([ensureSettings(), ensureDiscordLists()]);
    const days = t('days').split(',').map((label, i) => ({ value: i, label }));
    const hours = Array.from({ length: 24 }, (_, h) => ({ value: h, label: `${String(h).padStart(2, '0')}:00` }));
    content.innerHTML = `
      <div class="panel">
        <h3>${esc(t('nt.title'))}</h3><p class="desc">${esc(t('nt.desc'))}</p>
        ${selectRow('notifications.channel', esc(t('nt.channel')), channelOptions())}
        ${['rankUp', 'rankDown', 'rrChange', 'matchEnd', 'streak'].map((k) => toggleRow(`notifications.${k}`, t('nt.' + k))).join('')}
        ${numberRow('notifications.streakThreshold', t('nt.streakThreshold'), 2, 20)}
        ${['seasonEnd', 'events', 'tournament'].map((k) => toggleRow(`notifications.${k}`, t('nt.' + k))).join('')}
        ${numberRow('notifications.cooldownMinutes', t('nt.cooldown'), 0, 1440)}
      </div>
      <div class="panel" style="margin-top:16px">
        <h3>${esc(t('wr.title'))}</h3>
        ${toggleRow('weeklyRecap.enabled', t('wr.enabled'))}
        ${selectRow('weeklyRecap.channel', esc(t('wr.channel')), channelOptions())}
        ${selectRow('weeklyRecap.day', esc(t('wr.day')), days)}
        ${selectRow('weeklyRecap.hour', esc(t('wr.hour')), hours)}
      </div>
      <div id="savebar-holder"></div>`;
    bindForm(content);
  }

  async function pageSettings(content) {
    await ensureSettings();
    const tz = TIMEZONES.includes(state.settings.general.timezone) ? TIMEZONES : [state.settings.general.timezone].concat(TIMEZONES);
    content.innerHTML = `
      <div class="panel">
        <h3>${esc(t('st.general'))}</h3>
        ${selectRow('general.language', esc(t('st.language')), [{ value: 'auto', label: t('st.lang.auto') }, { value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }])}
        ${selectRow('general.timezone', esc(t('st.timezone')), tz.map((z) => ({ value: z, label: z })))}
        ${selectRow('general.region', esc(t('st.region')), ['kr', 'ap', 'na', 'eu', 'latam', 'br'].map((r) => ({ value: r, label: r.toUpperCase() })))}
        ${selectRow('general.defaultRanking', esc(t('st.ranking')), ['rr', 'tier', 'winrate', 'kd', 'acs'].map((r) => ({ value: r, label: t('rank.' + r) })))}
        ${toggleRow('general.publicStats', t('st.public'))}
      </div>
      <div class="panel" style="margin-top:16px">
        <h3>${esc(t('st.features'))}</h3>
        ${['autoRoles', 'notifications', 'scrims', 'parties', 'duels', 'clubs', 'tournaments', 'analytics'].map((k) => toggleRow(`features.${k}`, t('st.f.' + k))).join('')}
      </div>
      <div class="panel" style="margin-top:16px">
        <h3>${esc(t('st.backup'))}</h3><p class="desc">${esc(t('st.backup.desc'))}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" type="button" id="export">${esc(t('st.export'))}</button>
          <label class="btn btn-ghost btn-sm" for="import-file">${esc(t('st.import'))}</label>
          <input type="file" id="import-file" accept="application/json,.json" hidden>
        </div>
        <div id="import-msg" style="margin-top:12px"></div>
      </div>
      <div id="savebar-holder"></div>`;
    bindForm(content);

    content.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ type: 'valorant-hub-settings', version: 1, guildId: state.guildId, exportedAt: new Date().toISOString(), settings: state.savedSettings }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `valorant-hub-settings-${state.guildId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    content.querySelector('#import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const msg = content.querySelector('#import-msg');
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || data.type !== 'valorant-hub-settings' || typeof data.settings !== 'object') throw new Error('bad');
        // Keep only keys the dashboard knows; the server validates again on save.
        const merged = clone(state.settings);
        (function merge(dst, src) {
          Object.keys(dst).forEach((k) => {
            if (!(k in src)) return;
            if (dst[k] !== null && typeof dst[k] === 'object') merge(dst[k], src[k] || {});
            else dst[k] = src[k];
          });
        })(merged, data.settings);
        state.settings = merged;
        await renderPage();
        document.getElementById('import-msg').innerHTML = `<div class="alert alert-info">${esc(t('st.import.ok'))}</div>`;
      } catch (err) {
        msg.innerHTML = `<div class="alert alert-bad">${esc(t('st.import.bad'))}</div>`;
      }
    });
  }

  /* ----- Bot profile (per server) ----- */

  async function pageBotProfile(content) {
    const cur = await api(`/api/guilds/${state.guildId}/branding`);
    const pending = {};
    const MAX = 8 * 1024 * 1024;
    const TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    const render = () => {
      const name = 'nick' in pending ? pending.nick : cur.nick;
      const bio = 'bio' in pending ? pending.bio : cur.bio;
      const avatar = 'avatar' in pending ? (pending.avatar || null) : cur.avatarUrl;
      const banner = 'banner' in pending ? pending.banner : cur.bannerUrl;
      const avatarState = 'avatar' in pending ? t('bp.pending') : cur.customAvatar ? t('bp.custom') : t('bp.default');
      const bannerState = 'banner' in pending ? t('bp.pending') : cur.bannerUrl ? t('bp.custom') : t('bp.none');
      const dirtyNow = Object.keys(pending).length > 0;
      content.innerHTML = `
        <div class="grid grid-2" style="align-items: start">
          <div class="panel">
            <h3>${esc(t('p.botprofile'))}</h3><p class="desc">${esc(t('bp.desc'))}</p>
            <div class="form-row"><div><label class="lbl" for="bp-name">${esc(t('bp.name'))}</label><div class="hint">${esc(t('bp.name.hint'))}</div></div>
              <input class="input" id="bp-name" maxlength="32" placeholder="${esc(cur.defaultName)}" value="${esc(name || '')}"></div>
            <div class="form-row"><div><label class="lbl" for="bp-bio">${esc(t('bp.bio'))}</label><div class="hint">${esc(t('bp.bio.hint'))}</div></div>
              <textarea class="input" id="bp-bio" maxlength="190" rows="3" style="max-width:380px;resize:vertical">${esc(bio || '')}</textarea></div>
            <div class="form-row"><div><div class="lbl">${esc(t('bp.avatar'))}</div><div class="hint">${esc(t('bp.img.hint'))}</div></div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <label class="btn btn-ghost btn-sm" for="bp-avatar-file">${esc(t('bp.choose'))}</label>
                <input type="file" id="bp-avatar-file" accept="image/png,image/jpeg,image/gif,image/webp" hidden>
                <button class="btn btn-ghost btn-sm" type="button" id="bp-avatar-reset">${esc(t('bp.reset'))}</button>
                <span class="badge">${esc(avatarState)}</span></div></div>
            <div class="form-row"><div><div class="lbl">${esc(t('bp.banner'))}</div><div class="hint">${esc(t('bp.img.hint'))}</div></div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <label class="btn btn-ghost btn-sm" for="bp-banner-file">${esc(t('bp.choose'))}</label>
                <input type="file" id="bp-banner-file" accept="image/png,image/jpeg,image/gif,image/webp" hidden>
                <button class="btn btn-ghost btn-sm" type="button" id="bp-banner-reset">${esc(t('bp.reset'))}</button>
                <span class="badge">${esc(bannerState)}</span></div></div>
            <div id="bp-msg" style="margin-top:12px"></div>
          </div>
          <div class="panel" style="padding:0;overflow:hidden">
            <div style="height:110px;background:${banner ? `url('${esc(banner)}') center/cover` : 'linear-gradient(135deg,#2b2d31,#1e1f22)'}"></div>
            <div style="padding:0 20px 22px;margin-top:-40px">
              <div style="width:84px;height:84px;border-radius:50%;border:6px solid var(--surface);overflow:hidden;background:var(--surface-2)">${avatar ? `<img src="${esc(avatar)}" alt="" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
              <div style="font-weight:700;font-size:19px;margin-top:8px">${esc(name || cur.defaultName)} <span class="badge" style="background:#5865f2;color:#fff">APP</span></div>
              <div style="color:var(--text-3);font-size:13px;margin-top:2px">${esc(t('bp.preview'))}</div>
              ${bio ? `<div style="margin-top:12px;font-size:14px;color:var(--text-2);white-space:pre-wrap">${esc(bio)}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="savebar"><span class="status ${state.saveKind}" id="save-status">${esc(state.saveStatus || (dirtyNow ? t('unsaved') : cur.updatedAt ? `${t('ov.saved')}: ${dateFmt(cur.updatedAt)}` : ''))}</span>
          <div class="btns"><button class="btn btn-ghost btn-sm" type="button" id="bp-revert" ${dirtyNow ? '' : 'disabled'}>${esc(t('revert'))}</button>
          <button class="btn btn-primary btn-sm" type="button" id="bp-save" ${dirtyNow ? '' : 'disabled'}>${esc(t('save'))}</button></div></div>`;

      const nameEl = content.querySelector('#bp-name');
      const bioEl = content.querySelector('#bp-bio');
      nameEl.addEventListener('change', () => { pending.nick = nameEl.value.trim() || null; if (pending.nick === (cur.nick || null)) delete pending.nick; state.saveStatus = ''; render(); });
      bioEl.addEventListener('change', () => { pending.bio = bioEl.value.trim() || null; if (pending.bio === (cur.bio || null)) delete pending.bio; state.saveStatus = ''; render(); });
      const pick = (key) => (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!TYPES.includes(f.type) || f.size > MAX) { content.querySelector('#bp-msg').innerHTML = `<div class="alert alert-bad">${esc(t('bp.bad'))}</div>`; return; }
        const r = new FileReader();
        r.onload = () => { pending[key] = r.result; state.saveStatus = ''; render(); };
        r.readAsDataURL(f);
      };
      content.querySelector('#bp-avatar-file').addEventListener('change', pick('avatar'));
      content.querySelector('#bp-banner-file').addEventListener('change', pick('banner'));
      content.querySelector('#bp-avatar-reset').addEventListener('click', () => { pending.avatar = null; render(); });
      content.querySelector('#bp-banner-reset').addEventListener('click', () => { pending.banner = null; render(); });
      content.querySelector('#bp-revert').addEventListener('click', () => { Object.keys(pending).forEach((k) => delete pending[k]); state.saveStatus = ''; render(); });
      content.querySelector('#bp-save').addEventListener('click', async () => {
        state.saveStatus = t('saving'); state.saveKind = ''; render();
        try {
          const next = await api(`/api/guilds/${state.guildId}/branding`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(pending),
          });
          Object.assign(cur, next);
          Object.keys(pending).forEach((k) => delete pending[k]);
          state.saveStatus = t('bp.saved'); state.saveKind = 'ok';
        } catch (err) {
          state.saveStatus = t('save.err', { msg: err.message }); state.saveKind = 'err';
        }
        render();
      });
    };
    state.saveStatus = ''; state.saveKind = '';
    render();
  }

  /* ----- My Riot accounts (on the server picker) ----- */

  async function waitForRequest(id) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const st = await api(`/api/me/requests/${id}`);
      if (st.status === 'done' || st.status === 'failed') return st;
    }
    return { status: 'slow' };
  }

  async function renderMyAccounts(note) {
    const box = document.getElementById('me-accounts');
    if (!box) return;
    let me;
    try { me = await api('/api/me/accounts'); } catch (e) { box.remove(); return; }
    const playerUrl = (a) => `/p/${encodeURIComponent(a.region || 'ap')}/${encodeURIComponent(a.name)}/${encodeURIComponent(a.tag)}`;
    box.innerHTML = `
      <h3>${esc(t('me.title'))}</h3><p class="desc">${esc(t('me.desc'))}</p>
      ${me.accounts.length ? me.accounts.map((a) => `
        <div class="form-row" style="grid-template-columns:1fr auto">
          <div><span class="lbl">${a.name ? `${esc(a.name)}#${esc(a.tag)}` : esc(a.puuid.slice(0, 8))}</span> ${a.main ? `<span class="badge good">${esc(t('me.main'))}</span>` : ''}
            <div class="hint">${esc((a.region || '').toUpperCase())}${a.tier ? ` · ${esc(a.tier)}${a.rr !== null ? ` ${a.rr} RR` : ''}` : ''}</div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${a.name ? `<a class="btn btn-ghost btn-sm" href="${playerUrl(a)}">${esc(t('me.view'))}</a>` : ''}
            ${a.main ? '' : `<button class="btn btn-ghost btn-sm" data-req="main" data-puuid="${esc(a.puuid)}">${esc(t('me.makemain'))}</button>`}
            <button class="btn btn-ghost btn-sm" data-req="unlink" data-puuid="${esc(a.puuid)}">${esc(t('me.unlink'))}</button>
          </div>
        </div>`).join('') : `<p class="hint" style="margin:0 0 10px">${esc(t('me.none'))}</p>`}
      <form id="me-link" style="display:grid;grid-template-columns:1fr 110px auto;gap:8px;margin-top:12px">
        <input class="input" id="me-riot" placeholder="Name#TAG" maxlength="22">
        <select class="select" id="me-region"><option value="kr">KR</option><option value="ap">AP</option><option value="na">NA</option><option value="eu">EU</option><option value="latam">LATAM</option><option value="br">BR</option></select>
        <button class="btn btn-primary btn-sm" type="submit">${esc(t('me.link'))}</button>
      </form>
      <div class="form-row" style="margin-top:8px"><label class="lbl" for="me-private">${esc(t('me.private'))}</label><label class="switch"><input type="checkbox" id="me-private" ${me.private ? 'checked' : ''} ${me.accounts.length ? '' : 'disabled'}><span></span></label></div>
      <div class="form-row"><label class="lbl" for="me-lang">${esc(t('me.lang'))}</label><select class="select" id="me-lang" style="max-width:200px">
        <option value="auto" ${me.lang === 'auto' ? 'selected' : ''}>${esc(t('me.lang.auto'))}</option><option value="ko" ${me.lang === 'ko' ? 'selected' : ''}>한국어</option><option value="en" ${me.lang === 'en' ? 'selected' : ''}>English</option></select></div>
      <div id="me-msg">${note || ''}</div>`;

    const send = async (body) => {
      const msg = document.getElementById('me-msg');
      msg.innerHTML = `<div class="alert alert-info">${esc(t('me.waiting'))}</div>`;
      try {
        const { id } = await api('/api/me/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
        const st = await waitForRequest(id);
        const out = st.status === 'done' ? `<div class="alert alert-info">${esc(t('me.done'))}</div>`
          : st.status === 'failed' ? `<div class="alert alert-bad">${esc(t('me.failed', { msg: st.message || '' }))}</div>`
            : `<div class="alert alert-warn">${esc(t('me.slow'))}</div>`;
        renderMyAccounts(out);
      } catch (err) {
        msg.innerHTML = `<div class="alert alert-bad">${esc(window.VH_ERR ? window.VH_ERR(err) : err.message)}</div>`;
      }
    };
    box.querySelector('#me-link').addEventListener('submit', (e) => { e.preventDefault(); send({ type: 'link', riotId: box.querySelector('#me-riot').value.trim(), region: box.querySelector('#me-region').value }); });
    box.querySelectorAll('[data-req]').forEach((b) => b.addEventListener('click', () => send({ type: b.dataset.req, puuid: b.dataset.puuid })));
    box.querySelector('#me-private').addEventListener('change', (e) => send({ type: 'privacy', value: e.target.checked }));
    box.querySelector('#me-lang').addEventListener('change', (e) => send({ type: 'lang', lang: e.target.value }));
  }

  /* ----- Actions (admin requests to the bot) ----- */

  async function pageActions(content) {
    await ensureDiscordLists();
    const res = await api(`/api/guilds/${state.guildId}/actions`);
    const statusBadge = (s) => `<span class="badge ${s === 'done' ? 'good' : s === 'failed' ? '' : 'warn'}">${esc(t(`ac.status.${s}`))}</span>`;
    const recent = res.items.map((a) => `<div class="audit-item"><strong>${esc(t(`ac.type.${a.type}`))}</strong> ${statusBadge(a.status)} <span class="when">· ${esc(dateFmt(a.finishedAt))}</span>
      ${a.message ? `<div style="margin-top:4px;color:var(--text-3);font-size:13px">${/^https:\/\/discord\.com\//.test(a.message) ? `<a href="${esc(a.message)}" target="_blank" rel="noopener" style="color:var(--teal)">${esc(a.message)}</a>` : esc(a.message)}</div>` : ''}</div>`).join('');
    content.innerHTML = `
      <div class="grid grid-2" style="align-items:start">
        <div class="panel">
          <h3>${esc(t('ac.announce'))}</h3><p class="desc">${esc(t('ac.announce.desc'))}</p>
          <div class="form-row"><label class="lbl" for="ac-ch">${esc(t('ac.channel'))}</label>
            <select class="select" id="ac-ch">${state.discordLists.textChannels.map((c) => `<option value="${esc(c.id)}"># ${esc(c.name)}</option>`).join('')}</select></div>
          <div class="form-row"><label class="lbl" for="ac-title">${esc(t('ac.title'))}</label><input class="input" id="ac-title" maxlength="100"></div>
          <div class="form-row" style="align-items:start"><label class="lbl" for="ac-text">${esc(t('ac.text'))}</label><textarea class="input" id="ac-text" rows="6" maxlength="3500" style="max-width:380px;resize:vertical"></textarea></div>
          <button class="btn btn-primary btn-sm" type="button" id="ac-send">${esc(t('ac.send'))}</button>
          <div id="ac-msg" style="margin-top:12px"></div>
        </div>
        <div>
          <div class="panel">
            <h3>${esc(t('ac.quick'))}</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button class="btn btn-ghost btn-sm" type="button" data-act="repostPanels">${esc(t('ac.repost'))}</button>
              <button class="btn btn-ghost btn-sm" type="button" data-act="syncRoles">${esc(t('ac.sync'))}</button>
            </div>
          </div>
          <div class="panel" style="margin-top:16px">
            <h3>${esc(t('ac.recent'))}</h3>
            ${res.waiting.length ? `<div class="audit-item">${statusBadge('waiting')} ${res.waiting.length}</div>` : ''}
            ${recent || `<p class="desc">${esc(t('ac.none'))}</p>`}
          </div>
        </div>
      </div>`;
    const post = async (body) => {
      const msg = content.querySelector('#ac-msg');
      try {
        await api(`/api/guilds/${state.guildId}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
        if (msg) msg.innerHTML = `<div class="alert alert-info">${esc(t('ac.sent'))}</div>`;
        setTimeout(() => { if (state.page === 'actions') renderPage(); }, 6000);
      } catch (err) {
        if (msg) msg.innerHTML = `<div class="alert alert-bad">${esc(err.message)}</div>`;
      }
    };
    content.querySelector('#ac-send').addEventListener('click', () => post({ type: 'announce', channelId: content.querySelector('#ac-ch').value, title: content.querySelector('#ac-title').value, text: content.querySelector('#ac-text').value }));
    content.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => post({ type: b.dataset.act })));
  }

  /* ---------------- Boot ---------------- */

  async function boot() {
    try {
      const me = await api('/api/me');
      state.me = me.user;
    } catch (err) {
      return renderLogin(err.status ? null : 'offline');
    }
    try {
      const res = await api('/api/guilds');
      state.guilds = res.guilds;
      state.botError = res.botError;
    } catch (err) {
      if (err.status === 401) { state.me = null; return renderLogin(); }
      state.guilds = [];
      state.botError = err.message;
    }
    route();
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  window.VH.onLang(() => {
    if (state.saveKind !== 'err') { state.saveStatus = ''; state.saveKind = ''; }
    if (!state.me) return renderLogin();
    if (!state.guildId) return renderPicker();
    renderShell();
    renderPage();
  });
  document.addEventListener('DOMContentLoaded', boot);
})();
