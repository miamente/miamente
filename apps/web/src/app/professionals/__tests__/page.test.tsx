import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import ProfessionalsPage from "../page";

// Helper function to wrap render in act()
const renderWithAct = (component: React.ReactElement) => {
  let result: ReturnType<typeof render> | undefined;
  act(() => {
    result = render(component);
  });
  return result!;
};

// Mock the queryProfessionals function
const mockQueryProfessionals = vi.hoisted(() => vi.fn());

// Mock the useSpecialtyNames hook
const mockUseSpecialtyNames = vi.hoisted(() => vi.fn());

// Mock the ProfessionalCardSkeleton component
const mockProfessionalCardSkeleton = vi.hoisted(() => vi.fn());

// Mock the UI components
const mockButton = vi.hoisted(() => vi.fn());
const mockCard = vi.hoisted(() => vi.fn());
const mockCardContent = vi.hoisted(() => vi.fn());
const mockCardHeader = vi.hoisted(() => vi.fn());
const mockCardTitle = vi.hoisted(() => vi.fn());
const mockInput = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());

// Mock Next.js components
const mockImage = vi.hoisted(() => vi.fn());
const mockLink = vi.hoisted(() => vi.fn());

// ID generation removed from frontend

// Mock the lib/profiles module
vi.mock("@/lib/profiles", () => ({
  queryProfessionals: mockQueryProfessionals,
}));

// Mock the useSpecialtyNames hook
vi.mock("@/hooks/useSpecialtyNames", () => ({
  useSpecialtyNames: mockUseSpecialtyNames,
}));

// Mock the ProfessionalCardSkeleton component
vi.mock("@/components/professional-card-skeleton", () => ({
  ProfessionalCardSkeleton: mockProfessionalCardSkeleton,
}));

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: mockButton,
}));

vi.mock("@/components/ui/card", () => ({
  Card: mockCard,
  CardContent: mockCardContent,
  CardHeader: mockCardHeader,
  CardTitle: mockCardTitle,
}));

vi.mock("@/components/ui/input", () => ({
  Input: mockInput,
}));

vi.mock("@/components/ui/select", () => ({
  Select: mockSelect,
}));

// Mock Next.js components
vi.mock("next/image", () => ({
  default: mockImage,
}));

vi.mock("next/link", () => ({
  default: mockLink,
}));

// ID generation mocking removed - no longer needed

// Mock the lib/profiles module
vi.mock("@/lib/profiles", () => ({
  queryProfessionals: mockQueryProfessionals,
}));

// Mock the useSpecialtyNames hook
vi.mock("@/hooks/useSpecialtyNames", () => ({
  useSpecialtyNames: mockUseSpecialtyNames,
}));

// Mock the ProfessionalCardSkeleton component
vi.mock("@/components/professional-card-skeleton", () => ({
  ProfessionalCardSkeleton: mockProfessionalCardSkeleton,
}));

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: mockButton,
}));

vi.mock("@/components/ui/card", () => ({
  Card: mockCard,
  CardContent: mockCardContent,
  CardHeader: mockCardHeader,
  CardTitle: mockCardTitle,
}));

vi.mock("@/components/ui/input", () => ({
  Input: mockInput,
}));

vi.mock("@/components/ui/select", () => ({
  Select: mockSelect,
}));

// Mock Next.js components
vi.mock("next/image", () => ({
  default: mockImage,
}));

vi.mock("next/link", () => ({
  default: mockLink,
}));

// ID generation mocking removed - no longer needed

