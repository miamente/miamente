#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef, @typescript-eslint/no-unused-vars */

/**
 * Script to initialize test users in Firebase Auth emulator
 * Run this after starting the Firebase emulators
 */

const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const { connectAuthEmulator } = require("firebase/auth");
const { getFirestore, connectFirestoreEmulator, doc, setDoc } = require("firebase/firestore");

// Firebase configuration for emulators
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-miamente.firebaseapp.com",
  projectId: "demo-miamente",
  storageBucket: "demo-miamente.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators
connectAuthEmulator(auth, "http://localhost:9099");
connectFirestoreEmulator(db, "localhost", 8080);

// Test users to create
const testUsers = [
  {
    email: "admin@miamente.com",
    password: "admin123",
    role: "admin",
    fullName: "Administrador del Sistema",
  },
  {
    email: "user@miamente.com",
    password: "user123",
    role: "user",
    fullName: "Usuario de Prueba",
  },
  {
    email: "pro@miamente.com",
    password: "pro123",
    role: "pro",
    fullName: "Profesional de Prueba",
  },
  {
    email: "test@miamente.com",
    password: "test123",
    role: "user",
    fullName: "Usuario de Prueba Adicional",
  },
];

async function createTestUsers() {
  console.log("🔐 Creating test users in Firebase Auth emulator...");

  const createdUsers = [];

  for (const user of testUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(
        `✅ Created auth user: ${user.email} (${user.role}) - UID: ${userCredential.user.uid}`,
      );

      // Store user info for Firestore profile creation
      createdUsers.push({
        uid: userCredential.user.uid,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      });
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️  Auth user already exists: ${user.email}`);
        // For existing users, we still want to create/update the Firestore profile
        // We'll use a placeholder UID and let Firestore handle it
        createdUsers.push({
          uid: `existing_${user.email.replace(/[@.]/g, "_")}`,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        });
      } else {
        console.error(`❌ Error creating auth user ${user.email}:`, error.message);
      }
    }
  }

  // Create Firestore user profiles
  console.log("\n👤 Creating user profiles in Firestore...");

  for (const userData of createdUsers) {
    try {
      const userProfile = {
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", userData.uid), userProfile);
      console.log(`✅ Created user profile: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Error creating user profile for ${userData.email}:`, error.message);
    }
  }

  console.log("\n🎉 Test users and profiles setup complete!");
  console.log("📝 You can now use these credentials to test authentication:");
  console.log("   - admin@miamente.com / admin123 (Admin - has access to admin panel)");
  console.log("   - user@miamente.com / user123 (User)");
  console.log("   - pro@miamente.com / pro123 (Professional)");
  console.log("   - test@miamente.com / test123 (User)");
}

// Run the script
createTestUsers()
  .then(() => {
    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
