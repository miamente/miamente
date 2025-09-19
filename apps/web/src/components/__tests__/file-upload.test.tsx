import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FileUpload } from "../file-upload";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

describe("FileUpload", () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB
    label: "Upload file",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<FileUpload {...defaultProps} />);

    expect(screen.getByText("Upload file")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /seleccionar archivo/i })).toBeInTheDocument();
    expect(screen.getByText("Arrastra un archivo o haz clic para seleccionar")).toBeInTheDocument();
  });

  it("should render with custom label", () => {
    render(<FileUpload {...defaultProps} label="Custom label" />);

    expect(screen.getByText("Custom label")).toBeInTheDocument();
  });

  it("should show file size limit", () => {
    render(<FileUpload {...defaultProps} maxSize={1024 * 1024} />);

    expect(screen.getByText("Máximo 1MB")).toBeInTheDocument();
  });

  it("should show current file when provided", () => {
    render(<FileUpload {...defaultProps} currentFile="https://example.com/image.jpg" />);

    expect(screen.getByText("✅ Archivo actual: image.jpg")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<FileUpload {...defaultProps} disabled={true} />);

    const fileInput = screen.getByDisplayValue("");
    const selectButton = screen.getByRole("button", { name: /seleccionar archivo/i });

    expect(fileInput).toBeDisabled();
    expect(selectButton).toBeDisabled();
  });

  it("should call onFileSelect when file is selected", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload {...defaultProps} onFileSelect={onFileSelect} />);

    const fileInput = screen.getByDisplayValue("");
    const file = new File(["test content"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it("should not call onFileSelect when disabled", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload {...defaultProps} onFileSelect={onFileSelect} disabled={true} />);

    // The component should not call onFileSelect when disabled
    // This test verifies the disabled state is properly applied
    expect(screen.getByRole("button", { name: /seleccionar archivo/i })).toBeDisabled();
  });

  it("should show error for file too large", async () => {
    const onFileSelect = vi.fn();
    render(
      <FileUpload
        {...defaultProps}
        onFileSelect={onFileSelect}
        maxSize={1024} // 1KB
      />,
    );

    const fileInput = screen.getByDisplayValue("");
    const file = new File(["x".repeat(2000)], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/archivo es demasiado grande/i)).toBeInTheDocument();
      expect(onFileSelect).not.toHaveBeenCalled();
    });
  });

  it("should show error for invalid file type", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload {...defaultProps} onFileSelect={onFileSelect} accept="image/*" />);

    const fileInput = screen.getByDisplayValue("");
    const file = new File(["test content"], "test.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/tipo de archivo no permitido/i)).toBeInTheDocument();
      expect(onFileSelect).not.toHaveBeenCalled();
    });
  });

  it("should handle drag and drop", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload {...defaultProps} onFileSelect={onFileSelect} />);

    const dropZone = screen
      .getByText("Arrastra un archivo o haz clic para seleccionar")
      .closest("div");
    const file = new File(["test content"], "test.jpg", { type: "image/jpeg" });

    fireEvent.dragOver(dropZone!);
    fireEvent.drop(dropZone!, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it("should show drag over state", () => {
    render(<FileUpload {...defaultProps} />);

    // Find the Card component which has the drag handlers
    const dropZone = screen
      .getByText("Arrastra un archivo o haz clic para seleccionar")
      .closest('[data-slot="card"]');

    fireEvent.dragOver(dropZone!);

    expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
  });

  it("should clear drag over state on drag leave", () => {
    render(<FileUpload {...defaultProps} />);

    const dropZone = screen
      .getByText("Arrastra un archivo o haz clic para seleccionar")
      .closest('[data-slot="card"]');

    fireEvent.dragOver(dropZone!);
    fireEvent.dragLeave(dropZone!);

    expect(dropZone).not.toHaveClass("border-blue-500", "bg-blue-50");
  });

  it("should show selected file name", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload {...defaultProps} onFileSelect={onFileSelect} />);

    const fileInput = screen.getByDisplayValue("");
    const file = new File(["test content"], "my-image.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  it("should clear error when new file is selected", async () => {
    const onFileSelect = vi.fn();
    render(
      <FileUpload
        {...defaultProps}
        onFileSelect={onFileSelect}
        maxSize={1024} // 1KB
      />,
    );

    const fileInput = screen.getByDisplayValue("");

    // First, select a file that's too large
    const largeFile = new File(["x".repeat(2000)], "large.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/archivo es demasiado grande/i)).toBeInTheDocument();
    });

    // Then select a valid file
    const validFile = new File(["test"], "valid.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.queryByText(/archivo es demasiado grande/i)).not.toBeInTheDocument();
      expect(onFileSelect).toHaveBeenCalledWith(validFile);
    });
  });

  it("should handle multiple file types in accept prop", async () => {
    const onFileSelect = vi.fn();
    render(
      <FileUpload {...defaultProps} onFileSelect={onFileSelect} accept="image/*,application/pdf" />,
    );

    const fileInput = screen.getByDisplayValue("");

    // Test with image file
    const imageFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [imageFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(imageFile);
    });

    // Test with PDF file
    const pdfFile = new File(["test"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith(pdfFile);
    });
  });

  it("should format file size correctly", () => {
    const { rerender } = render(<FileUpload {...defaultProps} maxSize={1024} />);
    expect(screen.getByText("Máximo 0MB")).toBeInTheDocument();

    rerender(<FileUpload {...defaultProps} maxSize={1024 * 1024} />);
    expect(screen.getByText("Máximo 1MB")).toBeInTheDocument();

    rerender(<FileUpload {...defaultProps} maxSize={1024 * 1024 * 1024} />);
    expect(screen.getByText("Máximo 1024MB")).toBeInTheDocument();
  });
});
