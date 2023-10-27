const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addchar')
        .setDescription('Set your character class and IGN')
        .addStringOption(option =>
            option
                .setName('class')
                .setDescription('Your character class')
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
                .setDescription('IGN')
                .setRequired(true)
        ),
    async execute(interaction) {
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

        const userId = interaction.user.id;
        const userRef = db.collection('users').doc(userId);

        // Check if the user document exists
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            // Create a new user document with an empty 'characters' array
            await userRef.set({ characters: [] });
        }

        const userData = userDoc.data() || {}; // Initialize userData as an empty object

        // Check if the user already has this IGN
        if (userData.characters && userData.characters.some(character => character.ign.toLowerCase() === ign.toLowerCase())) {
            await interaction.reply('You already have a character with this IGN. Please choose a different IGN.');
            return;
        }

        // Initialize the characters array if it doesn't exist
        userData.characters = userData.characters || [];

        // Add the new character (IGN and class) to the characters array
        userData.characters.push({ ign, class: characterClass });

        // Update the user document with the modified characters
        await userRef.update({ characters: userData.characters });

        await interaction.reply(`Your character information has been stored. Class: ${characterClass}, IGN: ${ign}`);
    }
};
