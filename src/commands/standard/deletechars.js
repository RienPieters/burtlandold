const { SlashCommandBuilder } = require('@discordjs/builders');
const Character = require('../../controllers/character');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletechar')
    .setDescription('Delete a character from your information')
    .addStringOption(option =>
      option
        .setName('ign')
        .setDescription('IGN of the character to delete')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const ignToDelete = interaction.options.getString('ign');
      const userId = interaction.user.id;
      const serverId = interaction.guild.id;

      // Create a Character instance for the character to be deleted
      const characterToDelete = new Character(userId, '', ignToDelete);

      // Attempt to remove the character from Firestore
      const removed = await characterToDelete.removeFromFirestore(serverId);

      if (removed) {
        await interaction.reply(`Character with IGN '${ignToDelete}' has been deleted.`);
      } else {
        await interaction.reply(`Character with IGN '${ignToDelete}' not found in your character list.`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
