import { httpsCallable } from "firebase/functions";

import type { BookAppointmentRequest, BookAppointmentResponse } from "./appointment-types";
import { getFirebaseFunctions } from "./firebase";

/**
 * Book an appointment by calling the Firebase Function
 */
export async function bookAppointment(
  proId: string,
  slotId: string,
): Promise<BookAppointmentResponse> {
  const functions = getFirebaseFunctions();
  const bookAppointmentFunction = httpsCallable<BookAppointmentRequest, BookAppointmentResponse>(
    functions,
    "bookAppointment",
  );

  try {
    const result = await bookAppointmentFunction({ proId, slotId });
    return result.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
}
