import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfessionalProfilePage from "../page";

// Mock Next.js components
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} data-testid="professional-image" />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock Next.js navigation hooks
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ id: "professional-1" })),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock the profile functions
const mockGetProfessionalProfile = vi.hoisted(() => vi.fn());
vi.mock("@/lib/profiles", () => ({
  getProfessionalProfile: mockGetProfessionalProfile,
}));

// Mock auth hooks
const mockUseAuth = {
  user: null as { id: string; email: string; role: string } | null,
  isLoading: false,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => mockUseAuth),
  getUserUid: vi.fn((user) => user?.id),
}));

// Mock specialty and therapy approach hooks
const mockUseSpecialtyNames = {
  getNames: vi.fn((ids) => ids.map((id: string) => `Specialty ${id}`)),
  loading: false,
};

const mockUseTherapyApproachNames = {
  getNames: vi.fn((ids) => ids.map((id: string) => `Approach ${id}`)),
  loading: false,
};

vi.mock("@/hooks/useSpecialtyNames", () => ({
  useSpecialtyNames: vi.fn(() => mockUseSpecialtyNames),
}));

vi.mock("@/hooks/useTherapyApproachNames", () => ({
  useTherapyApproachNames: vi.fn(() => mockUseTherapyApproachNames),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, asChild, ...props }: { children: React.ReactNode; onClick?: () => void; asChild?: boolean; [key: string]: unknown }) => {
    if (asChild) {
      return <div data-testid="button-as-child" {...props}>{children}</div>;
    }
    return (
      <button onClick={onClick} data-testid="button" {...props}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className}>
      Skeleton
    </div>
  ),
}));

