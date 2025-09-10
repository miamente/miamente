import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    consent: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones y la política de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const userProfileSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional(),
});

export const professionalProfileSchema = z.object({
  // Basic info
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional(),

  // Professional info
  specialty: z.string().min(2, "La especialidad debe tener al menos 2 caracteres"),
  licenseNumber: z.string().optional(),
  yearsExperience: z
    .number()
    .min(0, "Los años de experiencia no pueden ser negativos")
    .max(50, "Los años de experiencia no pueden exceder 50"),
  rateCents: z
    .number()
    .min(1000, "La tarifa debe ser al menos $10.00")
    .max(1000000, "La tarifa no puede exceder $10,000.00"),
  currency: z
    .string()
    .min(3, "La moneda debe tener 3 caracteres")
    .max(3, "La moneda debe tener 3 caracteres"),
  bio: z
    .string()
    .min(50, "La biografía debe tener al menos 50 caracteres")
    .max(1000, "La biografía no puede exceder 1000 caracteres")
    .optional(),

  // Experience arrays
  academicExperience: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),

  workExperience: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),

  // Arrays
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  therapyApproaches: z.array(z.string()).optional(),

  // Settings
  timezone: z.string().optional(),

  // Emergency contact
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export const fileUploadSchema = z
  .object({
    file: z.instanceof(File),
    maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
    allowedTypes: z.array(z.string()).default(["image/jpeg", "image/png", "application/pdf"]),
  })
  .refine((data) => data.file.size <= data.maxSize, {
    message: "El archivo es demasiado grande",
    path: ["file"],
  })
  .refine((data) => data.allowedTypes.includes(data.file.type), {
    message: "Tipo de archivo no permitido",
    path: ["file"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
