/* Valorant Hub — user guide content (English / Korean). Kept in sync with the bot's behaviour. */
window.VH_DOCS = [
  /* ================= Getting started ================= */
  {
    id: 'intro', group: 'start',
    title: { en: 'What is Valorant Hub?', ko: 'Valorant Hub란?' },
    en: `
<p>Valorant Hub turns your Discord server into a Valorant community. Members link their Riot ID once. After that the bot keeps their rank, stats and roles up to date, and gives the server tools to play together.</p>
<div class="grid2">
  <div class="tile"><h4>For players</h4><p>Profile, rank, match history, agent and map stats, analysis, leaderboards.</p></div>
  <div class="tile"><h4>For the community</h4><p>Scrims with fair teams, party finder, 1v1 duels, clubs, tournaments, seasons.</p></div>
  <div class="tile"><h4>Automatic</h4><p>Tier roles, rank-up alerts, weekly recap, panels that update themselves.</p></div>
  <div class="tile"><h4>Two ways to use it</h4><p>Click buttons on panels, or type slash commands. Both do the same thing.</p></div>
</div>
<div class="callout">Premium is free for every server right now. See <a href="#plans">Plans</a>.</div>`,
    ko: `
<p>Valorant Hub는 디스코드 서버를 발로란트 커뮤니티로 만들어 주는 봇입니다. 멤버가 Riot ID를 한 번 연결하면, 봇이 랭크·전적·역할을 계속 최신으로 유지하고 함께 플레이할 수 있는 도구를 제공합니다.</p>
<div class="grid2">
  <div class="tile"><h4>플레이어</h4><p>프로필, 랭크, 경기 기록, 요원·맵 통계, 분석, 랭킹.</p></div>
  <div class="tile"><h4>커뮤니티</h4><p>공정한 팀의 내전, 파티 모집, 1대1 대결, 클럽, 대회, 시즌.</p></div>
  <div class="tile"><h4>자동화</h4><p>티어 역할, 승급 알림, 주간 요약, 스스로 갱신되는 패널.</p></div>
  <div class="tile"><h4>두 가지 사용법</h4><p>패널의 버튼을 누르거나 슬래시 명령어를 입력하세요. 결과는 같습니다.</p></div>
</div>
<div class="callout">지금은 모든 서버에 Premium이 무료입니다. <a href="#plans">요금제</a>를 확인하세요.</div>`,
  },
  {
    id: 'add-bot', group: 'start',
    title: { en: 'Add the bot', ko: '봇 추가하기' },
    en: `
<ol class="dsteps">
  <li><b>Click "Add to Discord"</b> on the home page.</li>
  <li><b>Pick your server.</b> You need the "Manage Server" permission there.</li>
  <li><b>Keep the requested permissions.</b> Each one is used by a feature:
    <table><tr><th>Permission</th><th>Used for</th></tr>
    <tr><td>Manage Roles</td><td>Tier roles, season rewards, club roles</td></tr>
    <tr><td>Manage Channels</td><td>Voice rooms for scrims and parties</td></tr>
    <tr><td>Move Members</td><td>Voice rooms</td></tr>
    <tr><td>Change Nickname</td><td>Bot name per server</td></tr>
    <tr><td>Send Messages, Embed Links, Attach Files</td><td>Panels, cards, alerts</td></tr>
    <tr><td>Read Message History</td><td>Updating panels in place</td></tr></table>
  </li>
  <li><b>Run <code>/setup</code></b> in any channel. See the next page.</li>
</ol>
<div class="callout warn">Commands can take up to an hour to appear the very first time the bot joins Discord. Restarting the Discord app usually shows them sooner.</div>`,
    ko: `
<ol class="dsteps">
  <li>홈페이지에서 <b>"디스코드에 추가"</b>를 누릅니다.</li>
  <li><b>서버를 고릅니다.</b> 그 서버에서 "서버 관리" 권한이 있어야 합니다.</li>
  <li><b>요청된 권한을 그대로 둡니다.</b> 모두 기능에 쓰입니다:
    <table><tr><th>권한</th><th>쓰이는 곳</th></tr>
    <tr><td>역할 관리</td><td>티어 역할, 시즌 보상, 클럽 역할</td></tr>
    <tr><td>채널 관리</td><td>내전·파티 음성 채널</td></tr>
    <tr><td>멤버 이동</td><td>음성 채널</td></tr>
    <tr><td>별명 변경</td><td>서버별 봇 이름</td></tr>
    <tr><td>메시지 보내기, 링크 첨부, 파일 첨부</td><td>패널, 카드, 알림</td></tr>
    <tr><td>메시지 기록 보기</td><td>패널을 그 자리에서 갱신</td></tr></table>
  </li>
  <li>아무 채널에서 <b><code>/setup</code></b>을 실행합니다. 다음 페이지를 보세요.</li>
</ol>
<div class="callout warn">봇이 처음 디스코드에 등록되면 명령어가 보이기까지 최대 1시간 걸릴 수 있습니다. 디스코드 앱을 재시작하면 보통 더 빨리 보입니다.</div>`,
  },
  {
    id: 'setup', group: 'start',
    title: { en: 'First setup (/setup)', ko: '처음 설정 (/setup)' },
    en: `
<p><code>/setup</code> shows a checklist only you can see: tier roles, alert channel, panels and language.</p>
<ol class="dsteps">
  <li><b>Create tier roles.</b> Press <b>Create tier roles</b>. The bot makes Iron through Radiant (or reuses roles with those names) and links them.</li>
  <li><b>Move the bot's role up.</b> In Server Settings → Roles, drag the <b>Valorant Hub</b> role <u>above</u> the tier roles. Discord does not let a bot give roles that sit above its own.</li>
  <li><b>Pick channels.</b> Open the <a href="dashboard.html">dashboard</a> → Panels, and choose a channel for each panel. Set an alert channel under Notifications.</li>
  <li><b>Post panels.</b> Press <b>Post all panels</b>, or wait up to 2 minutes. You can also run <code>/panel post</code> in a channel.</li>
  <li><b>Tell members to link.</b> They press <b>Link Riot ID</b> on the Hub panel, or type <code>/register</code>.</li>
</ol>`,
    ko: `
<p><code>/setup</code>은 나에게만 보이는 체크리스트를 띄웁니다: 티어 역할, 알림 채널, 패널, 언어.</p>
<ol class="dsteps">
  <li><b>티어 역할 만들기.</b> <b>티어 역할 만들기</b>를 누르면 아이언부터 레디언트까지 역할을 만들고(같은 이름의 역할이 있으면 재사용) 연결합니다.</li>
  <li><b>봇 역할 올리기.</b> 서버 설정 → 역할에서 <b>Valorant Hub</b> 역할을 티어 역할들보다 <u>위로</u> 끌어 올리세요. 디스코드는 봇보다 위에 있는 역할을 줄 수 없게 합니다.</li>
  <li><b>채널 고르기.</b> <a href="dashboard.html">대시보드</a> → 패널에서 패널마다 채널을 고르세요. 알림에서 알림 채널도 정하세요.</li>
  <li><b>패널 올리기.</b> <b>패널 모두 게시</b>를 누르거나 최대 2분 기다리세요. 채널에서 <code>/panel post</code>로 직접 올릴 수도 있습니다.</li>
  <li><b>멤버에게 연결 안내.</b> 허브 패널의 <b>Riot ID 연결</b>을 누르거나 <code>/register</code>를 입력하면 됩니다.</li>
</ol>`,
  },
  {
    id: 'panels', group: 'start',
    title: { en: 'Panels', ko: '패널' },
    en: `
<p>A panel is a message with buttons that stays in a channel. Post it once; the bot keeps it current. If someone deletes it, the bot posts it again within 2 minutes. If you change its channel, the bot moves it.</p>
<table><tr><th>Panel</th><th>What it shows</th><th>Buttons</th></tr>
<tr><td>Hub</td><td>Start point for members</td><td>Link Riot ID, My profile, My analysis, Leaderboard, Help</td></tr>
<tr><td>Leaderboard</td><td>Top 10 of the week, live</td><td>Full leaderboard, My profile</td></tr>
<tr><td>Scrims</td><td>Open scrims with links</td><td>New scrim</td></tr>
<tr><td>Party Finder</td><td>Open parties with links</td><td>New party</td></tr>
<tr><td>Duel Arena</td><td>Top 5 Duel Rating</td><td>Challenge someone</td></tr>
<tr><td>Clubs</td><td>Clubs and member counts</td><td>Browse clubs</td></tr>
<tr><td>Tournament</td><td>Current tournament</td><td>Sign up team, Bracket</td></tr>
<tr><td>Admin Setup</td><td>Setup checklist (keep it in a staff channel)</td><td>Create tier roles, Post all panels, Dashboard</td></tr></table>
<p>Results that are about you (profile, analysis, leaderboard from a panel) open as messages only you can see.</p>`,
    ko: `
<p>패널은 채널에 고정되어 있는 버튼 메시지입니다. 한 번 올리면 봇이 계속 최신으로 유지합니다. 누가 지우면 2분 안에 다시 올리고, 채널을 바꾸면 옮깁니다.</p>
<table><tr><th>패널</th><th>내용</th><th>버튼</th></tr>
<tr><td>허브</td><td>멤버의 시작점</td><td>Riot ID 연결, 내 프로필, 내 분석, 랭킹, 도움말</td></tr>
<tr><td>랭킹</td><td>이번 주 TOP 10 (실시간)</td><td>전체 랭킹, 내 프로필</td></tr>
<tr><td>내전</td><td>모집 중인 내전과 링크</td><td>내전 만들기</td></tr>
<tr><td>파티 모집</td><td>모집 중인 파티와 링크</td><td>파티 만들기</td></tr>
<tr><td>대결 아레나</td><td>Duel Rating TOP 5</td><td>대결 신청</td></tr>
<tr><td>클럽</td><td>클럽과 인원</td><td>클럽 둘러보기</td></tr>
<tr><td>대회</td><td>진행 중인 대회</td><td>팀 신청, 대진표</td></tr>
<tr><td>관리자 설정</td><td>설정 체크리스트 (운영진 채널에 두세요)</td><td>티어 역할 만들기, 패널 모두 게시, 대시보드</td></tr></table>
<p>나에 대한 결과(프로필, 분석, 패널에서 연 랭킹)는 나에게만 보이는 메시지로 열립니다.</p>`,
  },

  /* ================= Players ================= */
  {
    id: 'link', group: 'player',
    title: { en: 'Link your Riot ID', ko: 'Riot ID 연결' },
    en: `
<ol class="dsteps">
  <li>Type <code>/register riot_id:Name#TAG</code> or press <b>Link Riot ID</b> on the Hub panel.</li>
  <li>Region is optional. If you skip it, the server's default region is used.</li>
  <li>Your profile appears right away with your current rank.</li>
</ol>
<h4>More than one account</h4>
<p>Run <code>/register</code> again with another Riot ID. Open <code>/profile</code> and choose your <b>Main account</b> from the menu. Leaderboards and roles use the main account.</p>
<h4>Linked, not verified</h4>
<p>Anyone can type any Riot ID, so accounts show as <b>Linked</b>. Server staff should keep that in mind for prizes.</p>
<h4>Unlink</h4>
<p><code>/unregister</code> lets you pick an account and removes it. Your tier role is removed in every server.</p>`,
    ko: `
<ol class="dsteps">
  <li><code>/register riot_id:이름#태그</code>를 입력하거나 허브 패널의 <b>Riot ID 연결</b>을 누릅니다.</li>
  <li>지역은 선택입니다. 비우면 서버의 기본 지역을 씁니다.</li>
  <li>현재 랭크가 담긴 프로필이 바로 표시됩니다.</li>
</ol>
<h4>계정이 여러 개라면</h4>
<p>다른 Riot ID로 <code>/register</code>를 한 번 더 하세요. <code>/profile</code>에서 <b>대표 계정</b> 메뉴로 고를 수 있습니다. 랭킹과 역할은 대표 계정을 기준으로 합니다.</p>
<h4>연결됨 (인증 아님)</h4>
<p>누구나 아무 Riot ID나 입력할 수 있으므로 계정은 <b>연결됨</b>으로 표시됩니다. 상품이 걸린 이벤트라면 운영진이 따로 확인하세요.</p>
<h4>연결 해제</h4>
<p><code>/unregister</code>로 계정을 골라 해제합니다. 모든 서버에서 티어 역할도 사라집니다.</p>`,
  },
  {
    id: 'profile', group: 'player',
    title: { en: 'Profile and match history', ko: '프로필과 경기 기록' },
    en: `
<p><code>/profile</code> opens your profile with five tabs:</p>
<table><tr><th>Tab</th><th>Shows</th></tr>
<tr><td>Profile</td><td>Rank, RR, last change, peak, level, last 20 competitive games summary, top agents and maps</td></tr>
<tr><td>Matches</td><td>Last 10 competitive games. Pick one from the menu for details</td></tr>
<tr><td>Agents</td><td>Games, win rate, K/D and ACS per agent</td></tr>
<tr><td>Maps</td><td>The same per map</td></tr>
<tr><td>Rank history</td><td>Dated rank changes</td></tr></table>
<p>Add <code>user:</code> to look at someone else, and <code>share:True</code> to post it in the channel. Shortcuts: <code>/rank</code>, <code>/peak</code>, <code>/stats</code>, <code>/matches</code>, <code>/match</code>, <code>/agents</code>, <code>/maps</code>, <code>/history</code>, <code>/compare</code>.</p>
<h4>How often it updates</h4>
<p>Players with a game in the last 3 days are refreshed about every 10 minutes; others about every hour. Press <b>Refresh</b> or run <code>/verify-rank</code> to update now.</p>`,
    ko: `
<p><code>/profile</code>은 다섯 개 탭이 있는 프로필을 엽니다:</p>
<table><tr><th>탭</th><th>내용</th></tr>
<tr><td>프로필</td><td>랭크, RR, 최근 변동, 최고 랭크, 레벨, 최근 경쟁전 20경기 요약, 주력 요원·맵</td></tr>
<tr><td>경기</td><td>최근 경쟁전 10경기. 메뉴에서 골라 상세 보기</td></tr>
<tr><td>요원</td><td>요원별 경기 수, 승률, K/D, ACS</td></tr>
<tr><td>맵</td><td>맵별 같은 통계</td></tr>
<tr><td>랭크 기록</td><td>날짜별 랭크 변동</td></tr></table>
<p><code>user:</code>로 다른 사람을, <code>share:True</code>로 채널에 공유할 수 있습니다. 바로가기: <code>/rank</code>, <code>/peak</code>, <code>/stats</code>, <code>/matches</code>, <code>/match</code>, <code>/agents</code>, <code>/maps</code>, <code>/history</code>, <code>/compare</code>.</p>
<h4>갱신 주기</h4>
<p>최근 3일 안에 경기를 한 플레이어는 약 10분마다, 나머지는 약 1시간마다 갱신됩니다. 바로 갱신하려면 <b>새로고침</b>이나 <code>/verify-rank</code>를 쓰세요.</p>`,
  },
  {
    id: 'player-pages', group: 'player',
    title: { en: 'Player pages (share by link)', ko: '전적 페이지 (링크로 공유)' },
    en: `
<p>Every player has a page on the website, like a tracker. Anyone can open it, no login needed.</p>
<table><tr><th>Link</th><th>Example</th></tr>
<tr><td><code>/p/region/name/tag</code></td><td><code>/p/kr/Name/TAG</code></td></tr></table>
<ul>
  <li><b>Search:</b> type a Riot ID in the search bar at the top of the page, or use <b>Player search</b> on the home page.</li>
  <li><b>From Discord:</b> press <b>Open on web</b> on any profile.</li>
  <li><b>Share:</b> press <b>Copy link</b> and paste it anywhere.</li>
</ul>
<table><tr><th>Tab</th><th>Shows</th></tr>
<tr><td>Overview</td><td>Rank, RR, peak, level, last 20 competitive games (win rate, K/D, ACS, ADR, HS%), rank history chart, top agents and maps</td></tr>
<tr><td>Matches</td><td>Up to 100 competitive games with result, map, agent, K/D/A, ACS, ADR, HS%</td></tr>
<tr><td>Agents / Maps</td><td>Full stats per agent and per map</td></tr>
<tr><td>Seasons</td><td>Final rank, wins and games for recent acts</td></tr></table>
<p>The page uses the same real game records as the bot. Players who linked through the bot get more stored games on their page.</p>`,
    ko: `
<p>모든 플레이어는 웹사이트에 트래커 같은 전적 페이지가 있습니다. 로그인 없이 누구나 열 수 있습니다.</p>
<table><tr><th>링크</th><th>예시</th></tr>
<tr><td><code>/p/지역/이름/태그</code></td><td><code>/p/kr/Name/TAG</code></td></tr></table>
<ul>
  <li><b>검색:</b> 페이지 위 검색창에 Riot ID를 입력하거나, 홈의 <b>전적 검색</b>을 누르세요.</li>
  <li><b>디스코드에서:</b> 프로필의 <b>웹에서 보기</b>를 누르세요.</li>
  <li><b>공유:</b> <b>링크 복사</b>를 눌러 어디든 붙여 넣으세요.</li>
</ul>
<table><tr><th>탭</th><th>내용</th></tr>
<tr><td>개요</td><td>랭크, RR, 최고 랭크, 레벨, 최근 경쟁전 20경기(승률, K/D, ACS, ADR, HS%), 랭크 변화 그래프, 주력 요원·맵</td></tr>
<tr><td>경기</td><td>최대 100경기의 결과, 맵, 요원, K/D/A, ACS, ADR, HS%</td></tr>
<tr><td>요원 / 맵</td><td>요원별·맵별 전체 통계</td></tr>
<tr><td>시즌</td><td>최근 액트의 최종 랭크, 승리, 경기 수</td></tr></table>
<p>봇과 같은 실제 경기 기록을 씁니다. 봇으로 연결한 플레이어는 저장된 경기가 더 많이 보입니다.</p>`,
  },
  {
    id: 'stats', group: 'player',
    title: { en: 'What the stats mean', ko: '통계 용어' },
    en: `
<table><tr><th>Stat</th><th>Meaning</th></tr>
<tr><td>Win rate</td><td>Wins ÷ (wins + losses). Draws are not counted.</td></tr>
<tr><td>K/D</td><td>Kills ÷ deaths.</td></tr>
<tr><td>ACS</td><td>Average combat score per round.</td></tr>
<tr><td>ADR</td><td>Average damage per round.</td></tr>
<tr><td>HS%</td><td>Headshots ÷ all hits (head + body + legs).</td></tr></table>
<ul>
  <li>Only <b>competitive</b> games count.</li>
  <li>Most numbers use your <b>last 20</b> games and always show how many games they come from.</li>
  <li>With fewer than <b>5</b> games, you see "Not enough games" instead of a number.</li>
  <li>If a value is missing from a game, that game is left out of that number. Nothing is guessed.</li>
</ul>`,
    ko: `
<table><tr><th>통계</th><th>뜻</th></tr>
<tr><td>승률</td><td>승 ÷ (승 + 패). 무승부는 빼고 계산합니다.</td></tr>
<tr><td>K/D</td><td>킬 ÷ 데스.</td></tr>
<tr><td>ACS</td><td>라운드당 평균 전투 점수.</td></tr>
<tr><td>ADR</td><td>라운드당 평균 피해량.</td></tr>
<tr><td>HS%</td><td>헤드샷 ÷ 전체 명중(머리 + 몸 + 다리).</td></tr></table>
<ul>
  <li><b>경쟁전</b>만 계산합니다.</li>
  <li>대부분의 숫자는 <b>최근 20경기</b> 기준이며, 몇 경기에서 나온 값인지 항상 함께 표시합니다.</li>
  <li><b>5경기</b> 미만이면 숫자 대신 "경기 수가 부족합니다"가 나옵니다.</li>
  <li>어떤 경기에 값이 빠져 있으면 그 경기는 해당 통계에서 제외합니다. 추측해서 채우지 않습니다.</li>
</ul>`,
  },
  {
    id: 'analysis', group: 'player',
    title: { en: 'Analysis (/analysis)', ko: '분석 (/analysis)' },
    en: `
<p>A deeper look at your last 20 competitive games:</p>
<ul>
  <li><b>Summary:</b> win rate, K/D, ACS, ADR, HS%.</li>
  <li><b>Trend:</b> your last 10 games compared with the ones before (needs 15+ games). ▲ better, ▼ worse.</li>
  <li><b>Best agent:</b> highest ACS among agents with 3+ games.</li>
  <li><b>Weakest map:</b> lowest win rate among maps with 3+ games.</li>
  <li><b>Best game</b> and your current <b>streak</b>.</li>
  <li><b>Time of day:</b> morning, afternoon, evening, night, in the server's time zone (3+ games each).</li>
</ul>`,
    ko: `
<p>최근 경쟁전 20경기를 더 깊게 봅니다:</p>
<ul>
  <li><b>요약:</b> 승률, K/D, ACS, ADR, HS%.</li>
  <li><b>추세:</b> 최근 10경기와 그 이전 비교 (15경기 이상 필요). ▲ 좋아짐, ▼ 나빠짐.</li>
  <li><b>가장 잘한 요원:</b> 3경기 이상 한 요원 중 ACS가 가장 높은 요원.</li>
  <li><b>가장 약한 맵:</b> 3경기 이상 한 맵 중 승률이 가장 낮은 맵.</li>
  <li><b>최고 경기</b>와 현재 <b>연승/연패</b>.</li>
  <li><b>시간대별:</b> 서버 시간대 기준 오전·오후·저녁·새벽 (각 3경기 이상).</li>
</ul>`,
  },
  {
    id: 'language', group: 'player',
    title: { en: 'Language (한국어 / English)', ko: '언어 (한국어 / English)' },
    en: `
<p>The bot speaks Korean and English. In one server, each member can get replies in their own language.</p>
<table><tr><th>Setting</th><th>What happens</th></tr>
<tr><td>Server: <b>Auto</b> (default)</td><td>Your replies follow your Discord app language. Messages everyone sees (panels, scrim cards, alerts) use the server's community language.</td></tr>
<tr><td>Server: <b>한국어</b> or <b>English</b></td><td>Everything uses that language.</td></tr>
<tr><td><code>/language</code></td><td>Your own choice. It wins over the server setting for replies to you.</td></tr></table>
<p>You can also change your language on the website: Dashboard → <b>My Riot accounts</b>.</p>`,
    ko: `
<p>봇은 한국어와 영어를 모두 지원합니다. 한 서버 안에서도 멤버마다 자기 언어로 답을 받을 수 있습니다.</p>
<table><tr><th>설정</th><th>동작</th></tr>
<tr><td>서버: <b>자동</b> (기본)</td><td>나에게 오는 답은 내 디스코드 앱 언어를 따릅니다. 모두가 보는 메시지(패널, 내전 카드, 알림)는 서버의 커뮤니티 언어로 나옵니다.</td></tr>
<tr><td>서버: <b>한국어</b> 또는 <b>English</b></td><td>모든 메시지가 그 언어로 나옵니다.</td></tr>
<tr><td><code>/language</code></td><td>나만의 선택. 나에게 오는 답에서는 서버 설정보다 우선합니다.</td></tr></table>
<p>웹사이트의 대시보드 → <b>내 Riot 계정</b>에서도 바꿀 수 있습니다.</p>`,
  },
  {
    id: 'privacy', group: 'player',
    title: { en: 'Privacy', ko: '개인정보' },
    en: `
<ul>
  <li><code>/privacy private:True</code> hides your profile from others, removes you from leaderboards and stops alerts about you. You can still see your own data.</li>
  <li><code>/privacy private:False</code> makes it public again.</li>
  <li><code>/unregister</code> removes the link. Server admins can see linked accounts in the dashboard.</li>
</ul>`,
    ko: `
<ul>
  <li><code>/privacy private:True</code>: 다른 사람에게 프로필이 안 보이고, 랭킹에서 빠지고, 나에 대한 알림도 멈춥니다. 내 데이터는 나에게 계속 보입니다.</li>
  <li><code>/privacy private:False</code>: 다시 공개합니다.</li>
  <li><code>/unregister</code>: 연결을 해제합니다. 서버 관리자는 대시보드에서 연결된 계정을 볼 수 있습니다.</li>
</ul>`,
  },

  /* ================= Competition ================= */
  {
    id: 'leaderboard', group: 'compete',
    title: { en: 'Leaderboards', ko: '랭킹' },
    en: `
<p><code>/leaderboard</code> ranks linked members of this server. Change type and period with the menus under it.</p>
<table><tr><th>Type</th><th>Ranked by</th><th>Period</th></tr>
<tr><td>Rank (RR)</td><td>Current rank and RR</td><td>Now</td></tr>
<tr><td>Tier</td><td>Current tier</td><td>Now</td></tr>
<tr><td>Win rate, K/D, ACS</td><td>Up to 20 recent games, min. 5</td><td>Today, week, month, all</td></tr>
<tr><td>Most wins, Most kills</td><td>Totals in the period</td><td>Today, week, month, all</td></tr>
<tr><td>RR gained</td><td>Rank now minus rank at the start of the period</td><td>Today, week, month</td></tr></table>
<p>Filters: <code>tier</code> (only players in that tier), <code>agent</code> or <code>map</code> (only games on it). <code>/myrank</code> shows your position on five boards at once. The default type for panels is set in the dashboard.</p>`,
    ko: `
<p><code>/leaderboard</code>는 이 서버의 연결된 멤버 순위를 보여 줍니다. 아래 메뉴로 종류와 기간을 바꿀 수 있습니다.</p>
<table><tr><th>종류</th><th>기준</th><th>기간</th></tr>
<tr><td>랭크 (RR)</td><td>현재 랭크와 RR</td><td>현재</td></tr>
<tr><td>티어</td><td>현재 티어</td><td>현재</td></tr>
<tr><td>승률, K/D, ACS</td><td>최근 최대 20경기, 최소 5경기</td><td>오늘, 이번 주, 이번 달, 전체</td></tr>
<tr><td>최다 승리, 최다 킬</td><td>기간 합계</td><td>오늘, 이번 주, 이번 달, 전체</td></tr>
<tr><td>RR 상승</td><td>현재 랭크 − 기간 시작 시점 랭크</td><td>오늘, 이번 주, 이번 달</td></tr></table>
<p>필터: <code>tier</code>(해당 티어만), <code>agent</code>나 <code>map</code>(그 요원·맵 경기만). <code>/myrank</code>는 다섯 가지 랭킹의 내 순위를 한 번에 보여 줍니다. 패널의 기본 랭킹은 대시보드에서 정합니다.</p>`,
  },
  {
    id: 'seasons', group: 'compete',
    title: { en: 'Seasons', ko: '시즌' },
    en: `
<ol class="dsteps">
  <li>An admin runs <code>/season create name: days: metric: reward_role: reward_top:</code>.</li>
  <li>Metric: <b>RR gained</b> (from each player's rank when they joined the season), <b>Wins</b>, or <b>Average ACS</b> (min. 5 games).</li>
  <li>Every linked member is entered automatically. Players who link later start from the moment they join.</li>
  <li>24 hours before the end, an alert is posted. At the end, the top players get the reward role and the final table is saved.</li>
</ol>
<p><code>/season info</code> shows standings, <code>/season end</code> ends it early, <code>/season list</code> shows past seasons.</p>`,
    ko: `
<ol class="dsteps">
  <li>관리자가 <code>/season create name: days: metric: reward_role: reward_top:</code>을 실행합니다.</li>
  <li>기준: <b>RR 상승량</b>(시즌에 들어온 시점의 랭크 대비), <b>승리 수</b>, <b>평균 ACS</b>(최소 5경기).</li>
  <li>연결된 멤버는 자동으로 참가합니다. 나중에 연결한 사람은 그 시점부터 계산합니다.</li>
  <li>종료 24시간 전에 알림이 가고, 종료되면 상위권에게 보상 역할을 주고 최종 순위를 보관합니다.</li>
</ol>
<p><code>/season info</code>로 순위 확인, <code>/season end</code>로 조기 종료, <code>/season list</code>로 지난 시즌을 봅니다.</p>`,
  },
  {
    id: 'mvp', group: 'compete',
    title: { en: 'MVP', ko: 'MVP' },
    en: `<p><code>/mvp</code> shows the member who gained the most RR in the last 7 days (weekly) and 30 days (monthly). Only players with a recorded rank from the start of that period count.</p>`,
    ko: `<p><code>/mvp</code>는 최근 7일(주간)과 30일(월간) 동안 RR을 가장 많이 올린 멤버를 보여 줍니다. 기간 시작 시점의 랭크 기록이 있는 플레이어만 대상입니다.</p>`,
  },
  {
    id: 'roles', group: 'compete',
    title: { en: 'Tier roles', ko: '티어 역할' },
    en: `
<ul>
  <li>Each linked member gets the role for their current tier. The old one is removed when the tier changes.</li>
  <li><b>Unlinked role</b> (optional): given to members who have not linked.</li>
  <li><b>Peak role</b> (optional): also gives the role for the player's peak tier.</li>
  <li><b>Restore hand edits</b>: when on, the bot fixes tier roles that someone changed by hand (checked every 6 hours). When off, it only changes roles when the rank changes.</li>
  <li>Every change is listed in the dashboard's role log.</li>
</ul>
<div class="callout warn">The bot can only give roles that are <b>below</b> its own role. If roles do not change, move the Valorant Hub role higher.</div>`,
    ko: `
<ul>
  <li>연결된 멤버는 현재 티어 역할을 받습니다. 티어가 바뀌면 이전 역할은 빠집니다.</li>
  <li><b>미등록 역할</b>(선택): 연결하지 않은 멤버에게 줍니다.</li>
  <li><b>최고 티어 역할</b>(선택): 최고 티어 역할도 함께 줍니다.</li>
  <li><b>수동 변경 복구</b>: 켜면 누가 손으로 바꾼 티어 역할을 봇이 바로잡습니다(6시간마다 확인). 끄면 랭크가 바뀔 때만 역할을 바꿉니다.</li>
  <li>모든 변경은 대시보드의 역할 기록에 남습니다.</li>
</ul>
<div class="callout warn">봇은 자기 역할보다 <b>아래</b>에 있는 역할만 줄 수 있습니다. 역할이 안 바뀌면 Valorant Hub 역할을 더 위로 올리세요.</div>`,
  },
  {
    id: 'alerts', group: 'compete',
    title: { en: 'Alerts', ko: '알림' },
    en: `
<p>Alerts go to the channel set in the dashboard (Notifications). Turn each type on or off:</p>
<table><tr><th>Alert</th><th>When</th></tr>
<tr><td>Rank up / Rank down</td><td>A player's tier changes</td></tr>
<tr><td>RR change</td><td>After each new game</td></tr>
<tr><td>Match finished</td><td>A new game appears</td></tr>
<tr><td>Streak</td><td>A win or loss streak reaches the length you set</td></tr>
<tr><td>Season ending</td><td>24 hours before a season ends, and at the end</td></tr>
<tr><td>New scrims and parties</td><td>Someone posts one</td></tr>
<tr><td>Tournament</td><td>Created, started, champion</td></tr></table>
<p><b>Cooldown</b> stops repeated alerts about the same player. Private profiles never get alerts.</p>`,
    ko: `
<p>알림은 대시보드(알림)에서 정한 채널로 갑니다. 종류마다 켜고 끌 수 있습니다:</p>
<table><tr><th>알림</th><th>시점</th></tr>
<tr><td>승급 / 강등</td><td>티어가 바뀔 때</td></tr>
<tr><td>RR 변동</td><td>새 경기마다</td></tr>
<tr><td>경기 종료</td><td>새 경기가 생길 때</td></tr>
<tr><td>연승 / 연패</td><td>정한 횟수에 도달할 때</td></tr>
<tr><td>시즌 종료</td><td>종료 24시간 전, 종료 시</td></tr>
<tr><td>새 내전·파티</td><td>누가 올릴 때</td></tr>
<tr><td>대회</td><td>생성, 시작, 우승</td></tr></table>
<p><b>쿨다운</b>은 같은 플레이어의 알림이 반복되지 않게 막습니다. 비공개 프로필은 알림이 가지 않습니다.</p>`,
  },
  {
    id: 'recap', group: 'compete',
    title: { en: 'Weekly Recap', ko: '주간 요약' },
    en: `<p>Turn it on in the dashboard (Notifications → Weekly Recap) and pick a channel, day and hour. Once a week the bot posts the top 3 RR climbs, the 3 members with the most games, and how many scrims and duels were played.</p>`,
    ko: `<p>대시보드(알림 → 주간 요약)에서 켜고 채널·요일·시각을 고르세요. 일주일에 한 번 RR 상승 TOP 3, 최다 경기 TOP 3, 내전·대결 수를 올립니다.</p>`,
  },

  /* ================= Community ================= */
  {
    id: 'scrims', group: 'play',
    title: { en: 'Scrims', ko: '내전' },
    en: `
<ol class="dsteps">
  <li><b>Create:</b> <code>/scrim create size:5</code> or <b>New scrim</b> on the Scrims panel. Options: title, map (empty = random from maps your members have played), teams (balanced or random), lowest tier, start time.</li>
  <li><b>Join:</b> members press <b>Join</b>. Lowest tier is checked automatically.</li>
  <li><b>Make teams:</b> the host or a moderator presses <b>Balance teams</b> or <b>Random teams</b>. <b>Reopen</b> undoes it.</li>
  <li><b>Voice:</b> <b>Voice rooms</b> creates one room per team. They are deleted when the scrim ends.</li>
  <li><b>Result:</b> any player presses <b>Report result</b>. A player from the <u>other</u> team (or a moderator) presses <b>Confirm</b>. <b>Dispute</b> flags it for moderators.</li>
</ol>
<h4>How balancing works</h4>
<p>The bot tries every split and picks the one where both teams' total rank is closest. Unlinked players have no rank, so they are spread evenly and marked on the card.</p>
<p><code>/scrim stats</code> shows wins and losses from confirmed scrims.</p>`,
    ko: `
<ol class="dsteps">
  <li><b>만들기:</b> <code>/scrim create size:5</code> 또는 내전 패널의 <b>내전 만들기</b>. 옵션: 제목, 맵(비우면 멤버들이 플레이한 맵 중 랜덤), 팀 배정(밸런스·랜덤), 최소 티어, 시작 시간.</li>
  <li><b>참가:</b> 멤버가 <b>참가</b>를 누릅니다. 최소 티어는 자동으로 확인합니다.</li>
  <li><b>팀 나누기:</b> 주최자나 운영진이 <b>팀 밸런스</b> 또는 <b>랜덤 팀</b>을 누릅니다. <b>다시 모집</b>으로 되돌릴 수 있습니다.</li>
  <li><b>음성:</b> <b>음성 채널</b>을 누르면 팀마다 방을 만들고, 내전이 끝나면 지웁니다.</li>
  <li><b>결과:</b> 아무 플레이어나 <b>결과 등록</b>을 누르고, <u>상대 팀</u> 플레이어(또는 운영진)가 <b>확인</b>을 누릅니다. <b>이의 제기</b>는 운영진에게 넘깁니다.</li>
</ol>
<h4>밸런스 방식</h4>
<p>가능한 모든 팀 조합을 비교해 두 팀의 랭크 합이 가장 비슷한 조합을 고릅니다. 미연결 플레이어는 랭크가 없으므로 양 팀에 고르게 나누고 카드에 표시합니다.</p>
<p><code>/scrim stats</code>로 확인된 내전의 승패를 봅니다.</p>`,
  },
  {
    id: 'parties', group: 'play',
    title: { en: 'Party Finder', ko: '파티 모집' },
    en: `
<ol class="dsteps">
  <li><code>/party create mode:</code> or <b>New party</b> on the panel. Choose size, tier range, mic and how long it stays open (default 60 minutes).</li>
  <li>Members press <b>Join</b>. Each member shows whether their rank fits the range.</li>
  <li>The host can open a <b>Voice room</b> and <b>Close</b> the party. When full, joining stops automatically.</li>
</ol>
<p>You can be in one open party per server at a time. If the host leaves, the next member becomes host.</p>`,
    ko: `
<ol class="dsteps">
  <li><code>/party create mode:</code> 또는 패널의 <b>파티 만들기</b>. 인원, 티어 범위, 마이크, 모집 시간(기본 60분)을 고릅니다.</li>
  <li>멤버가 <b>참가</b>를 누르면 각자 랭크가 범위 안인지 표시됩니다.</li>
  <li>파티장은 <b>음성 채널</b>을 열고 <b>마감</b>할 수 있습니다. 인원이 차면 자동으로 모집이 멈춥니다.</li>
</ol>
<p>서버마다 한 번에 하나의 파티에만 참가할 수 있습니다. 파티장이 나가면 다음 멤버가 파티장이 됩니다.</p>`,
  },
  {
    id: 'duels', group: 'play',
    title: { en: 'Duels and Duel Rating', ko: '대결과 Duel Rating' },
    en: `
<ol class="dsteps">
  <li><code>/duel challenge user:</code> or <b>Challenge someone</b> on the panel. Format: best of 1, 3 or 5. Rule: classic, random agent or random map.</li>
  <li>The opponent presses <b>Accept</b> or <b>Decline</b> within 30 minutes.</li>
  <li>After playing, both press <b>I won</b> or <b>I lost</b>. If one player says "I lost", that is enough.</li>
  <li>If both claim the win (or both the loss), a moderator picks the winner.</li>
</ol>
<h4>Duel Rating</h4>
<p>Everyone starts at 1000. Beating a higher-rated player gives more points; losing to a lower-rated one costs more. A single game moves at most 32 points. <code>/duel leaderboard</code> also shows the champion of the month (most wins).</p>`,
    ko: `
<ol class="dsteps">
  <li><code>/duel challenge user:</code> 또는 패널의 <b>대결 신청</b>. 방식: 단판, 3판 2선승, 5판 3선승. 규칙: 일반, 랜덤 요원, 랜덤 맵.</li>
  <li>상대가 30분 안에 <b>수락</b>이나 <b>거절</b>을 누릅니다.</li>
  <li>대결 후 둘 다 <b>내가 이김</b> 또는 <b>내가 짐</b>을 누릅니다. 한 명이 "내가 짐"을 누르면 그것으로 확정됩니다.</li>
  <li>둘 다 이겼다고(또는 졌다고) 하면 운영진이 승자를 정합니다.</li>
</ol>
<h4>Duel Rating</h4>
<p>모두 1000점에서 시작합니다. 나보다 높은 상대를 이기면 더 많이 오르고, 낮은 상대에게 지면 더 많이 내려갑니다. 한 판에 최대 32점까지 움직입니다. <code>/duel leaderboard</code>에서 이달의 챔피언(최다 승)도 볼 수 있습니다.</p>`,
  },
  {
    id: 'clubs', group: 'play',
    title: { en: 'Clubs', ko: '클럽' },
    en: `
<ul>
  <li><code>/club create name: tag:</code> makes you captain. Moderators can attach a role that members get automatically.</li>
  <li>Join with <code>/club join</code> or <b>Browse clubs</b> on the panel. One club per member, up to 30 members.</li>
  <li>Club score = members' confirmed scrim wins + duel wins. See <code>/club leaderboard</code>.</li>
  <li>Captains can <code>/club kick</code> and <code>/club disband</code>.</li>
</ul>`,
    ko: `
<ul>
  <li><code>/club create name: tag:</code>로 만들면 클럽장이 됩니다. 운영진은 멤버에게 자동으로 주는 역할을 붙일 수 있습니다.</li>
  <li><code>/club join</code>이나 패널의 <b>클럽 둘러보기</b>로 가입합니다. 한 사람당 한 클럽, 최대 30명.</li>
  <li>클럽 점수 = 멤버들의 확인된 내전 승리 + 대결 승리. <code>/club leaderboard</code>로 봅니다.</li>
  <li>클럽장은 <code>/club kick</code>, <code>/club disband</code>를 쓸 수 있습니다.</li>
</ul>`,
  },
  {
    id: 'tournaments', group: 'play',
    title: { en: 'Tournaments', ko: '대회' },
    en: `
<ol class="dsteps">
  <li><b>Create</b> (staff = Manage Server or Manage Events): <code>/tournament create name: team_size: max_teams: format:</code>. A sign-up card is posted.</li>
  <li><b>Sign up:</b> captains press <b>Sign up team</b>, pick teammates and name the team, or use <code>/tournament join</code>. A player can be on one team only.</li>
  <li><b>Start:</b> <code>/tournament start</code> closes sign-ups and builds the bracket.</li>
  <li><b>Results:</b> staff report with <code>/tournament result</code> and it counts right away. If a captain reports, the other captain or staff presses <b>Confirm</b>.</li>
  <li>The winner moves on automatically. The champion is announced and saved in <code>/tournament history</code>.</li>
</ol>
<h4>Formats</h4>
<table><tr><th>Format</th><th>How it works</th></tr>
<tr><td>Single elimination</td><td>Teams are seeded by members' average rank. If the team count is not 2, 4, 8, 16 or 32, top seeds get a bye.</td></tr>
<tr><td>Round robin</td><td>Every team plays every other team once. Most wins takes the title.</td></tr></table>`,
    ko: `
<ol class="dsteps">
  <li><b>만들기</b>(운영진 = 서버 관리 또는 이벤트 관리 권한): <code>/tournament create name: team_size: max_teams: format:</code>. 참가 신청 카드가 올라갑니다.</li>
  <li><b>신청:</b> 팀장이 <b>팀 신청</b>을 누르고 팀원과 팀 이름을 정하거나 <code>/tournament join</code>을 씁니다. 한 사람은 한 팀에만 들어갈 수 있습니다.</li>
  <li><b>시작:</b> <code>/tournament start</code>로 신청을 마감하고 대진표를 만듭니다.</li>
  <li><b>결과:</b> 운영진이 <code>/tournament result</code>로 등록하면 바로 반영됩니다. 팀장이 등록하면 상대 팀장이나 운영진이 <b>확인</b>을 눌러야 합니다.</li>
  <li>승자는 자동으로 다음 경기에 올라갑니다. 우승팀은 발표되고 <code>/tournament history</code>에 남습니다.</li>
</ol>
<h4>방식</h4>
<table><tr><th>방식</th><th>진행</th></tr>
<tr><td>싱글 엘리미네이션</td><td>팀원 평균 랭크로 시드를 정합니다. 팀 수가 2, 4, 8, 16, 32가 아니면 상위 시드가 부전승을 받습니다.</td></tr>
<tr><td>풀리그</td><td>모든 팀이 서로 한 번씩 경기합니다. 가장 많이 이긴 팀이 우승합니다.</td></tr></table>`,
  },

  /* ================= Admin ================= */
  {
    id: 'dashboard', group: 'admin',
    title: { en: 'Dashboard', ko: '대시보드' },
    en: `
<p>Log in with Discord at <a href="dashboard.html">Dashboard</a>. You see servers where you have Manage Server permission.</p>
<table><tr><th>Page</th><th>What you do</th></tr>
<tr><td>Server list</td><td>Your servers, plus <b>My Riot accounts</b></td></tr>
<tr><td>Overview</td><td>Members, channels, roles, linked players, open events, setup status</td></tr>
<tr><td>Actions</td><td>Announcement, repost panels, sync roles</td></tr>
<tr><td>Players</td><td>Linked members, their rank and last update</td></tr>
<tr><td>Leaderboards & Seasons</td><td>Season list and results</td></tr>
<tr><td>Scrims, Party Finder, Duels, Clubs, Tournaments</td><td>Everything members created</td></tr>
<tr><td>Auto Roles</td><td>Role for each tier, unlinked role, peak role, restore hand edits</td></tr>
<tr><td>Panels</td><td>Channel for each panel</td></tr>
<tr><td>Notifications</td><td>Alert channel and types, cooldown, weekly recap</td></tr>
<tr><td>Bot Profile</td><td>Bot name, image, banner and bio in this server</td></tr>
<tr><td>Settings</td><td>Language, time zone, region, default leaderboard, features on/off, backup</td></tr>
<tr><td>Audit Log</td><td>Who changed which setting and when</td></tr></table>
<p>Changes reach the bot within a few seconds.</p>`,
    ko: `
<p><a href="dashboard.html">대시보드</a>에서 디스코드로 로그인하세요. 서버 관리 권한이 있는 서버가 보입니다.</p>
<table><tr><th>페이지</th><th>할 수 있는 일</th></tr>
<tr><td>서버 목록</td><td>내 서버와 <b>내 Riot 계정</b></td></tr>
<tr><td>개요</td><td>멤버, 채널, 역할, 연결된 플레이어, 진행 중인 이벤트, 설정 현황</td></tr>
<tr><td>작업</td><td>공지, 패널 다시 올리기, 역할 동기화</td></tr>
<tr><td>플레이어</td><td>연결된 멤버와 랭크, 마지막 갱신</td></tr>
<tr><td>랭킹과 시즌</td><td>시즌 목록과 결과</td></tr>
<tr><td>내전, 파티 모집, 대결, 클럽, 대회</td><td>멤버들이 만든 모든 기록</td></tr>
<tr><td>자동 역할</td><td>티어별 역할, 미등록 역할, 최고 티어 역할, 수동 변경 복구</td></tr>
<tr><td>패널</td><td>패널마다 채널</td></tr>
<tr><td>알림</td><td>알림 채널과 종류, 쿨다운, 주간 요약</td></tr>
<tr><td>봇 프로필</td><td>이 서버의 봇 이름, 이미지, 배너, 소개</td></tr>
<tr><td>설정</td><td>언어, 시간대, 지역, 기본 랭킹, 기능 켜기/끄기, 백업</td></tr>
<tr><td>감사 로그</td><td>누가 언제 어떤 설정을 바꿨는지</td></tr></table>
<p>바꾼 설정은 몇 초 안에 봇에 반영됩니다.</p>`,
  },
  {
    id: 'settings', group: 'admin',
    title: { en: 'Settings reference', ko: '설정 항목' },
    en: `
<table><tr><th>Setting</th><th>Effect</th></tr>
<tr><td>Bot language</td><td>Auto (each member's Discord language), Korean or English. See <a href="#language">Language</a></td></tr>
<tr><td>Time zone</td><td>Weekly recap time and the time-of-day analysis</td></tr>
<tr><td>Default region</td><td>Used when someone links without picking a region</td></tr>
<tr><td>Default leaderboard</td><td>Shown on the Leaderboard panel and in <code>/leaderboard</code> without options</td></tr>
<tr><td>Features</td><td>Turn tier roles, alerts, scrims, parties, duels, clubs, tournaments or analysis off for this server</td></tr>
<tr><td>Backup</td><td>Download settings as a file and restore them later</td></tr></table>`,
    ko: `
<table><tr><th>설정</th><th>효과</th></tr>
<tr><td>봇 언어</td><td>자동(멤버마다 디스코드 언어), 한국어, 영어. <a href="#language">언어</a> 참고</td></tr>
<tr><td>시간대</td><td>주간 요약 시각과 시간대별 분석 기준</td></tr>
<tr><td>기본 지역</td><td>지역을 고르지 않고 연결할 때 사용</td></tr>
<tr><td>기본 랭킹</td><td>랭킹 패널과 옵션 없는 <code>/leaderboard</code>에 표시</td></tr>
<tr><td>기능</td><td>티어 역할, 알림, 내전, 파티, 대결, 클럽, 대회, 분석을 서버별로 끄기</td></tr>
<tr><td>백업</td><td>설정을 파일로 내려받고 나중에 복원</td></tr></table>`,
  },
  {
    id: 'web-bot', group: 'admin',
    title: { en: 'Website + bot together', ko: '웹사이트 + 봇 연동' },
    en: `
<table><tr><th>Feature</th><th>How it works</th></tr>
<tr><td><b>Open on web</b></td><td>Profiles, leaderboards and tournaments in Discord have a button that opens the same thing on the website.</td></tr>
<tr><td><b>Public server page</b></td><td>Turn on "Public leaderboard on the website" in Settings. Your server gets a page at <code>/s/your-server-id</code> with leaderboards, the current season, the tournament bracket, duels, scrims and clubs. Updated every 10 minutes. Private profiles are never shown.</td></tr>
<tr><td><b>My Riot accounts</b></td><td>Log in on the website to link a Riot ID, pick your main account, hide your profile or change your bot language. The bot does it within seconds.</td></tr>
<tr><td><b>Actions</b> (admins)</td><td>Dashboard → Actions: post an announcement as the bot, repost every panel, or sync tier roles right now.</td></tr>
<tr><td><b>Bot profile</b> (admins)</td><td>Change the bot's name and image for your server from the dashboard.</td></tr>
<tr><td><b>Settings</b></td><td>Everything you change in the dashboard reaches the bot within seconds.</td></tr></table>`,
    ko: `
<table><tr><th>기능</th><th>동작</th></tr>
<tr><td><b>웹에서 보기</b></td><td>디스코드의 프로필, 랭킹, 대회에 웹사이트로 바로 여는 버튼이 있습니다.</td></tr>
<tr><td><b>서버 공개 페이지</b></td><td>설정에서 "웹사이트에 랭킹 공개"를 켜면 <code>/s/서버ID</code> 페이지가 생깁니다. 랭킹, 진행 중인 시즌, 대회 대진표, 대결, 내전, 클럽이 보이고 10분마다 갱신됩니다. 비공개 프로필은 절대 나오지 않습니다.</td></tr>
<tr><td><b>내 Riot 계정</b></td><td>웹사이트에 로그인해서 Riot ID 연결, 대표 계정 선택, 프로필 숨기기, 봇 언어 변경을 할 수 있습니다. 봇이 몇 초 안에 처리합니다.</td></tr>
<tr><td><b>작업</b> (관리자)</td><td>대시보드 → 작업: 봇 이름으로 공지 올리기, 패널 모두 다시 올리기, 티어 역할 즉시 동기화.</td></tr>
<tr><td><b>봇 프로필</b> (관리자)</td><td>대시보드에서 이 서버의 봇 이름과 이미지를 바꿉니다.</td></tr>
<tr><td><b>설정</b></td><td>대시보드에서 바꾼 설정은 몇 초 안에 봇에 반영됩니다.</td></tr></table>`,
  },
  {
    id: 'bot-profile', group: 'admin',
    title: { en: 'Bot name and image per server', ko: '서버별 봇 이름·이미지' },
    en: `
<p>Each server can give the bot its own name, profile image, banner and bio. Other servers keep the default look.</p>
<h4>In the dashboard</h4>
<ol class="dsteps">
  <li>Open the <a href="#dashboard">dashboard</a> → <b>Bot Profile</b>.</li>
  <li>Type a name and bio, and choose a profile image and banner. The preview on the right shows how it will look.</li>
  <li>Press <b>Save changes</b>. <b>Use default</b> puts a single item back to the default.</li>
</ol>
<h4>In Discord</h4>
<table><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>/botprofile set</code></td><td>Change any of: <code>name</code>, <code>image</code>, <code>banner</code>, <code>bio</code></td></tr>
<tr><td><code>/botprofile show</code></td><td>See the current profile</td></tr>
<tr><td><code>/botprofile reset</code></td><td>Reset everything, or just one item</td></tr></table>
<ul>
  <li>Name: up to 32 characters. Bio: up to 190 characters.</li>
  <li>Images: PNG, JPG, GIF or WEBP, under 8 MB.</li>
  <li>Admins only (Manage Server). Every change is listed in the Audit Log.</li>
</ul>
<div class="callout warn">Discord limits how often a profile can change. If a change is refused, wait a few minutes. The bot also needs the "Change Nickname" permission to change its name.</div>`,
    ko: `
<p>서버마다 봇에게 이름, 프로필 이미지, 배너, 소개를 따로 줄 수 있습니다. 다른 서버에서는 기본 모습 그대로입니다.</p>
<h4>대시보드에서</h4>
<ol class="dsteps">
  <li><a href="#dashboard">대시보드</a> → <b>봇 프로필</b>을 엽니다.</li>
  <li>이름과 소개를 쓰고, 프로필 이미지와 배너를 고르세요. 오른쪽 미리보기에서 바로 확인할 수 있습니다.</li>
  <li><b>변경 사항 저장</b>을 누르세요. <b>기본값 사용</b>을 누르면 그 항목만 기본값으로 돌아갑니다.</li>
</ol>
<h4>디스코드에서</h4>
<table><tr><th>명령어</th><th>기능</th></tr>
<tr><td><code>/botprofile set</code></td><td><code>name</code>, <code>image</code>, <code>banner</code>, <code>bio</code> 중 원하는 것 바꾸기</td></tr>
<tr><td><code>/botprofile show</code></td><td>현재 프로필 보기</td></tr>
<tr><td><code>/botprofile reset</code></td><td>전부 또는 한 항목만 기본값으로</td></tr></table>
<ul>
  <li>이름은 최대 32자, 소개는 최대 190자입니다.</li>
  <li>이미지: PNG, JPG, GIF, WEBP (8MB 이하).</li>
  <li>관리자(서버 관리 권한)만 바꿀 수 있고, 모든 변경은 감사 로그에 남습니다.</li>
</ul>
<div class="callout warn">디스코드는 프로필 변경 횟수를 제한합니다. 거부되면 몇 분 뒤 다시 시도하세요. 이름을 바꾸려면 봇에 "별명 변경" 권한도 필요합니다.</div>`,
  },
  {
    id: 'plans', group: 'admin',
    title: { en: 'Plans', ko: '요금제' },
    en: `
<div class="callout">There are two plans, Free and Premium. <b>Right now every server gets Premium for free.</b></div>
<table><tr><th></th><th>Free</th><th>Premium</th></tr>
<tr><td>Profiles, stats, tier roles, alerts</td><td>Included</td><td>Included</td></tr>
<tr><td>Scrims, parties, duels, panels, dashboard</td><td>Included</td><td>Included</td></tr>
<tr><td>Bot name and image per server</td><td>Included</td><td>Included</td></tr>
<tr><td>Seasons at the same time</td><td>1</td><td>Unlimited</td></tr>
<tr><td>Tournaments</td><td>Single elimination, up to 8 teams</td><td>Single elimination + round robin, up to 32 teams</td></tr>
<tr><td>Clubs per server</td><td>5</td><td>Unlimited</td></tr>
<tr><td>Agent and map stats</td><td>Last 20 games</td><td>Last 100 games</td></tr>
<tr><td>Rank history</td><td>10 entries</td><td>50 entries</td></tr></table>
<p><code>/status</code> shows your server's current plan.</p>`,
    ko: `
<div class="callout">요금제는 Free와 Premium 두 가지입니다. <b>지금은 모든 서버가 Premium을 무료로 씁니다.</b></div>
<table><tr><th></th><th>Free</th><th>Premium</th></tr>
<tr><td>프로필, 전적, 티어 역할, 알림</td><td>포함</td><td>포함</td></tr>
<tr><td>내전, 파티, 대결, 패널, 대시보드</td><td>포함</td><td>포함</td></tr>
<tr><td>서버별 봇 이름·이미지</td><td>포함</td><td>포함</td></tr>
<tr><td>동시 진행 시즌</td><td>1개</td><td>무제한</td></tr>
<tr><td>대회</td><td>싱글 엘리미네이션, 최대 8팀</td><td>싱글 엘리미네이션 + 풀리그, 최대 32팀</td></tr>
<tr><td>서버당 클럽</td><td>5개</td><td>무제한</td></tr>
<tr><td>요원·맵 통계</td><td>최근 20경기</td><td>최근 100경기</td></tr>
<tr><td>랭크 기록</td><td>10개</td><td>50개</td></tr></table>
<p><code>/status</code>에서 서버의 현재 요금제를 볼 수 있습니다.</p>`,
  },

  /* ================= Help ================= */
  {
    id: 'trouble', group: 'help',
    title: { en: 'Troubleshooting', ko: '문제 해결' },
    en: `
<table><tr><th>Problem</th><th>Fix</th></tr>
<tr><td>Commands do not show up</td><td>Wait a little and restart the Discord app. Check members can use application commands in that channel.</td></tr>
<tr><td>Tier roles do not change</td><td>Move the Valorant Hub role above the tier roles. Check Auto Roles is on in Settings.</td></tr>
<tr><td>"Player not found"</td><td>Check spelling, the tag after #, and the region.</td></tr>
<tr><td>Stats look old</td><td>Press Refresh on your profile or run <code>/verify-rank</code>.</td></tr>
<tr><td>"Not enough games"</td><td>Play at least 5 competitive games after linking, or wait for the next update.</td></tr>
<tr><td>A panel disappeared</td><td>It comes back within 2 minutes. If not, check the bot can send messages in that channel.</td></tr>
<tr><td>No alerts</td><td>Set an alert channel in the dashboard and turn the alert type on.</td></tr>
<tr><td>Voice rooms fail</td><td>Give the bot "Manage Channels".</td></tr></table>`,
    ko: `
<table><tr><th>문제</th><th>해결</th></tr>
<tr><td>명령어가 안 보여요</td><td>잠시 기다린 뒤 디스코드 앱을 재시작하세요. 그 채널에서 멤버에게 "애플리케이션 명령어 사용" 권한이 있는지 확인하세요.</td></tr>
<tr><td>티어 역할이 안 바뀌어요</td><td>Valorant Hub 역할을 티어 역할보다 위로 올리세요. 설정에서 자동 역할이 켜져 있는지 확인하세요.</td></tr>
<tr><td>"플레이어를 찾을 수 없습니다"</td><td>철자, # 뒤 태그, 지역을 확인하세요.</td></tr>
<tr><td>전적이 오래된 것 같아요</td><td>프로필의 새로고침을 누르거나 <code>/verify-rank</code>를 실행하세요.</td></tr>
<tr><td>"경기 수가 부족합니다"</td><td>연결 후 경쟁전을 5판 이상 하거나 다음 갱신을 기다리세요.</td></tr>
<tr><td>패널이 사라졌어요</td><td>2분 안에 다시 올라옵니다. 아니라면 그 채널에 봇이 메시지를 보낼 수 있는지 확인하세요.</td></tr>
<tr><td>알림이 안 와요</td><td>대시보드에서 알림 채널을 정하고 알림 종류를 켜세요.</td></tr>
<tr><td>음성 채널을 못 만들어요</td><td>봇에 "채널 관리" 권한을 주세요.</td></tr></table>`,
  },
  {
    id: 'faq', group: 'help',
    title: { en: 'FAQ', ko: '자주 묻는 질문' },
    en: `
<h4>Is Valorant Hub made by Riot Games?</h4><p>No. It is an independent project and is not endorsed by Riot Games.</p>
<h4>Do custom games count in stats?</h4><p>No. Stats use competitive games. Scrims, duels and tournaments are recorded in Discord by players and staff.</p>
<h4>Does one link work in every server?</h4><p>Yes. Link once and every server with the bot sees your rank. Each server keeps its own leaderboards, seasons and settings.</p>
<h4>Can I change the bot's language?</h4><p>Yes. Each member can use <code>/language</code>, and admins pick Auto, Korean or English per server.</p>
<h4>Is it free?</h4><p>Yes. Premium is free for every server right now.</p>`,
    ko: `
<h4>Riot Games가 만든 건가요?</h4><p>아니요. 독립 프로젝트이며 Riot Games의 보증을 받지 않았습니다.</p>
<h4>사용자 설정 게임도 통계에 들어가나요?</h4><p>아니요. 통계는 경쟁전만 씁니다. 내전·대결·대회는 플레이어와 운영진이 디스코드에서 기록합니다.</p>
<h4>한 번 연결하면 모든 서버에서 되나요?</h4><p>네. 한 번 연결하면 봇이 있는 모든 서버에서 랭크가 보입니다. 랭킹, 시즌, 설정은 서버마다 따로입니다.</p>
<h4>봇 언어를 바꿀 수 있나요?</h4><p>네. 멤버는 <code>/language</code>로 각자 바꾸고, 관리자는 서버마다 자동·한국어·영어를 고릅니다.</p>
<h4>무료인가요?</h4><p>네. 지금은 모든 서버에 Premium이 무료입니다.</p>`,
  },
];

window.VH_DOCS_GROUPS = {
  start: { en: 'Getting started', ko: '시작하기' },
  player: { en: 'Players', ko: '플레이어' },
  compete: { en: 'Competition', ko: '경쟁' },
  play: { en: 'Play together', ko: '함께 플레이' },
  admin: { en: 'Server admins', ko: '서버 관리자' },
  help: { en: 'Help', ko: '도움말' },
};
