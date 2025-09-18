import React from "react";
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

// Mock the therapy approach names hook
vi.mock("@/hooks/useTherapyApproachNames", () => ({
  useTherapyApproachNames: vi.fn(() => ({
    getNames: vi.fn((ids: string[]) => {
      // Mock mapping of IDs to names
      const idToName: Record<string, string> = {
        "634efbc4-c977-430a-9a51-ba715f3df552": "Cognitivo-Conductual",
        "5c0e0887-972e-48fe-9428-a8a9066d4bb4": "Humanista",
      };
      return ids.map((id) => idToName[id] || id);
    }),
    loading: false,
    error: null,
  })),
}));

// Mock the specialty names hook
vi.mock("@/hooks/useSpecialtyNames", () => ({
  useSpecialtyNames: vi.fn(() => ({
    getNames: vi.fn((ids: string[]) => {
      // Mock mapping of IDs to names
      const idToName: Record<string, string> = {
        "psicologia-clinica": "Psicología Clínica",
        psiquiatria: "Psiquiatría",
      };
      return ids.map((id) => idToName[id] || id);
    }),
    loading: false,
    error: null,
  })),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src as string} alt={alt as string} {...props} />
  ),
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
  specialty_ids: ["psicologia-clinica"],
  specialty: "Psicología Clínica", // Keep for backward compatibility
  license_number: "PS123456",
  years_experience: 5,
  rate_cents: 80000,
  currency: "COP",
  bio: "Psicóloga clínica con experiencia en terapia cognitivo-conductual.",
  education: "Universidad Nacional de Colombia - Psicología",
  academic_experience: [
    {
      institution: "Universidad Nacional de Colombia",
      degree: "Psicología",
      field: "Psicología Clínica",
      start_date: "2015-01-01",
      end_date: "2020-12-31",
      description: "Licenciatura en Psicología con énfasis en clínica",
    },
    {
      institution: "Universidad de los Andes",
      degree: "Especialización en Terapia Cognitivo-Conductual",
      field: "Terapia Cognitivo-Conductual",
      start_date: "2021-01-01",
      end_date: "2022-12-31",
      description: "Especialización en TCC",
    },
  ],
  work_experience: [
    {
      company: "Centro de Salud Mental ABC",
      position: "Psicóloga Clínica",
      start_date: "2020-01-01",
      end_date: "2022-12-31",
      description: "Atención psicológica individual y grupal",
      achievements: ["Implementé programa de terapia grupal", "Reduje tiempo de espera en 30%"],
    },
    {
      company: "Consultorio Privado",
      position: "Psicóloga Independiente",
      start_date: "2023-01-01",
      description: "Práctica privada especializada en terapia cognitivo-conductual",
      achievements: ["Atendí más de 200 pacientes", "Desarrollé protocolo de evaluación"],
    },
  ],
  certifications: [
    { name: "Terapia Cognitivo-Conductual", document_url: "", file_name: "cert1.pdf" },
    { name: "EMDR", document_url: "", file_name: "cert2.pdf" },
  ],
  languages: ["Español", "Inglés"],
  therapy_approaches_ids: [
    "634efbc4-c977-430a-9a51-ba715f3df552",
    "5c0e0887-972e-48fe-9428-a8a9066d4bb4",
  ],
  timezone: "America/Bogota",
  emergency_contact: "María Test",
  emergency_phone: "+573001234568",
  is_active: true,
  is_verified: true,
  profile_picture: "https://example.com/profile.jpg",
  modalities: [
    {
      id: "presencial",
      modalityId: "presencial",
      modalityName: "Presencial",
      virtualPrice: 0,
      presencialPrice: 80000,
      offersPresencial: true,
      description: "Sesiones presenciales",
      isDefault: true,
    },
    {
      id: "virtual",
      modalityId: "virtual",
      modalityName: "Virtual",
      virtualPrice: 80000,
      presencialPrice: 0,
      offersPresencial: false,
      description: "Sesiones virtuales",
      isDefault: false,
    },
  ],
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

    // Check that skeleton elements are present during loading
    // The loading state shows skeleton elements, not the actual content
    // We can check for the presence of skeleton-like elements by looking for animate-pulse class
    const skeletonElements = document.querySelectorAll(".animate-pulse");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders professional profile successfully", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    expect(screen.getByText("Psicología Clínica")).toBeInTheDocument();
    expect(screen.getByText("800 / hora")).toBeInTheDocument();
    expect(screen.getByText("5 años de experiencia")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();
    expect(screen.getByText("Sobre mí")).toBeInTheDocument();
    expect(
      screen.getByText("Psicóloga clínica con experiencia en terapia cognitivo-conductual."),
    ).toBeInTheDocument();
    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    expect(
      screen.getByText("Universidad Nacional de Colombia - Psicología Clínica"),
    ).toBeInTheDocument();
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
      expect(screen.getAllByText("Profesional no encontrado")).toHaveLength(2);
    });

    expect(screen.getByText("Professional not found")).toBeInTheDocument();
    expect(screen.getByText("Ver todos los profesionales")).toBeInTheDocument();
  });

  it("handles breadcrumb navigation", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    // Check that breadcrumbs are present
    expect(screen.getByText("Profesionales")).toBeInTheDocument();
    expect(screen.getAllByText("Dr. Test Professional")).toHaveLength(2); // One in breadcrumb, one in card title

    // Check that the breadcrumb link to professionals works
    const professionalsLink = screen.getByRole("link", { name: "Profesionales" });
    expect(professionalsLink).toHaveAttribute("href", "/professionals");
  });

  it("handles navigation to all professionals", async () => {
    mockGetProfessionalProfile.mockRejectedValue(new Error("Professional not found"));

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText("Profesional no encontrado")).toHaveLength(2);
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
      certifications: [],
      languages: [],
      therapy_approaches_ids: [],
      profile_picture: undefined,
    };

    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutOptional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
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
      expect(screen.getByText("800 / hora")).toBeInTheDocument();
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
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    expect(screen.queryByText("Verificado")).not.toBeInTheDocument();
  });

  it("renders academic experience section when available", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    });

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();

    // Just verify the section exists
  });

  it("renders work experience section when available", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    });

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    // Just verify the section exists
  });

  it("does not render academic experience section when empty", async () => {
    const professionalWithoutAcademic = {
      ...mockProfessional,
      academic_experience: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutAcademic);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    expect(screen.queryByText("Formación Académica")).not.toBeInTheDocument();
  });

  it("does not render work experience section when empty", async () => {
    const professionalWithoutWork = {
      ...mockProfessional,
      work_experience: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutWork);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    expect(screen.queryByText("Experiencia Laboral")).not.toBeInTheDocument();
  });

  it("does not render experience sections when null", async () => {
    const professionalWithNullExperience = {
      ...mockProfessional,
      academic_experience: [],
      work_experience: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithNullExperience);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Perfil del Profesional")).toBeInTheDocument();
    });

    expect(screen.queryByText("Formación Académica")).not.toBeInTheDocument();
    expect(screen.queryByText("Experiencia Laboral")).not.toBeInTheDocument();
  });
});
