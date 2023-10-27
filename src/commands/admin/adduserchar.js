const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

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
    // Check if the user executing the command has the "sentinel" role
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.roles.cache.some(role => role.name === 'Sentinel')) {
      interaction.reply('You do not have permission to use this command.');
      return;
    }

    const user = interaction.options.getUser('user'); // Get the mentioned user
    const userId = user.id;
    const characterClass = interaction.options.getString('class');
    const ign = interaction.options.getString('ign');

    if (ign.length < 4 || ign.length >= 16) {
      await interaction.reply('IGN should be 4 to 16 characters in length.');
      return;
    }

    const isValidIgn = /^[A-Za-z0-9]+$/.test(ign);

    if (!isValidIgn) {
      await interaction.reply('IGN should contain only letters and numbers.');
      return;
    }

    // Reference to the user's document
    const userRef = db.collection('users').doc(userId);

    // Check if the user's document exists
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Initialize the user document with an empty 'characters' array
      await userRef.set({ characters: [] });
    }

    let userData = userDoc.data() || {}; // Initialize userData as an empty object

    // Initialize the characters array if it doesn't exist
    userData.characters = userData.characters || [];

    // Check if the IGN is already in use across all users
    const usersRef = db.collection('users');
    const usersQuery = await usersRef.get();

    for (const userDoc of usersQuery.docs) {
      const userData = userDoc.data();

      if (userData.characters && userData.characters.some(character => character.ign.toLowerCase() === ign)) {
        await interaction.reply('This IGN is already in use by another user. Please choose a different IGN.');
        return;
      }
    }

    // Add the new character (IGN and class) to the characters array
    userData.characters.push({ ign, class: characterClass });

    // Update the user document with the modified characters
    await userRef.update({ characters: userData.characters });

    await interaction.reply(`The character information has been added for ${user.tag}. Class: ${characterClass}, IGN: ${ign}`);
  },
};
