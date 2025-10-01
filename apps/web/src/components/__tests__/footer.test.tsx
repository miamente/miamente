import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "../footer";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the footer element", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass("border-t", "py-8");
  });

  it("should render company information section", () => {
    render(<Footer />);

    expect(screen.getByText("Miamente")).toBeInTheDocument();
    expect(screen.getByText(/Conectamos usuarios con profesionales/)).toBeInTheDocument();
  });

  it("should render services section with links", () => {
    render(<Footer />);

    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Buscar Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Cómo Funciona")).toBeInTheDocument();
    expect(screen.getByText("Estado del Sistema")).toBeInTheDocument();

    // Check that links have correct hrefs
    const buscarProfesionalesLink = screen.getByText("Buscar Profesionales").closest("a");
    expect(buscarProfesionalesLink).toHaveAttribute("href", "/professionals");

    const comoFuncionaLink = screen.getByText("Cómo Funciona").closest("a");
    expect(comoFuncionaLink).toHaveAttribute("href", "/landing");

    const estadoSistemaLink = screen.getByText("Estado del Sistema").closest("a");
    expect(estadoSistemaLink).toHaveAttribute("href", "/status");
  });

  it("should render support section with contact information", () => {
    render(<Footer />);

    expect(screen.getByText("Soporte")).toBeInTheDocument();
    expect(screen.getByText("soporte@miamente.com")).toBeInTheDocument();
    expect(screen.getByText("+57 (1) 234-5678")).toBeInTheDocument();
    expect(screen.getByText("Lunes a Viernes, 8:00 AM - 6:00 PM")).toBeInTheDocument();

    // Check that email link has correct href
    const emailLink = screen.getByText("soporte@miamente.com").closest("a");
    expect(emailLink).toHaveAttribute("href", "mailto:soporte@miamente.com");

    // Check that phone link has correct href
    const phoneLink = screen.getByText("+57 (1) 234-5678").closest("a");
    expect(phoneLink).toHaveAttribute("href", "tel:+57123456789");
  });

  it("should render legal section with links", () => {
    render(<Footer />);

    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Términos y Condiciones")).toBeInTheDocument();
    expect(screen.getByText("Política de Privacidad")).toBeInTheDocument();
    expect(screen.getByText("legal@miamente.com")).toBeInTheDocument();

    // Check that links have correct hrefs
    const terminosLink = screen.getByText("Términos y Condiciones").closest("a");
    expect(terminosLink).toHaveAttribute("href", "/terms");

    const privacidadLink = screen.getByText("Política de Privacidad").closest("a");
    expect(privacidadLink).toHaveAttribute("href", "/privacy");

    const legalEmailLink = screen.getByText("legal@miamente.com").closest("a");
    expect(legalEmailLink).toHaveAttribute("href", "mailto:legal@miamente.com");
  });

  it("should render copyright information with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Miamente S.A.S. Todos los derechos reservados.`),
    ).toBeInTheDocument();
  });

  it("should render compliance information", () => {
    render(<Footer />);

    expect(screen.getByText(/Cumplimiento: Ley 1581 de 2012/)).toBeInTheDocument();
    expect(screen.getByText(/Protección de Datos Personales/)).toBeInTheDocument();
  });

  it("should have proper structure with sections", () => {
    render(<Footer />);

    // Check that all main headings are present
    expect(screen.getByText("Miamente")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Soporte")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    render(<Footer />);

    // Check that all expected links are present
    const links = screen.getAllByTestId("next-link");
    expect(links).toHaveLength(5); // 3 in Services + 2 in Legal

    const linkTexts = links.map((link) => link.textContent);
    expect(linkTexts).toContain("Buscar Profesionales");
    expect(linkTexts).toContain("Cómo Funciona");
    expect(linkTexts).toContain("Estado del Sistema");
    expect(linkTexts).toContain("Términos y Condiciones");
    expect(linkTexts).toContain("Política de Privacidad");
  });

  it("should render all email and phone links", () => {
    render(<Footer />);

    // Check email links
    const emailLinks = screen.getAllByRole("link", { name: /@miamente\.com/ });
    expect(emailLinks).toHaveLength(2);

    expect(emailLinks[0]).toHaveAttribute("href", "mailto:soporte@miamente.com");
    expect(emailLinks[1]).toHaveAttribute("href", "mailto:legal@miamente.com");

    // Check phone link
    const phoneLink = screen.getByRole("link", { name: "+57 (1) 234-5678" });
    expect(phoneLink).toHaveAttribute("href", "tel:+57123456789");
  });

  it("should have proper CSS classes for styling", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("border-t", "py-8", "text-sm", "text-neutral-600", "");

    // Check that headings have proper classes
    const headings = screen.getAllByRole("heading", { level: 3 });
    headings.forEach((heading) => {
      expect(heading).toHaveClass("mb-3", "font-semibold", "text-neutral-900", "");
    });
  });

  it("should render company description", () => {
    render(<Footer />);

    const description = screen.getByText(
      /Conectamos usuarios con profesionales de la salud mental para sesiones virtuales seguras y confidenciales./,
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm");
  });

  it("should render support hours", () => {
    render(<Footer />);

    const hours = screen.getByText("Lunes a Viernes, 8:00 AM - 6:00 PM");
    expect(hours).toBeInTheDocument();
    expect(hours).toHaveClass("text-xs");
  });

  it("should render compliance text with proper styling", () => {
    render(<Footer />);

    const complianceText = screen.getByText(
      /Cumplimiento: Ley 1581 de 2012 - Protección de Datos Personales/,
    );
    expect(complianceText).toBeInTheDocument();
    expect(complianceText).toHaveClass("text-xs");
  });
});
