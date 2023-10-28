const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');

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
            const ignToDelete = interaction.options.getString('ign'); // Selected IGN
            const userId = interaction.user.id; // User who initiated the command

            // Reference to the users collection
            const usersRef = db.collection('users');

            // Get the user document for the current user
            const userDoc = await usersRef.doc(userId).get();

            if (!userDoc.exists) {
                await interaction.reply("User document not found. Please make sure you registered a character first.");
                return;
            }

            const userData = userDoc.data();

            // Check if the user has a `characters` array
            if (!userData.characters) {
                await interaction.reply("No characters found. Please make sure you registered a character first.");
                return;
            }

            const updatedCharacters = userData.characters.filter(character => character.ign.toLowerCase() !== ignToDelete.toLowerCase());

            if (updatedCharacters.length !== userData.characters.length) {
                // Update the user document with the modified `characters` array
                await usersRef.doc(userId).update({ characters: updatedCharacters });
                await interaction.reply(`Character with IGN '${ignToDelete}' has been deleted.`);
                return;
            }

            await interaction.reply(`Character with IGN '${ignToDelete}' not found in your character list.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
