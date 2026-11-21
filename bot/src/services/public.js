'use strict';
/*
 * Public server summary for the website (data/bot/<guildId>/public.json).
 * The website shows it only when the server turned on "Public leaderboard on the website".
 * Private profiles are never included.
 */
const store = require('../lib/store');
const ranking = require('../features/ranking');
const scrim = require('../features/scrim');
const duel = require('../features/duel');
const club = require('../features/club');
const tournament = require('../features/tournament');
const players = require('./players');

function rows(guild, type) {
  return ranking.compute(guild, type, 'week', {}).slice(0, 50).map((r) => ({
    userId: r.userId,
    name: r.member ? r.member.displayName : null,
    riotId: `${r.player.name}#${r.player.tag}`,
    region: r.player.region,
    tier: r.player.current ? r.player.current.tier : null,
    rr: r.player.current ? r.player.current.rr : null,
    value: r.value,
    display: r.display,
    games: r.n || null,
  }));
}

function exportGuild(guild) {
  const seasons = ranking.seasonsDoc(guild.id).data.filter((s) => s.status === 'active').map((s) => ({
    name: s.name, metric: s.metric, endAt: s.endAt,
    standings: Object.entries(s.entries).filter(([id]) => !players.isPrivate(id)).map(([id, e]) => {
      const p = players.player(e.puuid);
      if (!p) return null;
      let score = null;
      if (s.metric === 'rrgain' && p.current && typeof p.current.elo === 'number' && typeof e.startElo === 'number') score = p.current.elo - e.startElo;
      else if (s.metric !== 'rrgain') {
        const { aggregate } = require('../lib/stats');
        const agg = aggregate(players.competitive(p.puuid).filter((m) => Date.parse(m.startedAt) >= Date.parse(e.startAt)));
        score = s.metric === 'wins' ? agg.wins : agg.n >= 5 ? agg.acs : null;
      }
      return score === null ? null : { riotId: `${p.name}#${p.tag}`, region: p.region, name: guild.members.cache.get(id)?.displayName || null, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 50),
  }));
  const tn = tournament.current(guild.id) || tournament.doc(guild.id).data.filter((x) => x.status === 'done').slice(-1)[0] || null;
  const teamName = (id) => (tn && tn.teams.find((x) => x.id === id) || {}).name || null;
  const rec = scrim.recordFor(guild.id);
  const out = {
    guild: { id: guild.id, name: guild.name, icon: guild.icon },
    leaderboards: { rr: rows(guild, 'rr'), winrate: rows(guild, 'winrate'), kd: rows(guild, 'kd'), acs: rows(guild, 'acs'), rrgain: rows(guild, 'rrgain') },
    seasons,
    tournament: tn ? {
      name: tn.name, format: tn.format, status: tn.status, teamSize: tn.teamSize, rounds: tn.rounds || null,
      teams: tn.teams.map((x) => x.name), champion: teamName(tn.championId),
      matches: (tn.matches || []).map((m) => ({ id: m.id, round: m.round, a: teamName(m.a), b: teamName(m.b), winner: teamName(m.winner), bye: Boolean(m.bye), status: m.status })),
    } : null,
    duels: Object.entries(duel.ratingsDoc(guild.id).data).filter(([id, r]) => r.wins + r.losses > 0 && !players.isPrivate(id))
      .sort((a, b) => b[1].rating - a[1].rating).slice(0, 20)
      .map(([id, r]) => ({ name: guild.members.cache.get(id)?.displayName || null, rating: r.rating, wins: r.wins, losses: r.losses })),
    clubs: club.doc(guild.id).data.filter((c) => !c.disbandedAt).slice(0, 30).map((c) => ({ name: c.name, tag: c.tag, members: c.members.length })),
    scrims: Object.entries(rec).filter(([id]) => !players.isPrivate(id)).sort((a, b) => b[1].w - a[1].w).slice(0, 20)
      .map(([id, r]) => ({ name: guild.members.cache.get(id)?.displayName || null, wins: r.w, losses: r.l })),
    generatedAt: new Date().toISOString(),
  };
  const doc = store.guild(guild.id, 'public', {});
  doc.data = out;
  doc.save();
}

module.exports = { exportGuild };
