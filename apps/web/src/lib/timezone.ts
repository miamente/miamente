/**
 * Timezone utilities for handling UTC storage and America/Bogotá display
 */

export const BOGOTA_TIMEZONE = "America/Bogota";

/**
 * Convert UTC date to Bogotá timezone for display
 */
export function utcToBogota(utcDate: Date): Date {
  return new Date(utcDate.toLocaleString("en-US", { timeZone: BOGOTA_TIMEZONE }));
}

/**
 * Convert Bogotá timezone date to UTC for storage
 */
export function bogotaToUtc(bogotaDate: Date): Date {
  // Create a date in Bogotá timezone and get the UTC equivalent
  const bogotaTime = new Date(bogotaDate.toLocaleString("en-US", { timeZone: BOGOTA_TIMEZONE }));
  const utcTime = new Date(bogotaDate.getTime() - (bogotaTime.getTime() - bogotaDate.getTime()));
  return utcTime;
}

/**
 * Format date for display in Bogotá timezone
 */
export function formatBogotaDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleString("es-CO", {
    timeZone: BOGOTA_TIMEZONE,
    ...options,
  });
}

/**
 * Format time for display in Bogotá timezone
 */
export function formatBogotaTime(date: Date): string {
  return formatBogotaDate(date, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Format date and time for display in Bogotá timezone
 */
export function formatBogotaDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return formatBogotaDate(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });
}

/**
 * Get current date/time in Bogotá timezone
 */
export function getBogotaNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: BOGOTA_TIMEZONE }));
}

/**
 * Create a date in Bogotá timezone from components
 */
export function createBogotaDate(
  year: number,
  month: number, // 0-based
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
): Date {
  const bogotaDate = new Date(year, month, day, hour, minute, second);
  return bogotaToUtc(bogotaDate);
}

/**
 * Parse time string (HH:MM) and return minutes since midnight
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
