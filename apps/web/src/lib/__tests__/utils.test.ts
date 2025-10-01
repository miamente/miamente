import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("Utils Functions", () => {
  describe("cn (className utility)", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2", "py-1", "bg-red-500");
      expect(result).toBe("px-2 py-1 bg-red-500");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const isDisabled = false;

      const result = cn("base-class", isActive && "active-class", isDisabled && "disabled-class");

      expect(result).toBe("base-class active-class");
    });

    it("should handle Tailwind conflicts correctly", () => {
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
    });

    it("should handle multiple Tailwind conflicts", () => {
      const result = cn("px-2 py-1", "px-4 py-2", "px-6");
      // The order might vary, so we check that the last values win
      expect(result).toContain("px-6");
      expect(result).toContain("py-2");
    });

    it("should handle empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle null and undefined inputs", () => {
      const result = cn("base-class", null, undefined, "valid-class");
      expect(result).toBe("base-class valid-class");
    });

    it("should handle array inputs", () => {
      const result = cn(["px-2", "py-1"], ["bg-red-500"]);
      expect(result).toBe("px-2 py-1 bg-red-500");
    });

    it("should handle object inputs", () => {
      const result = cn({
        "px-2": true,
        "py-1": false,
        "bg-red-500": true,
        "text-white": false,
      });
      expect(result).toBe("px-2 bg-red-500");
    });

    it("should handle mixed input types", () => {
      const result = cn(
        "base-class",
        ["array-class-1", "array-class-2"],
        {
          "object-class": true,
          "disabled-class": false,
        },
        "string-class",
        null,
        undefined,
      );
      expect(result).toBe("base-class array-class-1 array-class-2 object-class string-class");
    });

    it("should merge conflicting classes with proper precedence", () => {
      const result = cn("text-sm text-gray-500", "text-lg text-blue-600");
      expect(result).toBe("text-lg text-blue-600");
    });

    it("should handle complex Tailwind utility conflicts", () => {
      const result = cn(
        "flex items-center justify-center",
        "flex-col items-start justify-start",
        "justify-between",
      );
      expect(result).toBe("flex flex-col items-start justify-between");
    });

    it("should handle responsive classes", () => {
      const result = cn("text-sm", "md:text-base", "lg:text-lg", "xl:text-xl");
      expect(result).toBe("text-sm md:text-base lg:text-lg xl:text-xl");
    });

    it("should handle hover and focus states", () => {
      const result = cn(
        "bg-blue-500",
        "hover:bg-blue-600",
        "focus:bg-blue-700",
        "active:bg-blue-800",
      );
      expect(result).toBe("bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800");
    });

    it("should handle whitespace in inputs", () => {
      const result = cn("bg-white text-black", " ");
      expect(result).toBe("bg-white text-black");
    });

    it("should handle arbitrary values", () => {
      const result = cn("w-[100px]", "h-[200px]", "bg-[#ff0000]");
      expect(result).toBe("w-[100px] h-[200px] bg-[#ff0000]");
    });

    it("should handle spacing conflicts", () => {
      const result = cn("m-2 p-4", "mx-4 my-2", "px-2 py-1");
      // Check that the more specific classes are present
      expect(result).toContain("mx-4");
      expect(result).toContain("my-2");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
    });

    it("should handle border conflicts", () => {
      const result = cn("border border-red-500", "border-2 border-blue-500", "border-solid");
      expect(result).toBe("border-2 border-blue-500 border-solid");
    });

    it("should handle font weight conflicts", () => {
      const result = cn("font-normal", "font-bold", "font-light");
      expect(result).toBe("font-light");
    });

    it("should handle display conflicts", () => {
      const result = cn("block", "inline", "flex");
      expect(result).toBe("flex");
    });

    it("should handle position conflicts", () => {
      const result = cn("static", "relative", "absolute");
      expect(result).toBe("absolute");
    });

    it("should handle z-index conflicts", () => {
      const result = cn("z-10", "z-20", "z-30");
      expect(result).toBe("z-30");
    });

    it("should handle opacity conflicts", () => {
      const result = cn("opacity-50", "opacity-75", "opacity-100");
      expect(result).toBe("opacity-100");
    });

    it("should handle transform conflicts", () => {
      const result = cn("scale-100", "scale-110", "scale-125");
      expect(result).toBe("scale-125");
    });

    it("should handle animation conflicts", () => {
      const result = cn("animate-none", "animate-spin", "animate-pulse");
      expect(result).toBe("animate-pulse");
    });

    it("should handle transition conflicts", () => {
      const result = cn("transition-none", "transition-all", "transition-colors");
      expect(result).toBe("transition-colors");
    });

    it("should handle duration conflicts", () => {
      const result = cn("duration-75", "duration-150", "duration-300");
      expect(result).toBe("duration-300");
    });

    it("should handle ease conflicts", () => {
      const result = cn("ease-linear", "ease-in", "ease-out");
      expect(result).toBe("ease-out");
    });

    it("should handle delay conflicts", () => {
      const result = cn("delay-75", "delay-150", "delay-300");
      expect(result).toBe("delay-300");
    });

    it("should handle complex real-world example", () => {
      const isActive = true;
      const isDisabled = false;
      const size: "default" | "small" | "large" | "icon" = "large";

      const result = cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": isActive && !isDisabled,
          "bg-destructive text-destructive-foreground hover:bg-destructive/90":
            !isActive && !isDisabled,
          "opacity-50 cursor-not-allowed": isDisabled,
        },
        {
          "h-11 rounded-md px-8": size === "large",
        },
      );

      expect(result).toContain("inline-flex items-center justify-center text-sm font-medium");
      expect(result).toContain("transition-colors focus-visible:outline-none focus-visible:ring-2");
      expect(result).toContain("bg-primary text-primary-foreground hover:bg-primary/90");
      expect(result).toContain("h-11 rounded-md px-8");
    });
  });
});
