import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}

export { auth, db };

// Helper type for Firestore document data
export type FirestoreTimestamp = {
  createdAt: string;
  updatedAt: string;
};

// Types for our collections
export type ThumbnailData = {
  userId: string;
  videoLink?: string;
  style: string;
  imageUrl: string;
  type: 'youtube' | 'custom';
} & FirestoreTimestamp;

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  THUMBNAILS: 'thumbnails',
  USERS: 'users'
} as const;