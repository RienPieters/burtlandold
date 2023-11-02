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
        const querySnapshot = await usersRef.get();
    
        const foundCharacters = [];
    
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.characters) {
                const matchingCharacters = userData.characters.filter((character) =>
                    character.server === serverId && character.ign.toLowerCase() === ignToFind.toLowerCase()
                );
    
                if (matchingCharacters.length > 0) {
                    foundCharacters.push({
                        userId: doc.id,
                        characters: matchingCharacters,
                    });
                }
            }
        });
    
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

        // Check IGN format (letters, numbers and [] only )
        const isValidIgn = /^[\[\]A-Za-z0-9]+$/.test(ign);

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
            return {};
          }
      
          const allCharacterInfo = {};
      
          const usersData = usersQuery.docs.map((userDoc) => {
            return {
              userId: userDoc.id,
              userData: userDoc.data(),
            };
          });
      
          usersData.forEach(({ userId, userData }) => {
            const characters = userData.characters || [];
      
            if (characters.length === 0) {
              return;
            }
      
            const filteredCharacters = characters.filter(
              (character) => character.server === serverId
            );
      
            if (filteredCharacters.length === 0) {
              return;
            }
      
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
          });
          return allCharacterInfo; // Return the object with character information
        } catch (error) {
          console.error('Error getting all characters in server:', error);
          return {};
        }
      }
      
    
}

module.exports = Character;
