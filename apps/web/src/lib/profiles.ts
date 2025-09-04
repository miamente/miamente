import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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
