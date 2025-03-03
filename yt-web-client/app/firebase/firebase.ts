// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, signInWithPopup, GoogleAuthProvider, 
  onAuthStateChanged, User} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7JJW2UppHVQR3SoahxsqUq_mrImd483Y",
  authDomain: "wenhao-fullstack-project.firebaseapp.com",
  projectId: "wenhao-fullstack-project",
  storageBucket: "wenhao-fullstack-project.firebasestorage.app",
  messagingSenderId: "642392229943",
  appId: "1:642392229943:web:d9e073c55e8085cae697b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Signs the user out
 * @returns A promise that resolves when the user is signed out
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Trigger a callback when the auth state changes
 */

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
