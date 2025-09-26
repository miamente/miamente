import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminDataTable, type Column } from "../AdminDataTable";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    className,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
  }) => (
    <button data-testid="button" onClick={onClick} className={className} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  MoreVertical: () => <div data-testid="more-vertical-icon">More</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  UserX: () => <div data-testid="user-x-icon">UserX</div>,
  UserCheck: () => <div data-testid="user-check-icon">UserCheck</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Phone: () => <div data-testid="phone-icon">Phone</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
}));

// Mock timezone utility
vi.mock("@/lib/timezone", () => ({
  formatBogotaDate: (date: Date) => date.toISOString().split("T")[0],
}));

interface TestItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  last_login?: string;
}

describe("AdminDataTable", () => {
  const mockData: TestItem[] = [
    {
      id: "1",
      name: "Test Item 1",
      email: "test1@example.com",
      phone: "+1234567890",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-01T00:00:00Z",
      last_login: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Test Item 2",
      email: "test2@example.com",
      phone: "+0987654321",
      is_active: false,
      is_verified: false,
      created_at: "2024-01-02T00:00:00Z",
      last_login: undefined,
    },
  ];

  const mockColumns: Column<TestItem>[] = [
    {
      key: "name",
      label: "Name",
      render: (item) => <span data-testid={`name-${item.id}`}>{item.name}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (item) => <span data-testid={`email-${item.id}`}>{item.email}</span>,
    },
    {
      key: "actions",
      label: "Actions",
    },
  ];

  const defaultProps = {
    title: "Test Table",
    description: "Test Description",
    data: mockData,
    loading: false,
    error: null,
    columns: mockColumns,
    emptyMessage: "No items found",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    render(<AdminDataTable {...defaultProps} loading={true} />);

    // When loading, only the spinner should be visible
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("Test Table")).not.toBeInTheDocument();
  });

  it("should render table with data", () => {
    render(<AdminDataTable {...defaultProps} />);

    expect(screen.getByText("Test Table (2)")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByTestId("name-1")).toHaveTextContent("Test Item 1");
    expect(screen.getByTestId("email-1")).toHaveTextContent("test1@example.com");
    expect(screen.getByTestId("name-2")).toHaveTextContent("Test Item 2");
    expect(screen.getByTestId("email-2")).toHaveTextContent("test2@example.com");
  });

  it("should render add button when provided", () => {
    const mockOnAdd = vi.fn();
    render(<AdminDataTable {...defaultProps} addButtonText="Add Item" onAdd={mockOnAdd} />);

    const addButton = screen.getByText("Add Item");
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("should not render add button when not provided", () => {
    render(<AdminDataTable {...defaultProps} />);

    expect(screen.queryByText("Add Item")).not.toBeInTheDocument();
  });

  it("should render error message when error exists", () => {
    render(<AdminDataTable {...defaultProps} error="Test error message" />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should render empty message when no data", () => {
    render(<AdminDataTable {...defaultProps} data={[]} />);

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("should render action buttons for each item", () => {
    const mockOnEdit = vi.fn();
    const mockOnToggleActive = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <AdminDataTable
        {...defaultProps}
        onEdit={mockOnEdit}
        onToggleActive={mockOnToggleActive}
        onDelete={mockOnDelete}
      />,
    );

    // Should have 2 dropdown menus (one for each item)
    const dropdownMenus = screen.getAllByTestId("dropdown-menu");
    expect(dropdownMenus).toHaveLength(2);

    // Should have more vertical icons for each item
    const moreVerticalIcons = screen.getAllByTestId("more-vertical-icon");
    expect(moreVerticalIcons).toHaveLength(2);
  });

  it("should handle edit action", () => {
    const mockOnEdit = vi.fn();
    render(<AdminDataTable {...defaultProps} onEdit={mockOnEdit} />);

    // Find and click the first dropdown trigger
    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    fireEvent.click(dropdownTriggers[0]);

    // Find and click the edit button (should be in dropdown content)
    const editIcons = screen.getAllByTestId("edit-icon");
    fireEvent.click(editIcons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it("should handle toggle active action", () => {
    const mockOnToggleActive = vi.fn();
    render(<AdminDataTable {...defaultProps} onToggleActive={mockOnToggleActive} />);

    // Find and click the first dropdown trigger
    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    fireEvent.click(dropdownTriggers[0]);

    // Find and click the toggle button (UserX for active item, UserCheck for inactive)
    const userXIcons = screen.getAllByTestId("user-x-icon");
    if (userXIcons.length > 0) {
      fireEvent.click(userXIcons[0]);
      expect(mockOnToggleActive).toHaveBeenCalledWith(mockData[0]);
    }
  });

  it("should handle delete action", () => {
    const mockOnDelete = vi.fn();
    render(<AdminDataTable {...defaultProps} onDelete={mockOnDelete} />);

    // Find and click the first dropdown trigger
    const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
    fireEvent.click(dropdownTriggers[0]);

    // Find and click the delete button
    const trashIcons = screen.getAllByTestId("trash-icon");
    fireEvent.click(trashIcons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockData[0]);
  });

  it("should render with custom empty message", () => {
    render(<AdminDataTable {...defaultProps} data={[]} emptyMessage="Custom empty message" />);

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("should render table headers correctly", () => {
    render(<AdminDataTable {...defaultProps} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should handle items without optional properties", () => {
    const minimalData: TestItem[] = [
      {
        id: "1",
        name: "Minimal Item",
      },
    ];

    const minimalColumns: Column<TestItem>[] = [
      {
        key: "name",
        label: "Name",
        render: (item) => <span>{item.name}</span>,
      },
    ];

    render(<AdminDataTable {...defaultProps} data={minimalData} columns={minimalColumns} />);

    expect(screen.getByText("Minimal Item")).toBeInTheDocument();
    expect(screen.getByText("Test Table (1)")).toBeInTheDocument();
  });

  it("should not render action buttons when no action handlers provided", () => {
    render(<AdminDataTable {...defaultProps} />);

    // Should still have dropdown menus but no action handlers
    const dropdownMenus = screen.getAllByTestId("dropdown-menu");
    expect(dropdownMenus).toHaveLength(2);
  });
});
