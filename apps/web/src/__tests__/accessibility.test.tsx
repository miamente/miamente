import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect, vi } from "vitest";
import Link from "next/link";
import Image from "next/image";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js components
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Firebase
vi.mock("@/lib/firebase/client", () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Sample components for accessibility testing
const SampleButton = () => (
  <button type="button" aria-label="Sample button">
    Click me
  </button>
);

const SampleForm = () => (
  <form>
    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      name="email"
      aria-required="true"
      aria-describedby="email-help"
    />
    <div id="email-help">Please enter a valid email address</div>
    <button type="submit">Submit</button>
  </form>
);

const SampleNavigation = () => (
  <nav role="navigation" aria-label="Main navigation">
    <ul>
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/about">About</Link>
      </li>
      <li>
        <Link href="/contact">Contact</Link>
      </li>
    </ul>
  </nav>
);

describe("Accessibility Tests", () => {
  it("should not have accessibility violations on button component", async () => {
    const { container } = render(<SampleButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have accessibility violations on form component", async () => {
    const { container } = render(<SampleForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have accessibility violations on navigation component", async () => {
    const { container } = render(<SampleNavigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper ARIA attributes", async () => {
    const { container } = render(
      <div>
        <h1>Main Heading</h1>
        <main role="main">
          <section aria-labelledby="section-heading">
            <h2 id="section-heading">Section Title</h2>
            <p>Section content</p>
          </section>
        </main>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should handle interactive elements properly", async () => {
    const { container } = render(
      <div>
        <button type="button" aria-expanded="false" aria-controls="menu">
          Menu
        </button>
        <ul id="menu" role="menu" aria-hidden="true">
          <li role="menuitem">
            <a href="/item1">Item 1</a>
          </li>
          <li role="menuitem">
            <a href="/item2">Item 2</a>
          </li>
        </ul>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should handle images with alt text properly", async () => {
    const { container } = render(
      <div>
        <Image src="/test-image.jpg" alt="Test image description" width={100} height={100} />
        <Image src="/decorative-image.jpg" alt="" role="presentation" width={100} height={100} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
