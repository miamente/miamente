import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProfessionalCreateDialog } from "../ProfessionalCreateDialog";

describe("ProfessionalCreateDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Agregar Nuevo Profesional")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ProfessionalCreateDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText("Agregar Nuevo Profesional")).not.toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Fill only some fields
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });

    const form = screen.getByText("Crear Profesional").closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText("Por favor completa todos los campos obligatorios")).toBeInTheDocument();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("validates password length", async () => {
    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "juan@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "123" } });

    const submitButton = screen.getByText("Crear Profesional");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("La contraseña debe tener al menos 8 caracteres")).toBeInTheDocument();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "invalid-email" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "password123" } });

    const form = screen.getByText("Crear Profesional").closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText("Por favor ingresa un email válido")).toBeInTheDocument();
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    mockOnConfirm.mockResolvedValue(undefined);

    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "juan@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: "+56912345678" } });

    const submitButton = screen.getByText("Crear Profesional");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith({
        email: "juan@example.com",
        password: "password123",
        first_name: "Juan",
        last_name: "Pérez",
        phone: "+56912345678",
      });
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles submission errors", async () => {
    mockOnConfirm.mockRejectedValue(new Error("Email already exists"));

    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "juan@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "password123" } });

    const submitButton = screen.getByText("Crear Profesional");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText("Cancelar");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("disables form during submission", async () => {
    mockOnConfirm.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(
      <ProfessionalCreateDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: "Juan" } });
    fireEvent.change(screen.getByLabelText(/Apellido/), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "juan@example.com" } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: "password123" } });

    const submitButton = screen.getByText("Crear Profesional");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre/)).toBeDisabled();
      expect(screen.getByLabelText(/Apellido/)).toBeDisabled();
      expect(screen.getByLabelText(/Email/)).toBeDisabled();
      expect(screen.getByLabelText(/Contraseña/)).toBeDisabled();
    });
  });
});

