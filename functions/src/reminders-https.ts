import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import type { AppointmentData } from "./appointment-data";
import { sendEmailHandler } from "./email";
import { generateReminderEmailHtml, generatePostSessionEmailHtml } from "./email";
import { generateReminderSubject } from "./utils";

const db = admin.firestore();

/**
 * HTTPS function to run reminders with proper time windows and idempotency
 */
export async function runRemindersHandler(): Promise<{
  success: boolean;
  reminders24h: number;
  reminders1h: number;
  postSession: number;
  error?: string;
}> {
  try {
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Calculate time windows with ±5 minute tolerance
    const window24hStart = new Date(now.getTime() + 24 * 60 * 60 * 1000 - fiveMinutes);
    const window24hEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + fiveMinutes);
    const window1hStart = new Date(now.getTime() + 60 * 60 * 1000 - fiveMinutes);
    const window1hEnd = new Date(now.getTime() + 60 * 60 * 1000 + fiveMinutes);

    // Get appointments for 24h reminders (not yet sent)
    const appointments24h = await db
      .collection("appointments")
      .where("status", "in", ["paid", "confirmed"])
      .where("start", ">=", admin.firestore.Timestamp.fromDate(window24hStart))
      .where("start", "<=", admin.firestore.Timestamp.fromDate(window24hEnd))
      .where("sent24h", "!=", true)
      .get();

    // Get appointments for 1h reminders (not yet sent)
    const appointments1h = await db
      .collection("appointments")
      .where("status", "in", ["paid", "confirmed"])
      .where("start", ">=", admin.firestore.Timestamp.fromDate(window1hStart))
      .where("start", "<=", admin.firestore.Timestamp.fromDate(window1hEnd))
      .where("sent1h", "!=", true)
      .get();

    // Get completed appointments for post-session emails (last hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const completedAppointments = await db
      .collection("appointments")
      .where("status", "==", "completed")
      .where("end", ">=", admin.firestore.Timestamp.fromDate(oneHourAgo))
      .where("end", "<=", admin.firestore.Timestamp.fromDate(now))
      .get();

    let reminders24hSent = 0;
    let reminders1hSent = 0;
    let postSessionSent = 0;

    // Send 24h reminders
    for (const appointmentDoc of appointments24h.docs) {
      const appointment = appointmentDoc.data() as AppointmentData;
      const success = await sendReminderEmail(appointmentDoc.id, appointment, 24);
      if (success) {
        reminders24hSent++;
        // Mark as sent
        await appointmentDoc.ref.update({
          sent24h: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Log to event_log
        await logEvent("reminder_sent", {
          appointmentId: appointmentDoc.id,
          type: "24h",
          userId: appointment.userId,
          proId: appointment.proId,
        });
      }
    }

    // Send 1h reminders
    for (const appointmentDoc of appointments1h.docs) {
      const appointment = appointmentDoc.data() as AppointmentData;
      const success = await sendReminderEmail(appointmentDoc.id, appointment, 1);
      if (success) {
        reminders1hSent++;
        // Mark as sent
        await appointmentDoc.ref.update({
          sent1h: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Log to event_log
        await logEvent("reminder_sent", {
          appointmentId: appointmentDoc.id,
          type: "1h",
          userId: appointment.userId,
          proId: appointment.proId,
        });
      }
    }

    // Send post-session emails
    for (const appointmentDoc of completedAppointments.docs) {
      const appointment = appointmentDoc.data() as AppointmentData;
      const success = await sendPostSessionEmail(appointmentDoc.id, appointment);
      if (success) {
        postSessionSent++;
        // Log to event_log
        await logEvent("post_session_email_sent", {
          appointmentId: appointmentDoc.id,
          userId: appointment.userId,
          proId: appointment.proId,
        });
      }
    }

    functions.logger.info(
      `Reminders sent: ${reminders24hSent} 24h, ${reminders1hSent} 1h, ${postSessionSent} post-session`,
    );

    return {
      success: true,
      reminders24h: reminders24hSent,
      reminders1h: reminders1hSent,
      postSession: postSessionSent,
    };
  } catch (error) {
    functions.logger.error("Error in runRemindersHandler:", error);
    return {
      success: false,
      reminders24h: 0,
      reminders1h: 0,
      postSession: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Helper function to send reminder email
 */
async function sendReminderEmail(
  appointmentId: string,
  appointment: AppointmentData,
  hoursUntil: number,
): Promise<boolean> {
  try {
    if (!appointment.jitsiUrl) {
      functions.logger.error(`No Jitsi URL for appointment ${appointmentId}`);
      return false;
    }

    // Get user and professional data
    const [userDoc, proDoc] = await Promise.all([
      db.collection("users").doc(appointment.userId).get(),
      db.collection("professionals").doc(appointment.proId).get(),
    ]);

    const userData = userDoc.data();
    const proData = proDoc.data();

    if (!userData?.email) {
      functions.logger.error(`No email for user ${appointment.userId}`);
      return false;
    }

    const appointmentDate = appointment.start.toDate();
    const subject = generateReminderSubject(appointmentDate, hoursUntil);
    const html = generateReminderEmailHtml(
      appointmentDate,
      appointment.jitsiUrl,
      hoursUntil,
      proData?.fullName,
    );

    const result = await sendEmailHandler(userData.email, subject, html);

    if (result.success) {
      functions.logger.info(
        `Reminder email sent for appointment ${appointmentId} (${hoursUntil}h)`,
      );
      return true;
    } else {
      functions.logger.error(
        `Failed to send reminder email for appointment ${appointmentId}:`,
        result.error,
      );
      return false;
    }
  } catch (error) {
    functions.logger.error(`Error sending reminder email for appointment ${appointmentId}:`, error);
    return false;
  }
}

/**
 * Helper function to send post-session email
 */
async function sendPostSessionEmail(
  appointmentId: string,
  appointment: AppointmentData,
): Promise<boolean> {
  try {
    // Get user and professional data
    const [userDoc, proDoc] = await Promise.all([
      db.collection("users").doc(appointment.userId).get(),
      db.collection("professionals").doc(appointment.proId).get(),
    ]);

    const userData = userDoc.data();
    const proData = proDoc.data();

    if (!userData?.email) {
      functions.logger.error(`No email for user ${appointment.userId}`);
      return false;
    }

    const subject = "Gracias por tu sesión - Miamente";
    const html = generatePostSessionEmailHtml(proData?.fullName);

    const result = await sendEmailHandler(userData.email, subject, html);

    if (result.success) {
      functions.logger.info(`Post-session email sent for appointment ${appointmentId}`);
      return true;
    } else {
      functions.logger.error(
        `Failed to send post-session email for appointment ${appointmentId}:`,
        result.error,
      );
      return false;
    }
  } catch (error) {
    functions.logger.error(
      `Error sending post-session email for appointment ${appointmentId}:`,
      error,
    );
    return false;
  }
}

/**
 * Log event to event_log collection
 */
async function logEvent(eventType: string, data: Record<string, unknown>): Promise<void> {
  try {
    await db.collection("event_log").add({
      eventType,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: "reminders-https",
    });
  } catch (error) {
    functions.logger.error("Error logging event:", error);
  }
}
