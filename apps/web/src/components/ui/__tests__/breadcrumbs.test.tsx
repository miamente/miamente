import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Breadcrumbs } from "../breadcrumbs";

// Mock Next.js Link
interface MockLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  [key: string]: unknown;
}

vi.mock("next/link", () => ({
  default: ({ children, href, className, ...props }: MockLinkProps) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ChevronRight: () => <span data-testid="chevron-right-icon">›</span>,
  Home: () => <span data-testid="home-icon">🏠</span>,
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Breadcrumbs Component", () => {
  describe("Basic Rendering", () => {
    it("should render breadcrumbs with home link", () => {
      render(<Breadcrumbs items={[]} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();
      expect(screen.getByText("Inicio")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /inicio/i })).toHaveAttribute("href", "/");
    });

    it("should render breadcrumb items with links", () => {
      const items = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Users", href: "/users" },
        { label: "Profile" },
      ];

      render(<Breadcrumbs items={items} />);

      // Check home link
      expect(screen.getByRole("link", { name: /inicio/i })).toBeInTheDocument();

      // Check breadcrumb items
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();

      // Check links
      const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
      const usersLink = screen.getByRole("link", { name: "Users" });

      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
      expect(usersLink).toHaveAttribute("href", "/users");

      // Check separators (chevron icons)
      const chevrons = screen.getAllByTestId("chevron-right-icon");
      expect(chevrons).toHaveLength(3); // One for each item
    });

    it("should render non-link items as spans", () => {
      const items = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Current Page" }, // No href
      ];

      render(<Breadcrumbs items={items} />);

      const currentPageElement = screen.getByText("Current Page");
      expect(currentPageElement.tagName).toBe("SPAN");
      expect(currentPageElement).toHaveClass("font-medium");
    });
  });

  describe("Styling", () => {
    it("should apply default classes", () => {
      render(<Breadcrumbs items={[]} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("flex", "items-center", "space-x-1", "text-sm", "text-gray-600", "");
    });

    it("should apply custom className", () => {
      render(<Breadcrumbs items={[]} className="custom-class" />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("custom-class");
    });

    it("should apply hover styles to links", () => {
      const items = [{ label: "Dashboard", href: "/dashboard" }];

      render(<Breadcrumbs items={items} />);

      const homeLink = screen.getByRole("link", { name: /inicio/i });
      const dashboardLink = screen.getByRole("link", { name: "Dashboard" });

      expect(homeLink).toHaveClass("hover:text-gray-900", "");
      expect(dashboardLink).toHaveClass("hover:text-gray-900", "");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Breadcrumbs items={[]} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    });

    it("should have screen reader text for home link", () => {
      render(<Breadcrumbs items={[]} />);

      const srText = screen.getByText("Inicio");
      expect(srText).toHaveClass("sr-only");
    });

    it("should have proper link structure", () => {
      const items = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Users", href: "/users" },
      ];

      render(<Breadcrumbs items={items} />);

      // All links should be accessible
      expect(screen.getByRole("link", { name: /inicio/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty items array", () => {
      render(<Breadcrumbs items={[]} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("home-icon")).toBeInTheDocument();

      // Should only have home link and no chevrons
      const chevrons = screen.queryAllByTestId("chevron-right-icon");
      expect(chevrons).toHaveLength(0);
    });

    it("should handle single item", () => {
      const items = [{ label: "Dashboard", href: "/dashboard" }];

      render(<Breadcrumbs items={items} />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");

      // Should have one chevron
      const chevrons = screen.getAllByTestId("chevron-right-icon");
      expect(chevrons).toHaveLength(1);
    });

    it("should handle items with only labels (no hrefs)", () => {
      const items = [{ label: "Dashboard" }, { label: "Current Page" }];

      render(<Breadcrumbs items={items} />);

      const dashboardElement = screen.getByText("Dashboard");
      const currentPageElement = screen.getByText("Current Page");

      expect(dashboardElement.tagName).toBe("SPAN");
      expect(currentPageElement.tagName).toBe("SPAN");
      expect(dashboardElement).toHaveClass("font-medium");
      expect(currentPageElement).toHaveClass("font-medium");
    });

    it("should handle mixed items (some with hrefs, some without)", () => {
      const items = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Section" }, // No href
        { label: "Page", href: "/page" },
        { label: "Current" }, // No href
      ];

      render(<Breadcrumbs items={items} />);

      // Check that links have proper hrefs
      expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
      expect(screen.getByRole("link", { name: "Page" })).toHaveAttribute("href", "/page");

      // Check that non-links are spans
      expect(screen.getByText("Section").tagName).toBe("SPAN");
      expect(screen.getByText("Current").tagName).toBe("SPAN");

      // Should have 4 chevrons (one for each item)
      const chevrons = screen.getAllByTestId("chevron-right-icon");
      expect(chevrons).toHaveLength(4);
    });
  });

  describe("Complex Scenarios", () => {
    it("should render a complete breadcrumb trail", () => {
      const items = [
        { label: "Admin", href: "/admin" },
        { label: "Users", href: "/admin/users" },
        { label: "Edit User", href: "/admin/users/edit" },
        { label: "John Doe" }, // Current page
      ];

      render(<Breadcrumbs items={items} />);

      // Check all items are rendered
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Edit User")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();

      // Check navigation structure
      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();

      // Check that current page is not a link
      const currentPage = screen.getByText("John Doe");
      expect(currentPage.tagName).toBe("SPAN");
      expect(currentPage).toHaveClass("font-medium");
    });
  });
});
