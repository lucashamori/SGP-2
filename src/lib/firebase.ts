// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
// Inicializa o Firebase (garante que só seja inicializado uma vez)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtém a instância de autenticação
const auth = getAuth(app);

export { app, auth };

