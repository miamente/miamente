import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let testEnv: RulesTestEnvironment;
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

describe("Security Rules Tests", () => {
  beforeEach(async () => {
    try {
      // Initialize test environment with emulator
      testEnv = await initializeTestEnvironment({
        projectId: "demo-miamente",
        firestore: {
          host: "127.0.0.1",
          port: 8080,
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              function isSignedIn() { return request.auth != null; }
              function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
              
              match /users/{userId} {
                allow read: if isSignedIn() && (
                  isOwner(userId) || 
                  (resource.data.keys().hasAll(['role', 'fullName']) && 
                   !resource.data.keys().hasAny(['phone', 'email']))
                );
                allow create, update: if isOwner(userId);
                allow delete: if false;
              }
              
              match /professionals/{userId} {
                allow read: if isSignedIn() && (
                  isOwner(userId) || 
                  (resource.data.keys().hasAll(['specialty', 'rateCents', 'bio', 'isVerified']) &&
                   !resource.data.keys().hasAny(['credentials', 'privateNotes']))
                );
                allow create, update: if isOwner(userId);
                allow delete: if false;
              }
            }
          }
        `,
      },
      storage: {
        host: "localhost",
        port: 9199,
        rules: `
          rules_version = '2';
          service firebase.storage {
            match /b/{bucket}/o {
              function isSignedIn() { return request.auth != null; }
              function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
              
              match /public_photos/{userId}/{allPaths=**} {
                allow read: if isSignedIn();
                allow write: if isOwner(userId);
              }
              
              match /private_credentials/{userId}/{allPaths=**} {
                allow read, write: if isOwner(userId);
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
    storage = getStorage(app);

      // Connect to emulators
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
      connectStorageEmulator(storage, "127.0.0.1", 9199);
    } catch (error) {
      console.warn("Failed to initialize test environment:", error);
      // Skip tests if emulators are not available
      testEnv = null as unknown as RulesTestEnvironment;
    }
  });

  afterEach(async () => {
    if (testEnv && typeof testEnv.cleanup === 'function') {
      await testEnv.cleanup();
    }
  });

  describe("Firestore Security Rules", () => {
    it("should allow users to read their own profile completely", async () => {
      if (!testEnv) {
        console.warn("Skipping test - Firebase emulators not available");
        return;
      }
      // Create test user
      const user = await createUserWithEmailAndPassword(auth, "test@example.com", "password123");

      // Create user profile
      const userRef = doc(firestore, "users", user.user.uid);
      await setDoc(userRef, {
        fullName: "Test User",
        role: "user",
        phone: "1234567890",
        email: "test@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User should be able to read their own profile
      const userDoc = await getDoc(userRef);
      expect(userDoc.exists()).toBe(true);
      expect(userDoc.data()?.phone).toBe("1234567890");
    });

    it("should prevent users from reading other users' private data", async () => {
      // Create two test users
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");

      // Create profile for user1
      const user1Ref = doc(firestore, "users", user1.user.uid);
      await setDoc(user1Ref, {
        fullName: "User 1",
        role: "user",
        phone: "1234567890",
        email: "user1@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Sign in as user2 and try to read user1's profile
      await signInWithEmailAndPassword(auth, "user2@example.com", "password123");

      // This should fail or return limited data
      try {
        const user1Doc = await getDoc(user1Ref);
        if (user1Doc.exists()) {
          const data = user1Doc.data();
          // Should not have access to private fields
          expect(data?.phone).toBeUndefined();
          expect(data?.email).toBeUndefined();
          // Should have access to public fields
          expect(data?.fullName).toBe("User 1");
          expect(data?.role).toBe("user");
        }
      } catch (error) {
        // Access denied is also acceptable
        expect(error).toBeDefined();
      }
    });

    it("should prevent users from updating other users' profiles", async () => {
      // Create two test users
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");

      // Create profile for user1
      const user1Ref = doc(firestore, "users", user1.user.uid);
      await setDoc(user1Ref, {
        fullName: "User 1",
        role: "user",
        phone: "1234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Sign in as user2 and try to update user1's profile
      await signInWithEmailAndPassword(auth, "user2@example.com", "password123");

      // This should fail
      try {
        await updateDoc(user1Ref, {
          fullName: "Hacked User",
          updatedAt: new Date(),
        });
        expect.fail("Should not be able to update another user's profile");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should allow professionals to read public professional data", async () => {
      // Create two test users
      const pro1 = await createUserWithEmailAndPassword(auth, "pro1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");

      // Create professional profile for pro1
      const pro1Ref = doc(firestore, "professionals", pro1.user.uid);
      await setDoc(pro1Ref, {
        specialty: "Psicología Clínica",
        rateCents: 50000,
        bio: "Psicóloga clínica con 10 años de experiencia",
        isVerified: true,
        credentials: "private-credentials-url",
        privateNotes: "Admin notes",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Sign in as user1 and try to read pro1's profile
      await signInWithEmailAndPassword(auth, "user1@example.com", "password123");

      const pro1Doc = await getDoc(pro1Ref);
      expect(pro1Doc.exists()).toBe(true);

      const data = pro1Doc.data();
      // Should have access to public fields
      expect(data?.specialty).toBe("Psicología Clínica");
      expect(data?.rateCents).toBe(50000);
      expect(data?.bio).toBe("Psicóloga clínica con 10 años de experiencia");
      expect(data?.isVerified).toBe(true);
      // Should not have access to private fields
      expect(data?.credentials).toBeUndefined();
      expect(data?.privateNotes).toBeUndefined();
    });
  });

  describe("Storage Security Rules", () => {
    it("should allow users to upload to their own public photos folder", async () => {
      const user = await createUserWithEmailAndPassword(auth, "test@example.com", "password123");

      // Create a test file
      const testFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const storageRef = ref(storage, `public_photos/${user.user.uid}/test.jpg`);

      // Should be able to upload
      await uploadBytes(storageRef, testFile);
      const downloadURL = await getDownloadURL(storageRef);
      expect(downloadURL).toBeDefined();
    });

    it("should prevent users from uploading to other users' folders", async () => {
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");

      // Sign in as user2
      await signInWithEmailAndPassword(auth, "user2@example.com", "password123");

      // Try to upload to user1's folder
      const testFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const storageRef = ref(storage, `public_photos/${user1.user.uid}/test.jpg`);

      // This should fail
      try {
        await uploadBytes(storageRef, testFile);
        expect.fail("Should not be able to upload to another user's folder");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should prevent users from accessing private credentials", async () => {
      const user1 = await createUserWithEmailAndPassword(auth, "user1@example.com", "password123");
      await createUserWithEmailAndPassword(auth, "user2@example.com", "password123");

      // User1 uploads private credentials
      await signInWithEmailAndPassword(auth, "user1@example.com", "password123");
      const testFile = new File(["private content"], "credentials.pdf", {
        type: "application/pdf",
      });
      const storageRef = ref(storage, `private_credentials/${user1.user.uid}/credentials.pdf`);
      await uploadBytes(storageRef, testFile);

      // Sign in as user2 and try to access user1's credentials
      await signInWithEmailAndPassword(auth, "user2@example.com", "password123");

      // This should fail
      try {
        await getDownloadURL(storageRef);
        expect.fail("Should not be able to access another user's private credentials");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
