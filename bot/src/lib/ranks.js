'use strict';
// Tier helpers. Tier names come from the API ("Gold 2"); we only map them to role keys and colours.
const ORDER = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'ascendant', 'immortal', 'radiant'];
const COLORS = {
  iron: 0x6b6b6b, bronze: 0xa5774a, silver: 0xc0c6cc, gold: 0xe1b74c, platinum: 0x3fb5c2,
  diamond: 0xb089f0, ascendant: 0x2fbf71, immortal: 0xd8475b, radiant: 0xffe28a,
};
const NAMES = { iron: 'Iron', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum', diamond: 'Diamond', ascendant: 'Ascendant', immortal: 'Immortal', radiant: 'Radiant' };

/** "Ascendant 2" -> "ascendant"; "Unrated"/null -> null */
function tierKey(tierName) {
  if (!tierName || typeof tierName !== 'string') return null;
  const first = tierName.trim().split(/\s+/)[0].toLowerCase();
  return ORDER.includes(first) ? first : null;
}

const tierIndex = (key) => ORDER.indexOf(key);
const accent = (tierName) => COLORS[tierKey(tierName)] || 0xff4d5a;

module.exports = { ORDER, COLORS, NAMES, tierKey, tierIndex, accent };
