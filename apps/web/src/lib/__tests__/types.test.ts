import { describe, it, expect } from "vitest";
import {
  AppointmentStatus,
  UserRole,
  type BaseEntity,
  type User,
  type Professional,
  type Appointment,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Specialty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type TherapeuticApproach,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Modality,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ProfessionalModality,
  type AcademicExperience,
  type WorkExperience,
  type Certification,
  type AuthUser,
  type LoginResponse,
  type ApiResponse,
  type PaginatedResponse,
  type ErrorResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type UserProfile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AdminMetrics,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ProfessionalSpecialty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ProfessionalTherapeuticApproach,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type UserProfileFormData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ProfessionalProfileFormData,
  type LoginFormData,
  type RegisterFormData,
  type SelectOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type NavigationItem,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type EventLogEntry,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type ProfessionalSummary,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type AppointmentSummary,
  type Review,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type CreateReviewRequest,
  type ReviewStats,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type UploadResponse,
  type EventLogData,
  type AppointmentChartData,
  type EventStats,
  type ConversionFunnelData,
} from "../types";

describe("Type Definitions", () => {
  describe("Enums", () => {
    describe("AppointmentStatus", () => {
      it("should have correct values", () => {
        expect(AppointmentStatus.CONFIRMED).toBe("confirmed");
        expect(AppointmentStatus.IN_PROGRESS).toBe("in_progress");
        expect(AppointmentStatus.COMPLETED).toBe("completed");
        expect(AppointmentStatus.CANCELLED).toBe("cancelled");
        expect(AppointmentStatus.NO_SHOW).toBe("no_show");
      });

      it("should be usable in type annotations", () => {
        const status: AppointmentStatus = AppointmentStatus.CONFIRMED;
        expect(status).toBe("confirmed");
      });
    });

    describe("UserRole", () => {
      it("should have correct values", () => {
        expect(UserRole.USER).toBe("user");
        expect(UserRole.PROFESSIONAL).toBe("professional");
        expect(UserRole.ADMIN).toBe("admin");
      });

      it("should be usable in type annotations", () => {
        const role: UserRole = UserRole.ADMIN;
        expect(role).toBe("admin");
      });
    });
  });

  describe("Base Types", () => {
    describe("BaseEntity", () => {
      it("should have required properties", () => {
        const entity: BaseEntity = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
        };

        expect(entity.id).toBe("123");
        expect(entity.created_at).toBe("2023-01-01T00:00:00Z");
      });

      it("should allow optional updated_at", () => {
        const entity: BaseEntity = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-02T00:00:00Z",
        };

        expect(entity.updated_at).toBe("2023-01-02T00:00:00Z");
      });
    });
  });

  describe("User Types", () => {
    describe("User", () => {
      it("should have all required properties", () => {
        const user: User = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
        };

        expect(user.id).toBe("123");
        expect(user.email).toBe("test@example.com");
        expect(user.full_name).toBe("Test User");
        expect(user.is_active).toBe(true);
        expect(user.is_verified).toBe(false);
      });

      it("should allow optional properties", () => {
        const user: User = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          phone: "+1234567890",
          profile_picture: "https://example.com/avatar.jpg",
          date_of_birth: "1990-01-01",
          emergency_contact: "Emergency Contact",
          emergency_phone: "+0987654321",
          preferences: '{"theme": "dark"}',
        };

        expect(user.phone).toBe("+1234567890");
        expect(user.profile_picture).toBe("https://example.com/avatar.jpg");
        expect(user.preferences).toBe('{"theme": "dark"}');
      });
    });
  });

  describe("Professional Types", () => {
    describe("Professional", () => {
      it("should have all required properties", () => {
        const professional: Professional = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "pro@example.com",
          full_name: "Professional User",
          is_active: true,
          is_verified: false,
          years_experience: 5,
          rate_cents: 50000,
          currency: "USD",
          academic_experience: [],
          work_experience: [],
          certifications: [],
          languages: [],
          therapy_approaches_ids: [],
          specialty_ids: [],
          modalities: [],
          timezone: "UTC",
        };

        expect(professional.years_experience).toBe(5);
        expect(professional.rate_cents).toBe(50000);
        expect(professional.currency).toBe("USD");
        expect(professional.timezone).toBe("UTC");
      });

      it("should allow optional professional properties", () => {
        const professional: Professional = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "pro@example.com",
          full_name: "Professional User",
          is_active: true,
          is_verified: true,
          years_experience: 10,
          rate_cents: 75000,
          currency: "USD",
          academic_experience: [],
          work_experience: [],
          certifications: [],
          languages: ["English", "Spanish"],
          therapy_approaches_ids: ["approach1"],
          specialty_ids: ["specialty1"],
          modalities: [],
          timezone: "America/New_York",
          phone_country_code: "+1",
          phone_number: "1234567890",
          license_number: "LIC123",
          custom_rate_cents: 80000,
          bio: "Experienced therapist",
          working_hours: '{"monday": {"start": "09:00", "end": "17:00"}}',
        };

        expect(professional.phone_country_code).toBe("+1");
        expect(professional.license_number).toBe("LIC123");
        expect(professional.bio).toBe("Experienced therapist");
      });
    });
  });

  describe("Appointment Types", () => {
    describe("Appointment", () => {
      it("should have all required properties", () => {
        const appointment: Appointment = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          user_id: "user123",
          professional_id: "pro123",
          status: AppointmentStatus.CONFIRMED,
          start_time: "2023-01-01T10:00:00Z",
          end_time: "2023-01-01T11:00:00Z",
          duration: 60,
          timezone: "UTC",
        };

        expect(appointment.user_id).toBe("user123");
        expect(appointment.professional_id).toBe("pro123");
        expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
        expect(appointment.duration).toBe(60);
      });

      it("should allow optional session properties", () => {
        const appointment: Appointment = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          user_id: "user123",
          professional_id: "pro123",
          status: AppointmentStatus.COMPLETED,
          start_time: "2023-01-01T10:00:00Z",
          end_time: "2023-01-01T11:00:00Z",
          duration: 60,
          timezone: "UTC",
          jitsi_url: "https://meet.jit.si/room123",
          session_notes: "Great session",
          session_rating: 5,
          session_feedback: "Very helpful",
          completed_at: "2023-01-01T11:00:00Z",
        };

        expect(appointment.jitsi_url).toBe("https://meet.jit.si/room123");
        expect(appointment.session_notes).toBe("Great session");
        expect(appointment.session_rating).toBe(5);
      });
    });
  });

  describe("Structured Data Types", () => {
    describe("AcademicExperience", () => {
      it("should have all required properties", () => {
        const experience: AcademicExperience = {
          institution: "University of Example",
          degree: "Master's",
          field: "Psychology",
          start_date: "2020-09-01",
        };

        expect(experience.institution).toBe("University of Example");
        expect(experience.degree).toBe("Master's");
        expect(experience.field).toBe("Psychology");
      });

      it("should allow optional properties", () => {
        const experience: AcademicExperience = {
          institution: "University of Example",
          degree: "Master's",
          field: "Psychology",
          start_date: "2020-09-01",
          end_date: "2022-05-01",
          description: "Focused on clinical psychology",
          is_current: false,
        };

        expect(experience.end_date).toBe("2022-05-01");
        expect(experience.is_current).toBe(false);
      });
    });

    describe("WorkExperience", () => {
      it("should have all required properties", () => {
        const experience: WorkExperience = {
          company: "Therapy Clinic",
          position: "Senior Therapist",
          start_date: "2022-06-01",
        };

        expect(experience.company).toBe("Therapy Clinic");
        expect(experience.position).toBe("Senior Therapist");
      });

      it("should allow optional properties", () => {
        const experience: WorkExperience = {
          company: "Therapy Clinic",
          position: "Senior Therapist",
          start_date: "2022-06-01",
          end_date: "2023-12-01",
          description: "Led therapy sessions and supervised junior therapists",
          is_current: false,
        };

        expect(experience.description).toBe(
          "Led therapy sessions and supervised junior therapists",
        );
        expect(experience.is_current).toBe(false);
      });
    });

    describe("Certification", () => {
      it("should have required properties", () => {
        const cert: Certification = {
          name: "Licensed Clinical Psychologist",
        };

        expect(cert.name).toBe("Licensed Clinical Psychologist");
      });

      it("should allow optional properties", () => {
        const cert: Certification = {
          name: "Licensed Clinical Psychologist",
          document_url: "https://example.com/cert.pdf",
          file_name: "cert.pdf",
          issued_by: "State Board",
          issued_date: "2020-01-01",
          expiry_date: "2025-01-01",
        };

        expect(cert.issued_by).toBe("State Board");
        expect(cert.expiry_date).toBe("2025-01-01");
      });
    });
  });

  describe("Auth Types", () => {
    describe("AuthUser", () => {
      it("should work with User type", () => {
        const user: User = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
        };

        const authUser: AuthUser = {
          type: UserRole.USER,
          data: user,
        };

        expect(authUser.type).toBe(UserRole.USER);
        expect(authUser.data).toEqual(user);
      });

      it("should work with Professional type", () => {
        const professional: Professional = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "pro@example.com",
          full_name: "Professional User",
          is_active: true,
          is_verified: false,
          years_experience: 5,
          rate_cents: 50000,
          currency: "USD",
          academic_experience: [],
          work_experience: [],
          certifications: [],
          languages: [],
          therapy_approaches_ids: [],
          specialty_ids: [],
          modalities: [],
          timezone: "UTC",
        };

        const authUser: AuthUser = {
          type: UserRole.PROFESSIONAL,
          data: professional,
        };

        expect(authUser.type).toBe(UserRole.PROFESSIONAL);
        expect(authUser.data).toEqual(professional);
      });
    });

    describe("LoginResponse", () => {
      it("should have required properties", () => {
        const response: LoginResponse = {
          access_token: "jwt-token",
          token_type: "bearer",
          user_type: "user",
        };

        expect(response.access_token).toBe("jwt-token");
        expect(response.token_type).toBe("bearer");
        expect(response.user_type).toBe("user");
      });

      it("should allow user data", () => {
        const user: User = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
        };

        const response: LoginResponse = {
          access_token: "jwt-token",
          token_type: "bearer",
          user_type: "user",
          user,
        };

        expect(response.user).toEqual(user);
      });
    });
  });

  describe("API Response Types", () => {
    describe("ApiResponse", () => {
      it("should have required data property", () => {
        const response: ApiResponse<string> = {
          data: "test data",
        };

        expect(response.data).toBe("test data");
      });

      it("should allow optional message and success", () => {
        const response: ApiResponse<{ id: string }> = {
          data: { id: "123" },
          message: "Success",
          success: true,
        };

        expect(response.message).toBe("Success");
        expect(response.success).toBe(true);
      });
    });

    describe("PaginatedResponse", () => {
      it("should have all required properties", () => {
        const response: PaginatedResponse<User> = {
          data: [],
          total: 0,
          page: 1,
          per_page: 10,
          total_pages: 0,
        };

        expect(response.total).toBe(0);
        expect(response.page).toBe(1);
        expect(response.per_page).toBe(10);
        expect(response.total_pages).toBe(0);
      });
    });

    describe("ErrorResponse", () => {
      it("should have required detail property", () => {
        const error: ErrorResponse = {
          detail: "Something went wrong",
        };

        expect(error.detail).toBe("Something went wrong");
      });

      it("should allow optional error_code and field_errors", () => {
        const error: ErrorResponse = {
          detail: "Validation failed",
          error_code: "VALIDATION_ERROR",
          field_errors: {
            email: ["Invalid email format"],
            password: ["Password too short"],
          },
        };

        expect(error.error_code).toBe("VALIDATION_ERROR");
        expect(error.field_errors).toEqual({
          email: ["Invalid email format"],
          password: ["Password too short"],
        });
      });
    });
  });

  describe("Form Types", () => {
    describe("LoginFormData", () => {
      it("should have required properties", () => {
        const formData: LoginFormData = {
          email: "test@example.com",
          password: "password123",
        };

        expect(formData.email).toBe("test@example.com");
        expect(formData.password).toBe("password123");
      });
    });

    describe("RegisterFormData", () => {
      it("should have all required properties", () => {
        const formData: RegisterFormData = {
          email: "test@example.com",
          password: "password123",
          confirm_password: "password123",
          full_name: "Test User",
          role: UserRole.USER,
        };

        expect(formData.email).toBe("test@example.com");
        expect(formData.confirm_password).toBe("password123");
        expect(formData.full_name).toBe("Test User");
        expect(formData.role).toBe(UserRole.USER);
      });

      it("should allow optional phone", () => {
        const formData: RegisterFormData = {
          email: "test@example.com",
          password: "password123",
          confirm_password: "password123",
          full_name: "Test User",
          role: UserRole.USER,
          phone: "+1234567890",
        };

        expect(formData.phone).toBe("+1234567890");
      });
    });
  });

  describe("UI Types", () => {
    describe("SelectOption", () => {
      it("should have required properties", () => {
        const option: SelectOption = {
          value: "option1",
          label: "Option 1",
        };

        expect(option.value).toBe("option1");
        expect(option.label).toBe("Option 1");
      });
    });

    describe("Review", () => {
      it("should have all required properties", () => {
        const review: Review = {
          id: "123",
          appointment_id: "apt123",
          user_id: "user123",
          professional_id: "pro123",
          rating: 5,
          created_at: "2023-01-01T00:00:00Z",
        };

        expect(review.rating).toBe(5);
        expect(review.appointment_id).toBe("apt123");
      });

      it("should allow optional comment", () => {
        const review: Review = {
          id: "123",
          appointment_id: "apt123",
          user_id: "user123",
          professional_id: "pro123",
          rating: 5,
          comment: "Great therapist!",
          created_at: "2023-01-01T00:00:00Z",
        };

        expect(review.comment).toBe("Great therapist!");
      });
    });

    describe("ReviewStats", () => {
      it("should have required properties", () => {
        const stats: ReviewStats = {
          average: 4.5,
          count: 10,
        };

        expect(stats.average).toBe(4.5);
        expect(stats.count).toBe(10);
      });
    });
  });

  describe("Analytics Types", () => {
    describe("EventLogData", () => {
      it("should have all required properties", () => {
        const event: EventLogData = {
          id: "123",
          user_id: "user123",
          action: "login",
          timestamp: "2023-01-01T00:00:00Z",
        };

        expect(event.action).toBe("login");
        expect(event.user_id).toBe("user123");
      });

      it("should allow optional entity_id and metadata", () => {
        const event: EventLogData = {
          id: "123",
          user_id: "user123",
          action: "appointment_created",
          entity_id: "apt123",
          timestamp: "2023-01-01T00:00:00Z",
          metadata: { source: "web", device: "desktop" },
        };

        expect(event.entity_id).toBe("apt123");
        expect(event.metadata).toEqual({ source: "web", device: "desktop" });
      });
    });

    describe("AppointmentChartData", () => {
      it("should have required properties", () => {
        const data: AppointmentChartData = {
          date: "2023-01-01",
          confirmed: 10,
          total: 15,
        };

        expect(data.date).toBe("2023-01-01");
        expect(data.confirmed).toBe(10);
        expect(data.total).toBe(15);
      });
    });

    describe("EventStats", () => {
      it("should have all required properties", () => {
        const stats: EventStats = {
          total_events: 100,
          events_by_type: { login: 50, signup: 30, appointment: 20 },
          events_by_day: { "2023-01-01": 25, "2023-01-02": 30 },
          unique_users: 45,
        };

        expect(stats.total_events).toBe(100);
        expect(stats.events_by_type.login).toBe(50);
        expect(stats.unique_users).toBe(45);
      });
    });

    describe("ConversionFunnelData", () => {
      it("should have required properties", () => {
        const funnel: ConversionFunnelData = {
          signups: 100,
          profile_completions: 80,
          slot_creations: 60,
          appointment_confirmations: 45,
        };

        expect(funnel.signups).toBe(100);
        expect(funnel.profile_completions).toBe(80);
        expect(funnel.slot_creations).toBe(60);
        expect(funnel.appointment_confirmations).toBe(45);
      });
    });
  });
});
