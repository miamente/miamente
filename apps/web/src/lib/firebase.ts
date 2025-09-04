import { getAnalytics, isSupported, type Analytics, logEvent } from "firebase/analytics";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, type Functions, connectFunctionsEmulator } from "firebase/functions";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

// Track emulator connections to avoid multiple connections
let emulatorsConnected = {
  auth: false,
  firestore: false,
  functions: false,
};

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  // Check if we're in development mode without proper Firebase config
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasValidConfig = process.env.NEXT_PUBLIC_FB_API_KEY && 
                        process.env.NEXT_PUBLIC_FB_PROJECT_ID;

  if (isDevelopment && !hasValidConfig) {
    console.warn('Firebase configuration not found. Running in development mode with mock values.');
  }

  // Development configuration for emulators
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FB_API_KEY || "demo-key",
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN || "demo-miamente.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID || "demo-miamente",
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET || "demo-miamente.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID || "123456789012",
    appId: process.env.NEXT_PUBLIC_FB_APP_ID || "1:123456789012:web:abcdef1234567890",
    measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID || "G-XXXXXXXXXX",
  } as const;

  app = getApps()[0] ?? initializeApp(config);
  const currentApp = app;

  if (typeof window !== "undefined") {
    // App Check - only initialize in production with valid site key
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ?? "";
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction && siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('App Check initialized for production');
    } else {
      console.log('App Check disabled for development mode');
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
    
    // Connect to emulator in development
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
                         window.location.hostname === 'localhost';
    
    if (isDevelopment && !emulatorsConnected.auth) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099");
        emulatorsConnected.auth = true;
        console.log('✅ Connected to Auth emulator at http://localhost:9099');
      } catch (error) {
        console.log('⚠️ Auth emulator already connected or not available:', error.message);
      }
    }
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    const app = getFirebaseApp();
    firestore = getFirestore(app);
    
    // Connect to emulator in development
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
                         window.location.hostname === 'localhost';
    
    if (isDevelopment && !emulatorsConnected.firestore) {
      try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        emulatorsConnected.firestore = true;
        console.log('✅ Connected to Firestore emulator at localhost:8080');
      } catch (error) {
        console.log('⚠️ Firestore emulator already connected or not available:', error.message);
      }
    }
  }
  return firestore;
}

export function getFirebaseFunctions(): Functions {
  if (!functions) {
    const app = getFirebaseApp();
    functions = getFunctions(app);
    
    // Connect to emulator in development
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
                         window.location.hostname === 'localhost';
    
    if (isDevelopment && !emulatorsConnected.functions) {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
        emulatorsConnected.functions = true;
        console.log('✅ Connected to Functions emulator at localhost:5001');
      } catch (error) {
        console.log('⚠️ Functions emulator already connected or not available:', error.message);
      }
    }
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
