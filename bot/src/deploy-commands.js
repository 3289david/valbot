'use strict';
/* Register slash commands. Run once after install and after any command change: npm run deploy-commands */
const { REST, Routes } = require('discord.js');
const config = require('./config');
const { definitions } = require('./router');

(async () => {
  if (!config.token || !config.clientId) {
    console.error('Set DISCORD_TOKEN and DISCORD_CLIENT_ID in .env first.');
    process.exit(1);
  }
  const body = definitions();
  const rest = new REST({ version: '10' }).setToken(config.token);
  const route = config.devGuildId
    ? Routes.applicationGuildCommands(config.clientId, config.devGuildId)
    : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body });
  console.log(`Registered ${body.length} commands ${config.devGuildId ? `in server ${config.devGuildId}` : 'globally'}.`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
