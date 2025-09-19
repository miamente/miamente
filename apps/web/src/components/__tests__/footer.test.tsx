import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Footer } from "../footer";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render footer with all sections", () => {
    render(<Footer />);

    // Check main footer structure
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // Check company info section
    expect(screen.getByText("Miamente")).toBeInTheDocument();
    expect(screen.getByText(/Conectamos usuarios con profesionales/)).toBeInTheDocument();

    // Check services section
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Buscar Profesionales")).toBeInTheDocument();
    expect(screen.getByText("Cómo Funciona")).toBeInTheDocument();
    expect(screen.getByText("Estado del Sistema")).toBeInTheDocument();

    // Check support section
    expect(screen.getByText("Soporte")).toBeInTheDocument();
    expect(screen.getByText("soporte@miamente.com")).toBeInTheDocument();
    expect(screen.getByText("+57 (1) 234-5678")).toBeInTheDocument();
    expect(screen.getByText("Lunes a Viernes, 8:00 AM - 6:00 PM")).toBeInTheDocument();

    // Check legal section
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Términos y Condiciones")).toBeInTheDocument();
    expect(screen.getByText("Política de Privacidad")).toBeInTheDocument();
    expect(screen.getByText("legal@miamente.com")).toBeInTheDocument();
  });

  it("should have correct links", () => {
    render(<Footer />);

    // Check service links
    const professionalsLink = screen.getByText("Buscar Profesionales");
    expect(professionalsLink).toHaveAttribute("href", "/professionals");

    const howItWorksLink = screen.getByText("Cómo Funciona");
    expect(howItWorksLink).toHaveAttribute("href", "/landing");

    const statusLink = screen.getByText("Estado del Sistema");
    expect(statusLink).toHaveAttribute("href", "/status");

    // Check legal links
    const termsLink = screen.getByText("Términos y Condiciones");
    expect(termsLink).toHaveAttribute("href", "/terms");

    const privacyLink = screen.getByText("Política de Privacidad");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("should have correct contact information", () => {
    render(<Footer />);

    // Check email links
    const supportEmail = screen.getByText("soporte@miamente.com");
    expect(supportEmail).toHaveAttribute("href", "mailto:soporte@miamente.com");

    const legalEmail = screen.getByText("legal@miamente.com");
    expect(legalEmail).toHaveAttribute("href", "mailto:legal@miamente.com");

    // Check phone link
    const phoneLink = screen.getByText("+57 (1) 234-5678");
    expect(phoneLink).toHaveAttribute("href", "tel:+57123456789");
  });

  it("should display current year in copyright", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Miamente S.A.S. Todos los derechos reservados.`),
    ).toBeInTheDocument();
  });

  it("should have proper CSS classes", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass(
      "border-t",
      "py-8",
      "text-sm",
      "text-neutral-600",
      "dark:text-neutral-400",
    );

    // Check grid layout
    const grid = screen.getByText("Miamente").closest("div")?.parentElement;
    expect(grid).toHaveClass("grid", "grid-cols-1", "gap-8", "md:grid-cols-4");
  });

  it("should have proper accessibility attributes", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Check headings
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(4); // Company, Services, Support, Legal
  });

  it("should have hover effects on links", () => {
    render(<Footer />);

    const professionalsLink = screen.getByText("Buscar Profesionales");
    expect(professionalsLink).toHaveClass("hover:text-blue-600", "dark:hover:text-blue-400");

    const supportEmail = screen.getByText("soporte@miamente.com");
    expect(supportEmail).toHaveClass("hover:text-blue-600", "dark:hover:text-blue-400");
  });

  it("should display compliance information", () => {
    render(<Footer />);

    expect(
      screen.getByText("Cumplimiento: Ley 1581 de 2012 - Protección de Datos Personales"),
    ).toBeInTheDocument();
  });

  it("should have responsive layout classes", () => {
    render(<Footer />);

    // Check bottom section responsive classes
    const bottomSection = screen.getByText(/© \d{4} Miamente S.A.S/).closest("div")?.parentElement;
    expect(bottomSection).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-between",
      "border-t",
      "pt-6",
      "md:flex-row",
    );

    // Check text alignment classes
    const copyrightText = screen.getByText(/© \d{4} Miamente S.A.S/).closest("div");
    expect(copyrightText).toHaveClass("text-center", "md:text-left");

    const complianceText = screen
      .getByText("Cumplimiento: Ley 1581 de 2012 - Protección de Datos Personales")
      .closest("div");
    expect(complianceText).toHaveClass("text-center", "md:text-right");
  });
});
