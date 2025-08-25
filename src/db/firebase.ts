// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB89tWqC4mCNNlvT0gXm442mCdBA4EHDUY",
  authDomain: "protapcar-cffa7.firebaseapp.com",
  projectId: "protapcar-cffa7",
  storageBucket: "protapcar-cffa7.firebasestorage.app",
  messagingSenderId: "781978556042",
  appId: "1:781978556042:web:8ec4b0a1b0ed20ada4ff73",
  measurementId: "G-2ZLE3263RC"
};

// Evita múltiplas inicializações (Next.js pode renderizar várias vezes)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
