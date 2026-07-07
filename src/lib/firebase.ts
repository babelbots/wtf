import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0951110180",
  appId: "1:1050214145804:web:a90a502f74996279037329",
  apiKey: "AIzaSyB261vO9IN_TcdACeRZdKDwa37UmWMJogg",
  authDomain: "gen-lang-client-0951110180.firebaseapp.com",
  storageBucket: "gen-lang-client-0951110180.firebasestorage.app",
  messagingSenderId: "1050214145804",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-017f281f-87b3-4096-b626-56e80de17a23");

// Auth Providers
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
