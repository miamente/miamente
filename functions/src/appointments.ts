import "./firebase-admin"; // Initialize Firebase Admin first
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();

interface BookAppointmentRequest {
  proId: string;
  slotId: string;
}

interface BookAppointmentResponse {
  appointmentId: string;
}

/**
 * Book an appointment with transaction handling to prevent double booking
 */
export const bookAppointment = onCall<BookAppointmentRequest, Promise<BookAppointmentResponse>>(
  { region: "us-central1" },
  async (request) => {
    const { proId, slotId } = request.data;
    const { auth } = request;

    // Verify authentication
    if (!auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated to book appointments");
    }

    const userId = auth.uid;

    // Validate input
    if (!proId || !slotId) {
      throw new HttpsError("invalid-argument", "proId and slotId are required");
    }

    try {
      // Use transaction to ensure atomicity
      const result = await db.runTransaction(async (transaction) => {
        // Get the slot document
        const slotRef = db.collection("availability").doc(slotId);
        const slotDoc = await transaction.get(slotRef);

        if (!slotDoc.exists) {
          throw new HttpsError("not-found", "Slot not found");
        }

        const slotData = slotDoc.data();

        // Verify the slot belongs to the specified professional
        if (slotData?.professionalId !== proId) {
          throw new HttpsError(
            "invalid-argument",
            "Slot does not belong to the specified professional",
          );
        }

        // Check if slot is available
        if (slotData?.status !== "free") {
          throw new HttpsError("failed-precondition", "Slot is no longer available");
        }

        // Get professional data to get rate
        const proRef = db.collection("professionals").doc(proId);
        const proDoc = await transaction.get(proRef);

        if (!proDoc.exists) {
          throw new HttpsError("not-found", "Professional not found");
        }

        const proData = proDoc.data();
        const rateCents = proData?.rateCents;

        if (!rateCents || rateCents <= 0) {
          throw new HttpsError("invalid-argument", "Professional rate not configured");
        }

        // Update slot status to "held"
        transaction.update(slotRef, {
          status: "held",
          heldBy: userId,
          heldAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Create appointment document
        const appointmentRef = db.collection("appointments").doc();
        const appointmentData = {
          id: appointmentRef.id,
          userId,
          professionalId: proId,
          slotId,
          status: "pending_payment",
          paid: false,
          payment: {
            provider: "mock", // Mock payment provider for now
            amountCents: rateCents,
            currency: "COP",
            status: "pending",
          },
          slot: {
            date: slotData.date,
            time: slotData.time,
            duration: slotData.duration,
            timezone: slotData.timezone || "America/Bogota",
          },
          professional: {
            id: proId,
            fullName: proData.fullName,
            specialty: proData.specialty,
            rateCents: rateCents,
          },
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        transaction.set(appointmentRef, appointmentData);

        return {
          appointmentId: appointmentRef.id,
          slotData,
          proData,
          appointmentData,
        };
      });

      // Log successful booking
      console.log(`Appointment booked successfully: ${result.appointmentId} for user ${userId}`);

      return {
        appointmentId: result.appointmentId,
      };
    } catch (error) {
      console.error("Error booking appointment:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      // Handle specific error cases
      if (error instanceof Error && error.message.includes("failed-precondition")) {
        throw new HttpsError(
          "failed-precondition",
          "Slot is no longer available. Another user may have booked it.",
        );
      }

      throw new HttpsError("internal", "Failed to book appointment. Please try again.");
    }
  },
);

/**
 * Get appointment details by ID
 */
export const getAppointment = onCall<{ appointmentId: string }, Promise<any>>(
  { region: "us-central1" },
  async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;

    // Verify authentication
    if (!auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const userId = auth.uid;

    if (!appointmentId) {
      throw new HttpsError("invalid-argument", "appointmentId is required");
    }

    try {
      const appointmentRef = db.collection("appointments").doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();

      if (!appointmentDoc.exists) {
        throw new HttpsError("not-found", "Appointment not found");
      }

      const appointmentData = appointmentDoc.data();

      // Verify user owns this appointment
      if (appointmentData?.userId !== userId) {
        throw new HttpsError("permission-denied", "You can only view your own appointments");
      }

      return appointmentData;
    } catch (error) {
      console.error("Error getting appointment:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to get appointment details");
    }
  },
);

/**
 * Cancel an appointment (only if not paid)
 */
export const cancelAppointment = onCall<{ appointmentId: string }, Promise<void>>(
  { region: "us-central1" },
  async (request) => {
    const { appointmentId } = request.data;
    const { auth } = request;

    // Verify authentication
    if (!auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    const userId = auth.uid;

    if (!appointmentId) {
      throw new HttpsError("invalid-argument", "appointmentId is required");
    }

    try {
      await db.runTransaction(async (transaction) => {
        const appointmentRef = db.collection("appointments").doc(appointmentId);
        const appointmentDoc = await transaction.get(appointmentRef);

        if (!appointmentDoc.exists) {
          throw new HttpsError("not-found", "Appointment not found");
        }

        const appointmentData = appointmentDoc.data();

        // Verify user owns this appointment
        if (appointmentData?.userId !== userId) {
          throw new HttpsError("permission-denied", "You can only cancel your own appointments");
        }

        // Only allow cancellation if not paid
        if (appointmentData?.paid === true) {
          throw new HttpsError("failed-precondition", "Cannot cancel paid appointments");
        }

        // Update appointment status
        transaction.update(appointmentRef, {
          status: "cancelled",
          cancelledAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Release the slot
        if (appointmentData?.slotId) {
          const slotRef = db.collection("availability").doc(appointmentData.slotId);
          transaction.update(slotRef, {
            status: "free",
            heldBy: FieldValue.delete(),
            heldAt: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

      console.log(`Appointment cancelled: ${appointmentId} by user ${userId}`);
    } catch (error) {
      console.error("Error cancelling appointment:", error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", "Failed to cancel appointment");
    }
  },
);
