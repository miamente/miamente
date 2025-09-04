"use client";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Functions } from "firebase/functions";
import { useEffect, useState } from "react";

import {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseFunctions,
} from "@/lib/firebase";

export function useFirebaseApp() {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const [functions, setFunctions] = useState<Functions | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const firebaseApp = getFirebaseApp();
      const firebaseAuth = getFirebaseAuth();
      const firebaseFirestore = getFirebaseFirestore();
      const firebaseFunctions = getFirebaseFunctions();

      setApp(firebaseApp);
      setAuth(firebaseAuth);
      setFirestore(firebaseFirestore);
      setFunctions(firebaseFunctions);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setIsInitialized(false);
    }
  }, []);

  return {
    app,
    auth,
    firestore,
    functions,
    isInitialized,
  };
}
