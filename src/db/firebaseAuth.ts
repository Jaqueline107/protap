import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// Login com Google
export const loginWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

// Login com email
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Criar conta
export const signupWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// Logout
export const logout = () => signOut(auth);
export { auth };

