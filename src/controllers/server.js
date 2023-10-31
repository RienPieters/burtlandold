const db = require('../db'); // Ensure you have the correct import for your Firebase configuration

class Server {
  constructor(serverId) {
    this.serverId = serverId;
  }

  async setCustomColor(color) {
    const serverRef = db.collection('servers').doc(this.serverId);

    try {
      await serverRef.set({ customColor: color });

      return true; // Custom color set successfully
    } catch (error) {
      console.error('Error setting custom color in Firestore:', error);
      return false; // Error while setting custom color
    }
  }

  async getCustomColor() {
    const serverRef = db.collection('servers').doc(this.serverId);

    try {
      const serverSnapshot = await serverRef.get();

      if (serverSnapshot.exists) {
        const serverData = serverSnapshot.data();
        return serverData.customColor || null;
      } else {
        return null; // Server document not found
      }
    } catch (error) {
      console.error('Error getting custom color from Firestore:', error);
      return null; // Error while fetching custom color
    }
  }
}

module.exports = Server;
