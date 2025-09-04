import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  collection,
  getDocs,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
  startAfter as fsStartAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";
import { uploadFile, getStoragePath, generateUniqueFilename } from "./storage";
import type { UserProfile, ProfessionalProfile } from "./types";

export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const firestore = getFirebaseFirestore();
  const userRef = doc(firestore, "users", uid);

  const userProfile: UserProfile = {
    fullName: data.fullName || "",
    role: data.role || "user",
    phone: data.phone,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const firestore = getFirebaseFirestore();
  const userRef = doc(firestore, "users", uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const firestore = getFirebaseFirestore();
  const userDoc = await getDoc(doc(firestore, "users", uid));

  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    fullName: data.fullName,
    role: data.role,
    phone: data.phone,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

export async function createProfessionalProfile(
  uid: string,
  data: Partial<ProfessionalProfile>,
  photoFile?: File,
  credentialsFile?: File,
): Promise<void> {
  const firestore = getFirebaseFirestore();
  const proRef = doc(firestore, "professionals", uid);

  let photoUrl: string | undefined;
  let credentialsUrl: string | undefined;

  // Upload photo if provided
  if (photoFile) {
    const photoPath = getStoragePath(uid, generateUniqueFilename(photoFile.name), true);
    photoUrl = await uploadFile(photoFile, photoPath);
  }

  // Upload credentials if provided
  if (credentialsFile) {
    const credentialsPath = getStoragePath(
      uid,
      generateUniqueFilename(credentialsFile.name),
      false,
    );
    credentialsUrl = await uploadFile(credentialsFile, credentialsPath);
  }

  const professionalProfile: ProfessionalProfile = {
    specialty: data.specialty || "",
    rateCents: data.rateCents || 0,
    bio: data.bio || "",
    isVerified: data.isVerified || false,
    credentials: credentialsUrl,
    privateNotes: data.privateNotes,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  };

  await setDoc(proRef, {
    ...professionalProfile,
    photoUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProfessionalProfile(
  uid: string,
  data: Partial<ProfessionalProfile>,
  photoFile?: File,
  credentialsFile?: File,
): Promise<void> {
  const firestore = getFirebaseFirestore();
  const proRef = doc(firestore, "professionals", uid);

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Upload new photo if provided
  if (photoFile) {
    const photoPath = getStoragePath(uid, generateUniqueFilename(photoFile.name), true);
    updateData.photoUrl = await uploadFile(photoFile, photoPath);
  }

  // Upload new credentials if provided
  if (credentialsFile) {
    const credentialsPath = getStoragePath(
      uid,
      generateUniqueFilename(credentialsFile.name),
      false,
    );
    updateData.credentials = await uploadFile(credentialsFile, credentialsPath);
  }

  await updateDoc(proRef, updateData);
}

export async function getProfessionalProfile(uid: string): Promise<ProfessionalProfile | null> {
  const firestore = getFirebaseFirestore();
  const proDoc = await getDoc(doc(firestore, "professionals", uid));

  if (!proDoc.exists()) return null;

  const data = proDoc.data();
  return {
    specialty: data.specialty,
    rateCents: data.rateCents,
    bio: data.bio,
    isVerified: data.isVerified,
    credentials: data.credentials,
    privateNotes: data.privateNotes,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  };
}

export interface ProfessionalsQueryParams {
  specialty?: string;
  minRateCents?: number;
  maxRateCents?: number;
  limit?: number;
  startAfterSnapshot?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface ProfessionalsQueryResult {
  professionals: Array<ProfessionalProfile & { id: string; photoUrl?: string }>;
  lastSnapshot: QueryDocumentSnapshot<DocumentData> | null;
}

export async function queryProfessionals(
  params: ProfessionalsQueryParams = {},
): Promise<ProfessionalsQueryResult> {
  const { specialty, minRateCents, maxRateCents, limit = 10, startAfterSnapshot } = params;
  const firestore = getFirebaseFirestore();
  const ref = collection(firestore, "professionals");

  const constraints: QueryConstraint[] = [where("isVerified", "==", true)];
  if (typeof specialty === "string" && specialty.trim()) {
    constraints.push(where("specialty", "==", specialty.trim()));
  }
  if (typeof minRateCents === "number") {
    constraints.push(where("rateCents", ">=", Math.max(0, minRateCents)));
  }
  if (typeof maxRateCents === "number") {
    constraints.push(where("rateCents", "<=", Math.max(0, maxRateCents)));
  }

  constraints.push(orderBy("rateCents", "asc"));
  constraints.push(fsLimit(limit));
  if (startAfterSnapshot) constraints.push(fsStartAfter(startAfterSnapshot));

  const q = fsQuery(ref, ...constraints);
  const snap = await getDocs(q);

  const professionals = snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: d.id,
      specialty: data.specialty as string,
      rateCents: data.rateCents as number,
      bio: data.bio as string,
      isVerified: data.isVerified as boolean,
      credentials: data.credentials as string | undefined,
      privateNotes: data.privateNotes as string | undefined,
      photoUrl: data.photoUrl as string | undefined,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    } satisfies ProfessionalProfile & { id: string; photoUrl?: string };
  });

  const lastSnapshot = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { professionals, lastSnapshot };
}
