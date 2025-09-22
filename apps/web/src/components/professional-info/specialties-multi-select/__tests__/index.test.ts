import { describe, it, expect } from "vitest";

describe("SpecialtiesMultiSelect Module Exports", () => {
  it("should export all types", async () => {
    const typesModule = await import("../types");

    expect(typeof typesModule).toBe("object");
    // Types should be available at compile time, but we can't test them directly at runtime
    // This test ensures the module imports without errors
  });

  it("should export all hooks", async () => {
    const hooksModule = await import("../hooks");

    expect(typeof hooksModule.useSpecialtySelection).toBe("function");
    expect(typeof hooksModule.useSpecialtyData).toBe("function");
  });

  it("should export all components", async () => {
    const indexModule = await import("../index");

    expect(typeof indexModule.LoadingState).toBe("function");
    expect(typeof indexModule.ErrorState).toBe("function");
    expect(typeof indexModule.SpecialtyBadge).toBe("function");
    expect(typeof indexModule.SelectedSpecialtiesList).toBe("function");
    expect(typeof indexModule.SpecialtySelector).toBe("function");
  });

  it("should export hooks from index", async () => {
    const indexModule = await import("../index");

    expect(typeof indexModule.useSpecialtySelection).toBe("function");
    expect(typeof indexModule.useSpecialtyData).toBe("function");
  });

  it("should have consistent component names", async () => {
    const indexModule = await import("../index");
    const loadingModule = await import("../LoadingState");
    const errorModule = await import("../ErrorState");
    const badgeModule = await import("../SpecialtyBadge");
    const listModule = await import("../SelectedSpecialtiesList");
    const selectorModule = await import("../SpecialtySelector");

    expect(indexModule.LoadingState).toBe(loadingModule.LoadingState);
    expect(indexModule.ErrorState).toBe(errorModule.ErrorState);
    expect(indexModule.SpecialtyBadge).toBe(badgeModule.SpecialtyBadge);
    expect(indexModule.SelectedSpecialtiesList).toBe(listModule.SelectedSpecialtiesList);
    expect(indexModule.SpecialtySelector).toBe(selectorModule.SpecialtySelector);
  });

  it("should have consistent hook names", async () => {
    const indexModule = await import("../index");
    const hooksModule = await import("../hooks");

    expect(indexModule.useSpecialtySelection).toBe(hooksModule.useSpecialtySelection);
    expect(indexModule.useSpecialtyData).toBe(hooksModule.useSpecialtyData);
  });
});
