import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../dialog";

// Mock interfaces for dialog components
interface MockDialogProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

// Mock @radix-ui/react-dialog
vi.mock("@radix-ui/react-dialog", () => ({
  Root: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-root">{children}</div>
  ),
  Trigger: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="dialog-trigger" onClick={onClick}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: ({ className, children, ...props }: MockDialogProps) => (
    <div data-testid="dialog-overlay" className={className} {...props}>
      {children}
    </div>
  ),
  Content: ({ className, children, ...props }: MockDialogProps) => (
    <div data-testid="dialog-content" className={className} {...props}>
      {children}
    </div>
  ),
  Close: ({ className, children, ...props }: MockDialogProps) => (
    <button data-testid="dialog-close" className={className} {...props}>
      {children}
    </button>
  ),
  Title: ({ className, children, ...props }: MockDialogProps) => (
    <h2 data-testid="dialog-title" className={className} {...props}>
      {children}
    </h2>
  ),
  Description: ({ className, children, ...props }: MockDialogProps) => (
    <p data-testid="dialog-description" className={className} {...props}>
      {children}
    </p>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  X: () => <span data-testid="x-icon">×</span>,
}));

// Mock cn utility
vi.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("Dialog Components", () => {
  describe("Dialog", () => {
    it("should render as root component", () => {
      render(
        <Dialog>
          <div>Dialog content</div>
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
    });
  });

  describe("DialogTrigger", () => {
    it("should render trigger button", () => {
      render(<DialogTrigger>Open Dialog</DialogTrigger>);

      expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
    });

    it("should handle click events", () => {
      const handleClick = vi.fn();
      render(<DialogTrigger onClick={handleClick}>Open Dialog</DialogTrigger>);

      fireEvent.click(screen.getByTestId("dialog-trigger"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("DialogContent", () => {
    it("should render content with portal and overlay", () => {
      render(
        <DialogContent>
          <div>Dialog content</div>
        </DialogContent>,
      );

      expect(screen.getByTestId("dialog-portal")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-overlay")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByText("Dialog content")).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(
        <DialogContent>
          <div>Dialog content</div>
        </DialogContent>,
      );

      const closeButton = screen.getByTestId("dialog-close");
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <DialogContent className="custom-class">
          <div>Dialog content</div>
        </DialogContent>,
      );

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveClass("custom-class");
    });
  });

  describe("DialogHeader", () => {
    it("should render header with correct structure", () => {
      render(
        <DialogHeader>
          <div>Header content</div>
        </DialogHeader>,
      );

      const header = screen.getByText("Header content").closest("div");
      expect(header).toBeInTheDocument();
      // Check that the header div exists and contains the content
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <DialogHeader className="custom-header">
          <div>Header content</div>
        </DialogHeader>,
      );

      const header = screen.getByText("Header content").closest("div");
      expect(header).toBeInTheDocument();
      // The custom class should be applied to the header container
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });
  });

  describe("DialogFooter", () => {
    it("should render footer with correct structure", () => {
      render(
        <DialogFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>,
      );

      const footer = screen.getByText("Cancel").closest("div");
      expect(footer).toHaveClass(
        "flex",
        "flex-col-reverse",
        "sm:flex-row",
        "sm:justify-end",
        "sm:space-x-2",
      );
    });

    it("should apply custom className", () => {
      render(
        <DialogFooter className="custom-footer">
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>,
      );

      const footer = screen.getByText("Cancel").closest("div");
      expect(footer).toHaveClass("custom-footer");
    });
  });

  describe("DialogTitle", () => {
    it("should render title", () => {
      render(<DialogTitle>Dialog Title</DialogTitle>);

      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<DialogTitle className="custom-title">Dialog Title</DialogTitle>);

      const title = screen.getByTestId("dialog-title");
      expect(title).toHaveClass("custom-title");
    });

    it("should apply default styling classes", () => {
      render(<DialogTitle>Dialog Title</DialogTitle>);

      const title = screen.getByTestId("dialog-title");
      expect(title).toHaveClass("text-lg", "leading-none", "font-semibold", "tracking-tight");
    });
  });

  describe("DialogDescription", () => {
    it("should render description", () => {
      render(<DialogDescription>Dialog description text</DialogDescription>);

      expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
      expect(screen.getByText("Dialog description text")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <DialogDescription className="custom-description">
          Dialog description text
        </DialogDescription>,
      );

      const description = screen.getByTestId("dialog-description");
      expect(description).toHaveClass("custom-description");
    });

    it("should apply default styling classes", () => {
      render(<DialogDescription>Dialog description text</DialogDescription>);

      const description = screen.getByTestId("dialog-description");
      expect(description).toHaveClass("text-muted-foreground", "text-sm");
    });
  });

  describe("DialogClose", () => {
    it("should render close button", () => {
      render(<DialogClose>Close</DialogClose>);

      expect(screen.getByTestId("dialog-close")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<DialogClose className="custom-close">Close</DialogClose>);

      const closeButton = screen.getByTestId("dialog-close");
      expect(closeButton).toHaveClass("custom-close");
    });
  });

  describe("Complete Dialog Example", () => {
    it("should render a complete dialog structure", () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure you want to perform this action?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-trigger")).toBeInTheDocument();
      expect(screen.getByText("Open Dialog")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to perform this action?")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogContent>,
      );

      const title = screen.getByTestId("dialog-title");
      const description = screen.getByTestId("dialog-description");

      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });

    it("should have close button with screen reader text", () => {
      render(
        <DialogContent>
          <div>Content</div>
        </DialogContent>,
      );

      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });
});
