import React from "react";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "../ui/breadcrumbs";
import { describe, it, expect } from "vitest";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronRight: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-right" className={className} />
  ),
  Home: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
}));

describe("Breadcrumbs", () => {
  it("should render with empty items", () => {
    render(<Breadcrumbs items={[]} />);

    expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("should render with single item", () => {
    const items = [{ label: "Dashboard" }];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getAllByTestId("chevron-right")).toHaveLength(1);
  });

  it("should render with multiple items", () => {
    const items = [{ label: "Dashboard" }, { label: "Professionals" }, { label: "Profile" }];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Professionals")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getAllByTestId("chevron-right")).toHaveLength(3);
  });

  it("should render items with href as links", () => {
    const items = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Professionals", href: "/professionals" },
      { label: "Profile" }, // No href, should be span
    ];
    render(<Breadcrumbs items={items} />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const professionalsLink = screen.getByRole("link", { name: "Professionals" });

    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(professionalsLink).toHaveAttribute("href", "/professionals");
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("should render items without href as spans", () => {
    const items = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Current Page" }, // No href
    ];
    render(<Breadcrumbs items={items} />);

    const currentPage = screen.getByText("Current Page");
    expect(currentPage.tagName).toBe("SPAN");
    expect(currentPage).toHaveClass("font-medium");
  });

  it("should render home link with correct href", () => {
    render(<Breadcrumbs items={[]} />);

    const homeLink = screen.getByRole("link");
    expect(homeLink).toHaveAttribute("href", "/");
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const customClass = "custom-breadcrumbs";
    render(<Breadcrumbs items={[]} className={customClass} />);

    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toHaveClass(customClass);
  });

  it("should have proper accessibility attributes", () => {
    render(<Breadcrumbs items={[]} />);

    const nav = screen.getByLabelText("Breadcrumb");
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toHaveClass("sr-only");
  });

  it("should render with mixed items (some with href, some without)", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category" },
      { label: "Subcategory" }, // No href
      { label: "Current", href: "/current" },
    ];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Category" })).toHaveAttribute("href", "/category");
    expect(screen.getByText("Subcategory").tagName).toBe("SPAN");
    expect(screen.getByRole("link", { name: "Current" })).toHaveAttribute("href", "/current");
  });

  it("should handle special characters in labels", () => {
    const items = [
      { label: "Dr. María García" },
      { label: "Terapia & Counseling" },
      { label: "Precio: $50,000" },
    ];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Dr. María García")).toBeInTheDocument();
    expect(screen.getByText("Terapia & Counseling")).toBeInTheDocument();
    expect(screen.getByText("Precio: $50,000")).toBeInTheDocument();
  });

  it("should render correct number of chevron separators", () => {
    const items = [
      { label: "Level 1" },
      { label: "Level 2" },
      { label: "Level 3" },
      { label: "Level 4" },
    ];
    render(<Breadcrumbs items={items} />);

    // Should have 4 chevrons for 4 items
    expect(screen.getAllByTestId("chevron-right")).toHaveLength(4);
  });

  it("should handle empty label gracefully", () => {
    const items = [{ label: "" }];
    render(<Breadcrumbs items={items} />);

    const chevron = screen.getByTestId("chevron-right");
    expect(chevron).toBeInTheDocument();
  });

  it("should maintain proper structure with nested navigation", () => {
    const items = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Professionals", href: "/professionals" },
      { label: "Dr. Juan Pérez", href: "/professionals/123" },
      { label: "Edit Profile" }, // Current page, no link
    ];
    render(<Breadcrumbs items={items} />);

    // Check that all items are rendered
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Professionals")).toBeInTheDocument();
    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();

    // Check that the last item is not a link
    const lastItem = screen.getByText("Edit Profile");
    expect(lastItem.tagName).toBe("SPAN");
    expect(lastItem).toHaveClass("font-medium");
  });

  it("should apply hover styles to links", () => {
    const items = [
      { label: "Link 1", href: "/link1" },
      { label: "Link 2", href: "/link2" },
      { label: "Current" },
    ];
    render(<Breadcrumbs items={items} />);

    const link1 = screen.getByRole("link", { name: "Link 1" });
    const link2 = screen.getByRole("link", { name: "Link 2" });
    const homeLink = screen.getByRole("link", { name: "Inicio" });

    expect(link1).toHaveClass("hover:text-gray-900");
    expect(link2).toHaveClass("hover:text-gray-900");
    expect(homeLink).toHaveClass("hover:text-gray-900");
  });
});
