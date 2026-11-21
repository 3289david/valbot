# Valorant Hub — Website

Landing page, commands page and admin dashboard for the Valorant Hub Discord bot. English and Korean, switchable on every page.

- `public/index.html` — landing page with a live rank lookup (HenrikDev API)
- `public/commands.html` — searchable command reference
- `public/dashboard.html` — Discord-login dashboard: overview, players, seasons, scrims, parties, duels, clubs, tournaments, auto roles, panels, alerts, settings, audit log
- `server.js` — Node/Express server: Discord OAuth2, API proxy, settings storage

**No fake data.** Every number on the site comes from Discord, the HenrikDev API, or files the bot writes. When a source has no data, the page says so. The server count on the landing page only appears when the server can read it live from Discord.

---

## 1. Run locally

Requires Node.js 18.17 or newer.

```bash
cp .env.example .env      # fill in the values (see below)
npm install
npm start                 # http://localhost:3000
```

Open the site through the server (http://localhost:3000), not by double-clicking the HTML files: the lookup and dashboard need the server.

## 2. Keys you need

| Variable | Where to get it |
| --- | --- |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord Developer Portal → your application → OAuth2 |
| `DISCORD_BOT_TOKEN` | Same application → Bot → Reset Token |
| `HENRIK_API_KEY` | HenrikDev API (see https://docs.henrikdev.xyz) |
| `SESSION_SECRET` | Any long random string (`openssl rand -hex 32`) |
| `PUBLIC_URL` | The site's public address, e.g. `https://valbot.example.com` |

In the Developer Portal → OAuth2 → Redirects, add `PUBLIC_URL` + `/auth/callback` (for local testing: `http://localhost:3000/auth/callback`).

Keys stay on the server. The browser never sees them.

## 3. Deploy on an Ubuntu VPS (22.04 / 24.04)

Point your domain's DNS A record at the VPS first. Then copy this folder to the VPS (git, `scp -r` or `rsync`) and run:

```bash
cd website                                            # the folder you copied
sudo bash deploy/install.sh your.domain.com you@email.com
sudo nano /opt/valorant-hub/website/.env              # fill in the keys
sudo systemctl restart valorant-hub-web
```

`install.sh` does all of this:

1. Installs Node.js 20, Nginx and Certbot
2. Creates a `valbot` system user and copies the app to `/opt/valorant-hub/website`
3. Creates `.env` with a random `SESSION_SECRET` and your `PUBLIC_URL`
4. Installs the systemd service `valorant-hub-web` (auto-restart, starts on boot)
5. Installs the Nginx reverse proxy for your domain
6. Gets a free HTTPS certificate from Let's Encrypt (if you gave an email)

Useful commands:

```bash
sudo systemctl status valorant-hub-web     # is it running?
sudo journalctl -u valorant-hub-web -f     # live logs
sudo bash deploy/update.sh                 # deploy new files after an upload / git pull
sudo certbot renew --dry-run               # check HTTPS auto-renewal
```

If you use `ufw`, allow web traffic: `sudo ufw allow 'Nginx Full'` (the installer does this when ufw is active).

## 4. How the dashboard gets bot data

The dashboard reads and writes files in `data/`:

| Path | Written by | Contents |
| --- | --- | --- |
| `data/guilds/<guildId>.json` | Dashboard | Settings: language, time zone, region, features, tier roles, panel channels, alerts, weekly recap |
| `data/audit/<guildId>.json` | Dashboard | Who changed which setting, and when |
| `data/bot/<guildId>/players.json` | Bot | Array of linked players |
| `data/bot/<guildId>/scrims.json` | Bot | Array of scrims |
| `data/bot/<guildId>/parties.json` | Bot | Array of parties |
| `data/bot/<guildId>/duels.json` | Bot | Array of duels |
| `data/bot/<guildId>/clubs.json` | Bot | Array of clubs |
| `data/bot/<guildId>/tournaments.json` | Bot | Array of tournaments |
| `data/bot/<guildId>/seasons.json` | Bot | Array of seasons |
| `data/bot/<guildId>/roleLog.json` | Bot | Array of tier-role changes |

Until a bot file exists, the matching dashboard page shows "No data from the bot yet". The bot should read `data/guilds/<guildId>.json` for its settings. When you move the bot to PostgreSQL (as in the service plan), replace the `readJson` calls in `server.js` with database queries; the API responses stay the same.

## 5. Photos

All photos are from Unsplash (free to use under the Unsplash License) and load from Unsplash's image CDN. Photographers are credited in each page footer. No Riot Games artwork, agent images or logos are used.

Valorant Hub is not endorsed by Riot Games. VALORANT is a trademark of Riot Games, Inc.

---

# 한국어 요약

**로컬 실행:** `.env.example`을 `.env`로 복사해 값을 채우고 `npm install` → `npm start` → http://localhost:3000. HTML 파일을 직접 열지 말고 서버를 통해 여세요.

**우분투 VPS 배포:** 도메인 DNS를 VPS로 연결한 뒤, 이 폴더를 VPS에 올리고 다음을 실행합니다.

```bash
sudo bash deploy/install.sh 내도메인.com 내이메일@example.com
sudo nano /opt/valorant-hub/website/.env     # 키 입력
sudo systemctl restart valorant-hub-web
```

설치 스크립트가 Node.js 20, Nginx, Certbot 설치, `valbot` 사용자 생성, systemd 서비스 등록, Nginx 리버스 프록시, HTTPS 인증서 발급까지 처리합니다. 디스코드 개발자 포털의 OAuth2 Redirects에 `https://내도메인.com/auth/callback`을 꼭 추가하세요.

**가짜 데이터 없음:** 모든 숫자는 디스코드, HenrikDev API, 봇이 쓴 파일에서 옵니다. 데이터가 없으면 없다고 표시합니다.
