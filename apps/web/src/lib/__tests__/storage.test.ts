import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module
vi.mock('../api', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock generateUniqueIdHex
vi.mock('../id', () => ({
  generateUniqueIdHex: vi.fn(() => 'mockrandomid123456789'),
}));

import { uploadFile, deleteFile, getStoragePath, generateUniqueFilename, UploadResponse } from '../storage';
import { apiClient } from '../api';

// Mock interface for apiClient
interface MockApiClient {
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

// Cast to mocked type
const mockApiClient = apiClient as unknown as MockApiClient;

describe('Storage Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/test.txt',
        filename: 'test.txt',
        size: 12,
        content_type: 'text/plain',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadFile(mockFile);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should append file to FormData correctly', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/test.txt',
        filename: 'test.txt',
        size: 12,
        content_type: 'text/plain',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      await uploadFile(mockFile);

      const formDataCall = mockApiClient.post.mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);
      
      // Verify the file is appended to FormData
      expect(formDataCall.get('file')).toBe(mockFile);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockError = new Error('Upload failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(uploadFile(mockFile)).rejects.toThrow('Upload failed');
      expect(consoleSpy).toHaveBeenCalledWith('File upload error:', mockError);

      consoleSpy.mockRestore();
    });

    it('should handle different file types', async () => {
      const mockFile = new File(['image data'], 'image.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/image.jpg',
        filename: 'image.jpg',
        size: 10,
        content_type: 'image/jpeg',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadFile(mockFile);

      expect(result.content_type).toBe('image/jpeg');
      expect(result.filename).toBe('image.jpg');
    });

    it('should handle large files', async () => {
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB
      const mockFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/large.txt',
        filename: 'large.txt',
        size: 1024 * 1024,
        content_type: 'text/plain',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const result = await uploadFile(mockFile);

      expect(result.size).toBe(1024 * 1024);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const filename = 'test.txt';
      mockApiClient.delete.mockResolvedValue({});

      await deleteFile(filename);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${filename}`);
    });

    it('should handle delete errors', async () => {
      const filename = 'test.txt';
      const mockError = new Error('Delete failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.delete.mockRejectedValue(mockError);

      await expect(deleteFile(filename)).rejects.toThrow('Delete failed');
      expect(consoleSpy).toHaveBeenCalledWith('File deletion error:', mockError);

      consoleSpy.mockRestore();
    });

    it('should handle special characters in filename', async () => {
      const filename = 'test file with spaces & symbols!.txt';
      mockApiClient.delete.mockResolvedValue({});

      await deleteFile(filename);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/upload/${filename}`);
    });
  });

  describe('getStoragePath', () => {
    it('should return correct storage path', () => {
      const filename = 'test.txt';
      const result = getStoragePath(filename);

      expect(result).toBe('/uploads/test.txt');
    });

    it('should handle filenames with special characters', () => {
      const filename = 'test file with spaces & symbols!.txt';
      const result = getStoragePath(filename);

      expect(result).toBe('/uploads/test file with spaces & symbols!.txt');
    });

    it('should handle empty filename', () => {
      const filename = '';
      const result = getStoragePath(filename);

      expect(result).toBe('/uploads/');
    });

    it('should handle nested paths', () => {
      const filename = 'folder/subfolder/file.txt';
      const result = getStoragePath(filename);

      expect(result).toBe('/uploads/folder/subfolder/file.txt');
    });
  });

  describe('generateUniqueFilename', () => {
    it('should generate unique filename with timestamp and random string', () => {
      const originalName = 'test.txt';
      const result = generateUniqueFilename(originalName);

      expect(result).toMatch(/^\d+_mockrandomid123456789\.txt$/);
    });

    it('should handle files without extension', () => {
      const originalName = 'testfile';
      const result = generateUniqueFilename(originalName);

      expect(result).toMatch(/^\d+_mockrandomid123456789\.testfile$/);
    });

    it('should handle files with multiple dots', () => {
      const originalName = 'test.backup.old.txt';
      const result = generateUniqueFilename(originalName);

      expect(result).toMatch(/^\d+_mockrandomid123456789\.txt$/);
    });

    it('should handle empty filename', () => {
      const originalName = '';
      const result = generateUniqueFilename(originalName);

      expect(result).toMatch(/^\d+_mockrandomid123456789\.$/);
    });

    it('should handle filenames with special characters', () => {
      const originalName = 'test file with spaces & symbols!.pdf';
      const result = generateUniqueFilename(originalName);

      expect(result).toMatch(/^\d+_mockrandomid123456789\.pdf$/);
    });

    it('should generate different filenames for same input', () => {
      const originalName = 'test.txt';
      
      // Mock Date.now to return different values
      const nowSpy = vi.spyOn(Date, 'now')
        .mockReturnValueOnce(1234567890)
        .mockReturnValueOnce(1234567891);

      const result1 = generateUniqueFilename(originalName);
      const result2 = generateUniqueFilename(originalName);

      expect(result1).not.toBe(result2);
      expect(result1).toMatch(/^1234567890_mockrandomid123456789\.txt$/);
      expect(result2).toMatch(/^1234567891_mockrandomid123456789\.txt$/);

      nowSpy.mockRestore();
    });

    it('should handle various file extensions', () => {
      const extensions = ['txt', 'pdf', 'jpg', 'png', 'docx', 'xlsx', 'zip'];
      
      extensions.forEach(ext => {
        const originalName = `test.${ext}`;
        const result = generateUniqueFilename(originalName);
        
        expect(result).toMatch(new RegExp(`^\\d+_mockrandomid123456789\\.${ext}$`));
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with real File objects', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/test.txt',
        filename: 'test.txt',
        size: 12,
        content_type: 'text/plain',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });

      const uploadResult = await uploadFile(mockFile);
      expect(uploadResult.filename).toBe('test.txt');

      mockApiClient.delete.mockResolvedValue({});
      await deleteFile(uploadResult.filename);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/upload/test.txt');
    });

    it('should maintain consistency between upload and delete', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: UploadResponse = {
        url: 'https://example.com/uploads/test.txt',
        filename: 'test.txt',
        size: 12,
        content_type: 'text/plain',
      };

      mockApiClient.post.mockResolvedValue({ data: mockResponse });
      mockApiClient.delete.mockResolvedValue({});

      const uploadResult = await uploadFile(mockFile);
      await deleteFile(uploadResult.filename);

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
    });
  });
});