import admin from "firebase-admin";

// Lê o JSON do Firebase a partir da variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG!);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ex: "meu-bucket.appspot.com"
  });
}

export const bucket = admin.storage().bucket();
export const db = admin.firestore();
