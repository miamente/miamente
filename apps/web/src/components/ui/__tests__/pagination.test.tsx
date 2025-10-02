import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "../pagination";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

describe("Pagination", () => {
  const defaultProps = {
    totalItems: 100,
    currentPage: 1,
    pageSize: 10,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render pagination with correct page info", () => {
    render(<Pagination {...defaultProps} />);

    expect(screen.getByText("Mostrando 1–10 de 100")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should render current page as active", () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const currentPageButton = screen.getByRole("button", { name: "3" });
    expect(currentPageButton).toHaveClass("bg-red-600", "text-white", "border-red-600");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
  });

  it("should disable previous button on first page", () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByLabelText("Página anterior");
    expect(prevButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(<Pagination {...defaultProps} currentPage={10} />);

    const nextButton = screen.getByLabelText("Página siguiente");
    expect(nextButton).toBeDisabled();
  });

  it("should enable navigation buttons on middle pages", () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    const prevButton = screen.getByLabelText("Página anterior");
    const nextButton = screen.getByLabelText("Página siguiente");
    
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("should call onPageChange when clicking page buttons", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange when clicking navigation buttons", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByLabelText("Página anterior"));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Página siguiente"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("should not call onPageChange when clicking current page", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should render ellipsis for large page counts", () => {
    render(<Pagination {...defaultProps} totalItems={1000} currentPage={5} />);

    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("should show correct page range for different pages", () => {
    const { rerender } = render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByText("Mostrando 1–10 de 100")).toBeInTheDocument();

    rerender(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByText("Mostrando 41–50 de 100")).toBeInTheDocument();

    rerender(<Pagination {...defaultProps} currentPage={10} />);
    expect(screen.getByText("Mostrando 91–100 de 100")).toBeInTheDocument();
  });

  it("should handle empty results", () => {
    render(<Pagination {...defaultProps} totalItems={0} />);

    expect(screen.getByText("Mostrando 0–0 de 0")).toBeInTheDocument();
  });

  it("should render page size selector when onPageSizeChange is provided", () => {
    const onPageSizeChange = vi.fn();
    render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);

    expect(screen.getByText("Elementos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });

  it("should call onPageSizeChange when page size changes", () => {
    const onPageSizeChange = vi.fn();
    render(<Pagination {...defaultProps} onPageSizeChange={onPageSizeChange} />);

    const select = screen.getByDisplayValue("10");
    fireEvent.change(select, { target: { value: "20" } });
    
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("should use custom page size options", () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination 
        {...defaultProps} 
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[5, 15, 25]}
      />
    );

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("should apply compact styling when compact prop is true", () => {
    const { container } = render(<Pagination {...defaultProps} compact={true} />);
    
    const paginationDiv = container.querySelector("div");
    expect(paginationDiv).toHaveClass("py-2");
  });

  it("should apply normal styling when compact prop is false", () => {
    const { container } = render(<Pagination {...defaultProps} compact={false} />);
    
    const paginationDiv = container.querySelector("div");
    expect(paginationDiv).toHaveClass("py-4");
  });

  it("should handle single page correctly", () => {
    render(<Pagination {...defaultProps} totalItems={5} pageSize={10} />);

    expect(screen.getByText("Mostrando 1–5 de 5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("should clamp page numbers to valid range", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);

    // Try to go to page 0 (should clamp to 1)
    fireEvent.click(screen.getByLabelText("Página anterior"));
    expect(onPageChange).not.toHaveBeenCalled();

    // Try to go to page beyond total (should clamp to max)
    rerender(<Pagination {...defaultProps} currentPage={10} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText("Página siguiente"));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("should render all page numbers for small page counts", () => {
    render(<Pagination {...defaultProps} totalItems={30} pageSize={10} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("…")).not.toBeInTheDocument();
  });
});
