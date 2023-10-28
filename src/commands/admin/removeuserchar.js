const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

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
      // Check if the user executing the command has the "Sentinel" role
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (!member.roles.cache.some(role => role.name === 'Sentinel')) {
        interaction.reply('You do not have permission to use this command.');
        return;
      }

      // Get user and IGN to remove from command options
      const user = interaction.options.getUser('user');
      const userId = user.id;
      const ignToRemove = interaction.options.getString('ign');

      // Reference to the user's document
      const usersRef = db.collection('users');

      // Check if the user's document exists
      const userDoc = await usersRef.doc(userId).get();

      if (!userDoc.exists) {
        await interaction.reply("User document not found. Please make sure you have previously registered.");
        return;
      }

      const userData = userDoc.data();

      // Find the character with the specified IGN and remove it
      const updatedCharacters = userData.characters.filter(character => character.ign.toLowerCase() !== ignToRemove.toLowerCase());

      // Update the user document with the modified characters
      if (updatedCharacters.length !== userData.characters.length) {
        // Update the user document with the modified `characters` array
        await usersRef.doc(userId).update({ characters: updatedCharacters });
        await interaction.reply(`Character with IGN '${ignToRemove}' has been removed.`);
        return;
      }

      interaction.reply(`The IGN '${ignToRemove}' has been removed from ${user.tag}'s character information.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
