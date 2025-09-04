#!/usr/bin/env node

/**
 * Script to initialize test users in Firebase Auth emulator
 * Run this after starting the Firebase emulators
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { connectAuthEmulator } = require('firebase/auth');

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

// Connect to Auth emulator
connectAuthEmulator(auth, "http://localhost:9099");

// Test users to create
const testUsers = [
  {
    email: "admin@miamente.com",
    password: "admin123",
    role: "admin"
  },
  {
    email: "user@miamente.com", 
    password: "user123",
    role: "user"
  },
  {
    email: "pro@miamente.com",
    password: "pro123", 
    role: "pro"
  },
  {
    email: "test@miamente.com",
    password: "test123",
    role: "user"
  }
];

async function createTestUsers() {
  console.log("🔐 Creating test users in Firebase Auth emulator...");
  
  for (const user of testUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`✅ Created user: ${user.email} (${user.role}) - UID: ${userCredential.user.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${user.email}`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }
  
  console.log("\n🎉 Test users setup complete!");
  console.log("📝 You can now use these credentials to test authentication:");
  console.log("   - admin@miamente.com / admin123 (Admin)");
  console.log("   - user@miamente.com / user123 (User)");
  console.log("   - pro@miamente.com / pro123 (Professional)");
  console.log("   - test@miamente.com / test123 (User)");
}

// Run the script
createTestUsers().catch(console.error);
