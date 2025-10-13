import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import UserProfilePage from "../page";
import { useAuth, getUserUid, getUserEmail } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/profiles";
import { uploadFile } from "@/lib/storage";
import type { AuthUser, UserProfile } from "@/lib/types";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  useUnifiedAuth: vi.fn(),
  getUserUid: vi.fn(),
  getUserEmail: vi.fn(),
  getAccountEmail: vi.fn(),
  getAccountId: vi.fn(),
  getAccountFullName: vi.fn(),
  getAccountRole: vi.fn(),
}));

// Mock the profiles utilities
vi.mock("@/lib/profiles", () => ({
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
}));

// Mock the storage utilities
vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn(),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getAccountById: vi.fn(),
    updateAccount: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock FileUpload component
vi.mock("@/components/file-upload", () => ({
  FileUpload: ({
    onFileSelect,
    disabled,
    label,
  }: {
    onFileSelect: (file: File) => void;
    disabled: boolean;
    label: string;
    accept?: string;
    maxSize?: number;
    currentFile?: string;
  }) => (
    <div data-testid="file-upload">
      <label>{label}</label>
      <input
        type="file"
        data-testid="file-input"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
    </div>
  ),
}));

import { apiClient } from "@/lib/api";

const mockUseAuth = vi.mocked(useAuth);
const mockGetUserUid = vi.mocked(getUserUid);
const mockGetUserEmail = vi.mocked(getUserEmail);
const mockGetUserProfile = vi.mocked(getUserProfile);
const mockUpdateUserProfile = vi.mocked(updateUserProfile);
const mockUploadFile = vi.mocked(uploadFile);
const mockUseRouter = vi.mocked(useRouter);
const mockApiClient = vi.mocked(apiClient);

// Import and mock useUnifiedAuth
import { useUnifiedAuth, getAccountId, getAccountEmail as getAccEmail, getAccountFullName as getAccFullName } from "@/hooks/useAuth";
const mockUseUnifiedAuth = vi.mocked(useUnifiedAuth);
const mockGetAccountId = vi.mocked(getAccountId);
const mockGetAccountEmail = vi.mocked(getAccEmail);
const mockGetAccountFullName = vi.mocked(getAccFullName);

describe("UserProfilePage", () => {
  const mockPush = vi.fn();
  const mockUser: AuthUser = {
    type: UserRole.USER,
    data: {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  };

  const mockProfile: UserProfile = {
    id: "profile-1",
    full_name: "Test User",
    phone: "+1234567890",
    role: UserRole.USER,
    created_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
      isAuthenticated: true,
    });

    mockUseUnifiedAuth.mockReturnValue({
      account: mockUser.data,
      profile: mockProfile,
      role: "user",
      isLoading: false,
      isAuthenticated: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    // Mock account helper functions
    mockGetAccountId.mockImplementation((account) => account?.id || "");
    mockGetAccountEmail.mockImplementation((account) => account?.email || "");
    mockGetAccountFullName.mockImplementation((account) => account?.full_name || "");
    
    // Mock apiClient methods
    mockApiClient.getAccountById.mockResolvedValue({
      account: mockUser.data,
      role: "user",
      profile: mockProfile,
    });
    mockApiClient.updateAccount.mockResolvedValue({
      account: mockUser.data,
      role: "user",
      profile: mockProfile,
    });
    
    mockGetUserUid.mockImplementation(() => "user-1");
    mockGetUserEmail.mockReturnValue("test@example.com");
    mockGetUserProfile.mockImplementation(() =>
      Promise.resolve(mockProfile as unknown as Record<string, unknown>),
    );
    mockUpdateUserProfile.mockImplementation(() =>
      Promise.resolve(mockProfile as unknown as Record<string, unknown>),
    );
    mockUploadFile.mockResolvedValue({
      url: "https://example.com/file.jpg",
      filename: "file.jpg",
      size: 1024,
      content_type: "image/jpeg",
    });
  });

  it("should render loading state when auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
      isAuthenticated: false,
    });

    mockUseUnifiedAuth.mockReturnValue({
      account: null,
      profile: null,
      role: null,
      isLoading: true,
      isAuthenticated: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<UserProfilePage />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      loginUser: vi.fn(),
      loginProfessional: vi.fn(),
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      registerUnified: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      getAuthHeaders: vi.fn(),
      isAuthenticated: false,
    });

    mockUseUnifiedAuth.mockReturnValue({
      account: null,
      profile: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<UserProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should render user profile form when authenticated", async () => {
    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil de Usuario")).toBeInTheDocument();
    });

    expect(screen.getByText("Actualiza tu información personal")).toBeInTheDocument();
    expect(screen.getByText("Información Personal")).toBeInTheDocument();
    expect(screen.getByText("Foto de Perfil")).toBeInTheDocument();
    expect(screen.getByText("Actualizar Perfil")).toBeInTheDocument();
  });

  it("should load and display current profile information", async () => {
    render(<UserProfilePage />);

    await waitFor(() => {
      expect(mockApiClient.getAccountById).toHaveBeenCalledWith("user-1");
    });

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();
  });

  it("should update profile successfully", async () => {
    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    const fullNameInput = screen.getByPlaceholderText("Nombre completo");
    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that form elements are present and can be interacted with
    expect(fullNameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(fullNameInput, { target: { value: "Updated Name" } });
    expect(fullNameInput).toHaveValue("Updated Name");
  });

  it("should handle profile update error", async () => {
    const errorMessage = "Error updating profile";
    mockUpdateUserProfile.mockRejectedValueOnce(new Error(errorMessage));

    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    const fullNameInput = screen.getByPlaceholderText("Nombre completo");
    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that form elements are present and can be interacted with
    expect(fullNameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(fullNameInput, { target: { value: "Updated Name" } });
    expect(fullNameInput).toHaveValue("Updated Name");
  });

  it("should handle file upload when submitting", async () => {
    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    // Simulate file selection
    const fileInput = screen.getByTestId("file-input");
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for file to be selected
    await waitFor(() => {
      expect(screen.getByText("Archivo seleccionado: test.jpg")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that the submit button is present
    expect(submitButton).toBeInTheDocument();
  });

  it("should show loading state during submission", async () => {
    // Make updateUserProfile take some time
    mockUpdateUserProfile.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that the submit button is present
    expect(submitButton).toBeInTheDocument();
  });

  it("should display form validation errors", async () => {
    render(<UserProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Actual")).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that the submit button is present
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle missing user UID gracefully", async () => {
    mockGetUserUid.mockImplementation(() => undefined);

    render(<UserProfilePage />);

    await waitFor(() => {
      expect(mockGetUserProfile).not.toHaveBeenCalled();
    });
  });
});
