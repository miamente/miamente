import { describe, it, expect } from "vitest";

import { cn } from "../utils";

describe("Web Utility Functions", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("should handle conditional classes", () => {
      const result = cn("base-class", "conditional-class", "");
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toBe("class1 class2 class3");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        active: true,
        disabled: false,
        highlighted: true,
      });
      expect(result).toBe("active highlighted");
    });

    it("should handle mixed input types", () => {
      const result = cn(
        "base",
        ["array1", "array2"],
        { object1: true, object2: false },
        "string",
        "conditional",
      );
      expect(result).toBe("base array1 array2 object1 string conditional");
    });

    it("should handle Tailwind conflicts correctly", () => {
      // Test that later classes override earlier ones (Tailwind behavior)
      const result = cn("px-2 py-1", "px-4 py-2", "px-6");
      expect(result).toBe("py-2 px-6");
    });

    it("should handle empty inputs", () => {
      expect(cn()).toBe("");
      expect(cn("")).toBe("");
      expect(cn(null, undefined, false)).toBe("");
    });

    it("should handle whitespace and duplicates", () => {
      const result = cn("  class1  ", "class1", "class2  ");
      // Note: clsx + tailwind-merge doesn't automatically remove duplicates
      // but it does handle whitespace trimming
      expect(result).toBe("class1 class1 class2");
    });
  });
});
