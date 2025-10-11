import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import AdminProfessionals from "../page";

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionals: vi.fn(),
    toggleProfessionalStatus: vi.fn(),
    deleteProfessional: vi.fn(),
  },
}));

// Mock the timezone utility
vi.mock("@/lib/timezone", () => ({
  formatBogotaDate: vi.fn((date) => date.toISOString().split("T")[0]),
}));

describe("AdminProfessionals", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock successful API response
    const { apiClient } = await import("@/lib/api");
    (
      apiClient.getProfessionals as unknown as { mockResolvedValue: (value: unknown) => void }
    ).mockResolvedValue([
      {
        id: "1",
        email: "professional@example.com",
        full_name: "Test Professional",
        phone: "+1234567890",
        is_active: true,
        is_verified: true,
        license_number: "PSI-12345",
        years_experience: 5,
        specialty_ids: [],
        modality_ids: [],
        therapeutic_approach_ids: [],
        created_at: "2024-01-01T00:00:00Z",
        last_login: "2024-01-15T10:30:00Z",
      },
    ]);
  });

  it("renders admin professionals page", async () => {
    render(<AdminProfessionals />);

    await waitFor(() => {
      expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
    });

    // Description text changed in page: adjust expectation
    expect(screen.getByText("Administrar profesionales registrados en la plataforma")).toBeInTheDocument();
  });
});
