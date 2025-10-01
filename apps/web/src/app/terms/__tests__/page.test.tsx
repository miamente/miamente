import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TermsPage from "../page";

describe("TermsPage", () => {
  it("should render the terms and conditions page", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", {
        name: "Términos y Condiciones de Uso",
      }),
    ).toBeInTheDocument();
  });

  it("should display the last updated date", () => {
    render(<TermsPage />);
    expect(screen.getByText("Última actualización:")).toBeInTheDocument();
  });

  it("should display company information", () => {
    render(<TermsPage />);

    expect(screen.getByText(/Miamente S\.A\.S\./)).toBeInTheDocument();
    expect(screen.getByText("legal@miamente.com")).toBeInTheDocument();
    expect(screen.getByText("Bogotá, Colombia")).toBeInTheDocument();
    expect(screen.getByText(/900\.XXX\.XXX-X/)).toBeInTheDocument();
  });

  it("should display all main sections", () => {
    render(<TermsPage />);

    // Check main section headings
    expect(screen.getByRole("heading", { name: "1. Información General" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. Definiciones" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3. Servicios Ofrecidos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4. Registro y Cuentas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "5. Uso Aceptable" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "6. Tarifas y Pagos" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "7. Responsabilidades y Limitaciones" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "8. Propiedad Intelectual" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "9. Terminación" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "10. Modificaciones" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "11. Ley Aplicable y Jurisdicción" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "12. Contacto" })).toBeInTheDocument();
  });

  it("should display definitions section", () => {
    render(<TermsPage />);
    expect(screen.getByText(/"Plataforma"/)).toBeInTheDocument();
    expect(screen.getByText(/"Usuario"/)).toBeInTheDocument();
    expect(screen.getByText(/"Profesional"/)).toBeInTheDocument();
    expect(screen.getByText(/"Servicios"/)).toBeInTheDocument();
    expect(screen.getByText(/"Sesión"/)).toBeInTheDocument();
  });

  it("should display services offered", () => {
    render(<TermsPage />);
    expect(
      screen.getByText("Búsqueda y selección de profesionales certificados"),
    ).toBeInTheDocument();
    expect(screen.getByText("Reserva de citas virtuales")).toBeInTheDocument();
    expect(screen.getByText("Plataforma de videollamadas segura")).toBeInTheDocument();
    expect(screen.getByText("Sistema de pagos integrado")).toBeInTheDocument();
    expect(screen.getByText("Calificación y reseñas de profesionales")).toBeInTheDocument();
  });

  it("should display the important notice about clinical history", () => {
    render(<TermsPage />);
    expect(screen.getByText("⚠️ Importante - No es Historia Clínica")).toBeInTheDocument();
    expect(
      screen.getByText(/En esta versión MVP, Miamente NO almacena ni gestiona historias clínicas/),
    ).toBeInTheDocument();
  });

  it("should display user requirements", () => {
    render(<TermsPage />);
    expect(screen.getByText("4.1 Requisitos para Usuarios")).toBeInTheDocument();
    expect(
      screen.getByText("Ser mayor de 18 años o tener autorización de un tutor legal"),
    ).toBeInTheDocument();
    expect(screen.getByText("Proporcionar información veraz y actualizada")).toBeInTheDocument();
    expect(screen.getByText("Mantener la confidencialidad de su cuenta")).toBeInTheDocument();
  });

  it("should display professional requirements", () => {
    render(<TermsPage />);
    expect(screen.getByText("4.2 Requisitos para Profesionales")).toBeInTheDocument();
    expect(
      screen.getByText("Estar debidamente certificado y colegiado en Colombia"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Presentar documentación que acredite su formación profesional"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cumplir con los estándares éticos de su profesión"),
    ).toBeInTheDocument();
  });

  it("should display acceptable use policies", () => {
    render(<TermsPage />);
    expect(screen.getByText("5.1 Conductas Permitidas")).toBeInTheDocument();
    expect(screen.getByText("5.2 Conductas Prohibidas")).toBeInTheDocument();
    expect(
      screen.getByText("Utilizar la plataforma para fines legítimos de salud mental"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Usar la plataforma para actividades ilegales o no autorizadas"),
    ).toBeInTheDocument();
  });

  it("should display payment information", () => {
    render(<TermsPage />);
    expect(
      screen.getByText("Las tarifas de los servicios son establecidas por cada profesional"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Miamente cobra una comisión por facilitar la conexión"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Los pagos se procesan de forma segura a través de proveedores certificados",
      ),
    ).toBeInTheDocument();
  });

  it("should display responsibilities and limitations", () => {
    render(<TermsPage />);
    expect(screen.getByText("7.1 Responsabilidades de Miamente")).toBeInTheDocument();
    expect(screen.getByText("7.2 Limitaciones de Responsabilidad")).toBeInTheDocument();
    expect(screen.getByText("Proporcionar una plataforma segura y funcional")).toBeInTheDocument();
    expect(
      screen.getByText("Miamente no proporciona servicios de salud mental directamente"),
    ).toBeInTheDocument();
  });

  it("should display intellectual property information", () => {
    render(<TermsPage />);
    expect(
      screen.getByText(
        /Todos los contenidos, marcas, logos y software de Miamente están protegidos/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Copiar, modificar o distribuir el contenido sin autorización"),
    ).toBeInTheDocument();
    expect(screen.getByText("Usar nuestras marcas o logos sin permiso")).toBeInTheDocument();
  });

  it("should display contact information", () => {
    render(<TermsPage />);

    expect(screen.getByText("legal@miamente.com")).toBeInTheDocument();
    expect(screen.getByText("+57 (1) XXX-XXXX")).toBeInTheDocument();
    expect(screen.getByText("Bogotá, Colombia")).toBeInTheDocument();
  });

  it("should display the final acceptance notice", () => {
    render(<TermsPage />);
    expect(
      screen.getByText(
        /Al utilizar Miamente, usted confirma que ha leído, entendido y acepta estos Términos/,
      ),
    ).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    const { container } = render(<TermsPage />);

    // Check main container
    expect(container.firstChild).toHaveClass("container", "mx-auto", "max-w-4xl", "px-4", "py-8");

    // Check the info box for last updated date
    expect(screen.getByText("Última actualización:").closest("div")).toHaveClass(
      "mb-6",
      "rounded-lg",
      "border",
      "border-blue-200",
      "bg-blue-50",
      "p-4",
      "",
      "",
    );

    // Check the important notice box
    expect(screen.getByText("⚠️ Importante - No es Historia Clínica").closest("div")).toHaveClass(
      "mt-6",
      "rounded-lg",
      "border",
      "border-yellow-200",
      "bg-yellow-50",
      "p-4",
      "",
      "",
    );

    // Check the final acceptance notice box
    expect(
      screen.getByText(/Al utilizar Miamente, usted confirma que ha leído/).closest("div"),
    ).toHaveClass("mt-12", "rounded-lg", "bg-gray-50", "p-6", "");
  });
});
