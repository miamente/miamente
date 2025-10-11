import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SearchResultsInfo } from "../SearchResultsInfo";

describe("SearchResultsInfo", () => {
  const defaultProps = {
    appliedSearch: "test search",
    totalItems: 5,
    entityName: "profesional",
    entityNamePlural: "profesionales",
    showClearButton: true,
    onClearSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when appliedSearch is empty", () => {
    render(<SearchResultsInfo {...defaultProps} appliedSearch="" />);
    
    expect(screen.queryByText(/se encontraron/i)).not.toBeInTheDocument();
  });

  it("renders correct message for multiple items", () => {
    render(<SearchResultsInfo {...defaultProps} totalItems={5} />);
    
    expect(screen.getByText('Se encontraron 5 profesionales que coinciden con "test search"')).toBeInTheDocument();
  });

  it("renders correct message for single item", () => {
    render(<SearchResultsInfo {...defaultProps} totalItems={1} />);
    
    expect(screen.getByText('Se encontraron 1 profesional que coinciden con "test search"')).toBeInTheDocument();
  });

  it("renders no results message when totalItems is 0", () => {
    render(<SearchResultsInfo {...defaultProps} totalItems={0} />);
    
    expect(screen.getByText('No se encontraron profesionales que coincidan con "test search"')).toBeInTheDocument();
  });

  it("shows clear button when showClearButton is true", () => {
    render(<SearchResultsInfo {...defaultProps} />);
    
    const clearButton = screen.getByRole("button", { name: /limpiar/i });
    expect(clearButton).toBeInTheDocument();
  });

  it("does not show clear button when showClearButton is false", () => {
    render(<SearchResultsInfo {...defaultProps} showClearButton={false} />);
    
    expect(screen.queryByRole("button", { name: /limpiar/i })).not.toBeInTheDocument();
  });

  it("calls onClearSearch when clear button is clicked", () => {
    render(<SearchResultsInfo {...defaultProps} />);
    
    const clearButton = screen.getByRole("button", { name: /limpiar/i });
    fireEvent.click(clearButton);
    
    expect(defaultProps.onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("displays search icon", () => {
    render(<SearchResultsInfo {...defaultProps} />);
    
    const searchIcon = screen.getByTestId("search-icon");
    expect(searchIcon).toBeInTheDocument();
  });

  it("works with different entity names", () => {
    render(<SearchResultsInfo {...defaultProps} entityName="especialidad" entityNamePlural="especialidades" />);
    
    expect(screen.getByText('Se encontraron 5 especialidades que coinciden con "test search"')).toBeInTheDocument();
  });

  it("handles singular form correctly for single item", () => {
    render(<SearchResultsInfo {...defaultProps} totalItems={1} entityName="especialidad" entityNamePlural="especialidades" />);
    
    expect(screen.getByText('Se encontraron 1 especialidad que coinciden con "test search"')).toBeInTheDocument();
  });
});
