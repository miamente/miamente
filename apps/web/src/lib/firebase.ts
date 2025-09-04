import { getAnalytics, isSupported, type Analytics, logEvent } from "firebase/analytics";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  } as const;
  app = getApps()[0] ?? initializeApp(config);
  const currentApp = app;

  if (typeof window !== "undefined") {
    // App Check - required
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? "";
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });

    // Analytics if supported
    isSupported().then((ok) => {
      if (ok && currentApp) {
        analytics = getAnalytics(currentApp);
      }
    });
  }
  return app;
}

export function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!analytics) return;
  const typedParams = params as unknown as Parameters<typeof logEvent>[2];
  logEvent(analytics, eventName as Parameters<typeof logEvent>[1], typedParams);
}
