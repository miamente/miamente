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
  academic_experience: [
    {
      institution: "Universidad Nacional de Colombia",
      degree: "Psicología",
      field: "Psicología Clínica",
      startDate: "2015-01-01",
      endDate: "2020-12-31",
      description: "Licenciatura en Psicología con énfasis en clínica",
    },
    {
      institution: "Universidad de los Andes",
      degree: "Especialización en Terapia Cognitivo-Conductual",
      field: "Terapia Cognitivo-Conductual",
      startDate: "2021-01-01",
      endDate: "2022-12-31",
      description: "Especialización en TCC",
    },
  ],
  work_experience: [
    {
      company: "Centro de Salud Mental ABC",
      position: "Psicóloga Clínica",
      startDate: "2020-01-01",
      endDate: "2022-12-31",
      description: "Atención psicológica individual y grupal",
      achievements: ["Implementé programa de terapia grupal", "Reduje tiempo de espera en 30%"],
    },
    {
      company: "Consultorio Privado",
      position: "Psicóloga Independiente",
      startDate: "2023-01-01",
      description: "Práctica privada especializada en terapia cognitivo-conductual",
      achievements: ["Atendí más de 200 pacientes", "Desarrollé protocolo de evaluación"],
    },
  ],
  certifications: [
    { name: "Terapia Cognitivo-Conductual", documentUrl: "", fileName: "cert1.pdf" },
    { name: "EMDR", documentUrl: "", fileName: "cert2.pdf" },
  ],
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
    expect(screen.getByText("$ 800,00 / hora")).toBeInTheDocument();
    expect(screen.getByText("5 años de experiencia")).toBeInTheDocument();
    expect(screen.getByText("Verificado")).toBeInTheDocument();
    expect(screen.getByText("Sobre mí")).toBeInTheDocument();
    expect(
      screen.getByText("Psicóloga clínica con experiencia en terapia cognitivo-conductual."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Formación Académica")).toHaveLength(2);
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
      certifications: undefined,
      languages: undefined,
      therapy_approaches: undefined,
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
      expect(screen.getByText("$ 800,00 / hora")).toBeInTheDocument();
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
      expect(screen.getAllByText("Formación Académica")).toHaveLength(2);
    });

    expect(screen.getAllByText("Psicología")).toHaveLength(2);
    expect(screen.getByText("Universidad Nacional de Colombia")).toBeInTheDocument();
    expect(screen.getByText("2015-01-01 - 2020-12-31")).toBeInTheDocument();
    expect(screen.getAllByText("Licenciatura en Psicología con énfasis en clínica")).toHaveLength(
      2,
    );

    expect(screen.getAllByText("Especialización en Terapia Cognitivo-Conductual")).toHaveLength(2);
    expect(screen.getByText("Universidad de los Andes")).toBeInTheDocument();
    expect(screen.getByText("2021-01-01 - 2022-12-31")).toBeInTheDocument();
    expect(screen.getAllByText("Especialización en TCC")).toHaveLength(2);
  });

  it("renders work experience section when available", async () => {
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    });

    expect(screen.getByText("Psicóloga Clínica")).toBeInTheDocument();
    expect(screen.getByText("Centro de Salud Mental ABC")).toBeInTheDocument();
    expect(screen.getByText("Atención psicológica individual y grupal")).toBeInTheDocument();
    expect(screen.getAllByText("Logros destacados:")).toHaveLength(2);
    expect(screen.getByText("Implementé programa de terapia grupal")).toBeInTheDocument();
    expect(screen.getByText("Reduje tiempo de espera en 30%")).toBeInTheDocument();

    expect(screen.getByText("Psicóloga Independiente")).toBeInTheDocument();
    expect(screen.getByText("Consultorio Privado")).toBeInTheDocument();
    expect(
      screen.getByText("Práctica privada especializada en terapia cognitivo-conductual"),
    ).toBeInTheDocument();
    expect(screen.getByText("Atendí más de 200 pacientes")).toBeInTheDocument();
    expect(screen.getByText("Desarrollé protocolo de evaluación")).toBeInTheDocument();
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
      academic_experience: null,
      work_experience: null,
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
