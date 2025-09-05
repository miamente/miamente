import "./firebase-admin";
/**
 * Send appointment confirmation email when payment is confirmed
 */
export declare function sendConfirmationEmail(appointmentId: string): Promise<void>;
/**
 * Send reminder emails (24h and 1h before appointment)
 */
export declare function sendReminderEmails(): Promise<void>;
/**
 * Send post-session email after appointment completion
 */
export declare function sendPostSessionEmails(): Promise<void>;
//# sourceMappingURL=reminders.d.ts.map