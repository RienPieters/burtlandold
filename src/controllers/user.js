const db = require('../db');

class User {
    constructor(userId) {
        this.userId = userId;
    }

    async getDocument() {
        const userRef = db.collection('users').doc(this.userId);
        return await userRef.get();
    }

    async removeUser() {
        await db.collection('users').doc(this.userId).delete();
    }

    userExists() {
        return db.collection('users').doc(this.userId).exists;
    }

    static async getUserCharacters(userId, serverId) {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return {
                found: false,
                message: "This user hasn't stored any character information yet.",
            };
        }

        const userData = userDoc.data();
        const characters = userData.characters || [];

        if (characters.length === 0) {
            return {
                found: false,
                message: "This user hasn't stored any character information yet.",
            };
        }

        const userCharacters = {};

        characters.forEach((character) => {
            if (character.server === serverId) {
                if (!userCharacters[character.class]) {
                    userCharacters[character.class] = [];
                }
                userCharacters[character.class].push(character.ign);
            }
        });

        return {
            found: true,
            characters: userCharacters,
        };
    }
}

module.exports = User;
