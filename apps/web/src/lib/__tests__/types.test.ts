import { describe, it, expect } from "vitest";
import {
  UserRole,
  type BaseEntity,
  type AccountWithRole,
  type AccountWithProfile,
  type AcademicExperience,
  type WorkExperience,
  type Certification,
  type UnifiedAuthResponse,
  type ApiResponse,
  type PaginatedResponse,
  type ErrorResponse,
  type LoginFormData,
  type RegisterFormData,
  type SelectOption,
  type Review,
  type ReviewStats,
  type EventLogData,
  type EventStats,
} from "../types";

describe("Type Definitions", () => {
  describe("Enums", () => {
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

  describe("Account Types", () => {
    describe("AccountWithRole", () => {
      it("should have all required properties", () => {
        const account: AccountWithRole = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
          role_id: "role-1",
          role_name: "user",
        };

        expect(account.id).toBe("123");
        expect(account.email).toBe("test@example.com");
        expect(account.full_name).toBe("Test User");
        expect(account.is_active).toBe(true);
        expect(account.is_verified).toBe(false);
        expect(account.role_name).toBe("user");
      });

      it("should allow optional properties", () => {
        const account: AccountWithRole = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: true,
          role_id: "role-1",
          role_name: "user",
          phone: "+1234567890",
          phone_country_code: "+1",
          phone_number: "234567890",
        };

        expect(account.phone).toBe("+1234567890");
        expect(account.phone_country_code).toBe("+1");
        expect(account.phone_number).toBe("234567890");
      });
    });
  });

  describe("Account with Profile Types", () => {
    describe("AccountWithProfile", () => {
      it("should have all required properties", () => {
        const account: AccountWithProfile = {
          account: {
            id: "123",
            created_at: "2023-01-01T00:00:00Z",
            email: "pro@example.com",
            full_name: "Professional User",
            is_active: true,
            is_verified: false,
            role_id: "role-2",
            role_name: "professional",
          },
          role: "professional",
          profile: {
            account_id: "123",
            license_number: "LIC123",
            years_experience: 5,
            rate_cents: 50000,
            currency: "USD",
            academic_experience: [],
            work_experience: [],
            certifications: [],
            languages: [],
            timezone: "UTC",
          },
        };

        expect((account.profile as any)?.years_experience).toBe(5);
        expect((account.profile as any)?.rate_cents).toBe(50000);
        expect((account.profile as any)?.currency).toBe("USD");
        expect((account.profile as any)?.timezone).toBe("UTC");
      });

      it("should allow optional profile properties", () => {
        const account: AccountWithProfile = {
          account: {
            id: "123",
            created_at: "2023-01-01T00:00:00Z",
            email: "pro@example.com",
            full_name: "Professional User",
            is_active: true,
            is_verified: true,
            role_id: "role-2",
            role_name: "professional",
            phone_country_code: "+1",
            phone_number: "1234567890",
          },
          role: "professional",
          profile: {
            account_id: "123",
            license_number: "LIC123",
            years_experience: 10,
            rate_cents: 75000,
            custom_rate_cents: 80000,
            currency: "USD",
            academic_experience: [],
            work_experience: [],
            certifications: [],
            languages: ["English", "Spanish"],
            timezone: "America/New_York",
            short_description: "Experienced therapist",
          },
        };

        expect(account.account.phone_country_code).toBe("+1");
        expect((account.profile as any)?.license_number).toBe("LIC123");
        expect((account.profile as any)?.short_description).toBe("Experienced therapist");
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
    describe("UnifiedAuthResponse", () => {
      it("should have all required properties", () => {
        const account: AccountWithRole = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "test@example.com",
          full_name: "Test User",
          is_active: true,
          is_verified: false,
          role_id: "role-1",
          role_name: "user",
        };

        const authResponse: UnifiedAuthResponse = {
          access_token: "token123",
          refresh_token: "refresh123",
          token_type: "bearer",
          account: account,
          role: "user",
        };

        expect(authResponse.access_token).toBe("token123");
        expect(authResponse.account).toEqual(account);
        expect(authResponse.role).toBe("user");
      });

      it("should work with professional account", () => {
        const account: AccountWithRole = {
          id: "123",
          created_at: "2023-01-01T00:00:00Z",
          email: "pro@example.com",
          full_name: "Professional User",
          is_active: true,
          is_verified: false,
          role_id: "role-2",
          role_name: "professional",
        };

        const authResponse: UnifiedAuthResponse = {
          access_token: "token123",
          refresh_token: "refresh123",
          token_type: "bearer",
          account: account,
          role: "professional",
        };

        expect(authResponse.role).toBe("professional");
        expect(authResponse.account).toEqual(account);
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
        const response: PaginatedResponse<AccountWithRole> = {
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
          user_id: "user123",
          professional_id: "pro123",
          rating: 5,
          created_at: "2023-01-01T00:00:00Z",
        };

        expect(review.rating).toBe(5);
      });

      it("should allow optional comment", () => {
        const review: Review = {
          id: "123",
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
          action: "review_created",
          entity_id: "apt123",
          timestamp: "2023-01-01T00:00:00Z",
          metadata: { source: "web", device: "desktop" },
        };

        expect(event.entity_id).toBe("apt123");
        expect(event.metadata).toEqual({ source: "web", device: "desktop" });
      });
    });

    describe("EventStats", () => {
      it("should have all required properties", () => {
        const stats: EventStats = {
          total_events: 100,
          events_by_type: { login: 50, signup: 30, review: 20 },
          events_by_day: { "2023-01-01": 25, "2023-01-02": 30 },
          unique_users: 45,
        };

        expect(stats.total_events).toBe(100);
        expect(stats.events_by_type.login).toBe(50);
        expect(stats.unique_users).toBe(45);
      });
    });
  });
});
