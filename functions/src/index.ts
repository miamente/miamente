import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const sendEmail = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.app) {
    throw new functions.https.HttpsError("failed-precondition", "App Check required");
  }
  return { ok: true };
});

export const bookAppointment = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Auth required");
    }
    return { ok: true };
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
