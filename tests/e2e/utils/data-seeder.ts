/**
 * Data seeding utility for Playwright tests
 * Handles population of empty tables with test data
 */

import { APIRequestContext } from "@playwright/test";

export interface TestUser {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  is_verified: boolean;
}

export interface TestProfessional {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  license_number: string;
  bio: string;
  specialties: string[];
  modalities: string[];
  therapeutic_approaches: string[];
}

export interface TestSpecialty {
  name: string;
  description: string;
  is_active: boolean;
}

export interface TestModality {
  name: string;
  description: string;
  is_active: boolean;
}

export interface TestTherapeuticApproach {
  name: string;
  description: string;
  is_active: boolean;
}

export class DataSeeder {
  constructor(private request: APIRequestContext) {}

  /**
   * Check if the database has any data and seed if necessary
   */
  async ensureDataExists(): Promise<void> {
    console.log("🌱 Checking if test data exists...");

    try {
      // Check if we have any professionals
      const professionalsResponse = await this.request.get("/api/v1/professionals");
      const professionals = await professionalsResponse.json();

      if (!professionals || professionals.length === 0) {
        console.log("📊 No professionals found, seeding data...");
        await this.seedAllData();
      } else {
        console.log(`✅ Found ${professionals.length} professionals, skipping seed`);
      }
    } catch (error) {
      console.log("⚠️ Error checking data, attempting to seed...", error);
      await this.seedAllData();
    }
  }

  /**
   * Seed all necessary data for tests
   */
  private async seedAllData(): Promise<void> {
    console.log("🌱 Seeding test data...");

    // Seed in order of dependencies
    await this.seedSpecialties();
    await this.seedModalities();
    await this.seedTherapeuticApproaches();
    await this.seedUsers();
    await this.seedProfessionals();

    console.log("✅ Test data seeding completed");
  }

  /**
   * Seed specialties data
   */
  private async seedSpecialties(): Promise<void> {
    const specialties: TestSpecialty[] = [
      {
        name: "Psicología Clínica",
        description: "Tratamiento de trastornos mentales y emocionales",
        is_active: true,
      },
      {
        name: "Psicoterapia",
        description: "Terapia psicológica para el bienestar mental",
        is_active: true,
      },
      {
        name: "Psiquiatría",
        description: "Tratamiento médico de trastornos mentales",
        is_active: true,
      },
      {
        name: "Terapia Familiar",
        description: "Terapia enfocada en dinámicas familiares",
        is_active: true,
      },
      {
        name: "Terapia de Pareja",
        description: "Terapia para mejorar relaciones de pareja",
        is_active: true,
      },
    ];

    for (const specialty of specialties) {
      try {
        await this.request.post("/api/v1/specialties", { data: specialty });
        console.log(`✅ Created specialty: ${specialty.name}`);
      } catch (_error) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(`⚠️ Specialty ${specialty.name} might already exist`);
      }
    }
  }

  /**
   * Seed modalities data
   */
  private async seedModalities(): Promise<void> {
    const modalities: TestModality[] = [
      {
        name: "Presencial",
        description: "Sesiones en consultorio físico",
        is_active: true,
      },
      {
        name: "Virtual",
        description: "Sesiones por videollamada",
        is_active: true,
      },
      {
        name: "Híbrida",
        description: "Combinación de sesiones presenciales y virtuales",
        is_active: true,
      },
    ];

    for (const modality of modalities) {
      try {
        await this.request.post("/api/v1/modalities", { data: modality });
        console.log(`✅ Created modality: ${modality.name}`);
      } catch (_error) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(`⚠️ Modality ${modality.name} might already exist`);
      }
    }
  }

  /**
   * Seed therapeutic approaches data
   */
  private async seedTherapeuticApproaches(): Promise<void> {
    const approaches: TestTherapeuticApproach[] = [
      {
        name: "Terapia Cognitivo-Conductual",
        description: "Enfoque en pensamientos y comportamientos",
        is_active: true,
      },
      {
        name: "Psicoanálisis",
        description: "Exploración del inconsciente",
        is_active: true,
      },
      {
        name: "Terapia Humanista",
        description: "Enfoque en el potencial humano",
        is_active: true,
      },
      {
        name: "Terapia Sistémica",
        description: "Enfoque en sistemas y relaciones",
        is_active: true,
      },
    ];

    for (const approach of approaches) {
      try {
        await this.request.post("/api/v1/therapeutic-approaches", { data: approach });
        console.log(`✅ Created therapeutic approach: ${approach.name}`);
      } catch (_error) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(`⚠️ Therapeutic approach ${approach.name} might already exist`);
      }
    }
  }

  /**
   * Seed test users
   */
  private async seedUsers(): Promise<void> {
    const users: TestUser[] = [
      {
        email: "testuser1@example.com",
        password: "TestPassword123!",
        full_name: "Test User 1",
        phone: "+1234567890",
        is_verified: true,
      },
      {
        email: "testuser2@example.com",
        password: "TestPassword123!",
        full_name: "Test User 2",
        phone: "+1234567891",
        is_verified: true,
      },
    ];

    for (const user of users) {
      try {
        await this.request.post("/api/v1/auth/register", { data: user });
        console.log(`✅ Created user: ${user.email}`);
      } catch (_error) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(`⚠️ User ${user.email} might already exist`);
      }
    }
  }

  /**
   * Seed test professionals
   */
  private async seedProfessionals(): Promise<void> {
    const professionals: TestProfessional[] = [
      {
        email: "dr.smith@example.com",
        password: "TestPassword123!",
        full_name: "Dr. Sarah Smith",
        phone: "+1234567892",
        license_number: "PSY123456",
        bio: "Psicóloga clínica con 10 años de experiencia en terapia cognitivo-conductual.",
        specialties: ["Psicología Clínica", "Psicoterapia"],
        modalities: ["Presencial", "Virtual"],
        therapeutic_approaches: ["Terapia Cognitivo-Conductual", "Terapia Humanista"],
      },
      {
        email: "dr.johnson@example.com",
        password: "TestPassword123!",
        full_name: "Dr. Michael Johnson",
        phone: "+1234567893",
        license_number: "PSY789012",
        bio: "Psiquiatra especializado en trastornos del estado de ánimo y ansiedad.",
        specialties: ["Psiquiatría", "Psicología Clínica"],
        modalities: ["Presencial", "Híbrida"],
        therapeutic_approaches: ["Psicoanálisis", "Terapia Sistémica"],
      },
      {
        email: "dr.garcia@example.com",
        password: "TestPassword123!",
        full_name: "Dra. Maria Garcia",
        phone: "+1234567894",
        license_number: "PSY345678",
        bio: "Terapeuta familiar especializada en terapia de pareja y dinámicas familiares.",
        specialties: ["Terapia Familiar", "Terapia de Pareja"],
        modalities: ["Virtual", "Híbrida"],
        therapeutic_approaches: ["Terapia Sistémica", "Terapia Humanista"],
      },
    ];

    for (const professional of professionals) {
      try {
        // Register the professional
        await this.request.post("/api/v1/auth/register-professional", { data: professional });
        console.log(`✅ Created professional: ${professional.email}`);
      } catch (_error) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        console.log(`⚠️ Professional ${professional.email} might already exist`);
      }
    }
  }

  /**
   * Clean up test data (for teardown)
   */
  async cleanupTestData(): Promise<void> {
    console.log("🧹 Cleaning up test data...");

    // Note: In a real implementation, you might want to clean up specific test data
    // For now, we'll leave the data as it might be useful for other tests
    console.log("✅ Test data cleanup completed (data preserved for other tests)");
  }
}
