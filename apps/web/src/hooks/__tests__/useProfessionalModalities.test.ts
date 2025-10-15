import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProfessionalModalities } from "../useProfessionalModalities";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: {
    getProfessionalModalities: vi.fn(),
    createProfessionalModality: vi.fn(),
    updateProfessionalModality: vi.fn(),
    deleteProfessionalModality: vi.fn(),
  },
}));

// Mock fetch for setDefaultModality
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

import { apiClient } from "@/lib/api";
const mockApiClient = vi.mocked(apiClient);

describe("useProfessionalModalities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state when professionalId is provided", async () => {
    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    expect(result.current.modalities).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should not load when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalModalities());

    expect(result.current.modalities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // Should not call the API
    expect(mockApiClient.getProfessionalModalities).not.toHaveBeenCalled();
  });

  it("should fetch modalities successfully", async () => {
    const mockModalities = [
      {
        id: "1",
        modality_id: "mod-1",
        modality_name: "Virtual",
        virtual_price: 50000,
        presencial_price: 0,
        offers_presencial: false,
        description: "Virtual therapy sessions",
        is_default: true,
      },
      {
        id: "2",
        modality_id: "mod-2",
        modality_name: "Presencial",
        virtual_price: 0,
        presencial_price: 80000,
        offers_presencial: true,
        description: "In-person therapy sessions",
        is_default: false,
      },
    ];

    mockApiClient.getProfessionalModalities.mockResolvedValue(mockModalities);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual(mockModalities);
    expect(result.current.error).toBe(null);
    expect(mockApiClient.getProfessionalModalities).toHaveBeenCalledWith("prof-123");
  });

  it("should handle API errors", async () => {
    mockApiClient.getProfessionalModalities.mockRejectedValue(
      new Error("Failed to fetch professional modalities"),
    );

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Failed to fetch professional modalities");
  });

  it("should handle network errors", async () => {
    mockApiClient.getProfessionalModalities.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.modalities).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("should create modality successfully", async () => {
    const mockModality = {
      id: "3",
      modality_id: "mod-3",
      modality_name: "Hybrid",
      virtual_price: 60000,
      presencial_price: 90000,
      offers_presencial: true,
      description: "Hybrid therapy sessions",
      is_default: false,
    };

    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockApiClient.createProfessionalModality.mockResolvedValue(mockModality);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const modalityData = {
      modality_id: "mod-3",
      modality_name: "Hybrid",
      virtual_price: 60000,
      presencial_price: 90000,
      offers_presencial: true,
      description: "Hybrid therapy sessions",
      is_default: false,
    };

    await act(async () => {
      await result.current.createModality(modalityData);
    });

    expect(result.current.modalities).toContain(mockModality);
    expect(mockApiClient.createProfessionalModality).toHaveBeenCalledWith("prof-123", modalityData);
  });

  it("should not create modality when professionalId is not provided", async () => {
    const { result } = renderHook(() => useProfessionalModalities());

    const modalityData = {
      modality_id: "mod-3",
      modality_name: "Hybrid",
      virtual_price: 60000,
      presencial_price: 90000,
      offers_presencial: true,
      description: "Hybrid therapy sessions",
      is_default: false,
    };

    await act(async () => {
      await result.current.createModality(modalityData);
    });

    expect(mockApiClient.createProfessionalModality).not.toHaveBeenCalled();
  });

  it("should handle create modality errors", async () => {
    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockApiClient.createProfessionalModality.mockRejectedValue(
      new Error("Failed to create professional modality"),
    );

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const modalityData = {
      modality_id: "mod-3",
      modality_name: "Hybrid",
      virtual_price: 60000,
      presencial_price: 90000,
      offers_presencial: true,
      description: "Hybrid therapy sessions",
      is_default: false,
    };

    await act(async () => {
      await result.current.createModality(modalityData);
    });

    expect(result.current.error).toBe("Failed to create professional modality");
  });

  it("should update modality successfully", async () => {
    const mockModality = {
      id: "1",
      modality_id: "mod-1",
      modality_name: "Virtual",
      virtual_price: 55000,
      presencial_price: 0,
      offers_presencial: false,
      description: "Updated description",
      is_default: true,
    };

    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockApiClient.updateProfessionalModality.mockResolvedValue(mockModality);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData = {
      virtual_price: 55000,
      description: "Updated description",
    };

    await act(async () => {
      await result.current.updateModality("modality-1", updateData);
    });

    expect(mockApiClient.updateProfessionalModality).toHaveBeenCalledWith("modality-1", updateData);
  });

  it("should handle update modality errors", async () => {
    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockApiClient.updateProfessionalModality.mockRejectedValue(
      new Error("Failed to update professional modality"),
    );

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData = {
      virtual_price: 55000,
      description: "Updated description",
    };

    await act(async () => {
      await result.current.updateModality("modality-1", updateData);
    });

    expect(result.current.error).toBe("Failed to update professional modality");
  });

  it("should delete modality successfully", async () => {
    const mockModalities = [
      {
        id: "1",
        modality_id: "mod-1",
        modality_name: "Virtual",
        virtual_price: 50000,
        presencial_price: 0,
        offers_presencial: false,
        description: "Virtual therapy sessions",
        is_default: true,
      },
      {
        id: "2",
        modality_id: "mod-2",
        modality_name: "Presencial",
        virtual_price: 0,
        presencial_price: 80000,
        offers_presencial: true,
        description: "In-person therapy sessions",
        is_default: false,
      },
    ];

    mockApiClient.getProfessionalModalities.mockResolvedValue(mockModalities);
    mockApiClient.deleteProfessionalModality.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteModality("1");
    });

    expect(result.current.modalities).toHaveLength(1);
    expect(result.current.modalities[0].id).toBe("2");
    expect(mockApiClient.deleteProfessionalModality).toHaveBeenCalledWith("1");
  });

  it("should handle delete modality errors", async () => {
    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockApiClient.deleteProfessionalModality.mockRejectedValue(
      new Error("Failed to delete professional modality"),
    );

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteModality("modality-1");
    });

    expect(result.current.error).toBe("Failed to delete professional modality");
  });

  it("should set default modality successfully", async () => {
    const mockModalities = [
      {
        id: "1",
        modality_id: "mod-1",
        modality_name: "Virtual",
        virtual_price: 50000,
        presencial_price: 0,
        offers_presencial: false,
        description: "Virtual therapy sessions",
        is_default: false,
      },
      {
        id: "2",
        modality_id: "mod-2",
        modality_name: "Presencial",
        virtual_price: 0,
        presencial_price: 80000,
        offers_presencial: true,
        description: "In-person therapy sessions",
        is_default: true,
      },
    ];

    mockApiClient.getProfessionalModalities.mockResolvedValue(mockModalities);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.setDefaultModality("2");
    });

    expect(result.current.modalities[0].is_default).toBe(false);
    expect(result.current.modalities[1].is_default).toBe(true);
  });

  it("should handle set default modality errors", async () => {
    mockApiClient.getProfessionalModalities.mockResolvedValue([]);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useProfessionalModalities("prof-123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.setDefaultModality("modality-2");
    });

    expect(result.current.error).toBe("Failed to set default modality");
  });

  it("should refetch when professionalId changes", async () => {
    const { result, rerender } = renderHook(
      ({ professionalId }) => useProfessionalModalities(professionalId),
      { initialProps: { professionalId: "prof-123" } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalModalities).toHaveBeenCalledWith("prof-123");

    // Change professionalId
    rerender({ professionalId: "prof-456" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getProfessionalModalities).toHaveBeenCalledWith("prof-456");
    expect(mockApiClient.getProfessionalModalities).toHaveBeenCalledTimes(2);
  });
});
