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

    // Check action buttons in header
    expect(screen.getAllByText("Gestionar Usuarios")).toHaveLength(2); // One in header, one in quick actions
    expect(screen.getAllByText("Gestionar Profesionales")).toHaveLength(2); // One in header, one in quick actions

    // Check quick actions section
    expect(screen.getByText("Acciones Rápidas")).toBeInTheDocument();

    // Check all quick action buttons
    const quickActionButtons = screen.getAllByRole("link");
    expect(quickActionButtons).toHaveLength(6); // 2 in header + 4 in quick actions

    // Verify quick action links
    expect(screen.getAllByRole("link", { name: /Gestionar Usuarios/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Gestionar Profesionales/i })).toHaveLength(2);
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
