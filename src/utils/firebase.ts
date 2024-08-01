import { FirebaseOptions, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'

const FIREBASE_CONFIG: FirebaseOptions = {
    apiKey: import.meta.env.VITE_OPS_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_OPS_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_OPS_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_OPS_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_OPS_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_OPS_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_OPS_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_OPS_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(FIREBASE_CONFIG)
export const db = getFirestore(app)
export const auth = getAuth(app)

