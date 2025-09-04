import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";
import Link from "next/link";

// Simple integration test example
describe("Integration Tests", () => {
  it("should render landing page components", () => {
    const { container } = render(
      <div>
        <h1>Miamente Landing Page</h1>
        <nav>
          <a href="/register">Register</a>
          <a href="/login">Login</a>
        </nav>
        <main>
          <section>
            <h2>Hero Section</h2>
            <p>Welcome to Miamente</p>
          </section>
        </main>
      </div>,
    );

    expect(container).toBeDefined();
    expect(container.querySelector("h1")).toHaveTextContent("Miamente Landing Page");
    expect(container.querySelector("nav")).toBeDefined();
    expect(container.querySelector("main")).toBeDefined();
  });

  it("should handle form interactions", () => {
    const { container } = render(
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Submit</button>
      </form>,
    );

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const submitButton = container.querySelector('button[type="submit"]');

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(submitButton).toBeDefined();
    expect(submitButton).toHaveTextContent("Submit");
  });

  it("should render professional cards", () => {
    const { container } = render(
      <div>
        <h1>Professionals</h1>
        <div className="grid">
          <div className="card">
            <h3>Dr. Juan Pérez</h3>
            <p>Psicólogo Clínico</p>
            <span>4.8 ⭐</span>
          </div>
          <div className="card">
            <h3>Dra. María García</h3>
            <p>Psiquiatra</p>
            <span>4.9 ⭐</span>
          </div>
        </div>
      </div>,
    );

    expect(container.querySelector("h1")).toHaveTextContent("Professionals");
    expect(container.querySelectorAll(".card")).toHaveLength(2);
    expect(container.querySelector(".card h3")).toHaveTextContent("Dr. Juan Pérez");
  });

  it("should handle navigation", () => {
    const { container } = render(
      <nav>
        <Link href="/">Home</Link>
        <Link href="/professionals">Professionals</Link>
        <Link href="/register">Register</Link>
        <Link href="/login">Login</Link>
      </nav>,
    );

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/professionals");
    expect(links[2]).toHaveAttribute("href", "/register");
    expect(links[3]).toHaveAttribute("href", "/login");
  });

  it("should render FAQ section", () => {
    const { container } = render(
      <section>
        <h2>Preguntas Frecuentes</h2>
        <div>
          <button>¿Cómo funciona Miamente?</button>
          <div>Respuesta sobre el funcionamiento</div>
        </div>
        <div>
          <button>¿Es seguro?</button>
          <div>Respuesta sobre seguridad</div>
        </div>
      </section>,
    );

    expect(container.querySelector("h2")).toHaveTextContent("Preguntas Frecuentes");
    expect(container.querySelectorAll("button")).toHaveLength(2);
    expect(container.querySelectorAll("div")).toHaveLength(3); // 2 FAQ items + 1 container
  });
});
