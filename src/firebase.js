// Import only what we need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD8ddYGxWwMy-Sj946HqZar7EL0tvhQdlw",
  authDomain: "church-event-bbeba.firebaseapp.com",
  projectId: "church-event-bbeba",
  storageBucket: "church-event-bbeba.appspot.com",
  messagingSenderId: "373335064143",
  appId: "1:373335064143:web:8acd67b4ff80af3607b43a",
  measurementId: "G-GZB34WLL8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth directly
export const db = getFirestore(app);
export const auth = getAuth(app);
