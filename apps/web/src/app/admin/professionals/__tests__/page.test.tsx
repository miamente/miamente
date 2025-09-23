import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import AdminProfessionals from "../page";

describe("AdminProfessionals", () => {
  it("renders admin professionals page", () => {
    render(<AdminProfessionals />);

    expect(screen.getByText("Gestión de Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Administra los profesionales de la plataforma")).toBeInTheDocument();
    expect(screen.getByText("Lista de Profesionales")).toBeInTheDocument();
    expect(
      screen.getByText("Funcionalidad de gestión de profesionales en desarrollo"),
    ).toBeInTheDocument();
  });
});
