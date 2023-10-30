const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Character = require('../../helpers/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeuserchar')
    .setDescription("Remove an IGN from a user's character information")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose character information should be modified')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('ign')
        .setDescription('The IGN to remove')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Check if the user executing the command has the "Administrator" permission
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply('You must be an administrator to modify character information.');
      }

      // Get user and IGN to remove from command options
      const user = interaction.options.getUser('user');
      const userId = user.id;
      const ignToRemove = interaction.options.getString('ign');

      // Create an instance of Character
      const characterToRemove = new Character(userId, '', ignToRemove);

      // Remove the character with the specified IGN
      const removed = await characterToRemove.removeFromFirestore(interaction.guild.id);

      if (removed) {
        await interaction.reply(`Character with IGN '${ignToRemove}' has been removed.`);
      } else {
        interaction.reply(`The IGN '${ignToRemove}' was not found in ${user.tag}'s character information.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
