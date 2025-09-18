import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "../card";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render with default props", () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
      expect(card).toHaveClass(
        "bg-card",
        "text-card-foreground",
        "flex",
        "flex-col",
        "gap-6",
        "rounded-xl",
        "border",
        "py-6",
        "shadow-sm",
      );
    });

    it("should accept custom className", () => {
      render(<Card className="custom-class">Card content</Card>);

      const card = screen.getByText("Card content");
      expect(card).toHaveClass("custom-class");
    });

    it("should pass through all div props", () => {
      render(
        <Card data-testid="test-card" role="article" aria-label="Test card">
          Card content
        </Card>,
      );

      const card = screen.getByTestId("test-card");
      expect(card).toHaveAttribute("role", "article");
      expect(card).toHaveAttribute("aria-label", "Test card");
    });
  });

  describe("CardHeader", () => {
    it("should render with default props", () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText("Header content");
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute("data-slot", "card-header");
      expect(header).toHaveClass(
        "@container/card-header",
        "grid",
        "auto-rows-min",
        "grid-rows-[auto_auto]",
        "items-start",
        "gap-1.5",
        "px-6",
      );
    });

    it("should accept custom className", () => {
      render(<CardHeader className="custom-header">Header content</CardHeader>);

      const header = screen.getByText("Header content");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("CardTitle", () => {
    it("should render with default props", () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByText("Card Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-slot", "card-title");
      expect(title).toHaveClass("leading-none", "font-semibold");
    });

    it("should accept custom className", () => {
      render(<CardTitle className="text-lg">Card Title</CardTitle>);

      const title = screen.getByText("Card Title");
      expect(title).toHaveClass("text-lg");
    });
  });

  describe("CardDescription", () => {
    it("should render with default props", () => {
      render(<CardDescription>Card description</CardDescription>);

      const description = screen.getByText("Card description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveAttribute("data-slot", "card-description");
      expect(description).toHaveClass("text-muted-foreground", "text-sm");
    });

    it("should accept custom className", () => {
      render(<CardDescription className="text-base">Card description</CardDescription>);

      const description = screen.getByText("Card description");
      expect(description).toHaveClass("text-base");
    });
  });

  describe("CardAction", () => {
    it("should render with default props", () => {
      render(<CardAction>Action button</CardAction>);

      const action = screen.getByText("Action button");
      expect(action).toBeInTheDocument();
      expect(action).toHaveAttribute("data-slot", "card-action");
      expect(action).toHaveClass(
        "col-start-2",
        "row-span-2",
        "row-start-1",
        "self-start",
        "justify-self-end",
      );
    });

    it("should accept custom className", () => {
      render(<CardAction className="custom-action">Action button</CardAction>);

      const action = screen.getByText("Action button");
      expect(action).toHaveClass("custom-action");
    });
  });

  describe("CardContent", () => {
    it("should render with default props", () => {
      render(<CardContent>Card content</CardContent>);

      const content = screen.getByText("Card content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-slot", "card-content");
      expect(content).toHaveClass("px-6");
    });

    it("should accept custom className", () => {
      render(<CardContent className="py-4">Card content</CardContent>);

      const content = screen.getByText("Card content");
      expect(content).toHaveClass("py-4");
    });
  });

  describe("CardFooter", () => {
    it("should render with default props", () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText("Footer content");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute("data-slot", "card-footer");
      expect(footer).toHaveClass("flex", "items-center", "px-6");
    });

    it("should accept custom className", () => {
      render(<CardFooter className="justify-between">Footer content</CardFooter>);

      const footer = screen.getByText("Footer content");
      expect(footer).toHaveClass("justify-between");
    });
  });

  describe("Complete Card Structure", () => {
    it("should render a complete card with all components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Main card content goes here")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("should handle nested content correctly", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Nested Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardContent>Nested card content</CardContent>
            </Card>
          </CardContent>
        </Card>,
      );

      expect(screen.getByText("Nested Card")).toBeInTheDocument();
      expect(screen.getByText("Nested card content")).toBeInTheDocument();
    });
  });
});
