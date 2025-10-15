import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ProfessionalsPage from "./page";
import { queryProfessionals } from "@/lib/profiles";
import { vi } from "vitest";
import { ImgHTMLAttributes } from "react";

// Mock Next.js hooks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock the profiles API
vi.mock("@/lib/profiles", () => ({
  queryProfessionals: vi.fn(),
}));

// Mock the specialty names hook
vi.mock("@/hooks/useSpecialtyNames", () => ({
  useSpecialtyNames: vi.fn(() => ({
    getNames: (ids: string[]) => {
      const specialtyMap: Record<string, string> = {
        "psicologia-clinica": "Psicología Clínica",
        psiquiatria: "Psiquiatría",
      };
      return ids.map((id) => specialtyMap[id] || id);
    },
    loading: false,
    error: null,
  })),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockQueryProfessionals = vi.mocked(queryProfessionals);

const mockPush = vi.fn();

const mockProfessionals = [
  {
    account: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test1@example.com",
      full_name: "Dr. Test Professional 1",
      phone: "+573001234567",
      phone_country_code: "+57",
      phone_number: "3001234567",
      is_active: true,
      is_verified: true,
      role_id: "role-2",
      role_name: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      emergency_contact_name: "María Test",
      emergency_phone_country_code: "+57",
      emergency_phone_number: "3001234568",
    },
    role: "professional",
    profile: {
      account_id: "123e4567-e89b-12d3-a456-426614174000",
      license_number: "PS123456",
      years_experience: 5,
      rate_cents: 80000,
      currency: "COP",
      short_description: "Psicóloga clínica con experiencia en terapia cognitivo-conductual.",
      academic_experience: "[]",
      work_experience: "[]",
      certifications: "[]",
      languages: ["Español", "Inglés"],
      therapy_approaches_ids: ["cognitivo-conductual", "humanista"],
      specialty_ids: ["psicologia-clinica"],
      modalities: [],
      timezone: "America/Bogota",
      profile_picture: "https://example.com/profile1.jpg",
    },
  },
  {
    account: {
      id: "123e4567-e89b-12d3-a456-426614174001",
      email: "test2@example.com",
      full_name: "Dr. Test Professional 2",
      phone: "+573001234569",
      phone_country_code: "+57",
      phone_number: "3001234569",
      is_active: true,
      is_verified: false,
      role_id: "role-2",
      role_name: "professional",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      emergency_contact_name: "Juan Test",
      emergency_phone_country_code: "+57",
      emergency_phone_number: "3001234570",
    },
    role: "professional",
    profile: {
      account_id: "123e4567-e89b-12d3-a456-426614174001",
      license_number: "PS123457",
      years_experience: 8,
      rate_cents: 120000,
      currency: "COP",
      short_description: "Psiquiatra con especialización en trastornos del estado de ánimo.",
      academic_experience: "[]",
      work_experience: "[]",
      certifications: "[]",
      languages: ["Español"],
      therapy_approaches_ids: ["psicofarmacologia", "terapia-pareja"],
      specialty_ids: ["psiquiatria"],
      modalities: [],
      timezone: "America/Bogota",
      profile_picture: undefined,
    },
  },
];

describe("ProfessionalsPage", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      refresh: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
    mockQueryProfessionals.mockResolvedValue({
      professionals: mockProfessionals,
      lastSnapshot: null,
    });
    mockPush.mockClear();
  });

  it("renders professionals list with navigation links", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Dr. Test Professional 2")).toBeInTheDocument();

    // Check that professional cards are wrapped in links
    const professional1Link = screen.getByRole("link", { name: /Dr. Test Professional 1/i });
    const professional2Link = screen.getByRole("link", { name: /Dr. Test Professional 2/i });

    expect(professional1Link).toHaveAttribute(
      "href",
      "/professionals/123e4567-e89b-12d3-a456-426614174000",
    );
    expect(professional2Link).toHaveAttribute(
      "href",
      "/professionals/123e4567-e89b-12d3-a456-426614174001",
    );
  });

  it("navigates to professional profile when card is clicked", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 1")).toBeInTheDocument();
    });

    const professional1Link = screen.getByRole("link", { name: /Dr. Test Professional 1/i });
    fireEvent.click(professional1Link);

    // Note: In a real test environment, this would trigger navigation
    // Here we're just verifying the link has the correct href
    expect(professional1Link).toHaveAttribute(
      "href",
      "/professionals/123e4567-e89b-12d3-a456-426614174000",
    );
  });

  it("shows correct button text for profile navigation", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 1")).toBeInTheDocument();
    });

    // Check that buttons show "Ver perfil" instead of "Ver horarios"
    const profileButtons = screen.getAllByText("Ver perfil");
    expect(profileButtons).toHaveLength(2);

    // Check that old "Ver horarios" text is not present
    expect(screen.queryByText("Ver horarios")).not.toBeInTheDocument();
  });

  it("applies hover effects to professional cards", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 1")).toBeInTheDocument();
    });

    const professional1Link = screen.getByRole("link", { name: /Dr. Test Professional 1/i });
    const professional1Card = professional1Link.querySelector('[data-slot="card"]');

    // Check that the card has hover and cursor pointer classes
    expect(professional1Card).toHaveClass("hover:shadow-lg");
    expect(professional1Card).toHaveClass("transition-shadow");
    expect(professional1Card).toHaveClass("duration-200");
    expect(professional1Card).toHaveClass("cursor-pointer");
  });

  it("displays professional information correctly", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 1")).toBeInTheDocument();
    });

    // Check professional 1 details - use getAllByText to get both instances and check the one in the card
    const psicologiaElements = screen.getAllByText("Psicología Clínica");
    expect(psicologiaElements).toHaveLength(2); // One in select, one in card
    expect(psicologiaElements[1]).toBeInTheDocument(); // The one in the card
    expect(screen.getByText("800 / hora")).toBeInTheDocument();
    expect(
      screen.getByText("Psicóloga clínica con experiencia en terapia cognitivo-conductual."),
    ).toBeInTheDocument();

    // Check professional 2 details - use getAllByText to get both instances and check the one in the card
    const psiquiatriaElements = screen.getAllByText("Psiquiatría");
    expect(psiquiatriaElements).toHaveLength(2); // One in select, one in card
    expect(psiquiatriaElements[1]).toBeInTheDocument(); // The one in the card
    expect(screen.getByText("1.200 / hora")).toBeInTheDocument();
    expect(
      screen.getByText("Psiquiatra con especialización en trastornos del estado de ánimo."),
    ).toBeInTheDocument();
  });

  it("handles professionals without profile pictures", async () => {
    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. Test Professional 2")).toBeInTheDocument();
    });

    // Professional 2 doesn't have a profile picture
    expect(screen.getByText("Sin foto")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    mockQueryProfessionals.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProfessionalsPage />);

    expect(screen.getByText("Profesionales")).toBeInTheDocument();
    // Loading skeleton should be visible
    expect(screen.getByText("Especialidad")).toBeInTheDocument();
  });

  it("shows no results message when no professionals found", async () => {
    mockQueryProfessionals.mockResolvedValue({
      professionals: [],
      lastSnapshot: null,
    });

    render(<ProfessionalsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No encontramos profesionales con los filtros seleccionados."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Intenta ajustar los filtros.")).toBeInTheDocument();
  });
});
