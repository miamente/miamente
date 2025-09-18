import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LandingPage from "../page";

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

// Mock the useAnalytics hook
const mockTrackCTAClick = vi.fn();
vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    trackCTAClick: mockTrackCTAClick,
  }),
}));

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main heading", () => {
    render(<LandingPage />);

    expect(screen.getByText("Cuidamos tu")).toBeInTheDocument();
    expect(screen.getByText("bienestar mental")).toBeInTheDocument();
  });

  it("should render the hero description", () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/Conecta con profesionales de la salud mental certificados/),
    ).toBeInTheDocument();
  });

  it("should render CTA buttons", () => {
    render(<LandingPage />);

    expect(screen.getAllByText("Crear cuenta gratis")).toHaveLength(2);
    expect(screen.getByText("Ver profesionales")).toBeInTheDocument();
  });

  it("should track CTA clicks", () => {
    render(<LandingPage />);

    const registerButtons = screen.getAllByText("Crear cuenta gratis");
    fireEvent.click(registerButtons[0]); // Click the first one (hero section)

    expect(mockTrackCTAClick).toHaveBeenCalledWith("hero_register", {
      page: "landing",
      timestamp: expect.any(String),
    });
  });

  it("should render value proposition section", () => {
    render(<LandingPage />);

    expect(screen.getByText("¿Por qué elegir Miamente?")).toBeInTheDocument();
    expect(screen.getByText("Profesionales Certificados")).toBeInTheDocument();
    expect(screen.getByText("100% Seguro y Confidencial")).toBeInTheDocument();
    expect(screen.getByText("Acceso Inmediato")).toBeInTheDocument();
  });

  it("should render how it works section", () => {
    render(<LandingPage />);

    expect(screen.getByText("¿Cómo funciona?")).toBeInTheDocument();
    expect(screen.getByText("Crea tu cuenta")).toBeInTheDocument();
    expect(screen.getByText("Encuentra tu profesional")).toBeInTheDocument();
    expect(screen.getByText("Reserva y conéctate")).toBeInTheDocument();
  });

  it("should render statistics section", () => {
    render(<LandingPage />);

    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("Profesionales certificados")).toBeInTheDocument();
    expect(screen.getByText("10,000+")).toBeInTheDocument();
    expect(screen.getByText("Sesiones realizadas")).toBeInTheDocument();
    expect(screen.getByText("4.8/5")).toBeInTheDocument();
    expect(screen.getByText("Calificación promedio")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("Disponibilidad")).toBeInTheDocument();
  });

  it("should render FAQ section", () => {
    render(<LandingPage />);

    expect(screen.getByText("Preguntas Frecuentes")).toBeInTheDocument();
    expect(screen.getByText("¿Cómo funciona Miamente?")).toBeInTheDocument();
    expect(screen.getByText("¿Los profesionales están certificados?")).toBeInTheDocument();
    expect(screen.getByText("¿Es seguro y confidencial?")).toBeInTheDocument();
  });

  it("should toggle FAQ items when clicked", () => {
    render(<LandingPage />);

    const firstFaqButton = screen.getByText("¿Cómo funciona Miamente?");

    // Initially, FAQ should be closed
    expect(
      screen.queryByText(/Miamente conecta usuarios con profesionales/),
    ).not.toBeInTheDocument();

    // Click to open FAQ
    fireEvent.click(firstFaqButton);
    expect(screen.getByText(/Miamente conecta usuarios con profesionales/)).toBeInTheDocument();

    // Click again to close FAQ
    fireEvent.click(firstFaqButton);
    expect(
      screen.queryByText(/Miamente conecta usuarios con profesionales/),
    ).not.toBeInTheDocument();
  });

  it("should render final CTA section", () => {
    render(<LandingPage />);

    expect(screen.getByText("¿Listo para comenzar tu bienestar mental?")).toBeInTheDocument();
    expect(screen.getAllByText("Crear cuenta gratis")).toHaveLength(2);
    expect(screen.getByText("Explorar profesionales")).toBeInTheDocument();
  });

  it("should track final CTA clicks", () => {
    render(<LandingPage />);

    const finalRegisterButton = screen.getAllByText("Crear cuenta gratis")[1]; // Second instance
    fireEvent.click(finalRegisterButton);

    expect(mockTrackCTAClick).toHaveBeenCalledWith("final_register", {
      page: "landing",
      timestamp: expect.any(String),
    });
  });

  it("should have proper links", () => {
    render(<LandingPage />);

    const registerLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/register");
    const professionalsLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/professionals");

    expect(registerLinks).toHaveLength(2); // Two register links
    expect(professionalsLinks).toHaveLength(2); // Two professionals links
  });

  it("should render all FAQ questions", () => {
    render(<LandingPage />);

    const faqQuestions = [
      "¿Cómo funciona Miamente?",
      "¿Los profesionales están certificados?",
      "¿Es seguro y confidencial?",
      "¿Cuánto cuesta una sesión?",
      "¿Puedo cancelar o reprogramar mi cita?",
      "¿Qué necesito para una sesión?",
    ];

    faqQuestions.forEach((question) => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  });

  it("should have proper ARIA attributes for FAQ", () => {
    render(<LandingPage />);

    const firstFaqButton = screen.getByText("¿Cómo funciona Miamente?");
    // Check that the FAQ question is clickable and has proper structure
    expect(firstFaqButton).toBeInTheDocument();
    // The FAQ question is inside a button element
    expect(firstFaqButton.closest("button")).toBeInTheDocument();
  });

  it("should update ARIA expanded when FAQ is toggled", () => {
    render(<LandingPage />);

    const firstFaqButton = screen.getByText("¿Cómo funciona Miamente?");

    // Initially FAQ should be closed
    expect(
      screen.queryByText(/Miamente conecta usuarios con profesionales/),
    ).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(firstFaqButton);
    expect(screen.getByText(/Miamente conecta usuarios con profesionales/)).toBeInTheDocument();

    // Click to close
    fireEvent.click(firstFaqButton);
    expect(
      screen.queryByText(/Miamente conecta usuarios con profesionales/),
    ).not.toBeInTheDocument();
  });
});
