import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { bookAppointment, getAppointment, cancelAppointment } from "./appointments";
import { mockApprovePayment } from "./mock-payment";
import { cleanupHeldSlots } from "./cleanup";
import { sendEmailHandler } from "./email";
import { sendReminderEmails, sendPostSessionEmails } from "./reminders";
import { runRemindersHandler } from "./reminders-https";
import type { SendEmailRequest } from "./types";

admin.initializeApp();

export const sendEmail = functions
  .region("us-central1")
  .https.onCall(async (data: SendEmailRequest, context) => {
    if (!context.app) {
      throw new functions.https.HttpsError("failed-precondition", "App Check required");
    }

    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Auth required");
    }

    const { to, subject, html } = data;

    if (!to || !subject || !html) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "to, subject, and html are required",
      );
    }

    return await sendEmailHandler(to, subject, html);
  });

// Export the new appointment functions
export { bookAppointment, getAppointment, cancelAppointment };

// Export mock payment function
export { mockApprovePayment };

export const wompiWebhook = functions.region("us-central1").https.onRequest(async (req, res) => {
  res.status(200).send("ok");
});

export const runReminders = functions
  .region("us-central1")
  .pubsub.schedule("every 1 hours")
  .onRun(async () => {
    await sendReminderEmails();
    await sendPostSessionEmails();
    return null;
  });

// Cleanup job to release held slots without payment
export const cleanupHeldSlotsJob = functions
  .region("us-central1")
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
    await cleanupHeldSlots();
    return null;
  });

// HTTPS function for running reminders (called by GitHub Actions)
export const runRemindersHttps = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    // Only allow GET requests
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // Verify authorization token
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.REMINDERS_AUTH_TOKEN;

    if (!expectedToken) {
      functions.logger.error("REMINDERS_AUTH_TOKEN not configured");
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      functions.logger.warn("Unauthorized reminder request");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await runRemindersHandler();
      res.status(200).json(result);
    } catch (error) {
      functions.logger.error("Error in runReminders HTTPS function:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
