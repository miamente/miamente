import { describe, it, expect } from "vitest";

import {
  createJitsiUrl,
  generateJitsiRoomName,
  isValidEmail,
  formatEmailDate,
  generateConfirmationSubject,
  generateReminderSubject,
} from "../utils";

describe("Utility Functions", () => {
  describe("createJitsiUrl", () => {
    it("should create Jitsi URL with default base URL", () => {
      const appointmentId = "appt-123";
      const url = createJitsiUrl(appointmentId);

      expect(url).toBe("https://meet.jit.si/miamente-appt-123");
    });

    it("should create Jitsi URL with custom base URL", () => {
      const appointmentId = "appt-456";
      const baseUrl = "https://custom.jitsi.server";
      const url = createJitsiUrl(appointmentId, baseUrl);

      expect(url).toBe("https://custom.jitsi.server/miamente-appt-456");
    });

    it("should use environment variable if set", () => {
      const originalEnv = process.env.JITSI_BASE_URL;
      process.env.JITSI_BASE_URL = "https://env.jitsi.server";

      const appointmentId = "appt-789";
      const url = createJitsiUrl(appointmentId);

      expect(url).toBe("https://env.jitsi.server/miamente-appt-789");

      // Restore original environment
      process.env.JITSI_BASE_URL = originalEnv;
    });
  });

  describe("generateJitsiRoomName", () => {
    it("should generate room name with prefix", () => {
      const appointmentId = "appt-123";
      const roomName = generateJitsiRoomName(appointmentId);

      expect(roomName).toBe("miamente-appt-123");
    });

    it("should handle special characters in appointment ID", () => {
      const appointmentId = "appt_special-123";
      const roomName = generateJitsiRoomName(appointmentId);

      expect(roomName).toBe("miamente-appt_special-123");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co",
        "user+tag@example.org",
        "simple@example.com",
        "test123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test@example",
        "",
        "test@.com",
        "test @example.com",
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email), `Email "${email}" should be invalid`).toBe(false);
      });
    });
  });

  describe("formatEmailDate", () => {
    it("should format date in Colombian locale", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");
      const formatted = formatEmailDate(date);

      // The exact format might vary, but should contain Colombian locale elements
      expect(formatted).toMatch(/\d{1,2} de [a-z]+ de \d{4}/i);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it("should handle different dates correctly", () => {
      const date1 = new Date("2024-12-25T10:00:00.000Z");
      const date2 = new Date("2024-06-15T16:45:00.000Z");

      const formatted1 = formatEmailDate(date1);
      const formatted2 = formatEmailDate(date2);

      expect(formatted1).toBeDefined();
      expect(formatted2).toBeDefined();
      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe("generateConfirmationSubject", () => {
    it("should generate confirmation subject with formatted date", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");
      const subject = generateConfirmationSubject(date);

      expect(subject).toMatch(/^Confirmación de cita - /);
      expect(subject).toContain("2024");
    });

    it("should include formatted date in subject", () => {
      const date = new Date("2024-06-20T09:00:00.000Z");
      const subject = generateConfirmationSubject(date);

      expect(subject).toMatch(/Confirmación de cita - \d{1,2} de [a-z]+ de \d{4}/i);
    });
  });

  describe("generateReminderSubject", () => {
    it("should generate 24-hour reminder subject", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");
      const subject = generateReminderSubject(date, 24);

      expect(subject).toMatch(/^Recordatorio: Tu cita es mañana - /);
      expect(subject).toContain("2024");
    });

    it("should generate 1-hour reminder subject", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");
      const subject = generateReminderSubject(date, 1);

      expect(subject).toMatch(/^Recordatorio: Tu cita es en 1 hora - /);
      expect(subject).toContain("2024");
    });

    it("should generate custom hour reminder subject", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");
      const subject = generateReminderSubject(date, 3);

      expect(subject).toMatch(/^Recordatorio: Tu cita es en 3 horas - /);
      expect(subject).toContain("2024");
    });

    it("should handle different hour values", () => {
      const date = new Date("2024-01-15T14:30:00.000Z");

      const subject2 = generateReminderSubject(date, 2);
      const subject12 = generateReminderSubject(date, 12);

      expect(subject2).toContain("2 horas");
      expect(subject12).toContain("12 horas");
    });
  });
});
