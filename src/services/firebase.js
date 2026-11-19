import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)";

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];
const isConfigured = requiredConfigKeys.every((key) => firebaseConfig[key]);

export const firebaseApp = isConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp
  ? getFirestore(firebaseApp, firestoreDatabaseId)
  : null;

export const requireFirebaseAuth = () => {
  if (!firebaseAuth) {
    throw new Error("Не налаштовано Firebase. Перевірте змінні VITE_FIREBASE_*.");
  }
  return firebaseAuth;
};

export const requireFirestore = () => {
  if (!firestore) {
    throw new Error("Не налаштовано Firebase. Перевірте змінні VITE_FIREBASE_*.");
  }
  return firestore;
};