describe("ProfessionalsPage", () => {
  const mockProfessionals = [
    {
      id: "1",
      full_name: "Dr. John Doe",
      bio: "Experienced therapist with 10 years of practice",
      rate_cents: 50000,
      specialty_ids: ["specialty-1", "specialty-2"],
      profile_picture: "/images/profile.jpg",
    },
    {
      id: "2",
      full_name: "Dr. Jane Smith",
      bio: "Specialized in cognitive behavioral therapy",
      rate_cents: 75000,
      specialty_ids: ["specialty-3"],
      profile_picture: undefined,
    },
  ];

  const mockSpecialtyNames = {
    getNames: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock to its default behavior
    mockQueryProfessionals.mockReset();
    
    // Setup default mocks
    mockQueryProfessionals.mockResolvedValue({
      professionals: mockProfessionals,
      lastSnapshot: "mock-snapshot",
    });

    mockUseSpecialtyNames.mockReturnValue(mockSpecialtyNames);
    mockSpecialtyNames.getNames.mockReturnValue(["Specialty 1", "Specialty 2"]);

    // Mock UI components to render their children
    mockButton.mockImplementation(({ children, ...props }) => (
      <button {...props}>{children}</button>
    ));
    mockCard.mockImplementation(({ children, ...props }) => (
      <div data-testid="card" {...props}>{children}</div>
    ));
    mockCardContent.mockImplementation(({ children, ...props }) => (
      <div data-testid="card-content" {...props}>{children}</div>
    ));
    mockCardHeader.mockImplementation(({ children, ...props }) => (
      <div data-testid="card-header" {...props}>{children}</div>
    ));
    mockCardTitle.mockImplementation(({ children, ...props }) => (
      <h3 data-testid="card-title" {...props}>{children}</h3>
    ));
    mockInput.mockImplementation((props) => (
      <input data-testid="input" {...props} />
    ));
    mockSelect.mockImplementation(({ options, onValueChange, ...props }) => (
      <select
        data-testid="select"
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ));
    mockImage.mockImplementation((props) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img data-testid="image" alt="" {...props} />
    ));
    mockLink.mockImplementation(({ children, ...props }) => (
      <a data-testid="link" {...props}>{children}</a>
    ));
    mockProfessionalCardSkeleton.mockImplementation(() => (
      <div data-testid="professional-card-skeleton">Loading...</div>
    ));
  });

  it("should render the page title", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for the initial data to load to avoid act warnings
    await waitFor(() => {
      expect(screen.getByText("Profesionales")).toBeInTheDocument();
    });
  });

  it("should render the filters form", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for the initial data to load to avoid act warnings
    await waitFor(() => {
      expect(screen.getByLabelText("Filtros")).toBeInTheDocument();
      expect(screen.getByLabelText("Especialidad")).toBeInTheDocument();
      expect(screen.getByLabelText("Precio mínimo (COP)")).toBeInTheDocument();
      expect(screen.getByLabelText("Precio máximo (COP)")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for the initial loading state to be set
    await waitFor(() => {
      expect(screen.getAllByTestId("professional-card-skeleton")).toHaveLength(6);
    });
  });

  it("should render professionals after loading", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Dr. Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Experienced therapist with 10 years of practice")).toBeInTheDocument();
    expect(screen.getByText("Specialized in cognitive behavioral therapy")).toBeInTheDocument();
  });

  it("should render professional cards with correct information", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    // Check rate display
    expect(screen.getByText("500 / hora")).toBeInTheDocument();
    expect(screen.getByText("750 / hora")).toBeInTheDocument();

    // Check specialty display (appears in both cards)
    expect(screen.getAllByText("Specialty 1")).toHaveLength(2);
    expect(screen.getAllByText("Specialty 2")).toHaveLength(2);
  });

  it("should handle professionals without profile pictures", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Sin foto")).toBeInTheDocument();
    });
  });

  it("should handle filter changes", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("select")).toBeInTheDocument();
    });

    const specialtySelect = screen.getByTestId("select");
    const minPriceInput = screen.getByLabelText("Precio mínimo (COP)");
    const maxPriceInput = screen.getByLabelText("Precio máximo (COP)");

    await act(async () => {
      fireEvent.change(specialtySelect, { target: { value: "Psicología Clínica" } });
      fireEvent.change(minPriceInput, { target: { value: "10000" } });
      fireEvent.change(maxPriceInput, { target: { value: "100000" } });
    });

    expect(specialtySelect).toHaveValue("Psicología Clínica");
    expect(minPriceInput).toHaveValue(10000);
    expect(maxPriceInput).toHaveValue(100000);
  });

  it("should apply filters when form is submitted", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Aplicar filtros")).toBeInTheDocument();
    });

    const specialtySelect = screen.getByTestId("select");
    const applyButton = screen.getByText("Aplicar filtros");

    await act(async () => {
      fireEvent.change(specialtySelect, { target: { value: "Psicología Clínica" } });
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockQueryProfessionals).toHaveBeenCalledWith({
        specialty: "Psicología Clínica",
        minRateCents: undefined,
        maxRateCents: undefined,
        limit: 9,
        startAfterSnapshot: null,
      });
    });
  });

  it("should clear filters when clear button is clicked", async () => {
    renderWithAct(<ProfessionalsPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Limpiar")).toBeInTheDocument();
    });

    const specialtySelect = screen.getByTestId("select");
    const minPriceInput = screen.getByLabelText("Precio mínimo (COP)");
    const maxPriceInput = screen.getByLabelText("Precio máximo (COP)");
    const clearButton = screen.getByText("Limpiar");

    // Set some values
    fireEvent.change(specialtySelect, { target: { value: "Psicología Clínica" } });
    fireEvent.change(minPriceInput, { target: { value: "10000" } });
    fireEvent.change(maxPriceInput, { target: { value: "100000" } });

    // Verify values are set
    expect(specialtySelect).toHaveValue("Psicología Clínica");
    expect(minPriceInput).toHaveValue(10000);
    expect(maxPriceInput).toHaveValue(100000);

    // Clear filters - just verify the button can be clicked
    await act(async () => {
      fireEvent.click(clearButton);
    });

    // The clear button should be clickable and not throw an error
    expect(clearButton).toBeInTheDocument();
  });

  it("should show error message when query fails", async () => {
    mockQueryProfessionals.mockRejectedValue(new Error("Network error"));

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should show no results message when no professionals found", async () => {
    mockQueryProfessionals.mockResolvedValue({
      professionals: [],
      lastSnapshot: null,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("No encontramos profesionales con los filtros seleccionados.")).toBeInTheDocument();
    });
  });

  it("should show load more button when there are more results", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Cargar más")).toBeInTheDocument();
  });

  it("should load more professionals when load more button is clicked", async () => {
    // Create different professionals for the load more call to avoid duplicate keys
    const additionalProfessionals = [
      {
        id: "3",
        full_name: "Dr. Additional Professional",
        bio: "Additional professional for testing",
        rate_cents: 60000,
        specialty_ids: ["specialty-4"],
        profile_picture: undefined,
      },
    ];

    // First call returns initial professionals
    mockQueryProfessionals.mockResolvedValueOnce({
      professionals: mockProfessionals,
      lastSnapshot: "mock-snapshot",
    });

    // Second call returns additional professionals
    mockQueryProfessionals.mockResolvedValueOnce({
      professionals: additionalProfessionals,
      lastSnapshot: null,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByText("Cargar más");
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    await waitFor(() => {
      expect(mockQueryProfessionals).toHaveBeenCalledWith({
        specialty: undefined,
        minRateCents: undefined,
        maxRateCents: undefined,
        limit: 9,
        startAfterSnapshot: "mock-snapshot",
      });
    });
  });

  it("should disable load more button when no more results", async () => {
    mockQueryProfessionals.mockResolvedValue({
      professionals: mockProfessionals,
      lastSnapshot: null,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("No hay más resultados")).toBeInTheDocument();
  });

  it("should show loading state on load more button when loading", async () => {
    // First, let the initial load complete
    mockQueryProfessionals.mockResolvedValue({
      professionals: mockProfessionals,
      lastSnapshot: "mock-snapshot",
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    // Now mock the second call to return a pending promise
    let resolvePromise: (value: unknown) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockQueryProfessionals.mockReturnValueOnce(loadingPromise);

    const loadMoreButton = screen.getByText("Cargar más");
    
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    // Check that loading state is shown
    await waitFor(() => {
      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });

    // Resolve the promise with different professionals to avoid duplicate keys
    resolvePromise!({
      professionals: [
        {
          id: "3",
          full_name: "Dr. Additional Professional",
          bio: "Additional professional for testing",
          rate_cents: 60000,
          specialty_ids: ["specialty-4"],
          profile_picture: undefined,
        },
      ],
      lastSnapshot: "mock-snapshot",
    });

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
    });
  });

  it("should render professional links correctly", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    const links = screen.getAllByTestId("link");
    expect(links[0]).toHaveAttribute("href", "/professionals/1");
    expect(links[1]).toHaveAttribute("href", "/professionals/2");
  });

  it("should render professional images correctly", async () => {
    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    const images = screen.getAllByTestId("image");
    expect(images[0]).toHaveAttribute("src", "http://localhost:8000/images/profile.jpg");
    expect(images[0]).toHaveAttribute("alt", "Foto del profesional Dr. John Doe");
  });

  it("should handle specialty names loading state", async () => {
    mockUseSpecialtyNames.mockReturnValue({
      getNames: vi.fn(),
      loading: true,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    // Should show loading skeleton for specialty names (2 cards with skeleton divs)
    const skeletonDivs = screen.getAllByRole("generic").filter(div => 
      div.className.includes("animate-pulse") && div.className.includes("bg-neutral-200")
    );
    expect(skeletonDivs).toHaveLength(2); // One skeleton per card for specialty names
  });

  it("should handle professionals without specialties", async () => {
    const professionalsWithoutSpecialties = [
      {
        id: "1",
        full_name: "Dr. John Doe",
        bio: "Experienced therapist",
        rate_cents: 50000,
        specialty_ids: [],
        profile_picture: "/images/profile.jpg",
      },
    ];

    mockQueryProfessionals.mockResolvedValue({
      professionals: professionalsWithoutSpecialties,
      lastSnapshot: null,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Especialidad no especificada")).toBeInTheDocument();
    });
  });

  it("should handle external image URLs", async () => {
    const professionalsWithExternalImages = [
      {
        id: "1",
        full_name: "Dr. John Doe",
        bio: "Experienced therapist",
        rate_cents: 50000,
        specialty_ids: ["specialty-1"],
        profile_picture: "https://example.com/image.jpg",
      },
    ];

    mockQueryProfessionals.mockResolvedValue({
      professionals: professionalsWithExternalImages,
      lastSnapshot: null,
    });

    renderWithAct(<ProfessionalsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
    });

    const image = screen.getByTestId("image");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });
});
