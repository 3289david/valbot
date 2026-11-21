# Valorant Hub — Discord bot

Panels + slash commands for Valorant communities: per-server bot name and image, profiles, leaderboards, seasons, tier roles, alerts, scrims, parties, duels, clubs, tournaments, analysis and weekly recaps. Korean and English.

The bot and the website share one data folder (`website/data`). Settings saved in the dashboard apply to the bot within seconds.

## Setup

1. Discord Developer Portal → your application:
   - **Bot → Privileged Gateway Intents → Server Members Intent: ON** (needed for tier roles and leaderboards)
   - Copy the bot token and application ID
2. `cp .env.example .env` and fill in `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `HENRIK_API_KEY`, `DATA_DIR`, `DASHBOARD_URL`
3. `npm install`
4. `npm run deploy-commands` (registers the 33 slash commands; use `DEV_GUILD_ID` for instant testing in one server)
5. `npm start`

Invite the bot with the "Add to Discord" button on the website. Then run `/setup` in your server.

## Ubuntu VPS

Install the website first (`website/deploy/install.sh`), then from this folder:

```bash
sudo bash deploy/install.sh
sudo nano /opt/valorant-hub/bot/.env     # check the values
sudo systemctl restart valorant-hub-bot
```

The installer copies keys from the website's `.env` when they exist, registers the commands and starts the `valorant-hub-bot` service.

```bash
sudo journalctl -u valorant-hub-bot -f   # logs
sudo bash deploy/update.sh               # deploy new files
```

## Languages

Every message works in English and Korean. Server language is set in the dashboard (Auto, 한국어, English). Auto follows each member's Discord language for private replies and the server's language for public messages. Members can pick their own with `/language`.

## Website links

- Player pages: `/p/<region>/<name>/<tag>` (the "Open on web" button on profiles).
- Server page: `/s/<server id>`, shown only when "Show rankings on the website" is on.
- Requests from the website (link accounts, announcements, panel reposts, role sync) are files in `data/bot/_global/queue` and `data/bot/<server>/queue`; the bot picks them up every 5 seconds.

## Tests

`npm test` runs offline checks: stats math, leaderboards, team balancing, brackets, settings validation, and renders every message in both languages against Discord's limits (40 components, 4000 characters).

## Plans

Free and Premium plans exist (`src/lib/premium.js`). Right now every server gets Premium (`EVERYONE_PREMIUM=true`, the default).

## Data

| File | Contents |
| --- | --- |
| `data/bot/_global/users.json` | Discord user → linked Riot accounts, privacy |
| `data/bot/_global/players.json` | Rank cache per account |
| `data/bot/_global/matches/<puuid>.json` | Stored competitive matches (latest 200) |
| `data/bot/_global/rank/<puuid>.json` | Rank snapshots over time |
| `data/bot/<guildId>/*.json` | Scrims, parties, duels, ratings, clubs, tournaments, seasons, role log, panels, players (for the dashboard) |
| `data/guilds/<guildId>.json` | Settings (written by the dashboard and `/setup`) |

The JSON files are written atomically. Back up the whole `data` folder.
