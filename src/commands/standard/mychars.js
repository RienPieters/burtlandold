const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../../controllers/character');
const User = require('../../controllers/user');
const Server = require('../../controllers/server');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mychars')
    .setDescription('Retrieve and display your character information'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const serverId = interaction.guild.id;

      const { found, characters, message } = await User.getUserCharacters(userId, serverId);

      if (!found) {
        await interaction.reply(message);
        return;
      }

      const formattedCharacterInfo = Character.formatCharacterInfo(characters);
      
      const server = new Server(serverId);
      const customColor = await server.getCustomColor();

      const embed = {
        title: `Your Character Information:`,
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
