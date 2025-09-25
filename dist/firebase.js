"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.bucket = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Lê o JSON do Firebase a partir da variável de ambiente
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ex: "meu-bucket.appspot.com"
    });
}
exports.bucket = firebase_admin_1.default.storage().bucket();
exports.db = firebase_admin_1.default.firestore();
