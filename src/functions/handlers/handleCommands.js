const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = (client, db) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`)
                .filter(file => file.endsWith('.js'));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            }
        }

    const clientId = process.env.CLIENT_ID;
    const token = process.env.DISCORD_TOKEN;

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Started refreshing application (/) commands globally.');

      // Register commands globally
      await rest.put(
        Routes.applicationCommands(clientId),
        {
          body: client.commandArray,
        }
      );

      console.log('Successfully refreshed application (/) commands globally.');
    } catch (error) {
      console.error('Error refreshing global commands:', error);
    }
  };
};
