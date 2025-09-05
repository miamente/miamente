/**
 * Utility functions for the Miamente platform
 */
/**
 * Generate Jitsi Meet URL for an appointment
 * @param appointmentId - The appointment ID
 * @param baseUrl - Optional base URL (defaults to https://meet.jit.si)
 * @returns Jitsi Meet URL
 */
export declare function createJitsiUrl(appointmentId: string, baseUrl?: string): string;
/**
 * Generate a secure room name for Jitsi
 * @param appointmentId - The appointment ID
 * @returns Secure room name
 */
export declare function generateJitsiRoomName(appointmentId: string): string;
/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Format date for email display in Bogotá timezone
 * @param date - Date to format
 * @returns Formatted date string
 */
export declare function formatEmailDate(date: Date): string;
/**
 * Generate appointment confirmation email subject
 * @param appointmentDate - Date of the appointment
 * @returns Email subject
 */
export declare function generateConfirmationSubject(appointmentDate: Date): string;
/**
 * Generate reminder email subject
 * @param appointmentDate - Date of the appointment
 * @param hoursUntil - Hours until appointment
 * @returns Email subject
 */
export declare function generateReminderSubject(appointmentDate: Date, hoursUntil: number): string;
//# sourceMappingURL=utils.d.ts.map