vi.mock("@/components/ui/breadcrumbs", () => ({
  Breadcrumbs: ({ items, className }: { items: Array<{ label: string; href?: string }>; className?: string }) => (
    <nav data-testid="breadcrumbs" className={className}>
      {items.map((item: { label: string; href?: string }, index: number) => (
        <span key={index} data-testid={`breadcrumb-${index}`}>
          {item.label}
        </span>
      ))}
    </nav>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  DollarSign: () => <div data-testid="dollar-icon">DollarSign</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  GraduationCap: () => <div data-testid="graduation-icon">GraduationCap</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
}));

describe("ProfessionalProfilePage", () => {
  const mockProfessional = {
    id: "professional-1",
    full_name: "Dr. John Doe",
    bio: "Experienced therapist with 10 years of practice",
    profile_picture: "/images/profile.jpg",
    rate_cents: 50000,
    phone: "+1234567890",
    years_experience: 10,
    timezone: "UTC-5",
    is_verified: true,
    specialty_ids: ["specialty-1", "specialty-2"],
    therapy_approaches_ids: ["approach-1", "approach-2"],
    academic_experience: [
      {
        degree: "PhD in Psychology",
        institution: "University of Example",
        field: "Clinical Psychology",
        start_date: "2010",
        end_date: "2014",
        description: "Specialized in cognitive behavioral therapy",
      },
    ],
    certifications: [
      { name: "Licensed Clinical Psychologist" },
      { name: "Certified CBT Therapist" },
    ],
    languages: ["English", "Spanish"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfessionalProfile.mockResolvedValue(mockProfessional);
    mockUseAuth.user = null;
    mockUseAuth.isLoading = false;
  });

  it("should render loading state initially", () => {
    render(<ProfessionalProfilePage />);

    expect(screen.getAllByTestId("skeleton")).toHaveLength(13); // Multiple skeleton elements
  });

  it("should render professional profile when data is loaded", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText("Dr. John Doe")).toHaveLength(2); // Breadcrumb and main content
      expect(screen.getByText("Experienced therapist with 10 years of practice")).toBeInTheDocument();
    });
  });

  it("should display professional information correctly", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText("Dr. John Doe")).toHaveLength(2); // Breadcrumb and main content
      expect(screen.getByText("500 / hora")).toBeInTheDocument();
      expect(screen.getByText("+1234567890")).toBeInTheDocument();
      expect(screen.getByText("10 años de experiencia")).toBeInTheDocument();
      expect(screen.getByText("UTC-5")).toBeInTheDocument();
    });
  });

  it("should show verification badge for verified professionals", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Verificado")).toBeInTheDocument();
    });
  });

  it("should display specialties", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Specialty specialty-1")).toBeInTheDocument();
      expect(screen.getByText("Specialty specialty-2")).toBeInTheDocument();
    });
  });

  it("should display therapy approaches", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Approach approach-1")).toBeInTheDocument();
      expect(screen.getByText("Approach approach-2")).toBeInTheDocument();
    });
  });

  it("should display academic experience", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("PhD in Psychology")).toBeInTheDocument();
      expect(screen.getByText("University of Example - Clinical Psychology")).toBeInTheDocument();
      expect(screen.getByText("2010 - 2014")).toBeInTheDocument();
      expect(screen.getByText("Specialized in cognitive behavioral therapy")).toBeInTheDocument();
    });
  });

  it("should display certifications", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Licensed Clinical Psychologist")).toBeInTheDocument();
      expect(screen.getByText("Certified CBT Therapist")).toBeInTheDocument();
    });
  });

  it("should display languages", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("Spanish")).toBeInTheDocument();
    });
  });

  it("should show edit profile button for own profile", async () => {
    mockUseAuth.user = { id: "professional-1", email: "test@example.com", role: "professional" };
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    });
  });

  it("should not show edit profile button for other profiles", async () => {
    mockUseAuth.user = { id: "other-user", email: "other@example.com", role: "user" };
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument();
    });
  });

  it("should display action buttons", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Agendar Cita")).toBeInTheDocument();
      expect(screen.getByText("Contactar")).toBeInTheDocument();
    });
  });

  it.skip("should handle missing profile picture", async () => {
    const professionalWithoutPicture = {
      ...mockProfessional,
      profile_picture: undefined,
    };
    
    // Clear mocks and set the mock before rendering
    vi.clearAllMocks();
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutPicture);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });
  });

  it("should handle external image URLs", async () => {
    const professionalWithExternalImage = {
      ...mockProfessional,
      profile_picture: "https://example.com/image.jpg",
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithExternalImage);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      const image = screen.getByTestId("professional-image");
      expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    });
  });

  it("should handle error state", async () => {
    mockGetProfessionalProfile.mockRejectedValue(new Error("Professional not found"));

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByText("Profesional no encontrado")).toHaveLength(2);
      expect(screen.getByText("Professional not found")).toBeInTheDocument();
    });
  });

  it("should show breadcrumbs", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profesionales")).toBeInTheDocument();
      expect(screen.getAllByText("Dr. John Doe")).toHaveLength(2);
    });
  });

  it("should handle missing bio", async () => {
    const professionalWithoutBio = {
      ...mockProfessional,
      bio: undefined,
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutBio);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Sobre mí")).not.toBeInTheDocument();
    });
  });

  it("should handle missing academic experience", async () => {
    const professionalWithoutEducation = {
      ...mockProfessional,
      academic_experience: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutEducation);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Formación Académica")).not.toBeInTheDocument();
    });
  });

  it("should handle missing certifications", async () => {
    const professionalWithoutCertifications = {
      ...mockProfessional,
      certifications: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutCertifications);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Certificaciones")).not.toBeInTheDocument();
    });
  });

  it("should handle missing languages", async () => {
    const professionalWithoutLanguages = {
      ...mockProfessional,
      languages: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutLanguages);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Idiomas")).not.toBeInTheDocument();
    });
  });

  it("should handle missing therapy approaches", async () => {
    const professionalWithoutApproaches = {
      ...mockProfessional,
      therapy_approaches_ids: [],
    };
    mockGetProfessionalProfile.mockResolvedValue(professionalWithoutApproaches);

    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.queryByText("Enfoques Terapéuticos")).not.toBeInTheDocument();
    });
  });

  it("should format price correctly", async () => {
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("500 / hora")).toBeInTheDocument();
    });
  });

  it("should show specialty loading state", async () => {
    mockUseSpecialtyNames.loading = true;
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });
  });

  it("should show therapy approaches loading state", async () => {
    mockUseTherapyApproachNames.loading = true;
    render(<ProfessionalProfilePage />);

    await waitFor(() => {
      expect(screen.getAllByTestId("skeleton")).toHaveLength(3); // Loading skeletons for therapy approaches
    });
  });
});
