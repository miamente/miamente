import "./firebase-admin"; // Initialize Firebase Admin first
import * as admin from "firebase-admin";
import { logger } from "firebase-functions/v2";

import type { AppointmentData } from "./appointment-data";
import { sendEmailHandler } from "./email";
import {
  generateConfirmationEmailHtml,
  generateReminderEmailHtml,
  generatePostSessionEmailHtml,
} from "./email";
import { generateConfirmationSubject, generateReminderSubject } from "./utils";

const db = admin.firestore();

/**
 * Send appointment confirmation email when payment is confirmed
 */
export async function sendConfirmationEmail(appointmentId: string): Promise<void> {
  try {
    const appointment = await getAppointment(appointmentId);
    if (!appointment) {
      logger.error(`Appointment ${appointmentId} not found`);
      return;
    }

    // Get user and professional data
    const [userDoc, proDoc] = await Promise.all([
      db.collection("users").doc(appointment.userId).get(),
      db.collection("professionals").doc(appointment.proId).get(),
    ]);

    const userData = userDoc.data();
    const proData = proDoc.data();

    const appointmentData = appointment as unknown as AppointmentData;

    if (!userData?.email || !appointmentData.jitsiUrl) {
      logger.error(`Missing email or Jitsi URL for appointment ${appointmentId}`);
      return;
    }

    const subject = generateConfirmationSubject(appointmentData.start.toDate());
    const html = generateConfirmationEmailHtml(
      appointmentData.start.toDate(),
      appointmentData.jitsiUrl,
      proData?.fullName,
    );

    const result = await sendEmailHandler(userData.email, subject, html);

    if (result.success) {
      logger.info(`Confirmation email sent for appointment ${appointmentId}`);
    } else {
      logger.error(
        `Failed to send confirmation email for appointment ${appointmentId}:`,
        result.error,
      );
    }
  } catch (error) {
    logger.error(
      `Error sending confirmation email for appointment ${appointmentId}:`,
      error,
    );
  }
}

/**
 * Send reminder emails (24h and 1h before appointment)
 */
export async function sendReminderEmails(): Promise<void> {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    // Get appointments that need 24h reminders
    const appointments24h = await db
      .collection("appointments")
      .where("status", "in", ["paid", "confirmed"])
      .where("start", ">=", now)
      .where("start", "<=", twentyFourHoursFromNow)
      .get();

    // Get appointments that need 1h reminders
    const appointments1h = await db
      .collection("appointments")
      .where("status", "in", ["paid", "confirmed"])
      .where("start", ">=", now)
      .where("start", "<=", oneHourFromNow)
      .get();

    // Send 24h reminders
    for (const appointmentDoc of appointments24h.docs) {
      const appointment = appointmentDoc.data();
      await sendReminderEmail(appointmentDoc.id, appointment, 24);
    }

    // Send 1h reminders
    for (const appointmentDoc of appointments1h.docs) {
      const appointment = appointmentDoc.data();
      await sendReminderEmail(appointmentDoc.id, appointment, 1);
    }

    logger.info(
      `Sent ${appointments24h.docs.length} 24h reminders and ${appointments1h.docs.length} 1h reminders`,
    );
  } catch (error) {
    logger.error("Error sending reminder emails:", error);
  }
}

/**
 * Send post-session email after appointment completion
 */
export async function sendPostSessionEmails(): Promise<void> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Get completed appointments from the last hour
    const completedAppointments = await db
      .collection("appointments")
      .where("status", "==", "completed")
      .where("end", ">=", oneHourAgo)
      .where("end", "<=", now)
      .get();

    for (const appointmentDoc of completedAppointments.docs) {
      const appointment = appointmentDoc.data();
      await sendPostSessionEmail(appointmentDoc.id, appointment);
    }

    logger.info(`Sent ${completedAppointments.docs.length} post-session emails`);
  } catch (error) {
    logger.error("Error sending post-session emails:", error);
  }
}

/**
 * Helper function to send reminder email
 */
async function sendReminderEmail(
  appointmentId: string,
  appointment: Record<string, unknown>,
  hoursUntil: number,
): Promise<void> {
  try {
    const appointmentData = appointment as unknown as AppointmentData;

    if (!appointmentData.jitsiUrl) {
      logger.error(`No Jitsi URL for appointment ${appointmentId}`);
      return;
    }

    // Get user and professional data
    const [userDoc, proDoc] = await Promise.all([
      db.collection("users").doc(appointmentData.userId).get(),
      db.collection("professionals").doc(appointmentData.proId).get(),
    ]);

    const userData = userDoc.data();
    const proData = proDoc.data();

    if (!userData?.email) {
      logger.error(`No email for user ${appointmentData.userId}`);
      return;
    }

    const appointmentDate = appointmentData.start.toDate();
    const subject = generateReminderSubject(appointmentDate, hoursUntil);
    const html = generateReminderEmailHtml(
      appointmentDate,
      appointmentData.jitsiUrl,
      hoursUntil,
      proData?.fullName,
    );

    const result = await sendEmailHandler(userData.email, subject, html);

    if (result.success) {
      logger.info(
        `Reminder email sent for appointment ${appointmentId} (${hoursUntil}h)`,
      );
    } else {
      logger.error(
        `Failed to send reminder email for appointment ${appointmentId}:`,
        result.error,
      );
    }
  } catch (error) {
    logger.error(`Error sending reminder email for appointment ${appointmentId}:`, error);
  }
}

/**
 * Helper function to send post-session email
 */
async function sendPostSessionEmail(
  appointmentId: string,
  appointment: Record<string, unknown>,
): Promise<void> {
  try {
    const appointmentData = appointment as unknown as AppointmentData;

    // Get user and professional data
    const [userDoc, proDoc] = await Promise.all([
      db.collection("users").doc(appointmentData.userId).get(),
      db.collection("professionals").doc(appointmentData.proId).get(),
    ]);

    const userData = userDoc.data();
    const proData = proDoc.data();

    if (!userData?.email) {
      logger.error(`No email for user ${appointmentData.userId}`);
      return;
    }

    const subject = "Gracias por tu sesión - Miamente";
    const html = generatePostSessionEmailHtml(proData?.fullName);

    const result = await sendEmailHandler(userData.email, subject, html);

    if (result.success) {
      logger.info(`Post-session email sent for appointment ${appointmentId}`);
    } else {
      logger.error(
        `Failed to send post-session email for appointment ${appointmentId}:`,
        result.error,
      );
    }
  } catch (error) {
    logger.error(
      `Error sending post-session email for appointment ${appointmentId}:`,
      error,
    );
  }
}

/**
 * Helper function to get appointment data
 */
async function getAppointment(appointmentId: string): Promise<AppointmentData | null> {
  const appointmentDoc = await db.collection("appointments").doc(appointmentId).get();
  return appointmentDoc.exists ? (appointmentDoc.data() as AppointmentData) : null;
}
