import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

import { getFirebaseAuth, getFirebaseFirestore } from "./firebase";

export type UserRole = "user" | "pro" | "admin";

export interface UserProfile {
  role: UserRole;
  fullName?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function registerWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Send email verification
  await sendEmailVerification(user);

  // Create user profile
  const userProfile: UserProfile = {
    role: "user",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(firestore, "users", user.uid), userProfile);

  return user;
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logout() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function resendEmailVerification() {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  await sendEmailVerification(user);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = getFirebaseFirestore();
  const userDoc = await getDoc(doc(firestore, "users", uid));

  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    role: data.role,
    fullName: data.fullName,
    phone: data.phone,
    emailVerified: data.emailVerified,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}
