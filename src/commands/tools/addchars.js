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
                    { name: 'Raider', value: 'raider' },
                    { name: 'Cleric', value: 'cleric' },
                    { name: 'Bourgeois', value: 'bourgeois' }
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
        let ign = interaction.options.getString('ign');

        const isValidIgn = /^[A-Za-z0-9]+$/.test(ign);

        if (!isValidIgn) {
            await interaction.reply('IGN should contain only letters and numbers.');
            return;
        }

        // Convert IGN to lowercase
        ign = ign.toLowerCase();

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

        const userId = interaction.user.id;
        const userRef = db.collection('users').doc(userId);

        // Check if the user document exists
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await interaction.reply("User document not found. Please make sure you have previously registered.");
            return;
        }

            let userData = userDoc.data();

            // Initialize the characters array if it doesn't exist
            userData.characters = userData.characters || [];

            // Add the new character (IGN and class) to the characters array
            userData.characters.push({ ign, class: characterClass });

            // Update the user document with the modified characters
            await userRef.set(userData);

            await interaction.reply(`Your character information has been stored. Class: ${characterClass}, IGN: ${ign}`);
        
    }
};
