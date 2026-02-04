import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchatapp-be63c.firebaseapp.com",
  projectId: "reactchatapp-be63c",
  storageBucket: "reactchatapp-be63c.firebasestorage.app",
  messagingSenderId: "227861675145",
  appId: "1:227861675145:web:d73dea80b2abcdf6721a58",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
