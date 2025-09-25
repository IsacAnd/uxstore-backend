"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.bucket = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
if (!firebase_admin_1.default.apps.length) {
    if (!process.env.FIREBASE_CONFIG) {
        throw new Error("FIREBASE_CONFIG não definido no ambiente");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    // Corrige as quebras de linha da private_key
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}
exports.bucket = firebase_admin_1.default.storage().bucket();
exports.db = firebase_admin_1.default.firestore();
