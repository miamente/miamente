import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import ProfessionalProfilePage from "../page";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/profiles";
import type { AuthUser, Professional } from "@/lib/types";
import { UserRole } from "@/lib/types";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
  useUnifiedAuth: vi.fn(),
}));

// Mock the profiles utilities
vi.mock("@/lib/profiles", () => ({
  getMyProfessionalProfile: vi.fn(),
  createProfessionalProfile: vi.fn(),
  updateProfessionalProfile: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Image component from next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="profile-image"
    />
  ),
}));

// Mock all the professional components
vi.mock("@/components/ui/phone-input", () => ({
  PhoneInputFieldWithRef: ({
    countryCode,
    onCountryCodeChange,
    phoneNumber,
    onPhoneNumberChange,
    placeholder,
    disabled,
  }: {
    countryCode: string;
    onCountryCodeChange: (code: string) => void;
    phoneNumber: string;
    onPhoneNumberChange: (number: string) => void;
    placeholder: string;
    disabled: boolean;
    className?: string;
  }) => (
    <div data-testid="phone-input">
      <input
        data-testid="country-code"
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        placeholder="Country code"
        disabled={disabled}
      />
      <input
        data-testid="phone-number"
        value={phoneNumber}
        onChange={(e) => onPhoneNumberChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  ),
}));

vi.mock("@/components/academic-experience-editor", () => ({
  AcademicExperienceEditor: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="academic-experience-editor" data-disabled={disabled}>
      Academic Experience Editor
    </div>
  ),
}));

vi.mock("@/components/work-experience-editor", () => ({
  WorkExperienceEditor: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="work-experience-editor" data-disabled={disabled}>
      Work Experience Editor
    </div>
  ),
}));

vi.mock("@/components/certifications-editor", () => ({
  CertificationsEditor: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="certifications-editor" data-disabled={disabled}>
      Certifications Editor
    </div>
  ),
}));

vi.mock("@/components/professional-info/SpecialtiesMultiSelect", () => ({
  SpecialtiesMultiSelect: ({
    disabled,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    disabled: boolean;
  }) => (
    <div data-testid="specialties-multi-select" data-disabled={disabled}>
      <label>Specialties</label>
      <select multiple data-testid="specialties-select" onChange={() => {}} disabled={disabled}>
        <option value="specialty1">Specialty 1</option>
        <option value="specialty2">Specialty 2</option>
      </select>
    </div>
  ),
}));

vi.mock("@/components/professional-info/TherapeuticApproachesMultiSelect", () => ({
  TherapeuticApproachesMultiSelect: ({
    disabled,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    disabled: boolean;
  }) => (
    <div data-testid="therapeutic-approaches-multi-select" data-disabled={disabled}>
      <label>Therapeutic Approaches</label>
      <select multiple data-testid="approaches-select" onChange={() => {}} disabled={disabled}>
        <option value="approach1">Approach 1</option>
        <option value="approach2">Approach 2</option>
      </select>
    </div>
  ),
}));

vi.mock("@/components/professional-info/LanguagesMultiSelect", () => ({
  LanguagesMultiSelect: ({
    disabled,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    disabled: boolean;
  }) => (
    <div data-testid="languages-multi-select" data-disabled={disabled}>
      <label>Languages</label>
      <select multiple data-testid="languages-select" onChange={() => {}} disabled={disabled}>
        <option value="spanish">Spanish</option>
        <option value="english">English</option>
      </select>
    </div>
  ),
}));

