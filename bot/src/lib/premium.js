'use strict';
/*
 * Plans. Two plans exist: Free and Premium. Right now every server gets Premium (EVERYONE_PREMIUM=true).
 * Feature code asks limits(guildId) instead of checking the plan directly.
 */
const LIMITS = {
  free: { plan: 'free', activeSeasons: 1, tournamentTeams: 8, tournamentFormats: ['single'], analysisGames: 20, historyEntries: 10, clubs: 5 },
  premium: { plan: 'premium', activeSeasons: Infinity, tournamentTeams: 32, tournamentFormats: ['single', 'roundrobin'], analysisGames: 100, historyEntries: 50, clubs: Infinity },
};

const everyonePremium = String(process.env.EVERYONE_PREMIUM ?? 'true').toLowerCase() !== 'false';

function plan(/* guildId */) {
  // A per-server subscription check goes here once paid plans open. Until then, everyone is Premium.
  return everyonePremium ? 'premium' : 'free';
}

const limits = (guildId) => LIMITS[plan(guildId)];

module.exports = { plan, limits, LIMITS, everyonePremium };
