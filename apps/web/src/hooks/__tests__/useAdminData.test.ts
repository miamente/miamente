import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAdminData } from "../useAdminData";

describe("useAdminData", () => {
  const mockLoadFunction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading state", async () => {
    mockLoadFunction.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for the async effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("should load data successfully", async () => {
    const mockData = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];
    mockLoadFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockLoadFunction).toHaveBeenCalledTimes(1);
  });

  it("should handle loading errors", async () => {
    const mockError = new Error("Failed to load data");
    mockLoadFunction.mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe("Error al cargar los datos. Por favor, inténtalo de nuevo.");
  });

  it("should handle non-array response", async () => {
    mockLoadFunction.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it("should update item correctly", async () => {
    const mockData = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];
    mockLoadFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const updatedItem = { id: "1", name: "Updated Item 1" };

    act(() => {
      result.current.updateItem("1", updatedItem);
    });

    expect(result.current.data).toEqual([updatedItem, { id: "2", name: "Item 2" }]);
  });

  it("should remove item correctly", async () => {
    const mockData = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];
    mockLoadFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.removeItem("1");
    });

    expect(result.current.data).toEqual([{ id: "2", name: "Item 2" }]);
  });

  it("should set error correctly", async () => {
    mockLoadFunction.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    // Wait for initial load to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.setError("Custom error message");
    });

    expect(result.current.error).toBe("Custom error message");
  });

  it("should clear error when setError is called with null", async () => {
    mockLoadFunction.mockRejectedValue(new Error("Initial error"));

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBe(null);
  });

  it("should refresh data when refreshData is called", async () => {
    const initialData = [{ id: "1", name: "Item 1" }];
    const refreshedData = [
      { id: "1", name: "Item 1" },
      { id: "2", name: "Item 2" },
    ];

    mockLoadFunction.mockResolvedValueOnce(initialData).mockResolvedValueOnce(refreshedData);

    const { result } = renderHook(() =>
      useAdminData({
        loadFunction: mockLoadFunction,
      }),
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.data).toEqual(initialData);

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.data).toEqual(refreshedData);
    expect(mockLoadFunction).toHaveBeenCalledTimes(2);
  });
});
