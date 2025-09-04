import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { bookAppointmentHandler } from "./appointments";
import { cleanupHeldSlots } from "./cleanup";
import type { BookAppointmentRequest, BookAppointmentResponse } from "./types";

admin.initializeApp();

export const sendEmail = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.app) {
    throw new functions.https.HttpsError("failed-precondition", "App Check required");
  }
  return { ok: true };
});

export const bookAppointment = functions
  .region("us-central1")
  .https.onCall<BookAppointmentRequest, BookAppointmentResponse>(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Auth required");
    }

    if (!context.app) {
      throw new functions.https.HttpsError("failed-precondition", "App Check required");
    }

    const { proId, slotId } = data;
    const userId = context.auth.uid;

    if (!proId || !slotId) {
      throw new functions.https.HttpsError("invalid-argument", "proId and slotId are required");
    }

    return await bookAppointmentHandler(userId, proId, slotId);
  });

export const wompiWebhook = functions.region("us-central1").https.onRequest(async (req, res) => {
  res.status(200).send("ok");
});

export const runReminders = functions
  .region("us-central1")
  .pubsub.schedule("every 1 hours")
  .onRun(async () => {
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
