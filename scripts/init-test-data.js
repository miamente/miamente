#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef, @typescript-eslint/no-unused-vars */

/**
 * Script to initialize test data in Firestore emulator
 * Run this after starting the Firebase emulators
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
} = require("firebase/firestore");

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
const db = getFirestore(app);

// Connect to Firestore emulator
connectFirestoreEmulator(db, "localhost", 8080);

// Test professionals to create
const testProfessionals = [
  {
    id: "pro1-test",
    specialty: "Psicología Clínica",
    rateCents: 8000000, // 80,000 COP
    bio: "Psicóloga clínica con 10 años de experiencia en terapia cognitivo-conductual y trastornos de ansiedad.",
    isVerified: true,
    photoUrl: "https://via.placeholder.com/400x300?text=Psicologa",
    credentials: "",
    privateNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pro2-test",
    specialty: "Psiquiatría",
    rateCents: 12000000, // 120,000 COP
    bio: "Médico psiquiatra especializado en tratamiento de depresión y trastornos del estado de ánimo.",
    isVerified: true,
    photoUrl: "https://via.placeholder.com/400x300?text=Psiquiatra",
    credentials: "",
    privateNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pro3-test",
    specialty: "Terapia Ocupacional",
    rateCents: 6000000, // 60,000 COP
    bio: "Terapeuta ocupacional con enfoque en rehabilitación neurológica y terapia de integración sensorial.",
    isVerified: true,
    photoUrl: "https://via.placeholder.com/400x300?text=Terapeuta",
    credentials: "",
    privateNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pro4-test",
    specialty: "Coaching",
    rateCents: 5000000, // 50,000 COP
    bio: "Coach profesional certificado en desarrollo personal y coaching ejecutivo.",
    isVerified: true,
    photoUrl: "https://via.placeholder.com/400x300?text=Coach",
    credentials: "",
    privateNotes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function createTestProfessionals() {
  console.log("👨‍⚕️ Creating test professionals in Firestore emulator...");

  for (const professional of testProfessionals) {
    try {
      const { id, ...data } = professional;
      await setDoc(doc(db, "professionals", id), data);
      console.log(
        `✅ Created professional: ${professional.specialty} - ${professional.rateCents / 10000} COP`,
      );
    } catch (error) {
      console.error(`❌ Error creating professional ${professional.specialty}:`, error.message);
    }
  }

  console.log("\n🎉 Test professionals setup complete!");
  console.log("📝 Available specialties:");
  testProfessionals.forEach((pro) => {
    console.log(`   - ${pro.specialty}: ${(pro.rateCents / 10000).toLocaleString()} COP/hora`);
  });
}

// Run the script
createTestProfessionals()
  .then(() => {
    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
