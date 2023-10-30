const admin = require("firebase-admin");
// const serviceAccount = JSON.parse(process.env.GOOGLE_CREDS);
const serviceAccount = require("../firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

module.exports = db;