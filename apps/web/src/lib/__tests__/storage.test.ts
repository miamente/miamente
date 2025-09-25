import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadFile,
  deleteFile,
  getStoragePath,
  generateUniqueFilename,
  type UploadResponse,
} from "../storage";

// Mock the apiClient
vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "../api";
const mockApiClient = vi.mocked(apiClient);

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn();
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: mockRandomUUID,
  },
});

describe("Storage Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn(); // Mock console.error

    // Mock Date.now() for consistent testing
    vi.spyOn(Date, "now").mockReturnValue(1640995200000); // 2022-01-01T00:00:00.000Z
    mockRandomUUID.mockReturnValue("550e8400-e29b-41d4-a716-446655440000");
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
      const mockResponse: UploadResponse = {
        url: "https://example.com/uploads/test.txt",
        filename: "test.txt",
        size: 12,
        content_type: "text/plain",
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadFile(mockFile);

      expect(mockApiClient.post).toHaveBeenCalledWith("/upload", expect.any(FormData), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle upload errors", async () => {
      const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
      const error = new Error("Upload failed");

      mockApiClient.post.mockRejectedValue(error);

      await expect(uploadFile(mockFile)).rejects.toThrow("Upload failed");
      expect(console.error).toHaveBeenCalledWith("File upload error:", error);
    });

    it("should handle network errors", async () => {
      const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
      const error = new Error("Network error");

      mockApiClient.post.mockRejectedValue(error);

      await expect(uploadFile(mockFile)).rejects.toThrow("Network error");
      expect(console.error).toHaveBeenCalledWith("File upload error:", error);
    });

    it("should create FormData with correct file", async () => {
      const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
      const mockResponse: UploadResponse = {
        url: "https://example.com/uploads/test.txt",
        filename: "test.txt",
        size: 12,
        content_type: "text/plain",
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      await uploadFile(mockFile);

      const callArgs = mockApiClient.post.mock.calls[0];
      const formData = callArgs[1] as FormData;

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("file")).toBe(mockFile);
    });

    it("should handle different file types", async () => {
      const imageFile = new File(["image content"], "image.jpg", { type: "image/jpeg" });
      const mockResponse: UploadResponse = {
        url: "https://example.com/uploads/image.jpg",
        filename: "image.jpg",
        size: 13,
        content_type: "image/jpeg",
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadFile(imageFile);

      expect(result.content_type).toBe("image/jpeg");
      expect(result.filename).toBe("image.jpg");
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      const filename = "test.txt";
      mockApiClient.delete.mockResolvedValue({});

      await deleteFile(filename);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${filename}`);
    });

    it("should handle deletion errors", async () => {
      const filename = "test.txt";
      const error = new Error("Delete failed");

      mockApiClient.delete.mockRejectedValue(error);

      await expect(deleteFile(filename)).rejects.toThrow("Delete failed");
      expect(console.error).toHaveBeenCalledWith("File deletion error:", error);
    });

    it("should handle network errors", async () => {
      const filename = "test.txt";
      const error = new Error("Network error");

      mockApiClient.delete.mockRejectedValue(error);

      await expect(deleteFile(filename)).rejects.toThrow("Network error");
      expect(console.error).toHaveBeenCalledWith("File deletion error:", error);
    });

    it("should handle different filenames", async () => {
      const filenames = ["test.txt", "image.jpg", "document.pdf"];

      mockApiClient.delete.mockResolvedValue({});

      for (const filename of filenames) {
        await deleteFile(filename);
        expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${filename}`);
      }
    });

    it("should handle empty filename", async () => {
      const filename = "";
      mockApiClient.delete.mockResolvedValue({});

      await deleteFile(filename);

      expect(mockApiClient.delete).toHaveBeenCalledWith("/upload/");
    });
  });

  describe("getStoragePath", () => {
    it("should return correct storage path", () => {
      const filename = "test.txt";
      const path = getStoragePath(filename);

      expect(path).toBe("/uploads/test.txt");
    });

    it("should handle different filenames", () => {
      const filenames = ["image.jpg", "document.pdf", "data.json"];

      filenames.forEach((filename) => {
        const path = getStoragePath(filename);
        expect(path).toBe(`/uploads/${filename}`);
      });
    });

    it("should handle filenames with special characters", () => {
      const filename = "test file (1).txt";
      const path = getStoragePath(filename);

      expect(path).toBe("/uploads/test file (1).txt");
    });

    it("should handle empty filename", () => {
      const path = getStoragePath("");

      expect(path).toBe("/uploads/");
    });
  });

  describe("generateUniqueFilename", () => {
    it("should generate unique filename with timestamp and UUID", () => {
      const originalName = "test.txt";
      const uniqueName = generateUniqueFilename(originalName);

      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.txt$/);
      expect(uniqueName).toContain("1640995200000"); // mocked timestamp
      // The function now generates a hex string instead of a specific UUID
      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.txt$/);
    });

    it("should preserve file extension", () => {
      const extensions = [".txt", ".jpg", ".pdf", ".json"];

      extensions.forEach((ext) => {
        const originalName = `test${ext}`;
        const uniqueName = generateUniqueFilename(originalName);

        expect(uniqueName.endsWith(ext)).toBe(true);
      });
    });

    it("should handle filenames without extension", () => {
      const originalName = "testfile";
      const uniqueName = generateUniqueFilename(originalName);

      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.testfile$/);
    });

    it("should handle filenames with multiple dots", () => {
      const originalName = "test.backup.txt";
      const uniqueName = generateUniqueFilename(originalName);

      expect(uniqueName.endsWith(".txt")).toBe(true);
      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.txt$/);
    });

    it("should handle different original names", () => {
      const names = ["document.pdf", "image.jpeg", "data.json", "script.js"];

      names.forEach((name) => {
        const uniqueName = generateUniqueFilename(name);
        expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\./);
        expect(uniqueName.length).toBeGreaterThan(name.length);
      });
    });

    it("should generate different names for same input", () => {
      const originalName = "test.txt";

      // Mock different UUIDs for each call
      mockRandomUUID
        .mockReturnValueOnce("550e8400-e29b-41d4-a716-446655440000")
        .mockReturnValueOnce("6ba7b810-9dad-11d1-80b4-00c04fd430c8");

      const uniqueName1 = generateUniqueFilename(originalName);
      const uniqueName2 = generateUniqueFilename(originalName);

      expect(uniqueName1).not.toBe(uniqueName2);
    });

    it("should handle very long filenames", () => {
      const longName = "very-long-filename-with-many-characters-and-descriptive-text.txt";
      const uniqueName = generateUniqueFilename(longName);

      expect(uniqueName.endsWith(".txt")).toBe(true);
      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.txt$/);
    });

    it("should handle empty filename", () => {
      const uniqueName = generateUniqueFilename("");

      expect(uniqueName).toMatch(/^\d+_[a-f0-9]+\.$/);
    });
  });

  describe("Integration tests", () => {
    it("should work together for file operations", async () => {
      const filename = "test.txt";
      const mockFile = new File(["content"], filename, { type: "text/plain" });
      const uploadResponse: UploadResponse = {
        url: "https://example.com/uploads/test.txt",
        filename: "test.txt",
        size: 7,
        content_type: "text/plain",
      };

      mockApiClient.post.mockResolvedValue({ data: uploadResponse });
      mockApiClient.delete.mockResolvedValue({});

      // Upload file
      const uploadResult = await uploadFile(mockFile);
      expect(uploadResult).toEqual(uploadResponse);

      // Delete file
      await deleteFile(uploadResult.filename);
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${uploadResult.filename}`);
    });

    it("should handle file operations with generated unique names", () => {
      const originalName = "document.pdf";
      const uniqueName = generateUniqueFilename(originalName);
      const storagePath = getStoragePath(uniqueName);

      expect(uniqueName.endsWith(".pdf")).toBe(true);
      expect(storagePath).toBe(`/uploads/${uniqueName}`);
    });

    it("should maintain consistency across operations", async () => {
      const originalName = "image.jpg";
      const uniqueName = generateUniqueFilename(originalName);
      const mockFile = new File(["image"], uniqueName, { type: "image/jpeg" });

      const uploadResponse: UploadResponse = {
        url: `https://example.com/uploads/${uniqueName}`,
        filename: uniqueName,
        size: 5,
        content_type: "image/jpeg",
      };

      mockApiClient.post.mockResolvedValue({ data: uploadResponse });
      mockApiClient.delete.mockResolvedValue({});

      const uploadResult = await uploadFile(mockFile);
      await deleteFile(uploadResult.filename);

      expect(uploadResult.filename).toBe(uniqueName);
      expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${uniqueName}`);
    });
  });
});
