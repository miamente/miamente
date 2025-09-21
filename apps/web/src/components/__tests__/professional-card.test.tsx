import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfessionalCard } from "../professional-card";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} data-testid="professional-image" />
  ),
}));

// Mock StarRating component
vi.mock("@/components/star-rating", () => ({
  StarRating: ({
    rating,
    maxRating,
    interactive,
    size,
  }: {
    rating: number;
    maxRating: number;
    interactive: boolean;
    size: string;
  }) => (
    <div
      data-testid="star-rating"
      data-rating={rating}
      data-max-rating={maxRating}
      data-interactive={interactive}
      data-size={size}
    >
      ★★★★☆
    </div>
  ),
}));

describe("ProfessionalCard", () => {
  const mockProfessional = {
    id: "1",
    full_name: "Dr. Juan Pérez",
    bio: "Psicólogo clínico con 10 años de experiencia",
    profile_picture: "/images/profile.jpg",
    specialties: [
      { id: "1", name: "Terapia Cognitiva" },
      { id: "2", name: "Terapia Familiar" },
    ],
    rating: 4.5,
    total_reviews: 25,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with basic information", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    expect(screen.getByTestId("professional-card")).toBeInTheDocument();
    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Psicólogo clínico con 10 años de experiencia")).toBeInTheDocument();
  });

  it("should render profile picture when provided", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    const image = screen.getByTestId("professional-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("alt", "Foto del profesional Dr. Juan Pérez");
  });

  it("should render placeholder when no profile picture", () => {
    const professionalWithoutPicture = {
      ...mockProfessional,
      profile_picture: undefined,
    };

    render(<ProfessionalCard professional={professionalWithoutPicture} />);

    expect(screen.getByText("Sin foto")).toBeInTheDocument();
    expect(screen.queryByTestId("professional-image")).not.toBeInTheDocument();
  });

  it("should render specialties as badges", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    expect(screen.getByText("Terapia Cognitiva")).toBeInTheDocument();
    expect(screen.getByText("Terapia Familiar")).toBeInTheDocument();
  });

  it("should render rating and reviews when provided", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    expect(screen.getByTestId("star-rating")).toBeInTheDocument();
    expect(screen.getByText("4.5 (25 reseñas)")).toBeInTheDocument();
  });

  it("should not render rating section when not provided", () => {
    const professionalWithoutRating = {
      ...mockProfessional,
      rating: undefined,
      total_reviews: undefined,
    };

    render(<ProfessionalCard professional={professionalWithoutRating} />);

    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
    expect(screen.queryByText(/reseñas/)).not.toBeInTheDocument();
  });

  it("should render view profile button", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    const button = screen.getByText("Ver perfil");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Ver perfil de Dr. Juan Pérez");
  });

  it("should call onViewProfile when button is clicked", () => {
    const mockOnViewProfile = vi.fn();
    render(<ProfessionalCard professional={mockProfessional} onViewProfile={mockOnViewProfile} />);

    const button = screen.getByText("Ver perfil");
    fireEvent.click(button);

    expect(mockOnViewProfile).toHaveBeenCalledWith("1");
  });

  it("should not crash when onViewProfile is not provided", () => {
    render(<ProfessionalCard professional={mockProfessional} />);

    const button = screen.getByText("Ver perfil");
    fireEvent.click(button);

    // Should not throw an error
    expect(button).toBeInTheDocument();
  });

  it("should handle professional with minimal data", () => {
    const minimalProfessional = {
      id: "2",
      full_name: "Dr. María García",
    };

    render(<ProfessionalCard professional={minimalProfessional} />);

    expect(screen.getByText("Dr. María García")).toBeInTheDocument();
    expect(screen.getByText("Sin foto")).toBeInTheDocument();
    expect(screen.getByText("Ver perfil")).toBeInTheDocument();
    expect(screen.queryByText(/bio/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
  });

  it("should handle professional without specialties", () => {
    const professionalWithoutSpecialties = {
      ...mockProfessional,
      specialties: undefined,
    };

    render(<ProfessionalCard professional={professionalWithoutSpecialties} />);

    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Terapia Cognitiva")).not.toBeInTheDocument();
    expect(screen.queryByText("Terapia Familiar")).not.toBeInTheDocument();
  });

  it("should handle professional with empty specialties array", () => {
    const professionalWithEmptySpecialties = {
      ...mockProfessional,
      specialties: [],
    };

    render(<ProfessionalCard professional={professionalWithEmptySpecialties} />);

    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Terapia Cognitiva")).not.toBeInTheDocument();
  });

  it("should handle professional with many specialties", () => {
    const professionalWithManySpecialties = {
      ...mockProfessional,
      specialties: [
        { id: "1", name: "Terapia Cognitiva" },
        { id: "2", name: "Terapia Familiar" },
        { id: "3", name: "Terapia de Pareja" },
        { id: "4", name: "Terapia Individual" },
        { id: "5", name: "Terapia Grupal" },
      ],
    };

    render(<ProfessionalCard professional={professionalWithManySpecialties} />);

    expect(screen.getByText("Terapia Cognitiva")).toBeInTheDocument();
    expect(screen.getByText("Terapia Familiar")).toBeInTheDocument();
    expect(screen.getByText("Terapia de Pareja")).toBeInTheDocument();
    expect(screen.getByText("Terapia Individual")).toBeInTheDocument();
    expect(screen.getByText("Terapia Grupal")).toBeInTheDocument();
  });

  it("should handle professional with rating but no reviews", () => {
    const professionalWithRatingOnly = {
      ...mockProfessional,
      rating: 4.0,
      total_reviews: undefined,
    };

    render(<ProfessionalCard professional={professionalWithRatingOnly} />);

    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
    expect(screen.queryByText(/reseñas/)).not.toBeInTheDocument();
  });

  it("should handle professional with reviews but no rating", () => {
    const professionalWithReviewsOnly = {
      ...mockProfessional,
      rating: undefined,
      total_reviews: 10,
    };

    render(<ProfessionalCard professional={professionalWithReviewsOnly} />);

    expect(screen.queryByTestId("star-rating")).not.toBeInTheDocument();
    expect(screen.queryByText(/reseñas/)).not.toBeInTheDocument();
  });

  it("should construct correct image URL for relative paths", () => {
    // Mock environment variable
    const originalEnv = process.env;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";

    render(<ProfessionalCard professional={mockProfessional} />);

    const image = screen.getByTestId("professional-image");
    expect(image).toHaveAttribute("src", "http://localhost:8000/images/profile.jpg");

    // Restore original env
    process.env = originalEnv;
  });

  it("should handle absolute image URLs", () => {
    const professionalWithAbsoluteUrl = {
      ...mockProfessional,
      profile_picture: "https://example.com/image.jpg",
    };

    render(<ProfessionalCard professional={professionalWithAbsoluteUrl} />);

    const image = screen.getByTestId("professional-image");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });
});
