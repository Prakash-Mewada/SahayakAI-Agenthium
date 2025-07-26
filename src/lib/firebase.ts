// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "edugenius-5vnki",
  "appId": "1:738235700341:web:051f5cf602405673c0143c",
  "storageBucket": "edugenius-5vnki.firebasestorage.app",
  "apiKey": "AIzaSyDeZesEX_f3XLV5Ac2fV3h_JiRWHJQuKHo",
  "authDomain": "edugenius-5vnki.firebaseapp.com",
  "messagingSenderId": "738235700341"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
