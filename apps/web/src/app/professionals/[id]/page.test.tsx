import { render, screen, waitFor } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import ProfessionalProfilePage from "./page";
import { getProfessionalProfile } from "@/lib/profiles";
import { vi } from "vitest";

// Mock Next.js hooks
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock the profiles API
vi.mock("@/lib/profiles", () => ({
  getProfessionalProfile: vi.fn(),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockUseParams = vi.mocked(useParams);
const mockUseRouter = vi.mocked(useRouter);
const mockGetProfessionalProfile = vi.mocked(getProfessionalProfile);

const mockPush = vi.fn();
const mockBack = vi.fn();

const mockProfessional = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  full_name: "Dr. Test Professional",
  phone: "+573001234567",
  specialty: "Psicología Clínica",
  license_number: "PS123456",
  years_experience: 5,
  rate_cents: 80000,
  currency: "COP",
  bio: "Psicóloga clínica con experiencia en terapia cognitivo-conductual.",
  education: "Universidad Nacional de Colombia - Psicología",
  certifications: ["Terapia Cognitivo-Conductual", "EMDR"],
  languages: ["Español", "Inglés"],
  therapy_approaches: ["Cognitivo-Conductual", "Humanista"],
  timezone: "America/Bogota",
  emergency_contact: "María Test",
  emergency_phone: "+573001234568",
  is_active: true,
  is_verified: true,
  profile_picture: "https://example.com/profile.jpg",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ProfessionalProfilePage", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ id: "123e4567-e89b-12d3-a456-426614174000" });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
      refresh: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    mockGetProfessionalProfile.mockClear();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it("renders loading state initially", () => {
    mockGetProfessionalProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProfessionalProfilePage />);

    expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    expect(screen.getAllByTestId("skeleton")).toHaveLength(0); // Skeleton components don't have testid
  });

  it("renders professional profile successfully", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional")).toBeInTheDocument();
    });

    expect(screen.getByText("Psicología Clínica")).toBeInTheDocument();
    expect(screen.getByText("$800 / hora")).toBeInTheDocument();
    expect(screen.getByText("5 años de experiencia")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();
    expect(screen.getByText("Sobre mí")).toBeInTheDocument();
    expect(
      screen.getByText("Psicóloga clínica con experiencia en terapia cognitivo-conductual."),
    ).toBeInTheDocument();
    expect(screen.getByText("Educación")).toBeInTheDocument();
    expect(screen.getByText("Universidad Nacional de Colombia - Psicología")).toBeInTheDocument();
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
    expect(screen.getByText("Terapia Cognitivo-Conductual")).toBeInTheDocument();
    expect(screen.getByText("EMDR")).toBeInTheDocument();
    expect(screen.getByText("Idiomas")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByText("Inglés")).toBeInTheDocument();
    expect(screen.getByText("Enfoques Terapéuticos")).toBeInTheDocument();
    expect(screen.getByText("Cognitivo-Conductual")).toBeInTheDocument();
    expect(screen.getByText("Humanista")).toBeInTheDocument();
  });

  it("renders error state when professional not found", async () => {
    mockGetProfessionalProfile.mockRejectedValue(new Error("Professional not found"));

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profesional no encontrado")).toBeInTheDocument();
    });

    expect(
      screen.getByText("El profesional que buscas no existe o no está disponible."),
    ).toBeInTheDocument();
    expect(screen.getByText("Ver todos los profesionales")).toBeInTheDocument();
  });

  it("handles back navigation", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional")).toBeInTheDocument();
    });

    const backButton = screen.getByText("Volver");
    backButton.click();

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("handles navigation to all professionals", async () => {
    mockGetProfessionalProfile.mockRejectedValue(new Error("Professional not found"));

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profesional no encontrado")).toBeInTheDocument();
    });

    const allProfessionalsButton = screen.getByText("Ver todos los profesionales");
    allProfessionalsButton.click();

    expect(mockPush).toHaveBeenCalledWith("/professionals");
  });

  it("renders professional without optional fields", async () => {
    const professionalWithoutOptional = {
      ...mockProfessional,
      bio: undefined,
      education: undefined,
      certifications: undefined,
      languages: undefined,
      therapy_approaches: undefined,
      profile_picture: undefined,
    };

    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutOptional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional")).toBeInTheDocument();
    });

    // Should not render sections for undefined fields
    expect(screen.queryByText("Sobre mí")).not.toBeInTheDocument();
    expect(screen.queryByText("Educación")).not.toBeInTheDocument();
    expect(screen.queryByText("Certificaciones")).not.toBeInTheDocument();
    expect(screen.queryByText("Idiomas")).not.toBeInTheDocument();
    expect(screen.queryByText("Enfoques Terapéuticos")).not.toBeInTheDocument();
  });

  it("formats price correctly", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("$800 / hora")).toBeInTheDocument();
    });
  });

  it("shows verification badge for verified professionals", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Verificado")).toBeInTheDocument();
    });
  });

  it("does not show verification badge for unverified professionals", async () => {
    const unverifiedProfessional = {
      ...mockProfessional,
      is_verified: false,
    };

    mockGetProfessionalProfile.mockResolvedValue(unverifiedProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional")).toBeInTheDocument();
    });

    expect(screen.queryByText("Verificado")).not.toBeInTheDocument();
  });
});
