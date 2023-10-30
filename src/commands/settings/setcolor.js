const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Server = require('../../helpers/server');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcolor')
    .setDescription('Set the custom color for the server')
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('Custom color (in hex format, e.g., #FF0000)')
        .setRequired(true),
    ),
  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply('You must be an administrator to set roles.');
    }

    const serverId = interaction.guild.id;
    const color = interaction.options.getString('color');

    // Check if the provided color is a valid hex color code
    const validHexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (!validHexColorRegex.test(color)) {
      return interaction.reply('Invalid color format. Please provide a valid hex color code (e.g., #FF0000).');
    }

    const server = new Server(serverId);
    const updated = await server.setCustomColor(color);

    if (updated) {
      return interaction.reply(`Custom color for the server has been set to ${color}.`);
    } else {
      return interaction.reply('An error occurred while setting the custom color.');
    }
  },
};
