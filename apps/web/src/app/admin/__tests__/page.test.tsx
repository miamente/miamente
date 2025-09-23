import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import AdminDashboard from "../page";

describe("AdminDashboard", () => {
  it("renders admin dashboard with header and quick actions", () => {
    render(<AdminDashboard />);

    // Check header
    expect(screen.getByText("Dashboard de Administración")).toBeInTheDocument();
    expect(screen.getByText("Panel de control para administrar la plataforma")).toBeInTheDocument();

    // Check action buttons in quick actions
    expect(screen.getByText("Gestionar Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Gestionar Profesionales")).toBeInTheDocument();

    // Check quick actions section
    expect(screen.getByText("Acciones Rápidas")).toBeInTheDocument();

    // Check all quick action buttons
    const quickActionButtons = screen.getAllByRole("link");
    expect(quickActionButtons).toHaveLength(4); // 4 in quick actions

    // Verify quick action links
    expect(screen.getByRole("link", { name: /Gestionar Usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gestionar Profesionales/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gestionar Especialidades/i })).toHaveAttribute(
      "href",
      "/admin/specialties",
    );
    expect(screen.getByRole("link", { name: /Gestionar Modalidades/i })).toHaveAttribute(
      "href",
      "/admin/modalities",
    );
  });

  it("renders without analytics and metrics components", () => {
    render(<AdminDashboard />);

    // Verify no analytics components are present
    expect(screen.queryByTestId("appointment-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("conversion-funnel")).not.toBeInTheDocument();

    // Verify no metric cards are present
    expect(screen.queryByText("Total Usuarios")).not.toBeInTheDocument();
    expect(screen.queryByText("Profesionales Verificados")).not.toBeInTheDocument();
    expect(screen.queryByText("Citas Hoy")).not.toBeInTheDocument();
  });
});
