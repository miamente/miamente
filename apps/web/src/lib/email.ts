import { httpsCallable } from "firebase/functions";

import type { SendEmailRequest, SendEmailResponse } from "./appointment-types";
import { getFirebaseFunctions } from "./firebase";

/**
 * Send email using the Firebase Function
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResponse> {
  const functions = getFirebaseFunctions();
  const sendEmailFunction = httpsCallable<SendEmailRequest, SendEmailResponse>(
    functions,
    "sendEmail",
  );

  try {
    const result = await sendEmailFunction({ to, subject, html });
    return result.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
