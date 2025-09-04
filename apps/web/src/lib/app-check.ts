import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

import { getFirebaseApp } from "./firebase";

/**
 * Initialize Firebase App Check with reCAPTCHA Enterprise
 */
export function initializeAppCheckWithRecaptcha() {
  const app = getFirebaseApp();

  // Get the reCAPTCHA Enterprise site key from environment variables
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY not found. App Check will not be initialized.");
    return;
  }

  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });

    console.log("App Check initialized with reCAPTCHA Enterprise");
    return appCheck;
  } catch (error) {
    console.error("Failed to initialize App Check:", error);
    throw error;
  }
}

/**
 * Get App Check token for server-side verification
 */
export async function getAppCheckToken(): Promise<string | null> {
  try {
    const { getToken } = await import("firebase/app-check");
    const appCheck = initializeAppCheckWithRecaptcha();

    if (!appCheck) {
      return null;
    }

    const token = await getToken(appCheck);
    return token.token;
  } catch (error) {
    console.error("Failed to get App Check token:", error);
    return null;
  }
}

/**
 * Verify App Check token on the client side
 */
export async function verifyAppCheckToken(): Promise<boolean> {
  try {
    const token = await getAppCheckToken();
    return token !== null;
  } catch (error) {
    console.error("App Check token verification failed:", error);
    return false;
  }
}
