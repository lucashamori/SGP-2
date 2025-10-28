// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps, getApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrCQIu5cH7dxZ-argjqV2jbyG9v_dzFEE",
  authDomain: "sgp-senac.firebaseapp.com",
  projectId: "sgp-senac",
  storageBucket: "sgp-senac.firebasestorage.app",
  messagingSenderId: "136980853106",
  appId: "1:136980853106:web:2e4832da4f8f65fd612deb",
  measurementId: "G-FF0TY4DDT6"
};

// Initialize Firebase
// Inicializa o Firebase (garante que só seja inicializado uma vez)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtém a instância de autenticação
const auth = getAuth(app);

export { app, auth };

