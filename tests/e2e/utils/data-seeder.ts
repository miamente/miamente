/**
 * Data seeding utility for Playwright tests
 * Handles population of empty tables with test data
 */

import { APIRequestContext } from "@playwright/test";

// Test password - use environment variable or fallback for test data
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || "TestPassword123!";

export interface TestUser {
  email: string;
  password: string;
  full_name: string;
  phone: string;
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
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Generic method to create entities via API with error handling
   */
  private async createEntity<T>(
    endpoint: string,
    entity: T,
    entityName: string,
    entityDisplayName: string,
  ): Promise<void> {
    try {
      await this.request.post(endpoint, { data: entity });
      console.log(`✅ Created ${entityName}: ${entityDisplayName}`);
    } catch {
      console.log(`⚠️ ${entityName} ${entityDisplayName} might already exist`);
    }
  }

  /**
   * Check if the database has any data and seed if necessary
   */
  async ensureDataExists(): Promise<void> {
    console.log("🌱 Checking if test data exists...");

    try {
      // Check if we have any specialties (public endpoint)
      const specialtiesResponse = await this.request.get("/api/v1/specialties");
      const specialties = await specialtiesResponse.json();

      if (!specialties || specialties.length === 0) {
        console.log("📊 No specialties found, seeding data...");
        await this.seedAllData();
      } else {
        console.log(`✅ Found ${specialties.length} specialties, skipping seed`);
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
      await this.createEntity("/api/v1/specialties", specialty, "specialty", specialty.name);
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
      await this.createEntity("/api/v1/modalities", modality, "modality", modality.name);
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
      await this.createEntity(
        "/api/v1/therapeutic-approaches",
        approach,
        "therapeutic approach",
        approach.name,
      );
    }
  }

  /**
   * Seed test users
   */
  private async seedUsers(): Promise<void> {
    const users: TestUser[] = [
      {
        email: "testuser1@example.com",
        password: TEST_PASSWORD,
        full_name: "Test User 1",
        phone: "+1234567890",
      },
      {
        email: "testuser2@example.com",
        password: TEST_PASSWORD,
        full_name: "Test User 2",
        phone: "+1234567891",
      },
    ];

    for (const user of users) {
      await this.createEntity("/api/v1/auth/register/user", user, "user", user.email);
    }

    // Create admin user
    const adminUser = {
      email: "admin@miamente.com",
      password: TEST_PASSWORD,
      full_name: "Admin User",
      phone: "+1234567899",
      role: "admin",
    };

    await this.createEntity("/api/v1/auth/register/user", adminUser, "admin user", adminUser.email);
  }

  /**
   * Seed test professionals
   */
  private async seedProfessionals(): Promise<void> {
    const professionals: TestProfessional[] = [
      {
        email: "dr.smith@example.com",
        password: TEST_PASSWORD,
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
        password: TEST_PASSWORD,
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
        password: TEST_PASSWORD,
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
      await this.createEntity(
        "/api/v1/auth/register/professional",
        professional,
        "professional",
        professional.email,
      );
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
