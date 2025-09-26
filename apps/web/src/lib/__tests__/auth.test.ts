import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the api module
vi.mock('../api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

import {
  registerWithEmail,
  loginWithEmail,
  logout,
  resendEmailVerification,
  getUserProfile,
  getStoredToken,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  type RegisterRequest,
} from '../auth';
import { UserRole } from '@/lib/types';
import { apiClient } from '../api';

// Mock interface for apiClient
interface MockApiClient {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  setToken: ReturnType<typeof vi.fn>;
  clearToken: ReturnType<typeof vi.fn>;
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
}

// Cast to mocked type
const mockApiClient = apiClient as unknown as MockApiClient;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation.href = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerWithEmail', () => {
    it('should register a user successfully', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '+1234567890',
        role: UserRole.USER,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '+1234567890',
        role: 'user',
        is_verified: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue(mockUser);

      const result = await registerWithEmail(registerData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register/user', registerData);
      expect(result).toEqual(mockUser);
    });

    it('should handle registration errors', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockError = new Error('Registration failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(registerWithEmail(registerData)).rejects.toThrow('Registration failed');
      expect(consoleSpy).toHaveBeenCalledWith('Registration error:', mockError);

      consoleSpy.mockRestore();
    });

    it('should register with minimal data', async () => {
      const registerData: RegisterRequest = {
        email: 'minimal@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-456',
        email: 'minimal@example.com',
        role: 'user',
        is_verified: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue(mockUser);

      const result = await registerWithEmail(registerData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register/user', registerData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginWithEmail', () => {
    it('should login successfully and store token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        access_token: 'jwt-token-123',
        token_type: 'bearer',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await loginWithEmail(email, password);

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email,
        password,
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'jwt-token-123');
      expect(mockApiClient.setToken).toHaveBeenCalledWith('jwt-token-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle login errors', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockError = new Error('Invalid credentials');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(loginWithEmail(email, password)).rejects.toThrow('Invalid credentials');
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', mockError);

      consoleSpy.mockRestore();
    });

    it('should not store token on login failure', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockError = new Error('Invalid credentials');

      mockApiClient.post.mockRejectedValue(mockError);

      try {
        await loginWithEmail(email, password);
      } catch {
        // Expected to throw
      }

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('access_token', expect.any(String));
      expect(mockApiClient.setToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear token and redirect to login', async () => {
      await logout();

      expect(mockApiClient.clearToken).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });

    it('should handle logout errors gracefully', async () => {
      mockApiClient.clearToken.mockRejectedValue(new Error('Clear token failed'));

      await logout();

      expect(mockApiClient.clearToken).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });
  });

  describe('resendEmailVerification', () => {
    it('should resend verification email successfully', async () => {
      mockApiClient.post.mockResolvedValue({});

      await resendEmailVerification();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/resend-verification');
    });

    it('should handle resend verification errors', async () => {
      const mockError = new Error('Resend failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.post.mockRejectedValue(mockError);

      await expect(resendEmailVerification()).rejects.toThrow('Resend failed');
      expect(consoleSpy).toHaveBeenCalledWith('Resend verification error:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({ data: mockUser });

      const result = await getUserProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should return null on error', async () => {
      const mockError = new Error('Profile fetch failed');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockApiClient.get.mockRejectedValue(mockError);

      const result = await getUserProfile();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Get user profile error:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('getStoredToken', () => {
    it('should return stored token', () => {
      const token = 'jwt-token-123';
      localStorageMock.getItem.mockReturnValue(token);

      const result = getStoredToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token');
      expect(result).toBe(token);
    });

    it('should return null when no token is stored', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getStoredToken();

      expect(result).toBeNull();
    });
  });

  describe('setAuthToken', () => {
    it('should set token in localStorage and API client', () => {
      const token = 'jwt-token-123';

      setAuthToken(token);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', token);
      expect(mockApiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });
  });

  describe('clearAuthToken', () => {
    it('should remove token from localStorage and API client', () => {
      clearAuthToken();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(mockApiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for invalid token format', () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false for expired token', () => {
      const expiredToken = createJWT({ exp: Math.floor(Date.now() / 1000) - 3600 }); // Expired 1 hour ago
      localStorageMock.getItem.mockReturnValue(expiredToken);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return true for valid non-expired token', () => {
      const validToken = createJWT({ exp: Math.floor(Date.now() / 1000) + 3600 }); // Valid for 1 hour
      localStorageMock.getItem.mockReturnValue(validToken);

      const result = isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false for malformed JWT', () => {
      localStorageMock.getItem.mockReturnValue('malformed.jwt.token');

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full login flow', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        access_token: 'jwt-token-123',
        token_type: 'bearer',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      // Login
      await loginWithEmail(email, password);

      // Verify token is stored
      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'jwt-token-123');

      // Set up localStorage mock for authentication check with valid JWT
      const validToken = createJWT({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorageMock.getItem.mockReturnValue(validToken);
      
      // Verify authentication status
      expect(isAuthenticated()).toBe(true);

      // Get user profile
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'user',
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      mockApiClient.get.mockResolvedValue({ data: mockUser });

      const profile = await getUserProfile();
      expect(profile).toEqual(mockUser);

      // Reset localStorage mock for logout
      localStorageMock.getItem.mockReturnValue(null);
      
      // Logout
      await logout();
      expect(mockApiClient.clearToken).toHaveBeenCalled();
      expect(isAuthenticated()).toBe(false);
    });
  });
});

// Helper function to create a JWT token for testing
function createJWT(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'test-signature';
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
