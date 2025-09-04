import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import type { BookAppointmentResponse, Appointment } from "./types";

const db = admin.firestore();

export async function bookAppointmentHandler(
  userId: string,
  proId: string,
  slotId: string,
): Promise<BookAppointmentResponse> {
  const slotRef = db.collection("availability").doc(proId).collection("slots").doc(slotId);
  const appointmentsRef = db.collection("appointments");

  try {
    // Use transaction to ensure atomicity
    const result = await db.runTransaction(async (transaction) => {
      // Read the slot
      const slotDoc = await transaction.get(slotRef);

      if (!slotDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Slot not found");
      }

      const slotData = slotDoc.data();

      if (!slotData) {
        throw new functions.https.HttpsError("not-found", "Slot data not found");
      }

      // Check if slot is still free
      if (slotData.status !== "free") {
        throw new functions.https.HttpsError("failed-precondition", "Slot is no longer available");
      }

      // Check if user already has an appointment for this slot (idempotency)
      const existingAppointmentQuery = await transaction.get(
        appointmentsRef
          .where("userId", "==", userId)
          .where("proId", "==", proId)
          .where("slotId", "==", slotId)
          .limit(1),
      );

      if (!existingAppointmentQuery.empty) {
        const existingAppointment = existingAppointmentQuery.docs[0];
        return {
          success: true,
          appointmentId: existingAppointment.id,
        };
      }

      // Update slot status to "held"
      transaction.update(slotRef, {
        status: "held",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create appointment
      const appointmentData: Omit<Appointment, "createdAt" | "updatedAt"> = {
        userId,
        proId,
        slotId,
        start: slotData.start,
        end: slotData.end,
        status: "pending_payment",
        paid: false,
      };

      const appointmentRef = appointmentsRef.doc();
      transaction.set(appointmentRef, {
        ...appointmentData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        appointmentId: appointmentRef.id,
      };
    });

    return result;
  } catch (error) {
    functions.logger.error("Error booking appointment:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError("internal", "Failed to book appointment");
  }
}

export async function getAppointment(appointmentId: string): Promise<Appointment | null> {
  try {
    const appointmentDoc = await db.collection("appointments").doc(appointmentId).get();

    if (!appointmentDoc.exists) {
      return null;
    }

    const data = appointmentDoc.data();
    if (!data) {
      return null;
    }

    return {
      userId: data.userId,
      proId: data.proId,
      slotId: data.slotId,
      start: data.start.toDate(),
      end: data.end.toDate(),
      status: data.status,
      paid: data.paid,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    functions.logger.error("Error getting appointment:", error);
    return null;
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment["status"],
  paid?: boolean,
): Promise<void> {
  try {
    const appointmentRef = db.collection("appointments").doc(appointmentId);

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (paid !== undefined) {
      updateData.paid = paid;
    }

    await appointmentRef.update(updateData);
  } catch (error) {
    functions.logger.error("Error updating appointment status:", error);
    throw new functions.https.HttpsError("internal", "Failed to update appointment status");
  }
}
