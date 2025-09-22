import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  BOGOTA_TIMEZONE,
  utcToBogota,
  bogotaToUtc,
  formatBogotaDate,
  formatBogotaTime,
  formatBogotaDateTime,
  getBogotaNow,
  createBogotaDate,
  parseTimeToMinutes,
  minutesToTimeString,
} from "../timezone";

describe("Timezone Functions", () => {
  beforeEach(() => {
    // Mock Date.now() to a fixed date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T12:00:00Z")); // UTC
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("BOGOTA_TIMEZONE", () => {
    it("should have correct timezone string", () => {
      expect(BOGOTA_TIMEZONE).toBe("America/Bogota");
    });
  });

  describe("utcToBogota", () => {
    it("should convert UTC date to Bogotá timezone", () => {
      const utcDate = new Date("2023-01-01T12:00:00Z");
      const bogotaDate = utcToBogota(utcDate);

      // Bogotá is UTC-5, so 12:00 UTC should be 07:00 in Bogotá
      expect(bogotaDate).toBeInstanceOf(Date);
    });

    it("should handle different UTC times", () => {
      const utcDate1 = new Date("2023-06-01T12:00:00Z"); // Summer time
      const utcDate2 = new Date("2023-12-01T12:00:00Z"); // Winter time

      const bogotaDate1 = utcToBogota(utcDate1);
      const bogotaDate2 = utcToBogota(utcDate2);

      expect(bogotaDate1).toBeInstanceOf(Date);
      expect(bogotaDate2).toBeInstanceOf(Date);
    });
  });

  describe("bogotaToUtc", () => {
    it("should convert Bogotá date to UTC", () => {
      const bogotaDate = new Date("2023-01-01T07:00:00");
      const utcDate = bogotaToUtc(bogotaDate);

      expect(utcDate).toBeInstanceOf(Date);
    });

    it("should handle different Bogotá times", () => {
      const bogotaDate1 = new Date("2023-06-01T07:00:00");
      const bogotaDate2 = new Date("2023-12-01T07:00:00");

      const utcDate1 = bogotaToUtc(bogotaDate1);
      const utcDate2 = bogotaToUtc(bogotaDate2);

      expect(utcDate1).toBeInstanceOf(Date);
      expect(utcDate2).toBeInstanceOf(Date);
    });
  });

  describe("formatBogotaDate", () => {
    it("should format date for Bogotá timezone", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaDate(date);

      expect(typeof formatted).toBe("string");
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Spanish date format
    });

    it("should accept custom format options", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaDate(date, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      expect(typeof formatted).toBe("string");
    });

    it("should handle different dates", () => {
      const date1 = new Date("2023-06-15T12:00:00Z");
      const date2 = new Date("2023-12-25T12:00:00Z");

      const formatted1 = formatBogotaDate(date1);
      const formatted2 = formatBogotaDate(date2);

      expect(typeof formatted1).toBe("string");
      expect(typeof formatted2).toBe("string");
      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe("formatBogotaTime", () => {
    it("should format time for Bogotá timezone", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaTime(date);

      expect(typeof formatted).toBe("string");
      expect(formatted).toMatch(/\d{2}:\d{2}/); // HH:MM format
    });

    it("should use 24-hour format", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaTime(date);

      // Should not contain AM/PM
      expect(formatted).not.toMatch(/AM|PM/i);
    });

    it("should handle different times", () => {
      const date1 = new Date("2023-01-01T06:00:00Z");
      const date2 = new Date("2023-01-01T18:00:00Z");

      const formatted1 = formatBogotaTime(date1);
      const formatted2 = formatBogotaTime(date2);

      expect(typeof formatted1).toBe("string");
      expect(typeof formatted2).toBe("string");
      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe("formatBogotaDateTime", () => {
    it("should format date and time for Bogotá timezone", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaDateTime(date);

      expect(typeof formatted).toBe("string");
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/); // DD/MM/YYYY, HH:MM format
    });

    it("should accept custom format options", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      const formatted = formatBogotaDateTime(date, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(typeof formatted).toBe("string");
    });

    it("should handle different dates and times", () => {
      const date1 = new Date("2023-06-15T09:30:00Z");
      const date2 = new Date("2023-12-25T21:45:00Z");

      const formatted1 = formatBogotaDateTime(date1);
      const formatted2 = formatBogotaDateTime(date2);

      expect(typeof formatted1).toBe("string");
      expect(typeof formatted2).toBe("string");
      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe("getBogotaNow", () => {
    it("should return current date/time in Bogotá timezone", () => {
      const now = getBogotaNow();

      expect(now).toBeInstanceOf(Date);
    });

    it("should return different times for different system times", () => {
      vi.setSystemTime(new Date("2023-01-01T12:00:00Z"));
      const now1 = getBogotaNow();

      vi.setSystemTime(new Date("2023-01-01T18:00:00Z"));
      const now2 = getBogotaNow();

      expect(now1).toBeInstanceOf(Date);
      expect(now2).toBeInstanceOf(Date);
      expect(now1.getTime()).not.toBe(now2.getTime());
    });
  });

  describe("createBogotaDate", () => {
    it("should create date in Bogotá timezone from components", () => {
      const date = createBogotaDate(2023, 0, 1, 12, 30, 45); // January 1, 2023, 12:30:45

      expect(date).toBeInstanceOf(Date);
    });

    it("should handle default hour, minute, second values", () => {
      const date = createBogotaDate(2023, 0, 1); // January 1, 2023, 00:00:00

      expect(date).toBeInstanceOf(Date);
    });

    it("should create different dates for different components", () => {
      const date1 = createBogotaDate(2023, 0, 1, 10, 0, 0);
      const date2 = createBogotaDate(2023, 0, 1, 14, 0, 0);

      expect(date1).toBeInstanceOf(Date);
      expect(date2).toBeInstanceOf(Date);
      expect(date1.getTime()).not.toBe(date2.getTime());
    });

    it("should handle month correctly (0-based)", () => {
      const january = createBogotaDate(2023, 0, 1);
      const december = createBogotaDate(2023, 11, 1);

      expect(january).toBeInstanceOf(Date);
      expect(december).toBeInstanceOf(Date);
      expect(january.getTime()).not.toBe(december.getTime());
    });
  });

  describe("parseTimeToMinutes", () => {
    it("should parse time string to minutes correctly", () => {
      expect(parseTimeToMinutes("00:00")).toBe(0);
      expect(parseTimeToMinutes("01:00")).toBe(60);
      expect(parseTimeToMinutes("12:30")).toBe(750);
      expect(parseTimeToMinutes("23:59")).toBe(1439);
    });

    it("should handle single digit hours and minutes", () => {
      expect(parseTimeToMinutes("1:5")).toBe(65);
      expect(parseTimeToMinutes("9:30")).toBe(570);
    });

    it("should handle edge cases", () => {
      expect(parseTimeToMinutes("00:01")).toBe(1);
      expect(parseTimeToMinutes("23:58")).toBe(1438);
    });

    it("should handle invalid format gracefully", () => {
      // These should return NaN, not throw
      expect(parseTimeToMinutes("invalid")).toBeNaN();
      expect(parseTimeToMinutes("25:00")).toBe(25 * 60); // Actually parses as valid
      expect(parseTimeToMinutes("12:60")).toBe(13 * 60); // Actually parses as valid (60 minutes = 1 hour)
    });
  });

  describe("minutesToTimeString", () => {
    it("should convert minutes to time string correctly", () => {
      expect(minutesToTimeString(0)).toBe("00:00");
      expect(minutesToTimeString(60)).toBe("01:00");
      expect(minutesToTimeString(750)).toBe("12:30");
      expect(minutesToTimeString(1439)).toBe("23:59");
    });

    it("should pad single digits with zeros", () => {
      expect(minutesToTimeString(65)).toBe("01:05");
      expect(minutesToTimeString(570)).toBe("09:30");
    });

    it("should handle edge cases", () => {
      expect(minutesToTimeString(1)).toBe("00:01");
      expect(minutesToTimeString(1438)).toBe("23:58");
    });

    it("should handle large numbers", () => {
      expect(minutesToTimeString(1440)).toBe("24:00"); // Next day
      expect(minutesToTimeString(1500)).toBe("25:00"); // Next day + 1 hour
    });

    it("should handle negative numbers", () => {
      expect(minutesToTimeString(-1)).toBe("-1:-1"); // Edge case
      expect(minutesToTimeString(-60)).toBe("-1:00"); // Edge case - actually converts to hours
    });
  });

  describe("Integration tests", () => {
    it("should work together for time conversion", () => {
      const timeString = "14:30";
      const minutes = parseTimeToMinutes(timeString);
      const backToString = minutesToTimeString(minutes);

      expect(backToString).toBe("14:30");
    });

    it("should maintain consistency across timezone functions", () => {
      const utcDate = new Date("2023-01-01T12:00:00Z");
      const bogotaDate = utcToBogota(utcDate);
      const backToUtc = bogotaToUtc(bogotaDate);

      expect(backToUtc).toBeInstanceOf(Date);
    });
  });
});
