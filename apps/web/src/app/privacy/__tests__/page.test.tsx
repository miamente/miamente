import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import PrivacyPage from "../page";

describe("PrivacyPage", () => {
  it("should render the privacy policy page", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("Política de Privacidad y Protección de Datos")).toBeInTheDocument();
  });

  it("should display the last updated date", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("Última actualización:")).toBeInTheDocument();
    expect(screen.getByText("Cumplimiento:")).toBeInTheDocument();
  });

  it("should display company information", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("Miamente S.A.S.")).toBeInTheDocument();
    expect(screen.getAllByText("privacidad@miamente.com")).toHaveLength(3);
    expect(screen.getAllByText("Bogotá, Colombia")).toHaveLength(2);
  });

  it("should display all main sections", () => {
    render(<PrivacyPage />);

    // Check main section headings
    expect(screen.getByText("1. Información del Responsable del Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("2. Finalidades del Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("3. Datos Personales que Recopilamos")).toBeInTheDocument();
    expect(screen.getByText("4. Base Legal del Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("5. Compartir Información con Terceros")).toBeInTheDocument();
    expect(screen.getByText("6. Transferencias Internacionales")).toBeInTheDocument();
    expect(screen.getByText("7. Seguridad de los Datos")).toBeInTheDocument();
    expect(screen.getByText("8. Retención de Datos")).toBeInTheDocument();
    expect(screen.getByText("9. Sus Derechos")).toBeInTheDocument();
    expect(screen.getByText("10. Menores de Edad")).toBeInTheDocument();
    expect(screen.getByText("11. Cookies y Tecnologías Similares")).toBeInTheDocument();
    expect(screen.getByText("12. Modificaciones a esta Política")).toBeInTheDocument();
    expect(screen.getByText("13. Autoridad de Control")).toBeInTheDocument();
    expect(screen.getByText("14. Contacto")).toBeInTheDocument();
  });

  it("should display data collection information", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("3.1 Datos de Usuarios")).toBeInTheDocument();
    expect(screen.getByText("3.2 Datos de Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Datos de identificación:")).toBeInTheDocument();
    expect(screen.getByText("Datos profesionales:")).toBeInTheDocument();
  });

  it("should display the sensitive data warning", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("⚠️ Datos Sensibles - Historia Clínica")).toBeInTheDocument();
    expect(screen.getByText("IMPORTANTE:")).toBeInTheDocument();
    expect(screen.getByText(/En esta versión MVP, Miamente NO recopila/)).toBeInTheDocument();
  });

  it("should display user rights information", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("9.1 Derechos Fundamentales")).toBeInTheDocument();
    expect(screen.getByText("Conocer:")).toBeInTheDocument();
    expect(screen.getByText("Actualizar:")).toBeInTheDocument();
    expect(screen.getByText("Rectificar:")).toBeInTheDocument();
    expect(screen.getByText("Revocar:")).toBeInTheDocument();
  });

  it("should display contact information", () => {
    render(<PrivacyPage />);

    expect(screen.getAllByText("privacidad@miamente.com")).toHaveLength(3);
    expect(screen.getAllByText("+57 (1) XXX-XXXX")).toHaveLength(3);
    expect(screen.getByText("Lunes a Viernes, 8:00 AM - 6:00 PM")).toBeInTheDocument();
  });

  it("should display SIC information", () => {
    render(<PrivacyPage />);

    expect(screen.getByText(/Superintendencia de Industria y Comercio/)).toBeInTheDocument();
    expect(screen.getByText("www.sic.gov.co")).toBeInTheDocument();
    expect(screen.getByText("(601) 587 0000")).toBeInTheDocument();
  });

  it("should display legal compliance information", () => {
    render(<PrivacyPage />);

    expect(screen.getAllByText(/Ley 1581 de 2012/)).toHaveLength(3);
    expect(screen.getAllByText(/Decreto 1377 de 2013/)).toHaveLength(3);
  });

  it("should have proper styling classes", () => {
    const { container } = render(<PrivacyPage />);

    // Check main container
    const mainContainer = container.querySelector(".container");
    expect(mainContainer).toHaveClass("mx-auto", "max-w-4xl", "px-4", "py-8");

    // Check prose styling
    const proseContainer = container.querySelector(".prose");
    expect(proseContainer).toHaveClass("prose-neutral", "dark:prose-invert", "max-w-none");
  });

  it("should display the final compliance notice", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByText(/Esta política de privacidad cumple con la Ley 1581 de 2012/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Al utilizar Miamente, usted acepta el tratamiento/),
    ).toBeInTheDocument();
  });
});
