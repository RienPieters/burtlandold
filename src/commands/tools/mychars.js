const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mychars')
    .setDescription('Retrieve and display your character information'),
  async execute(interaction) {
    // Get the user's ID
    const userId = interaction.user.id;

    // Reference to the user's document
    const userRef = db.collection('users').doc(userId);

    // Get the user's document
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await interaction.reply("You haven't stored any character information yet.");
      return;
    }

    const userData = userDoc.data();
    const characters = userData.characters || [];

    if (characters.length === 0) {
      await interaction.reply("You haven't stored any character information yet.");
      return;
    }

    const groupedCharacters = {};

    characters.forEach((character) => {
      // Group characters by class
      if (!groupedCharacters[character.class]) {
        groupedCharacters[character.class] = [];
      }
      groupedCharacters[character.class].push(character.ign);
    });

    const userCharacters = [];

    for (const characterClass in groupedCharacters) {
      // Display classes with multiple IGNs as a comma-separated list
      if (groupedCharacters[characterClass].length > 1) {
        userCharacters.push(`**${characterClass}**: ${groupedCharacters[characterClass].join(', ')}`);
      } else {
        userCharacters.push(`**${characterClass}**: ${groupedCharacters[characterClass][0]}`);
      }
    }

    const username = interaction.user.username;

    const embed = {
      title: `Your Character Information, ${username}`,
      description: userCharacters.join('\n'),
      color: 0x00ff00, // Green color
    };

    await interaction.reply({ embeds: [embed] });
  },
};
