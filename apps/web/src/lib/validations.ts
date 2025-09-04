import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
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
  specialty: z.string().min(2, "La especialidad debe tener al menos 2 caracteres"),
  rateCents: z
    .number()
    .min(1000, "La tarifa debe ser al menos $10.00")
    .max(1000000, "La tarifa no puede exceder $10,000.00"),
  bio: z
    .string()
    .min(50, "La biografía debe tener al menos 50 caracteres")
    .max(1000, "La biografía no puede exceder 1000 caracteres"),
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
