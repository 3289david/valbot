'use strict';
/*
 * Aggregates computed ONLY from stored real matches. Every result carries its sample size (n).
 * Nothing is estimated: if a field is missing from a match, that match is left out of that average.
 */

const MIN_SAMPLE = 5;

/** Trim a HenrikDev v4 match to the one player's perspective. Returns null if the player is not in it. */
function toRecord(match, puuid) {
  if (!match || !match.metadata || !Array.isArray(match.players)) return null;
  const p = match.players.find((x) => x.puuid === puuid);
  if (!p) return null;
  const team = (match.teams || []).find((t) => t.team_id === p.team_id) || null;
  const rounds = team && team.rounds ? (team.rounds.won || 0) + (team.rounds.lost || 0) : null;
  const s = p.stats || {};
  return {
    matchId: match.metadata.match_id,
    startedAt: match.metadata.started_at || null,
    map: match.metadata.map ? match.metadata.map.name : null,
    queue: match.metadata.queue ? match.metadata.queue.id || match.metadata.queue.name : null,
    season: match.metadata.season ? match.metadata.season.short : null,
    agent: p.agent ? p.agent.name : null,
    tier: p.tier ? p.tier.name : null,
    team: p.team_id || null,
    won: team ? team.won === true : null,
    draw: team && team.rounds ? team.rounds.won === team.rounds.lost : false,
    roundsWon: team && team.rounds ? team.rounds.won : null,
    roundsLost: team && team.rounds ? team.rounds.lost : null,
    rounds,
    score: num(s.score),
    kills: num(s.kills),
    deaths: num(s.deaths),
    assists: num(s.assists),
    headshots: num(s.headshots),
    bodyshots: num(s.bodyshots),
    legshots: num(s.legshots),
    damage: s.damage ? num(s.damage.dealt) : null,
  };
}

function num(v) { return typeof v === 'number' && Number.isFinite(v) ? v : null; }

function aggregate(records) {
  const list = records.filter(Boolean);
  const n = list.length;
  const decided = list.filter((m) => m.won !== null && !m.draw);
  const wins = decided.filter((m) => m.won).length;
  const sum = (k, arr = list) => arr.reduce((a, m) => a + (m[k] || 0), 0);
  const withRounds = list.filter((m) => m.rounds && m.score !== null);
  const withDmg = list.filter((m) => m.rounds && m.damage !== null);
  const withShots = list.filter((m) => m.headshots !== null && m.bodyshots !== null && m.legshots !== null);
  const shots = sum('headshots', withShots) + sum('bodyshots', withShots) + sum('legshots', withShots);
  const kdList = list.filter((m) => m.kills !== null && m.deaths !== null);
  const deaths = sum('deaths', kdList);
  return {
    n,
    wins,
    losses: decided.length - wins,
    draws: list.filter((m) => m.draw).length,
    winRate: decided.length ? wins / decided.length : null,
    kills: sum('kills', kdList),
    deaths,
    assists: sum('assists'),
    kd: kdList.length ? (deaths ? sum('kills', kdList) / deaths : null) : null,
    acs: withRounds.length ? sum('score', withRounds) / sum('rounds', withRounds) : null,
    adr: withDmg.length ? sum('damage', withDmg) / sum('rounds', withDmg) : null,
    hs: shots ? sum('headshots', withShots) / shots : null,
  };
}

function groupBy(records, key) {
  const groups = new Map();
  for (const r of records) {
    if (!r || !r[key]) continue;
    if (!groups.has(r[key])) groups.set(r[key], []);
    groups.get(r[key]).push(r);
  }
  return [...groups.entries()].map(([name, list]) => ({ name, ...aggregate(list) }));
}

/** Current streak from newest match backwards: { type: 'W'|'L', count } */
function streak(records) {
  const sorted = [...records].filter((m) => m && m.won !== null && !m.draw).sort(byNewest);
  if (!sorted.length) return null;
  const type = sorted[0].won ? 'W' : 'L';
  let count = 0;
  for (const m of sorted) {
    if ((m.won ? 'W' : 'L') !== type) break;
    count++;
  }
  return { type, count };
}

function acsOf(m) { return m.rounds && m.score !== null ? m.score / m.rounds : null; }
const byNewest = (a, b) => Date.parse(b.startedAt || 0) - Date.parse(a.startedAt || 0);

const fmt = {
  pct: (v) => (v === null || v === undefined ? null : `${(v * 100).toFixed(1)}%`),
  dec: (v, d = 2) => (v === null || v === undefined ? null : v.toFixed(d)),
  int: (v) => (v === null || v === undefined ? null : String(Math.round(v))),
};

module.exports = { MIN_SAMPLE, toRecord, aggregate, groupBy, streak, acsOf, byNewest, fmt };
