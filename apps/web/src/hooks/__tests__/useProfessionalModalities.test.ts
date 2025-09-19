import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalModalities } from "../useProfessionalModalities";

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe("useProfessionalModalities", () => {
  const mockModalities = [
    {
      id: "modality-1",
      professionalId: "prof-123",
      modalityId: "mod-1",
      modalityName: "Virtual",
      virtualPrice: 50000,
      presencialPrice: 80000,
      offersPresencial: true,
      description: "Online therapy sessions",
      isDefault: true,
    },
    {
      id: "modality-2",
      professionalId: "prof-123",
      modalityId: "mod-2",
      modalityName: "Presencial",
      virtualPrice: 0,
      presencialPrice: 100000,
      offersPresencial: true,
      description: "In-person therapy sessions",
      isDefault: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when professionalId is provided", () => {
    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    expect(result.current.modalities).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it("should not load when professionalId is not provided", () => {
    const { result } = renderHook(() => useProfessionalModalities());

    expect(result.current.modalities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should fetch modalities successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockModalities),
    } as Response);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities/professional/prof-123`,
    );
  });

  it("should handle API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional modalities");
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  describe("createModality", () => {
    it("should create modality successfully", async () => {
      const newModality = {
        modalityId: "mod-3",
        modalityName: "Hybrid",
        virtualPrice: 60000,
        presencialPrice: 90000,
        offersPresencial: true,
        description: "Hybrid therapy sessions",
        isDefault: false,
      };

      const createdModality = {
        id: "modality-3",
        professionalId: "prof-123",
        ...newModality,
      };

      // Mock fetch for initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModalities),
      } as Response);

      // Mock fetch for create
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdModality),
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createModality(newModality);
      });

      expect(result.current.modalities).toContain(createdModality);
      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newModality,
            professionalId: "prof-123",
          }),
        },
      );
    });

    it("should not create modality when professionalId is not provided", async () => {
      const { result } = renderHook(() => useProfessionalModalities());

      await act(async () => {
        await result.current.createModality({
          modalityId: "mod-3",
          modalityName: "Hybrid",
          virtualPrice: 60000,
          presencialPrice: 90000,
          offersPresencial: true,
          description: "Hybrid therapy sessions",
          isDefault: false,
        });
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle create modality errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      await act(async () => {
        await result.current.createModality({
          modalityId: "mod-3",
          modalityName: "Hybrid",
          virtualPrice: 60000,
          presencialPrice: 90000,
          offersPresencial: true,
          description: "Hybrid therapy sessions",
          isDefault: false,
        });
      });

      expect(result.current.error).toBe("Failed to create professional modality");
    });
  });

  describe("updateModality", () => {
    it("should update modality successfully", async () => {
      const updatedModality = {
        ...mockModalities[0],
        virtualPrice: 55000,
        description: "Updated description",
      };

      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModalities),
      } as Response);

      // Mock update fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedModality),
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateModality("modality-1", {
          virtualPrice: 55000,
          description: "Updated description",
        });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities/modality-1`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            virtualPrice: 55000,
            description: "Updated description",
          }),
        },
      );
    });

    it("should handle update modality errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      await act(async () => {
        await result.current.updateModality("modality-1", { virtualPrice: 55000 });
      });

      expect(result.current.error).toBe("Failed to update professional modality");
    });
  });

  describe("deleteModality", () => {
    it("should delete modality successfully", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      // Set initial modalities
      act(() => {
        result.current.modalities = mockModalities;
      });

      await act(async () => {
        await result.current.deleteModality("modality-1");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities/modality-1`,
        {
          method: "DELETE",
        },
      );
    });

    it("should handle delete modality errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      await act(async () => {
        await result.current.deleteModality("modality-1");
      });

      expect(result.current.error).toBe("Failed to delete professional modality");
    });
  });

  describe("setDefaultModality", () => {
    it("should set default modality successfully", async () => {
      // Mock initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModalities),
      } as Response);

      // Mock set default fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.setDefaultModality("modality-2");
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities/modality-2/set-default`,
        {
          method: "PUT",
        },
      );

      // Check that the modality is set as default
      const updatedModalities = result.current.modalities;
      expect(updatedModalities.find((m) => m.id === "modality-2")?.isDefault).toBe(true);
      expect(updatedModalities.find((m) => m.id === "modality-1")?.isDefault).toBe(false);
    });

    it("should handle set default modality errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      } as Response);

      const { result } = renderHook(() => useProfessionalModalities("prof-123"));

      await act(async () => {
        await result.current.setDefaultModality("modality-1");
      });

      expect(result.current.error).toBe("Failed to set default modality");
    });
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalModalities(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockModalities),
    } as Response);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Change professionalId
    rerender({ professionalId: "prof-456" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/professional-modalities/professional/prof-456`,
    );
  });
});
