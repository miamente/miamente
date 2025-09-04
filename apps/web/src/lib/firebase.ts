import { getAnalytics, isSupported, type Analytics, logEvent } from "firebase/analytics";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID,
  } as const;

  app = getApps()[0] ?? initializeApp(config);
  const currentApp = app;

  if (typeof window !== "undefined") {
    // App Check - required
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? "";
    if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }

    // Analytics if supported
    isSupported().then((ok) => {
      if (ok && currentApp) {
        analytics = getAnalytics(currentApp);
      }
    });
  }

  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    const app = getFirebaseApp();
    firestore = getFirestore(app);
  }
  return firestore;
}

export function getFirebaseFunctions(): Functions {
  if (!functions) {
    const app = getFirebaseApp();
    functions = getFunctions(app);
  }
  return functions;
}

export function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!analytics) return;
  const typedParams = params as unknown as Parameters<typeof logEvent>[2];
  logEvent(analytics, eventName as Parameters<typeof logEvent>[1], typedParams);
}
