import { describe, it, expect } from "vitest";
import type {
  AppointmentStatus,
  Appointment,
  BookAppointmentRequest,
  BookAppointmentResponse,
  SendEmailRequest,
  SendEmailResponse,
} from "../appointment-types";

describe("appointment-types", () => {
  describe("AppointmentStatus type", () => {
    it("should accept valid appointment status values", () => {
      const validStatuses: AppointmentStatus[] = ["paid", "confirmed", "completed", "cancelled"];

      validStatuses.forEach((status) => {
        expect(["paid", "confirmed", "completed", "cancelled"]).toContain(status);
      });
    });

    it("should validate appointment status values", () => {
      // These would be compile-time errors if the types were wrong
      const status1: AppointmentStatus = "paid";
      const status2: AppointmentStatus = "confirmed";
      const status3: AppointmentStatus = "completed";
      const status4: AppointmentStatus = "cancelled";

      expect(status1).toBe("paid");
      expect(status2).toBe("confirmed");
      expect(status3).toBe("completed");
      expect(status4).toBe("cancelled");
    });
  });

  describe("Appointment interface", () => {
    it("should create valid appointment objects", () => {
      const appointment: Appointment = {
        userId: "user-123",
        proId: "pro-456",
        slotId: "slot-789",
        start: new Date("2024-01-15T10:00:00Z"),
        end: new Date("2024-01-15T11:00:00Z"),
        status: "confirmed",
        paid: true,
        jitsiUrl: "https://meet.jit.si/room-123",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      expect(appointment.userId).toBe("user-123");
      expect(appointment.proId).toBe("pro-456");
      expect(appointment.slotId).toBe("slot-789");
      expect(appointment.start).toBeInstanceOf(Date);
      expect(appointment.end).toBeInstanceOf(Date);
      expect(appointment.status).toBe("confirmed");
      expect(appointment.paid).toBe(true);
      expect(appointment.jitsiUrl).toBe("https://meet.jit.si/room-123");
      expect(appointment.createdAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });

    it("should create appointment without optional jitsiUrl", () => {
      const appointment: Appointment = {
        userId: "user-123",
        proId: "pro-456",
        slotId: "slot-789",
        start: new Date("2024-01-15T10:00:00Z"),
        end: new Date("2024-01-15T11:00:00Z"),
        status: "confirmed",
        paid: false,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      expect(appointment.jitsiUrl).toBeUndefined();
      expect(appointment.paid).toBe(false);
    });

    it("should handle different appointment statuses", () => {
      const statuses: AppointmentStatus[] = ["paid", "confirmed", "completed", "cancelled"];

      statuses.forEach((status) => {
        const appointment: Appointment = {
          userId: "user-123",
          proId: "pro-456",
          slotId: "slot-789",
          start: new Date("2024-01-15T10:00:00Z"),
          end: new Date("2024-01-15T11:00:00Z"),
          status,
          paid: status === "paid",
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        };

        expect(appointment.status).toBe(status);
        expect(appointment.paid).toBe(status === "paid");
      });
    });
  });

  describe("BookAppointmentRequest interface", () => {
    it("should create valid booking request objects", () => {
      const request: BookAppointmentRequest = {
        proId: "pro-456",
        slotId: "slot-789",
      };

      expect(request.proId).toBe("pro-456");
      expect(request.slotId).toBe("slot-789");
    });

    it("should handle different professional and slot IDs", () => {
      const requests: BookAppointmentRequest[] = [
        { proId: "pro-1", slotId: "slot-1" },
        { proId: "pro-abc", slotId: "slot-xyz" },
        { proId: "professional-123", slotId: "slot-456" },
      ];

      requests.forEach((request) => {
        expect(typeof request.proId).toBe("string");
        expect(typeof request.slotId).toBe("string");
        expect(request.proId.length).toBeGreaterThan(0);
        expect(request.slotId.length).toBeGreaterThan(0);
      });
    });
  });

  describe("BookAppointmentResponse interface", () => {
    it("should create successful booking response", () => {
      const response: BookAppointmentResponse = {
        success: true,
        appointmentId: "appointment-123",
      };

      expect(response.success).toBe(true);
      expect(response.appointmentId).toBe("appointment-123");
      expect(response.error).toBeUndefined();
    });

    it("should create failed booking response", () => {
      const response: BookAppointmentResponse = {
        success: false,
        error: "Slot not available",
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe("Slot not available");
      expect(response.appointmentId).toBeUndefined();
    });

    it("should handle different error messages", () => {
      const errorMessages = [
        "Slot not available",
        "Professional not found",
        "Invalid slot ID",
        "Booking failed",
      ];

      errorMessages.forEach((errorMessage) => {
        const response: BookAppointmentResponse = {
          success: false,
          error: errorMessage,
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe(errorMessage);
      });
    });
  });

  describe("SendEmailRequest interface", () => {
    it("should create valid email request objects", () => {
      const request: SendEmailRequest = {
        to: "user@example.com",
        subject: "Appointment Confirmation",
        html: "<p>Your appointment has been confirmed.</p>",
      };

      expect(request.to).toBe("user@example.com");
      expect(request.subject).toBe("Appointment Confirmation");
      expect(request.html).toBe("<p>Your appointment has been confirmed.</p>");
    });

    it("should handle different email formats", () => {
      const emails = [
        "user@example.com",
        "test.email+tag@domain.co.uk",
        "user123@subdomain.example.org",
        "admin@company.com",
      ];

      emails.forEach((email) => {
        const request: SendEmailRequest = {
          to: email,
          subject: "Test Subject",
          html: "<p>Test HTML</p>",
        };

        expect(request.to).toBe(email);
        expect(typeof request.to).toBe("string");
      });
    });

    it("should handle different HTML content", () => {
      const htmlContents = [
        "<p>Simple HTML</p>",
        "<html><body><h1>Complex HTML</h1><p>With multiple elements</p></body></html>",
        "<div>Plain div content</div>",
        "Plain text without HTML",
      ];

      htmlContents.forEach((html) => {
        const request: SendEmailRequest = {
          to: "test@example.com",
          subject: "Test Subject",
          html,
        };

        expect(request.html).toBe(html);
        expect(typeof request.html).toBe("string");
      });
    });
  });

  describe("SendEmailResponse interface", () => {
    it("should create successful email response", () => {
      const response: SendEmailResponse = {
        success: true,
        messageId: "msg-123456789",
      };

      expect(response.success).toBe(true);
      expect(response.messageId).toBe("msg-123456789");
      expect(response.error).toBeUndefined();
    });

    it("should create failed email response", () => {
      const response: SendEmailResponse = {
        success: false,
        error: "Invalid email address",
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe("Invalid email address");
      expect(response.messageId).toBeUndefined();
    });

    it("should handle different error scenarios", () => {
      const errorScenarios = [
        "Invalid email address",
        "Email service unavailable",
        "Rate limit exceeded",
        "Template not found",
      ];

      errorScenarios.forEach((errorMessage) => {
        const response: SendEmailResponse = {
          success: false,
          error: errorMessage,
        };

        expect(response.success).toBe(false);
        expect(response.error).toBe(errorMessage);
      });
    });
  });

  describe("Type compatibility", () => {
    it("should ensure AppointmentStatus is compatible with Appointment", () => {
      const appointment: Appointment = {
        userId: "user-1",
        proId: "pro-1",
        slotId: "slot-1",
        start: new Date(),
        end: new Date(),
        status: "confirmed" as AppointmentStatus,
        paid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(appointment.status).toBe("confirmed");
    });

    it("should ensure interfaces work together", () => {
      const bookingRequest: BookAppointmentRequest = {
        proId: "pro-1",
        slotId: "slot-1",
      };

      const bookingResponse: BookAppointmentResponse = {
        success: true,
        appointmentId: "appointment-1",
      };

      const emailRequest: SendEmailRequest = {
        to: "user@example.com",
        subject: "Appointment Booked",
        html: `<p>Your appointment with ${bookingRequest.proId} has been booked.</p>`,
      };

      expect(bookingResponse.success).toBe(true);
      expect(emailRequest.html).toContain(bookingRequest.proId);
    });
  });
});
