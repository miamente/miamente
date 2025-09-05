import { describe, it, expect } from "vitest";

import {
  generateConfirmationEmailHtml,
  generateReminderEmailHtml,
  generatePostSessionEmailHtml,
} from "../email";

describe("Email Functions", () => {
  describe("generateConfirmationEmailHtml", () => {
    it("should generate confirmation email HTML with professional name", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";
      const professionalName = "Dr. Juan Pérez";

      const html = generateConfirmationEmailHtml(appointmentDate, jitsiUrl, professionalName);

      expect(html).toContain("¡Cita Confirmada!");
      expect(html).toContain("con Dr. Juan Pérez");
      expect(html).toContain(jitsiUrl);
      expect(html).toContain("Unirme a la Sesión");
      expect(html).toContain("Política de Cancelación");
      expect(html).toContain("Miamente");
    });

    it("should generate confirmation email HTML without professional name", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";

      const html = generateConfirmationEmailHtml(appointmentDate, jitsiUrl);

      expect(html).toContain("¡Cita Confirmada!");
      expect(html).not.toContain("con ");
      expect(html).toContain(jitsiUrl);
      expect(html).toContain("Unirme a la Sesión");
    });

    it("should include proper HTML structure", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";

      const html = generateConfirmationEmailHtml(appointmentDate, jitsiUrl);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("<head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</html>");
    });

    it("should include CSS styles", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";

      const html = generateConfirmationEmailHtml(appointmentDate, jitsiUrl);

      expect(html).toContain("<style>");
      expect(html).toContain("font-family: Arial, sans-serif");
      expect(html).toContain("background: linear-gradient");
    });
  });

  describe("generateReminderEmailHtml", () => {
    it("should generate 24-hour reminder email HTML", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";
      const hoursUntil = 24;
      const professionalName = "Dr. María García";

      const html = generateReminderEmailHtml(
        appointmentDate,
        jitsiUrl,
        hoursUntil,
        professionalName,
      );

      expect(html).toContain("Recordatorio de Cita");
      expect(html).toContain("en 24 horas");
      expect(html).toContain("con Dr. María García");
      expect(html).toContain(jitsiUrl);
      expect(html).toContain("Unirme a la Sesión");
    });

    it("should generate 1-hour reminder email HTML", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";
      const hoursUntil = 1;

      const html = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil);

      expect(html).toContain("Recordatorio de Cita");
      expect(html).toContain("en 1 hora");
      expect(html).toContain(jitsiUrl);
    });

    it("should generate custom hours reminder email HTML", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";
      const hoursUntil = 3;

      const html = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil);

      expect(html).toContain("Recordatorio de Cita");
      expect(html).toContain("en 3 horas");
      expect(html).toContain(jitsiUrl);
    });

    it("should include preparation instructions", () => {
      const appointmentDate = new Date("2024-01-15T14:30:00Z");
      const jitsiUrl = "https://meet.jit.si/miamente-appt-123";
      const hoursUntil = 24;

      const html = generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil);

      expect(html).toContain("Preparación para la sesión");
      expect(html).toContain("Verifica tu conexión a internet");
      expect(html).toContain("Prepara tus auriculares");
    });
  });

  describe("generatePostSessionEmailHtml", () => {
    it("should generate post-session email HTML with professional name", () => {
      const professionalName = "Dr. Carlos López";

      const html = generatePostSessionEmailHtml(professionalName);

      expect(html).toContain("¡Gracias por tu Sesión!");
      expect(html).toContain("con Dr. Carlos López");
      expect(html).toContain("Agendar Nueva Cita");
      expect(html).toContain("Tu bienestar mental es importante");
    });

    it("should generate post-session email HTML without professional name", () => {
      const html = generatePostSessionEmailHtml();

      expect(html).toContain("¡Gracias por tu Sesión!");
      expect(html).not.toContain("con ");
      expect(html).toContain("Agendar Nueva Cita");
    });

    it("should include wellness reminders", () => {
      const html = generatePostSessionEmailHtml();

      expect(html).toContain("Practica las técnicas discutidas");
      expect(html).toContain("Mantén una rutina saludable");
      expect(html).toContain("No dudes en buscar ayuda");
    });

    it("should include proper HTML structure", () => {
      const html = generatePostSessionEmailHtml();

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("<head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</html>");
    });
  });
});
