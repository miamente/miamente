import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  userProfileSchema,
  professionalProfileSchema,
  fileUploadSchema,
} from "../validations";

describe("validations", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email inválido");
      }
    });

    it("should reject short password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "La contraseña debe tener al menos 6 caracteres",
        );
      }
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate correct register data", () => {
      const validData = {
        fullName: "John Doe",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        consent: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject when passwords don't match", () => {
      const invalidData = {
        fullName: "John Doe",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different123",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Las contraseñas no coinciden");
        expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
      }
    });

    it("should reject when consent is false", () => {
      const invalidData = {
        fullName: "John Doe",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        consent: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Debes aceptar los términos y condiciones y la política de privacidad",
        );
      }
    });

    it("should reject short full name", () => {
      const invalidData = {
        fullName: "J",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        consent: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre debe tener al menos 2 caracteres");
      }
    });
  });

  describe("userProfileSchema", () => {
    it("should validate correct user profile data", () => {
      const validData = {
        fullName: "John Doe",
        phoneCountryCode: "+1",
        phoneNumber: "1234567890",
      };

      const result = userProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with minimal data", () => {
      const validData = {
        fullName: "John Doe",
      };

      const result = userProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject short phone number", () => {
      const invalidData = {
        fullName: "John Doe",
        phoneNumber: "123",
      };

      const result = userProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "El número de teléfono debe tener al menos 7 dígitos",
        );
      }
    });
  });

  describe("professionalProfileSchema", () => {
    it("should validate correct professional profile data", () => {
      const validData = {
        fullName: "Dr. John Doe",
        email: "doctor@example.com",
        phoneCountryCode: "+1",
        phoneNumber: "1234567890",
        licenseNumber: "LIC123",
        yearsExperience: 5,
        bio: "Experienced therapist with 5 years of experience in cognitive behavioral therapy.",
        academicExperience: [
          {
            institution: "University of Psychology",
            degree: "PhD",
            field: "Clinical Psychology",
            start_date: "2015-01-01",
            end_date: "2019-12-31",
            description: "Doctoral studies in clinical psychology",
          },
        ],
        workExperience: [
          {
            company: "Mental Health Clinic",
            position: "Senior Therapist",
            start_date: "2020-01-01",
            end_date: "2023-12-31",
            description: "Provided therapy services to patients",
          },
        ],
        certifications: [
          {
            name: "CBT Certification",
            documentUrl: "https://example.com/cert.pdf",
            fileName: "cbt-cert.pdf",
          },
        ],
        languages: ["English", "Spanish"],
        therapyApproaches: ["CBT", "DBT"],
        specialtyIds: ["anxiety", "depression"],
        modalities: [
          {
            id: "mod-1",
            modalityId: "virtual",
            modalityName: "Virtual",
            virtualPrice: 10000,
            presencialPrice: 0,
            offersPresencial: false,
            description: "Online therapy sessions",
            isDefault: true,
          },
        ],
        timezone: "America/New_York",
      };

      const result = professionalProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject negative years of experience", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: -1,
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Los años de experiencia no pueden ser negativos",
        );
      }
    });

    it("should reject too many years of experience", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 60,
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Los años de experiencia no pueden exceder 50");
      }
    });

    it("should reject short bio", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        bio: "Short bio",
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "La biografía debe tener al menos 50 caracteres",
        );
      }
    });

    it("should reject long bio", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        bio: "x".repeat(1001),
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "La biografía no puede exceder 1000 caracteres",
        );
      }
    });

    it("should reject negative virtual price", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        modalities: [
          {
            id: "mod-1",
            modalityId: "virtual",
            modalityName: "Virtual",
            virtualPrice: -100,
            presencialPrice: 0,
            offersPresencial: false,
            isDefault: true,
          },
        ],
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El precio virtual no puede ser negativo");
      }
    });

    it("should reject negative presencial price", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        modalities: [
          {
            id: "mod-1",
            modalityId: "presencial",
            modalityName: "Presencial",
            virtualPrice: 0,
            presencialPrice: -100,
            offersPresencial: true,
            isDefault: true,
          },
        ],
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El precio presencial no puede ser negativo");
      }
    });

    it("should reject certification without name", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        certifications: [
          {
            name: "",
            documentUrl: "https://example.com/cert.pdf",
            fileName: "cbt-cert.pdf",
          },
        ],
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre de la certificación es requerido");
      }
    });

    it("should reject certification without document", () => {
      const invalidData = {
        fullName: "Dr. John Doe",
        yearsExperience: 5,
        certifications: [
          {
            name: "CBT Certification",
            documentUrl: "",
            fileName: "cbt-cert.pdf",
          },
        ],
      };

      const result = professionalProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El documento de certificación es obligatorio");
      }
    });
  });

  describe("fileUploadSchema", () => {
    it("should validate correct file upload data", () => {
      const file = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const validData = {
        file,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png"],
      };

      const result = fileUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should validate with default values", () => {
      const file = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const validData = {
        file,
      };

      const result = fileUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxSize).toBe(5 * 1024 * 1024);
        expect(result.data.allowedTypes).toEqual(["image/jpeg", "image/png", "application/pdf"]);
      }
    });

    it("should reject file that's too large", () => {
      const file = new File(["x".repeat(10 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
      const invalidData = {
        file,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["image/jpeg"],
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El archivo es demasiado grande");
        expect(result.error.issues[0].path).toEqual(["file"]);
      }
    });

    it("should reject file with wrong type", () => {
      const file = new File(["test content"], "test.txt", { type: "text/plain" });
      const invalidData = {
        file,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png"],
      };

      const result = fileUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Tipo de archivo no permitido");
        expect(result.error.issues[0].path).toEqual(["file"]);
      }
    });
  });
});
