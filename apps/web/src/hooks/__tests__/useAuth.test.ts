import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "../useAuth";

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();
const mockRefresh = vi.fn();
const mockPrefetch = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    loginUser: vi.fn(),
    loginProfessional: vi.fn(),
    logout: vi.fn(),
    registerUser: vi.fn(),
    registerProfessional: vi.fn(),
    registerUnified: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct initial state", async () => {
    const { result } = renderHook(() => useAuth());

    // Should start with correct initial values
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.account).toBe(null);

    // Wait for the initial auth check to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 },
    );
  });

  it("should handle authentication failure when no token", async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 },
    );

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.account).toBe(null);
  });
});