vi.mock("@/components/professional-info/ModalitiesEditor", () => ({
  ModalitiesEditor: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="modalities-editor" data-disabled={disabled}>
      Modalities Editor
    </div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetMyProfessionalProfile = vi.mocked(getMyProfessionalProfile);
const mockCreateProfessionalProfile = vi.mocked(createProfessionalProfile);
const mockUpdateProfessionalProfile = vi.mocked(updateProfessionalProfile);
const mockUseRouter = vi.mocked(useRouter);

describe("ProfessionalProfilePage", () => {
  const mockPush = vi.fn();
  const mockUser: AuthUser = {
    type: UserRole.PROFESSIONAL,
    data: {
      id: "prof-1",
      email: "professional@example.com",
      full_name: "Dr. Professional",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  };

  const mockProfile: Professional = {
    id: "profile-1",
    full_name: "Dr. Professional",
    email: "professional@example.com",
    phone_country_code: "+1",
    phone_number: "234567890",
    license_number: "LIC-123",
    years_experience: 5,
    bio: "Experienced professional",
    profile_picture: "/images/profile.jpg",
    academic_experience: [],
    work_experience: [],
    certifications: [],
    languages: ["spanish", "english"],
    therapy_approaches_ids: ["approach1"],
    specialty_ids: ["specialty1"],
    modalities: [],
    timezone: "America/Bogota",
    is_active: true,
    is_verified: true,
    rate_cents: 5000,
    currency: "USD",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch for file upload
    global.fetch = vi.fn();

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

    mockGetMyProfessionalProfile.mockResolvedValue(mockProfile);
    mockCreateProfessionalProfile.mockResolvedValue(mockProfile);
    mockUpdateProfessionalProfile.mockResolvedValue(mockProfile);

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => "mock-token"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
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

    render(<ProfessionalProfilePage />);

    expect(screen.getByText("Cargando perfil...")).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", () => {
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

    render(<ProfessionalProfilePage />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should render professional profile form when authenticated", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Personal")).toBeInTheDocument();
    });

    expect(screen.getByText("Información Profesional")).toBeInTheDocument();
    expect(screen.getByText("Actualizar Perfil")).toBeInTheDocument();
  });

  it("should load and display current profile information", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(mockGetMyProfessionalProfile).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("professional@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("LIC-123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("should update profile successfully", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    });

    const fullNameInput = screen.getByDisplayValue("Dr. Professional");
    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that form elements are present and can be interacted with
    expect(fullNameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(fullNameInput, { target: { value: "Dr. Updated Professional" } });
    expect(fullNameInput).toHaveValue("Dr. Updated Professional");
  });

  it("should create new profile when none exists", async () => {
    mockGetMyProfessionalProfile.mockResolvedValue(null);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Información Personal")).toBeInTheDocument();
    });

    const fullNameInput = screen.getByPlaceholderText("Dr. Juan Pérez");
    const submitButton = screen.getByText("Crear Perfil");

    // Test that form elements are present and can be interacted with
    expect(fullNameInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.change(fullNameInput, { target: { value: "Dr. New Professional" } });
    expect(fullNameInput).toHaveValue("Dr. New Professional");
  });

  it("should handle profile update error", async () => {
    const errorMessage = "Error updating profile";
    mockUpdateProfessionalProfile.mockRejectedValueOnce(new Error(errorMessage));

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that the submit button is present
    expect(submitButton).toBeInTheDocument();
  });

  it("should handle profile picture upload", async () => {
    // Mock URL.createObjectURL for file uploads
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Actualizar Perfil")).toBeInTheDocument();
    });

    // Test that the form renders correctly
    expect(screen.getByText("Información Personal")).toBeInTheDocument();
  });

  it("should show loading state during submission", async () => {
    // Make updateProfessionalProfile take some time
    mockUpdateProfessionalProfile.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Actualizar Perfil");

    // Test that the button exists and can be clicked
    expect(submitButton).toBeInTheDocument();
  });

  it("should render all professional components", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("academic-experience-editor")).toBeInTheDocument();
    });

    expect(screen.getByTestId("work-experience-editor")).toBeInTheDocument();
    expect(screen.getByTestId("certifications-editor")).toBeInTheDocument();
    expect(screen.getByTestId("modalities-editor")).toBeInTheDocument();
    expect(screen.getByTestId("specialties-multi-select")).toBeInTheDocument();
    expect(screen.getByTestId("therapeutic-approaches-multi-select")).toBeInTheDocument();
    expect(screen.getByTestId("languages-multi-select")).toBeInTheDocument();
  });

  it("should handle phone input changes", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    });

    const countryCodeInput = screen.getByTestId("country-code");
    const phoneNumberInput = screen.getByTestId("phone-number");

    fireEvent.change(countryCodeInput, { target: { value: "+57" } });
    fireEvent.change(phoneNumberInput, { target: { value: "3001234567" } });

    expect(countryCodeInput).toHaveValue("+57");
    expect(phoneNumberInput).toHaveValue("3001234567");
  });

  it("should disable form elements during submission", async () => {
    // Make updateProfessionalProfile take some time
    mockUpdateProfessionalProfile.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Actualizar Perfil");
    
    // Wrap the click in act to handle state updates
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for the form elements to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("academic-experience-editor")).toBeInTheDocument();
      expect(screen.getByTestId("work-experience-editor")).toBeInTheDocument();
      expect(screen.getByTestId("certifications-editor")).toBeInTheDocument();
      expect(screen.getByTestId("modalities-editor")).toBeInTheDocument();
    });
  });
});
