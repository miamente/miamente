import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

/**
 * Cleanup job to release held slots that haven't been paid for within the timeout period
 * This runs every 5 minutes to check for held slots older than 15 minutes
 */
export async function cleanupHeldSlots(): Promise<void> {
  const HELD_TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(Date.now() - HELD_TIMEOUT_MINUTES * 60 * 1000);

  try {
    // Query for held slots older than the timeout
    const heldSlotsQuery = await db
      .collectionGroup("slots")
      .where("status", "==", "held")
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(timeoutDate))
      .limit(100) // Process in batches
      .get();

    if (heldSlotsQuery.empty) {
      functions.logger.info("No held slots to cleanup");
      return;
    }

    functions.logger.info(`Found ${heldSlotsQuery.docs.length} held slots to cleanup`);

    // Use batch to update multiple slots
    const batch = db.batch();
    let cleanupCount = 0;

    for (const slotDoc of heldSlotsQuery.docs) {
      // Check if there's a corresponding appointment that's been paid
      const appointmentQuery = await db
        .collection("appointments")
        .where("slotId", "==", slotDoc.id)
        .where("paid", "==", true)
        .limit(1)
        .get();

      // Only release the slot if there's no paid appointment
      if (appointmentQuery.empty) {
        batch.update(slotDoc.ref, {
          status: "free",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        cleanupCount++;

        // Also cancel any pending appointments for this slot
        const pendingAppointmentsQuery = await db
          .collection("appointments")
          .where("slotId", "==", slotDoc.id)
          .where("status", "==", "pending_payment")
          .get();

        for (const appointmentDoc of pendingAppointmentsQuery.docs) {
          batch.update(appointmentDoc.ref, {
            status: "cancelled",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    if (cleanupCount > 0) {
      await batch.commit();
      functions.logger.info(`Cleaned up ${cleanupCount} held slots`);
    }
  } catch (error) {
    functions.logger.error("Error in cleanup job:", error);
    throw error;
  }
}

/**
 * Manual cleanup function for testing or emergency use
 */
export async function manualCleanupHeldSlots(): Promise<{ cleaned: number }> {
  const HELD_TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(Date.now() - HELD_TIMEOUT_MINUTES * 60 * 1000);

  try {
    const heldSlotsQuery = await db
      .collectionGroup("slots")
      .where("status", "==", "held")
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(timeoutDate))
      .get();

    let cleaned = 0;

    for (const slotDoc of heldSlotsQuery.docs) {
      const appointmentQuery = await db
        .collection("appointments")
        .where("slotId", "==", slotDoc.id)
        .where("paid", "==", true)
        .limit(1)
        .get();

      if (appointmentQuery.empty) {
        await slotDoc.ref.update({
          status: "free",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        cleaned++;
      }
    }

    return { cleaned };
  } catch (error) {
    functions.logger.error("Error in manual cleanup:", error);
    throw error;
  }
}
