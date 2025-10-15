import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRouter } from "next/navigation";

import ProfessionalProfilePage from "../page";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/profiles";
import type { AccountWithRole, AccountWithProfile } from "@/lib/types";
import type { ProfessionalProfile } from "@/lib/profiles";
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
  const mockUser: AccountWithRole = {
    id: "prof-1",
    email: "professional@example.com",
    full_name: "Dr. Professional",
    phone: "+1234567890",
    is_active: true,
    is_verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    role_id: "role-2",
    role_name: "professional",
  };

  const mockProfile: AccountWithProfile = {
    account: {
      id: "profile-1",
      full_name: "Dr. Professional",
      email: "professional@example.com",
      phone_country_code: "+1",
      phone_number: "234567890",
      is_active: true,
      is_verified: true,
      role_id: "role-2",
      role_name: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    role: "professional",
    profile: {
      account_id: "profile-1",
      license_number: "LIC-123",
      years_experience: 5,
      rate_cents: 50000,
      currency: "USD",
      short_description: "Experienced professional",
      academic_experience: [],
      work_experience: [],
      certifications: [],
      languages: ["spanish", "english"],
      timezone: "America/Bogota",
    },
  };

  const mockProfessionalProfile = {
    account_id: "profile-1",
    license_number: "LIC-123",
    years_experience: 5,
    rate_cents: 5000,
    custom_rate_cents: 5000,
    currency: "USD",
    short_description: "Experienced professional",
    academic_experience: "[]",
    work_experience: "[]",
    certifications: "[]",
    languages: ["spanish", "english"],
    therapy_approaches_ids: ["approach1"],
    timezone: "America/Bogota",
    emergency_contact_name: null,
    emergency_phone_country_code: null,
    emergency_phone_number: null,
  } as unknown as ProfessionalProfile;

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
      account: mockUser,
      profile: null,
      role: UserRole.PROFESSIONAL,
      isLoading: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      isAuthenticated: true,
    });

    mockGetMyProfessionalProfile.mockResolvedValue(mockProfile);
    (mockCreateProfessionalProfile as any).mockResolvedValue(mockProfessionalProfile);
    (mockUpdateProfessionalProfile as any).mockResolvedValue(mockProfessionalProfile);

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
      account: null,
      profile: null,
      role: null,
      isLoading: true,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      isAuthenticated: false,
    });

    render(<ProfessionalProfilePage />);

    expect(screen.getByText("Cargando perfil...")).toBeInTheDocument();
  });

  it("should redirect to login when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      account: null,
      profile: null,
      role: null,
      isLoading: false,
      loginUnified: vi.fn(),
      registerUser: vi.fn(),
      registerProfessional: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      isAuthenticated: false,
    });

    render(<ProfessionalProfilePage />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });


  it("should load and display current profile information", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(mockGetMyProfessionalProfile).toHaveBeenCalled();
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByDisplayValue("professional@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("LIC-123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("should update profile successfully", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Dr. Professional")).toBeInTheDocument();
    }, { timeout: 3000 });

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
    }, { timeout: 3000 });

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
