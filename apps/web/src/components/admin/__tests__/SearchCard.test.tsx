import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SearchCard } from "../SearchCard";

describe("SearchCard", () => {
  const defaultProps = {
    title: "Buscar Test",
    placeholder: "Buscar...",
    searchTerm: "",
    onSearchTermChange: vi.fn(),
    onSearch: vi.fn(),
    onClearSearch: vi.fn(),
    showClearButton: true,
    loading: false,
    entityName: "test",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with title and placeholder", () => {
    render(<SearchCard {...defaultProps} />);
    
    expect(screen.getByText("Buscar Test")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });

  it("calls onSearch when search button is clicked", () => {
    render(<SearchCard {...defaultProps} />);
    
    const searchButton = screen.getByRole("button", { name: /buscar/i });
    fireEvent.click(searchButton);
    
    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1);
  });

  it("calls onSearch when Enter key is pressed", () => {
    render(<SearchCard {...defaultProps} />);
    
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.keyDown(input, { key: "Enter" });
    
    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1);
  });

  it("calls onSearchTermChange when input value changes", () => {
    render(<SearchCard {...defaultProps} />);
    
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.change(input, { target: { value: "test search" } });
    
    expect(defaultProps.onSearchTermChange).toHaveBeenCalledWith("test search");
  });

  it("shows clear button when searchTerm has value and showClearButton is true", () => {
    render(<SearchCard {...defaultProps} searchTerm="test" />);
    
    const clearButton = screen.getByRole("button", { name: "" });
    expect(clearButton).toBeInTheDocument();
  });

  it("does not show clear button when showClearButton is false", () => {
    render(<SearchCard {...defaultProps} searchTerm="test" showClearButton={false} />);
    
    const clearButtons = screen.queryAllByRole("button");
    expect(clearButtons).toHaveLength(1); // Only search button
  });

  it("calls onClearSearch when clear button is clicked", () => {
    render(<SearchCard {...defaultProps} searchTerm="test" />);
    
    const clearButton = screen.getByRole("button", { name: "" });
    fireEvent.click(clearButton);
    
    expect(defaultProps.onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("disables search button when loading", () => {
    render(<SearchCard {...defaultProps} loading={true} />);
    
    const searchButton = screen.getByRole("button", { name: /buscar/i });
    expect(searchButton).toBeDisabled();
  });

  it("displays search icon in input", () => {
    render(<SearchCard {...defaultProps} />);
    
    const searchIcon = screen.getByTestId("search-icon");
    expect(searchIcon).toBeInTheDocument();
  });
});
