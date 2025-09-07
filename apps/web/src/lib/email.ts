import { apiClient } from "./api";

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using the FastAPI backend
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResponse> {
  try {
    const response = await apiClient.post("/email/send", {
      to,
      subject,
      html,
    });
    return response as any;
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al enviar el email",
    };
  }
}
