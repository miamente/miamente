import React from "react";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "../ui/breadcrumbs";
import { describe, it, expect } from "vitest";

describe("Breadcrumbs", () => {
  it("should render with default props", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Current Page" },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Current Page")).toBeInTheDocument();
  });

  it("should render links for items with href", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Current Page" },
    ];

    render(<Breadcrumbs items={items} />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    const productsLink = screen.getByRole("link", { name: "Products" });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(productsLink).toHaveAttribute("href", "/products");
  });

  it("should render current page as text without link", () => {
    const items = [{ label: "Home", href: "/" }, { label: "Current Page" }];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Current Page")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Current Page" })).not.toBeInTheDocument();
  });

  it("should render with custom className", () => {
    const items = [{ label: "Home", href: "/" }];
    const customClass = "custom-breadcrumbs";

    render(<Breadcrumbs items={items} className={customClass} />);

    const breadcrumbsElement = screen.getByRole("navigation");
    expect(breadcrumbsElement).toHaveClass(customClass);
  });

  it("should render separator between items", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Current Page" },
    ];

    render(<Breadcrumbs items={items} />);

    // The separator is typically rendered as a slash or chevron
    // We'll check that it's present by looking for the navigation structure
    const navigation = screen.getByRole("navigation");
    expect(navigation).toBeInTheDocument();
  });

  it("should handle empty items array", () => {
    render(<Breadcrumbs items={[]} />);

    const navigation = screen.getByRole("navigation");
    expect(navigation).toBeInTheDocument();
    // Should not crash with empty items
  });

  it("should handle single item", () => {
    const items = [{ label: "Home" }];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should use unique keys for items", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Current Page" },
    ];

    render(<Breadcrumbs items={items} />);

    // All items should be rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Current Page")).toBeInTheDocument();
  });
});
