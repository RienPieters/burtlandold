const db = require('../db');

class Character {
    constructor(userId, characterClass, ign) {
        this.userId = userId;
        this.characterClass = characterClass;
        this.ign = ign;
    }

    async addToFirestore(serverId) {
        const userRef = db.collection('users').doc(this.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({ characters: [] });
        }

        const userData = userDoc.data() || {};
        userData.characters = userData.characters || [];

        if (userData.characters.some(character => character.ign.toLowerCase() === this.ign.toLowerCase() && character.server === serverId)) {
            return false; // Character already exists for this user in this server
        }

        userData.characters.push({ ign: this.ign, class: this.characterClass, server: serverId });
        await userRef.update({ characters: userData.characters });

        return true; // Character added successfully
    }

    async removeFromFirestore(serverId) {
        const userRef = db.collection('users').doc(this.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) return false; // User not found

        const userData = userDoc.data();
        if (!userData.characters) return false; // No characters to remove

        const updatedCharacters = userData.characters.filter(character =>
            character.ign.toLowerCase() !== this.ign.toLowerCase() || character.server !== serverId
        );

        if (updatedCharacters.length === userData.characters.length) return false; // Character not found

        await userRef.update({ characters: updatedCharacters });
        return true; // Character removed successfully
    }

    async findCharactersByIGN(serverId, ignToFind) {
        const usersRef = db.collection('users');
        const usersQuery = await usersRef.get();

        const foundCharacters = [];

        for (const userDoc of usersQuery.docs) {
            const userData = userDoc.data();

            if (!userData.characters) {
                continue; // Skip users with no characters
            }

            const matchingCharacters = userData.characters.filter(character =>
                character.ign.toLowerCase() === ignToFind.toLowerCase() && character.server === serverId
            );

            if (matchingCharacters.length > 0) {
                // Found matching characters in this user's document
                foundCharacters.push({
                    userId: userDoc.id,
                    characters: matchingCharacters,
                });
            }
        }

        if (foundCharacters.length > 0) {
            return foundCharacters;
        }

        return null;
    }

    static formatCharacterInfo(characters) {
        const sortedClasses = Object.keys(characters).sort();
        const characterList = sortedClasses.map((characterClass) => {
            const ignList = characters[characterClass].join(', ');
            return `**${characterClass}**: ${ignList}`;
        });

        return characterList.join('\n');
    }

    static validateIGN(ign) {
        // Check IGN length
        if (ign.length < 1 || ign.length > 16) {
            return { valid: false, message: 'IGN should be 1 to 16 characters in length.' };
        }

        // Check IGN format (letters and numbers only)
        const isValidIgn = /^[A-Za-z0-9]+$/.test(ign);

        if (!isValidIgn) {
            return { valid: false, message: 'IGN should contain only letters and numbers.' };
        }

        return { valid: true };
    }

    async getAllCharactersInServer(serverId, interaction) {
        try {
            const guild = interaction.guild;
            const members = await guild.members.fetch();
            const usersRef = db.collection('users');
            const usersQuery = await usersRef.get();

            if (usersQuery.empty) {
                return {}; // Return an empty object instead of an empty array
            }

            const allCharacterInfo = {};

            for (const userDoc of usersQuery.docs) {
                const userData = userDoc.data();
                const characters = userData.characters || [];

                if (characters.length === 0) {
                    continue;
                }

                const filteredCharacters = characters.filter((character) => character.server === serverId);

                if (filteredCharacters.length === 0) {
                    continue;
                }

                const userId = userDoc.id;
                const member = members.get(userId);
                const displayName = member ? member.displayName : 'Unknown';

                const charactersByClass = {};
                for (const character of filteredCharacters) {
                    const characterClass = character.class;
                    if (!charactersByClass[characterClass]) {
                        charactersByClass[characterClass] = [];
                    }
                    charactersByClass[characterClass].push(character.ign);
                }

                allCharacterInfo[displayName] = charactersByClass;
            }

            console.log(allCharacterInfo);

            return allCharacterInfo; // Return the object with character information
        } catch (error) {
            console.error('Error getting all characters in server:', error);
            return {};
        }
    }

}

module.exports = Character;
