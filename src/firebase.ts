import admin from "firebase-admin";

if (!admin.apps.length) {
  if (!process.env.FIREBASE_CONFIG) {
    throw new Error("FIREBASE_CONFIG não definido no ambiente");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  // Corrige as quebras de linha da private_key
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const bucket = admin.storage().bucket();
export const db = admin.firestore();
