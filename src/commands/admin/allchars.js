const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allchars')
    .setDescription('Retrieve and display all characters in the clan'),
  async execute(interaction) {

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.roles.cache.some(role => role.name === 'Inviter')) {
      interaction.reply('You do not have permission to use this command.');
      return;
    }
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

      if (characters.length === 0) {
        continue;
      }

      const groupedCharacters = {};

      characters.forEach((character) => {
        // Group characters by class
        if (!groupedCharacters[character.class]) {
          groupedCharacters[character.class] = [];
        }
        groupedCharacters[character.class].push(character.ign);
      });

      const member = await interaction.guild.members.fetch(userDoc.id);
      const username = member?.user.username ?? 'User not found';

      allCharacterInfo.push({ user: username, characters: groupedCharacters });
    }

    if (allCharacterInfo.length === 0) {
      interaction.reply('No character information found for any user.');
      return;
    }

    // Sort users alphabetically based on their usernames
    allCharacterInfo.sort((a, b) => a.user.localeCompare(b.user));

    const embeds = allCharacterInfo.map((userData) => {
      const userCharacters = [];

      const sortedClasses = Object.keys(userData.characters).sort();
      for (const characterClass of sortedClasses) {
        // Display classes with multiple IGNs as a comma-separated list
        if (userData.characters[characterClass].length > 1) {
          userCharacters.push(`**${characterClass}**: ${userData.characters[characterClass].join(', ')}`);
        } else {
          userCharacters.push(`**${characterClass}**: ${userData.characters[characterClass][0]}`);
        }
      }

      return {
        title: `Character Information for ${userData.user}`,
        description: userCharacters.join('\n'),
        color: 0x00ff00, // You can set the color as needed
      };
    });

    interaction.reply({ embeds });
  },
};
