import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateUniqueId, generateUniqueIdHex } from "../id";

// Mock crypto.getRandomValues
const mockCrypto = {
  getRandomValues: vi.fn(),
};

// Mock global crypto
Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

describe("ID Generation Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset counter by re-importing the module
    vi.resetModules();
  });

  describe("generateUniqueId", () => {
    it("should generate a unique ID with correct format", () => {
      // Mock crypto.getRandomValues to return predictable values
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = i % 256;
        }
        return arr;
      });

      const id = generateUniqueId();

      // Should have format: timestamp-random-counter
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
      expect(id.split("-")).toHaveLength(3);
    });

    it("should generate different IDs on multiple calls", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      });

      const id1 = generateUniqueId();
      const id2 = generateUniqueId();

      expect(id1).not.toBe(id2);
    });

    it("should include timestamp in the ID", () => {
      const beforeTime = Date.now();
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 0;
        }
        return arr;
      });

      const id = generateUniqueId();
      const afterTime = Date.now();

      const timestampPart = id.split("-")[0];
      const timestamp = parseInt(timestampPart, 36);

      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should call crypto.getRandomValues with correct length", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 0;
        }
        return arr;
      });

      generateUniqueId();

      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
      const calledWith = mockCrypto.getRandomValues.mock.calls[0][0];
      expect(calledWith.length).toBe(12);
    });
  });

  describe("generateUniqueIdHex", () => {
    it("should generate a hex ID with default length", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = i % 256;
        }
        return arr;
      });

      const id = generateUniqueIdHex();

      // Should be hexadecimal string
      expect(id).toMatch(/^[a-f0-9]+$/);
      expect(id.length).toBeLessThanOrEqual(32); // default length (may be shorter due to slicing)
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate hex ID with custom length", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = i % 256;
        }
        return arr;
      });

      const id = generateUniqueIdHex(16);

      expect(id).toMatch(/^[a-f0-9]+$/);
      expect(id.length).toBe(16);
    });

    it("should generate different hex IDs on multiple calls", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      });

      const id1 = generateUniqueIdHex();
      const id2 = generateUniqueIdHex();

      expect(id1).not.toBe(id2);
    });

    it("should call crypto.getRandomValues with correct length for hex", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 0;
        }
        return arr;
      });

      generateUniqueIdHex();

      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));
      const calledWith = mockCrypto.getRandomValues.mock.calls[0][0];
      expect(calledWith.length).toBe(8);
    });

    it("should handle edge case of very short length", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 255; // Max byte value
        }
        return arr;
      });

      const id = generateUniqueIdHex(1);

      expect(id).toMatch(/^[a-f0-9]+$/);
      expect(id.length).toBe(1);
    });
  });

  describe("Security", () => {
    it("should use crypto.getRandomValues instead of Math.random", () => {
      const mathRandomSpy = vi.spyOn(Math, "random");
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 0;
        }
        return arr;
      });

      generateUniqueId();

      expect(mathRandomSpy).not.toHaveBeenCalled();
      expect(mockCrypto.getRandomValues).toHaveBeenCalled();
    });

    it("should provide sufficient entropy for security", () => {
      mockCrypto.getRandomValues.mockImplementation((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      });

      // Generate many IDs and check they're all unique
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId());
      }

      expect(ids.size).toBe(1000);
    });
  });
});
