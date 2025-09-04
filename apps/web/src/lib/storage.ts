import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import { getFirebaseApp } from "./firebase";

export async function uploadFile(file: File, path: string): Promise<string> {
  const app = getFirebaseApp();
  const storage = getStorage(app);

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
}

export async function deleteFile(path: string): Promise<void> {
  const app = getFirebaseApp();
  const storage = getStorage(app);

  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export function getStoragePath(
  userId: string,
  filename: string,
  isPublic: boolean = false,
): string {
  const folder = isPublic ? "public_photos" : "private_credentials";
  return `${folder}/${userId}/${filename}`;
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${timestamp}_${random}.${extension}`;
}
