const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../../controllers/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('findchar')
    .setDescription('Find a character by IGN')
    .addStringOption(option =>
      option
        .setName('ign')
        .setDescription('IGN of the character to find')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const ignToFind = interaction.options.getString('ign');
      const serverId = interaction.guild.id;

      const helper = new Character('', '', ignToFind);

      // Find characters by IGN across all users in the server
      const foundCharacters = await helper.findCharactersByIGN(serverId, ignToFind);

      if (!foundCharacters || foundCharacters.length === 0) {
        await interaction.reply(`IGN '**${ignToFind}**' not found in this server.`);
        return;
      }

      // Construct the response message
      const response = foundCharacters.map(entry => {
        const charactersInfo = entry.characters.map(character => {
          return `**User**: <@${entry.userId}>\n**Class**: ${character.class}`;
        }).join('\n');

        return charactersInfo;
      }).join('\n\n');

      await interaction.reply(`IGN **${ignToFind}** found:\n${response}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
