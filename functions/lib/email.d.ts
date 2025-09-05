import type { SendEmailResponse } from "./types";
/**
 * Send email using SendGrid
 */
export declare function sendEmailHandler(to: string, subject: string, html: string): Promise<SendEmailResponse>;
/**
 * Generate appointment confirmation email HTML
 */
export declare function generateConfirmationEmailHtml(appointmentDate: Date, jitsiUrl: string, professionalName?: string): string;
/**
 * Generate reminder email HTML
 */
export declare function generateReminderEmailHtml(appointmentDate: Date, jitsiUrl: string, hoursUntil: number, professionalName?: string): string;
/**
 * Generate post-session email HTML
 */
export declare function generatePostSessionEmailHtml(professionalName?: string): string;
//# sourceMappingURL=email.d.ts.map