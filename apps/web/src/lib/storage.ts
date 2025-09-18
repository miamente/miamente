// Simple file upload utility for the new backend
import { apiClient } from "./api";

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return (response as { data: UploadResponse }).data;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

export async function deleteFile(filename: string): Promise<void> {
  try {
    await apiClient.delete(`/upload/${filename}`);
  } catch (error) {
    console.error("File deletion error:", error);
    throw error;
  }
}

// Legacy functions for compatibility
export function getStoragePath(filename: string): string {
  return `/uploads/${filename}`;
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID().replace(/-/g, "");
  const extension = originalName.split(".").pop();
  return `${timestamp}_${random}.${extension}`;
}
