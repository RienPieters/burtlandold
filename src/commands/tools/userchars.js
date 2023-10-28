const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userchars')
        .setDescription('Retrieve and display character information for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to retrieve characters for')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser('user'); // Get the mentioned user

            if (!user) {
                interaction.reply('Please mention a user to view their character information.');
                return;
            }

            const userId = user.id; // Get the user's ID

            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                interaction.reply(`${user.displayName} hasn't stored any character information yet.`);
                return;
            }

            const userData = userDoc.data();
            const characters = userData.characters || [];

            if (characters.length === 0) {
                interaction.reply(`${user.displayName} hasn't stored any character information yet.`);
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
            const sortedClasses = Object.keys(groupedCharacters).sort();
            for (const characterClass of sortedClasses) {
                // Display classes with multiple IGNs as a comma-separated list
                if (groupedCharacters[characterClass].length > 1) {
                    userCharacters.push(`**${characterClass}**: ${groupedCharacters[characterClass].join(', ')}`);
                } else {
                    userCharacters.push(`**${characterClass}**: ${groupedCharacters[characterClass][0]}`);
                }
            }

            const username = user.displayName;

            const embed = {
                title: `Character Information for ${username}`,
                description: userCharacters.join('\n'),
                color: 0x00ff00, // Green color
            };

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
};
