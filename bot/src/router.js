'use strict';
/* Loads every feature module and routes interactions by command name / customId prefix. */
const { tr } = require('./lib/i18n');
const ui = require('./lib/ui');
const { errorText } = require('./features/common');

const modules = [
  require('./features/player'),
  require('./features/ranking'),
  require('./features/scrim'),
  require('./features/party'),
  require('./features/duel'),
  require('./features/club'),
  require('./features/tournament'),
  require('./features/analytics'),
  require('./features/panels'),
  require('./features/utility'),
  require('./features/branding'),
];

const commands = new Map();
const buttons = new Map();
const selects = new Map();
const modals = new Map();
const autocompletes = new Map();

for (const m of modules) {
  for (const [name, fn] of Object.entries(m.onCommand || {})) commands.set(name, fn);
  for (const [p, fn] of Object.entries(m.onButton || {})) buttons.set(p, fn);
  for (const [p, fn] of Object.entries(m.onSelect || {})) selects.set(p, fn);
  for (const [p, fn] of Object.entries(m.onModal || {})) modals.set(p, fn);
  for (const [name, fn] of Object.entries(m.onAutocomplete || {})) autocompletes.set(name, fn);
}

function definitions() {
  return modules.flatMap((m) => (m.commands || []).map((c) => c.toJSON()));
}

const { MessageFlags } = require('discord.js');

function translatorFor(interaction) {
  // Buttons and menus on a message everyone sees keep that message in the server language.
  const onPublic = interaction.isMessageComponent && interaction.isMessageComponent()
    && interaction.guildId && interaction.message && !interaction.message.flags.has(MessageFlags.Ephemeral);
  return onPublic ? tr(interaction.guildId) : tr(interaction);
}

async function handle(interaction) {
  const t = translatorFor(interaction);
  try {
    if (interaction.isChatInputCommand()) {
      const fn = commands.get(interaction.commandName);
      if (fn) await fn(interaction, t);
    } else if (interaction.isAutocomplete()) {
      const fn = autocompletes.get(interaction.commandName);
      await (fn ? fn(interaction, t) : interaction.respond([]));
    } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
      const id = interaction.customId;
      if (id.startsWith('noop:')) return interaction.deferUpdate();
      const prefix = id.split(':').slice(0, 2).join(':');
      const map = interaction.isButton() ? buttons : interaction.isModalSubmit() ? modals : selects;
      const fn = map.get(prefix);
      if (fn) await fn(interaction, t, id.split(':').slice(2));
    }
  } catch (err) {
    if (interaction.isAutocomplete()) return interaction.respond([]).catch(() => {});
    const payload = ui.notice(errorText(t, err), 'error', { ephemeral: true });
    try {
      if (interaction.deferred && !interaction.replied) await interaction.editReply(ui.notice(errorText(t, err), 'error'));
      else if (interaction.replied || interaction.deferred) await interaction.followUp(payload);
      else await interaction.reply(payload);
    } catch (e) { /* interaction expired */ }
  }
}

module.exports = { handle, definitions, modules };
