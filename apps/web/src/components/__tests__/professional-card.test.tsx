import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfessionalCard } from "../professional-card";
import type { ProfessionalProfile } from "@/lib/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

// Mock the getImageUrl function
vi.mock("@/lib/storage", () => ({
  getImageUrl: vi.fn((url: string) => url),
}));

describe("ProfessionalCard", () => {
  const mockProfessional: ProfessionalProfile = {
    id: "1",
    full_name: "Dr. John Doe",
    email: "john.doe@example.com",
    phone_country_code: "+1",
    phone_number: "1234567890",
    bio: "Experienced therapist with 10+ years of experience",
    specialties: [
      { id: "1", name: "Anxiety" },
      { id: "2", name: "Depression" },
    ],
    modalities: [
      { id: "1", name: "Individual Therapy" },
      { id: "2", name: "Group Therapy" },
    ],
    therapeutic_approaches: [
      { id: "1", name: "CBT" },
      { id: "2", name: "DBT" },
    ],
    profile_picture: "https://example.com/profile.jpg",
    rating: 4.5,
    total_reviews: 10,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const defaultProps = {
    professional: mockProfessional,
    onViewProfile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render professional information", () => {
    render(<ProfessionalCard {...defaultProps} />);

    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Experienced therapist with 10+ years of experience"),
    ).toBeInTheDocument();
    expect(screen.getByText("Anxiety")).toBeInTheDocument();
    expect(screen.getByText("Depression")).toBeInTheDocument();
  });

  it("should render profile picture", () => {
    render(<ProfessionalCard {...defaultProps} />);

    const image = screen.getByAltText("Foto del profesional Dr. John Doe");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/profile.jpg");
  });

  it("should render rating and reviews", () => {
    render(<ProfessionalCard {...defaultProps} />);

    expect(screen.getByText("4.5 (10 reseñas)")).toBeInTheDocument();
  });

  it("should render specialties as badges", () => {
    render(<ProfessionalCard {...defaultProps} />);

    const specialtyBadges = screen.getAllByText(/Anxiety|Depression/);
    expect(specialtyBadges).toHaveLength(2);
  });

  it("should call onViewProfile when view profile button is clicked", () => {
    render(<ProfessionalCard {...defaultProps} />);

    const viewProfileButton = screen.getByRole("button", { name: /ver perfil/i });
    fireEvent.click(viewProfileButton);

    expect(defaultProps.onViewProfile).toHaveBeenCalledWith(mockProfessional.id);
  });

  it("should handle professional without profile picture", () => {
    const professionalWithoutPicture = {
      ...mockProfessional,
      profile_picture: null,
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithoutPicture} />);

    // Should still render the card with other information
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
  });

  it("should handle professional without bio", () => {
    const professionalWithoutBio = {
      ...mockProfessional,
      bio: null,
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithoutBio} />);

    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    // Bio should not be rendered
    expect(
      screen.queryByText("Experienced therapist with 10+ years of experience"),
    ).not.toBeInTheDocument();
  });

  it("should handle professional without specialties", () => {
    const professionalWithoutSpecialties = {
      ...mockProfessional,
      specialties: [],
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithoutSpecialties} />);

    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    // No specialty badges should be rendered
    expect(screen.queryByText("Anxiety")).not.toBeInTheDocument();
    expect(screen.queryByText("Depression")).not.toBeInTheDocument();
  });

  it("should handle professional without rating", () => {
    const professionalWithoutRating = {
      ...mockProfessional,
      rating: null,
      total_reviews: 0,
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithoutRating} />);

    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    // Rating should not be rendered
    expect(screen.queryByText("4.5")).not.toBeInTheDocument();
    expect(screen.queryByText("(10 reseñas)")).not.toBeInTheDocument();
  });

  it("should render with correct CSS classes", () => {
    render(<ProfessionalCard {...defaultProps} />);

    const card = screen.getByTestId("professional-card");
    expect(card).toHaveClass(
      "bg-card",
      "text-card-foreground",
      "rounded-xl",
      "border",
      "shadow-sm",
    );
  });

  it("should render view profile button with correct styling", () => {
    render(<ProfessionalCard {...defaultProps} />);

    const viewProfileButton = screen.getByRole("button", { name: /ver perfil/i });
    expect(viewProfileButton).toHaveClass("w-full");
  });

  it("should handle long bio text", () => {
    const professionalWithLongBio = {
      ...mockProfessional,
      bio: "This is a very long bio that should be truncated in the UI to prevent layout issues and maintain consistent card heights across the grid",
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithLongBio} />);

    expect(
      screen.getByText(
        "This is a very long bio that should be truncated in the UI to prevent layout issues and maintain consistent card heights across the grid",
      ),
    ).toBeInTheDocument();
  });

  it("should render multiple specialties correctly", () => {
    const professionalWithManySpecialties = {
      ...mockProfessional,
      specialties: [
        { id: "1", name: "Anxiety" },
        { id: "2", name: "Depression" },
        { id: "3", name: "PTSD" },
        { id: "4", name: "OCD" },
      ],
    };

    render(<ProfessionalCard {...defaultProps} professional={professionalWithManySpecialties} />);

    expect(screen.getByText("Anxiety")).toBeInTheDocument();
    expect(screen.getByText("Depression")).toBeInTheDocument();
    expect(screen.getByText("PTSD")).toBeInTheDocument();
    expect(screen.getByText("OCD")).toBeInTheDocument();
  });
});
