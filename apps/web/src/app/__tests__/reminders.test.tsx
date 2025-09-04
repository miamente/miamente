import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
// Reminder tests don't need availability or timezone imports

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ proId: "test-pro-id" }),
}));

let testEnv: RulesTestEnvironment;
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;

describe("Reminder System Tests", () => {
  beforeEach(async () => {
    // Initialize test environment with emulator
    testEnv = await initializeTestEnvironment({
      projectId: "demo-miamente",
      firestore: {
        host: "localhost",
        port: 8080,
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              function isSignedIn() { return request.auth != null; }
              function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
              
              match /appointments/{appointmentId} {
                allow read, write: if isSignedIn();
              }
              
              match /event_log/{logId} {
                allow read, write: if isSignedIn();
              }
            }
          }
        `,
      },
    });

    // Initialize Firebase app
    app = initializeApp({
      projectId: "demo-miamente",
      apiKey: "test-api-key",
      authDomain: "demo-miamente.firebaseapp.com",
    });

    auth = getAuth(app);
    firestore = getFirestore(app);

    // Connect to emulators
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(firestore, "localhost", 8080);
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe("Idempotency Tests", () => {
    it("should not send duplicate 24h reminders", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create an appointment 24 hours from now
      const appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const appointmentRef = doc(firestore, "appointments");

      await setDoc(appointmentRef, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot",
        start: appointmentTime,
        end: new Date(appointmentTime.getTime() + 60 * 60 * 1000),
        status: "paid",
        paid: true,
        jitsiUrl: "https://meet.jit.si/miamente-test",
        sent24h: false,
        sent1h: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate first reminder run
      const appointmentsQuery = query(
        collection(firestore, "appointments"),
        where("status", "in", ["paid", "confirmed"]),
        where("sent24h", "!=", true),
      );

      const firstRun = await getDocs(appointmentsQuery);
      expect(firstRun.docs.length).toBe(1);

      // Mark as sent
      await appointmentRef.update({ sent24h: true });

      // Simulate second reminder run
      const secondRun = await getDocs(appointmentsQuery);
      expect(secondRun.docs.length).toBe(0);
    });

    it("should not send duplicate 1h reminders", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create an appointment 1 hour from now
      const appointmentTime = new Date(Date.now() + 60 * 60 * 1000);
      const appointmentRef = doc(firestore, "appointments");

      await setDoc(appointmentRef, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot",
        start: appointmentTime,
        end: new Date(appointmentTime.getTime() + 60 * 60 * 1000),
        status: "paid",
        paid: true,
        jitsiUrl: "https://meet.jit.si/miamente-test",
        sent24h: false,
        sent1h: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate first reminder run
      const appointmentsQuery = query(
        collection(firestore, "appointments"),
        where("status", "in", ["paid", "confirmed"]),
        where("sent1h", "!=", true),
      );

      const firstRun = await getDocs(appointmentsQuery);
      expect(firstRun.docs.length).toBe(1);

      // Mark as sent
      await appointmentRef.update({ sent1h: true });

      // Simulate second reminder run
      const secondRun = await getDocs(appointmentsQuery);
      expect(secondRun.docs.length).toBe(0);
    });
  });

  describe("Event Logging Tests", () => {
    it("should log reminder events to event_log collection", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Create an appointment
      const appointmentTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const appointmentRef = doc(firestore, "appointments");

      await setDoc(appointmentRef, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot",
        start: appointmentTime,
        end: new Date(appointmentTime.getTime() + 60 * 60 * 1000),
        status: "paid",
        paid: true,
        jitsiUrl: "https://meet.jit.si/miamente-test",
        sent24h: false,
        sent1h: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate logging a reminder event
      await setDoc(doc(firestore, "event_log"), {
        eventType: "reminder_sent",
        data: {
          appointmentId: appointmentRef.id,
          type: "24h",
          userId: user.user.uid,
          proId: pro.user.uid,
        },
        timestamp: new Date(),
        source: "reminders-https",
      });

      // Verify the event was logged
      const eventLogQuery = query(
        collection(firestore, "event_log"),
        where("eventType", "==", "reminder_sent"),
      );

      const eventLogDocs = await getDocs(eventLogQuery);
      expect(eventLogDocs.docs.length).toBe(1);

      const eventData = eventLogDocs.docs[0].data();
      expect(eventData.data.type).toBe("24h");
      expect(eventData.data.userId).toBe(user.user.uid);
      expect(eventData.source).toBe("reminders-https");
    });

    it("should log post-session email events", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      // Simulate logging a post-session event
      await setDoc(doc(firestore, "event_log"), {
        eventType: "post_session_email_sent",
        data: {
          appointmentId: "test-appointment-id",
          userId: user.user.uid,
          proId: pro.user.uid,
        },
        timestamp: new Date(),
        source: "reminders-https",
      });

      // Verify the event was logged
      const eventLogQuery = query(
        collection(firestore, "event_log"),
        where("eventType", "==", "post_session_email_sent"),
      );

      const eventLogDocs = await getDocs(eventLogQuery);
      expect(eventLogDocs.docs.length).toBe(1);

      const eventData = eventLogDocs.docs[0].data();
      expect(eventData.data.userId).toBe(user.user.uid);
      expect(eventData.source).toBe("reminders-https");
    });
  });

  describe("Time Window Tests", () => {
    it("should only find appointments within 24h ±5min window", async () => {
      const user = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
      const pro = await createUserWithEmailAndPassword(auth, "pro@example.com", "password123");

      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      const window24hStart = new Date(now.getTime() + 24 * 60 * 60 * 1000 - fiveMinutes);
      const window24hEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + fiveMinutes);

      // Create appointment within window
      const appointmentInWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const appointmentRef1 = doc(firestore, "appointments");

      await setDoc(appointmentRef1, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot-1",
        start: appointmentInWindow,
        end: new Date(appointmentInWindow.getTime() + 60 * 60 * 1000),
        status: "paid",
        paid: true,
        jitsiUrl: "https://meet.jit.si/miamente-test-1",
        sent24h: false,
        sent1h: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create appointment outside window (too early)
      const appointmentTooEarly = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const appointmentRef2 = doc(firestore, "appointments");

      await setDoc(appointmentRef2, {
        userId: user.user.uid,
        proId: pro.user.uid,
        slotId: "test-slot-2",
        start: appointmentTooEarly,
        end: new Date(appointmentTooEarly.getTime() + 60 * 60 * 1000),
        status: "paid",
        paid: true,
        jitsiUrl: "https://meet.jit.si/miamente-test-2",
        sent24h: false,
        sent1h: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Query for appointments in the 24h window
      const appointmentsQuery = query(
        collection(firestore, "appointments"),
        where("status", "in", ["paid", "confirmed"]),
        where("start", ">=", window24hStart),
        where("start", "<=", window24hEnd),
        where("sent24h", "!=", true),
      );

      const appointments = await getDocs(appointmentsQuery);
      expect(appointments.docs.length).toBe(1);
      expect(appointments.docs[0].id).toBe(appointmentRef1.id);
    });
  });
});
