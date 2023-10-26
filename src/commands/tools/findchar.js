const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

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
    const ignToFind = interaction.options.getString('ign');

    // Reference to the users collection
    const usersRef = db.collection('users');

    // Query all user documents
    const usersQuery = await usersRef.get();

    // Array to store matching character information
    const foundCharacters = [];

    // Iterate through user documents to find characters with the specified IGN
    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();

      if (!userData.characters) {
        return;
      }
      const matchingCharacters = userData.characters.filter(character => character.ign.toLowerCase() === ignToFind.toLowerCase());

      if (matchingCharacters.length > 0) {
        // Found matching characters in this user's document
        foundCharacters.push({
          user: userDoc.id,
          characters: matchingCharacters,
        });
      }
    }

    if (!foundCharacters?.length) {
      await interaction.reply(`IGN '**${ignToFind}**' not found.`);
      return;
    }
    
    // Characters with the specified IGN found
    const response = foundCharacters.map(entry => {
      const charactersInfo = entry.characters.map(character => {
        return `**Class**: ${character.class}`;
      }).join('\n');

      return `**User**: <@${entry.user}>\n${charactersInfo}`;
    }).join('\n\n');

    await interaction.reply(`IGN **${ignToFind}** found:\n${response}`);
  },
};
