// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
<<<<<<< HEAD
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
=======

>>>>>>> 6158b9e666877538413c557f412e463b598cf862

// Initialize Firebase
// Inicializa o Firebase (garante que só seja inicializado uma vez)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtém a instância de autenticação
const auth = getAuth(app);

export { app, auth };

