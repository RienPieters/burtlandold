const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Character = require('../../helpers/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adduserchar')
    .setDescription("Add an IGN to a user's character information")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to add the character information for')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('class')
        .setDescription('The character class')
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
        .setDescription('The IGN to add')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const userId = user.id;
      const characterClass = interaction.options.getString('class');
      const ign = interaction.options.getString('ign');
      const serverId = interaction.guild.id;

      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply('You must be an administrator to modify other character information.');
      }

      const validation = Character.validateIGN(ign);

      if (!validation.valid) {
        await interaction.reply(validation.message);
        return;
      }

      const character = new Character(userId, characterClass, ign);

      // Check if the character was added successfully
      const added = await character.addToFirestore(serverId);

      if (added) {
        interaction.reply(`The character information has been added for ${user.tag}. Class: ${characterClass}, IGN: ${ign}`);
      } else {
        interaction.reply('This IGN is already added for this user in this server. Please choose a different IGN.');
      }
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
