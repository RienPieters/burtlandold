const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('../../db');
const admin = require("firebase-admin");

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
        const ignToDelete = interaction.options.getString('ign'); // Selected IGN
        const userId = interaction.user.id; // User who initiated the command

        // Reference to the users collection
        const usersRef = db.collection('users');

        // Get the user document for the current user
        const userDoc = await usersRef.doc(userId).get();

        if (!userDoc.exists) {
            await interaction.reply("User document not found. Please make sure you have previously registered.");
            return;
        }
        const userData = userDoc.data();

        // Check if the user has a `characters` array
        if (!userData.characters) {
            await interaction.reply("No character data found for this user.");
        }
        const updatedCharacters = userData.characters.filter(character => character.ign !== ignToDelete);

        if (updatedCharacters.length !== userData.characters.length) {
            // Update the user document with the modified `characters` array
            await usersRef.doc(userId).update({ characters: updatedCharacters });
            await interaction.reply(`Character with IGN '${ignToDelete}' has been deleted.`);
            return;
        }
        await interaction.reply(`Character with IGN '${ignToDelete}' not found in your character list.`);
    },
}
