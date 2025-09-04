import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

import { getFirebaseApp } from "./firebase";

type EventLog = {
  name: string;
  userId?: string;
  payload?: Record<string, unknown>;
  createdAt?: unknown;
  utc?: true;
};

export async function writeEvent(name: string, payload?: Record<string, unknown>, userId?: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const ref = collection(db, "event_log");
  await addDoc(ref, {
    name,
    payload: payload ?? {},
    userId: userId ?? undefined,
    createdAt: serverTimestamp(),
    utc: true,
  } satisfies EventLog);
}
