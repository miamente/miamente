import { describe, it, expect } from "vitest";
import {
  DEFAULT_SPECIALTIES,
  getSpecialtyById,
  formatPrice,
  type Specialty,
} from "../specialties";

describe("Specialties Functions", () => {
  describe("DEFAULT_SPECIALTIES", () => {
    it("should contain expected specialties", () => {
      expect(DEFAULT_SPECIALTIES).toBeDefined();
      expect(Array.isArray(DEFAULT_SPECIALTIES)).toBe(true);
      expect(DEFAULT_SPECIALTIES.length).toBeGreaterThan(0);
    });

    it("should have all required properties for each specialty", () => {
      DEFAULT_SPECIALTIES.forEach((specialty: Specialty) => {
        expect(specialty).toHaveProperty("id");
        expect(specialty).toHaveProperty("name");
        expect(specialty).toHaveProperty("description");
        expect(specialty).toHaveProperty("defaultPriceCents");
        expect(specialty).toHaveProperty("currency");

        expect(typeof specialty.id).toBe("string");
        expect(typeof specialty.name).toBe("string");
        expect(typeof specialty.description).toBe("string");
        expect(typeof specialty.defaultPriceCents).toBe("number");
        expect(typeof specialty.currency).toBe("string");
      });
    });

    it("should have unique IDs", () => {
      const ids = DEFAULT_SPECIALTIES.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have positive prices", () => {
      DEFAULT_SPECIALTIES.forEach((specialty) => {
        expect(specialty.defaultPriceCents).toBeGreaterThan(0);
      });
    });

    it("should use COP currency", () => {
      DEFAULT_SPECIALTIES.forEach((specialty) => {
        expect(specialty.currency).toBe("COP");
      });
    });
  });

  describe("getSpecialtyById", () => {
    it("should return specialty when ID exists", () => {
      const specialty = getSpecialtyById("psychology");

      expect(specialty).toBeDefined();
      expect(specialty?.id).toBe("psychology");
      expect(specialty?.name).toBe("Psicología Clínica");
    });

    it("should return undefined when ID doesn't exist", () => {
      const specialty = getSpecialtyById("nonexistent");

      expect(specialty).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const specialty = getSpecialtyById("");

      expect(specialty).toBeUndefined();
    });

    it("should handle different specialty IDs", () => {
      const psychology = getSpecialtyById("psychology");
      const psychiatry = getSpecialtyById("psychiatry");
      const therapy = getSpecialtyById("therapy");

      expect(psychology?.id).toBe("psychology");
      expect(psychiatry?.id).toBe("psychiatry");
      expect(therapy?.id).toBe("therapy");
    });

    it("should be case sensitive", () => {
      const specialty = getSpecialtyById("Psychology"); // Capital P

      expect(specialty).toBeUndefined();
    });
  });

  describe("formatPrice", () => {
    it("should format price in COP currency", () => {
      const formatted = formatPrice(80000);

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("$");
      expect(formatted).toMatch(/800/);
    });

    it("should handle different price amounts", () => {
      const price1 = formatPrice(60000); // $600
      const price2 = formatPrice(120000); // $1,200
      const price3 = formatPrice(150000); // $1,500

      expect(price1).toMatch(/600/);
      expect(price2).toMatch(/1\.200/);
      expect(price3).toMatch(/1\.500/);
    });

    it("should handle zero price", () => {
      const formatted = formatPrice(0);

      expect(formatted).toContain("$");
      expect(formatted).toContain("0");
    });

    it("should handle large prices", () => {
      const formatted = formatPrice(1000000); // $10,000

      expect(formatted).toContain("$");
      expect(formatted).toMatch(/10\.000/);
    });

    it("should use Spanish locale formatting", () => {
      const formatted = formatPrice(120000);

      // Spanish locale uses dots as thousand separators
      expect(formatted).toMatch(/1\.200/);
    });

    it("should accept custom currency", () => {
      const formatted = formatPrice(80000, "USD");

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("$");
    });

    it("should handle decimal prices correctly", () => {
      const formatted = formatPrice(80500); // $805.00

      expect(formatted).toMatch(/805/);
    });

    it("should format prices from specialty data", () => {
      const psychology = getSpecialtyById("psychology");
      const formatted = formatPrice(psychology!.defaultPriceCents);

      expect(formatted).toMatch(/800/);
    });

    it("should handle negative prices", () => {
      const formatted = formatPrice(-50000);

      expect(formatted).toContain("-");
      expect(formatted).toMatch(/500/);
    });
  });

  describe("Integration tests", () => {
    it("should work together for specialty lookup and price formatting", () => {
      const specialty = getSpecialtyById("psychiatry");
      const formattedPrice = formatPrice(specialty!.defaultPriceCents);

      expect(specialty).toBeDefined();
      expect(formattedPrice).toBeDefined();
      expect(formattedPrice).toMatch(/1\.200/);
    });

    it("should handle edge cases gracefully", () => {
      expect(() => getSpecialtyById("")).not.toThrow();
      expect(() => formatPrice(0)).not.toThrow();
      expect(() => formatPrice(-100)).not.toThrow();
    });
  });
});
