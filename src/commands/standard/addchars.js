const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../../controllers/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addchar')
    .setDescription('Set your character class and IGN')
    .addStringOption(option =>
      option
        .setName('class')
        .setDescription('Your character class')
        .setRequired(true)
        .addChoices(
          { name: 'Artisan', value: 'Artisan' },
          { name: 'Bourgeois', value: 'Bourgeois' },
          { name: 'Champion', value: 'Champion' },
          { name: 'Cleric', value: 'Cleric' },
          { name: 'Knight', value: 'Knight' },
          { name: 'Mage', value: 'Mage' },
          { name: 'Raider', value: 'Raider' },
          { name: 'Scout', value: 'Scout' },
        )
    )
    .addStringOption(option =>
      option
        .setName('ign')
        .setDescription('IGN')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const characterClass = interaction.options.getString('class');
      const ign = interaction.options.getString('ign');

      // Validate IGN length and format
      const validation = Character.validateIGN(ign);

      if (!validation.valid) {
        await interaction.reply(validation.message);
        return;
      }

      const userId = interaction.user.id;
      const serverId = interaction.guild.id;

      const character = new Character(userId, characterClass, ign);

      // Add the new character (IGN, class, and server) to the characters array
      const addedToFirestore = await character.addToFirestore(serverId);

      if (addedToFirestore) {
        await interaction.reply(`Your character information has been stored. Class: ${characterClass}, IGN: ${ign}`);
      } else {
        await interaction.reply('There was an error while adding your character information.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
