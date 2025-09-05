"use strict";
/**
 * Utility functions for the Miamente platform
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJitsiUrl = createJitsiUrl;
exports.generateJitsiRoomName = generateJitsiRoomName;
exports.isValidEmail = isValidEmail;
exports.formatEmailDate = formatEmailDate;
exports.generateConfirmationSubject = generateConfirmationSubject;
exports.generateReminderSubject = generateReminderSubject;
/**
 * Generate Jitsi Meet URL for an appointment
 * @param appointmentId - The appointment ID
 * @param baseUrl - Optional base URL (defaults to https://meet.jit.si)
 * @returns Jitsi Meet URL
 */
function createJitsiUrl(appointmentId, baseUrl) {
  const jitsiBase = baseUrl || process.env.JITSI_BASE_URL || "https://meet.jit.si";
  const roomName = `miamente-${appointmentId}`;
  return `${jitsiBase}/${roomName}`;
}
/**
 * Generate a secure room name for Jitsi
 * @param appointmentId - The appointment ID
 * @returns Secure room name
 */
function generateJitsiRoomName(appointmentId) {
  // Use appointment ID with prefix for easy identification
  return `miamente-${appointmentId}`;
}
/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
/**
 * Format date for email display in Bogotá timezone
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatEmailDate(date) {
  return date.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
/**
 * Generate appointment confirmation email subject
 * @param appointmentDate - Date of the appointment
 * @returns Email subject
 */
function generateConfirmationSubject(appointmentDate) {
  const formattedDate = formatEmailDate(appointmentDate);
  return `Confirmación de cita - ${formattedDate}`;
}
/**
 * Generate reminder email subject
 * @param appointmentDate - Date of the appointment
 * @param hoursUntil - Hours until appointment
 * @returns Email subject
 */
function generateReminderSubject(appointmentDate, hoursUntil) {
  const formattedDate = formatEmailDate(appointmentDate);
  if (hoursUntil === 24) {
    return `Recordatorio: Tu cita es mañana - ${formattedDate}`;
  } else if (hoursUntil === 1) {
    return `Recordatorio: Tu cita es en 1 hora - ${formattedDate}`;
  }
  return `Recordatorio: Tu cita es en ${hoursUntil} horas - ${formattedDate}`;
}
