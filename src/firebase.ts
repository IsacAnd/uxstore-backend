import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(path.join(
  __dirname,
  "../config/serviceAccountKey.json"
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const bucket = admin.storage().bucket();
export const db = admin.firestore();
