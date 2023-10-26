const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allchars')
    .setDescription('Retrieve and display all characters in the clan'),
  async execute(interaction) {
    // Fetch character information for all users from the Firestore database
    const usersRef = db.collection('users');
    const usersQuery = await usersRef.get();

    if (usersQuery.empty) {
      interaction.reply('No character information found for any user.');
      return;
    }

    const allCharacterInfo = [];

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();
      const characters = userData.characters || [];

      if (characters.length > 0) {
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

        const member = await interaction.guild.members.fetch(userDoc.id);
        const username = member ? member.user.username : 'User not found';

        allCharacterInfo.push({ user: username, characters: userCharacters });
      }
    }

    if (allCharacterInfo.length === 0) {
      interaction.reply('No character information found for any user.');
      return;
    }

    const embeds = allCharacterInfo.map((userData) => ({
      title: `Character Information for ${userData.user}`,
      description: userData.characters.join('\n'),
      color: 0x00ff00, // You can set the color as needed
    }));

    interaction.reply({ embeds });
  },
};
