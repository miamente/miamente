import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../api", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { sendEmail, type SendEmailRequest, type SendEmailResponse } from "../email";
import { apiClient } from "../api";

describe("email", () => {
  const mockEmailRequest: SendEmailRequest = {
    to: "test@example.com",
    subject: "Test Subject",
    html: "<p>Test HTML content</p>",
  };

  const mockEmailResponse: SendEmailResponse = {
    success: true,
    messageId: "msg-123456",
  };

  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      mockApiClient.post.mockResolvedValue(mockEmailResponse);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(mockApiClient.post).toHaveBeenCalledWith("/email/send", {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML content</p>",
      });
      expect(result).toEqual(mockEmailResponse);
    });

    it("should send email with different parameters", async () => {
      const customResponse = {
        success: true,
        messageId: "msg-custom-123",
      };
      mockApiClient.post.mockResolvedValue(customResponse);

      const result = await sendEmail("user@test.com", "Custom Subject", "<h1>Custom HTML</h1>");

      expect(mockApiClient.post).toHaveBeenCalledWith("/email/send", {
        to: "user@test.com",
        subject: "Custom Subject",
        html: "<h1>Custom HTML</h1>",
      });
      expect(result).toEqual(customResponse);
    });

    it("should handle API errors", async () => {
      const error = new Error("API Error");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "API Error",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", error);
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", error);
    });

    it("should handle server errors", async () => {
      const error = new Error("Server error");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Server error",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", error);
    });

    it("should handle non-Error exceptions", async () => {
      mockApiClient.post.mockRejectedValue("String error");

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Error al enviar el email",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", "String error");
    });

    it("should handle object errors", async () => {
      const errorObject = { message: "Object error", code: 500 };
      mockApiClient.post.mockRejectedValue(errorObject);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Error al enviar el email",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", errorObject);
    });

    it("should handle null/undefined errors", async () => {
      mockApiClient.post.mockRejectedValue(null);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Error al enviar el email",
      });
      expect(console.error).toHaveBeenCalledWith("Error sending email:", null);
    });

    it("should handle email validation errors", async () => {
      const error = new Error("Invalid email address");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail("invalid-email", "Subject", "HTML");

      expect(result).toEqual({
        success: false,
        error: "Invalid email address",
      });
    });

    it("should handle email service unavailable", async () => {
      const error = new Error("Email service unavailable");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Email service unavailable",
      });
    });

    it("should handle rate limiting errors", async () => {
      const error = new Error("Rate limit exceeded");
      mockApiClient.post.mockRejectedValue(error);

      const result = await sendEmail(
        mockEmailRequest.to,
        mockEmailRequest.subject,
        mockEmailRequest.html,
      );

      expect(result).toEqual({
        success: false,
        error: "Rate limit exceeded",
      });
    });
  });

  describe("error handling", () => {
    it("should handle different types of errors", async () => {
      const errors = [
        new Error("Network error"),
        new Error("Server error"),
        "String error",
        { message: "Object error" },
        null,
        undefined,
      ];

      for (const error of errors) {
        mockApiClient.post.mockRejectedValue(error);
        const result = await sendEmail("test@test.com", "Subject", "HTML");

        expect(result.success).toBe(false);
        if (error instanceof Error) {
          expect(result.error).toBe(error.message);
        } else {
          expect(result.error).toBe("Error al enviar el email");
        }
      }
    });

    it("should log errors to console", async () => {
      const error = new Error("Test error");
      mockApiClient.post.mockRejectedValue(error);

      await sendEmail("test@test.com", "Subject", "HTML");

      expect(console.error).toHaveBeenCalledWith("Error sending email:", error);
    });
  });

  describe("API integration", () => {
    it("should call correct API endpoint", async () => {
      mockApiClient.post.mockResolvedValue(mockEmailResponse);

      await sendEmail("test@test.com", "Subject", "HTML");

      expect(mockApiClient.post).toHaveBeenCalledWith("/email/send", {
        to: "test@test.com",
        subject: "Subject",
        html: "HTML",
      });
    });

    it("should handle API response format", async () => {
      const apiResponse = {
        success: true,
        messageId: "msg-123",
        error: undefined,
      };
      mockApiClient.post.mockResolvedValue(apiResponse);

      const result = await sendEmail("test@test.com", "Subject", "HTML");

      expect(result).toEqual(apiResponse);
    });

    it("should handle API response with error field", async () => {
      const apiResponse = {
        success: false,
        error: "Email service error",
      };
      mockApiClient.post.mockResolvedValue(apiResponse);

      const result = await sendEmail("test@test.com", "Subject", "HTML");

      expect(result).toEqual(apiResponse);
    });
  });
});
