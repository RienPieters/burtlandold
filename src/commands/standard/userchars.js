const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../../controllers/character');
const User = require('../../controllers/user');
const Server = require('../../controllers/server');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userchars')
    .setDescription('Retrieve and display character information for a user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to retrieve characters for')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');

      if (!user) {
        await interaction.reply('Please mention a user to view their character information.');
        return;
      }

      const serverId = interaction.guild.id;
      const userId = user.id;

      const { found, characters, message } = await User.getUserCharacters(userId, serverId);

      if (!found) {
        await interaction.reply(message);
        return;
      }

      const formattedCharacterInfo = Character.formatCharacterInfo(characters);

      const username = user.displayName;
      const server = new Server(serverId);
      const customColor = await server.getCustomColor();

      const embed = {
        title: `Character Information for ${username}:`,
        description: formattedCharacterInfo,
        color: customColor ? parseInt(customColor.slice(1), 16) : 0xffffff,
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
