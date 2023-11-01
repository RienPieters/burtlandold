const { SlashCommandBuilder, PermissionsBitField, User } = require('discord.js');
const UserHelper = require('../../helpers/user');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeuser')
    .setDescription("Remove the characters of the following user")
    .addStringOption(option =>
      option
        .setName('user_id')
        .setDescription('The user whose character information should be modified')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Check if the user executing the command has the "Administrator" permission
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply('You must be an administrator to modify character information.');
      }
      const userId = interaction.options.getString('user_id');


      // Create an instance of Character
      const helper = new UserHelper(userId, '', '/');

      if (! helper.userExists()) {
        return interaction.reply(`The following user: <@${userId}> has no characters`);
      }

      helper.removeUser(userId)

      return interaction.reply(`Deleted all user data for: <@${userId}>`);

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
