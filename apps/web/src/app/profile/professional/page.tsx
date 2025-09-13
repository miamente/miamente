"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AcademicExperienceEditor } from "@/components/academic-experience-editor";
import { WorkExperienceEditor } from "@/components/work-experience-editor";
import { CertificationsEditor } from "@/components/certifications-editor";
import { SpecialtiesEditor } from "@/components/specialties-editor";
import { ArrayFieldEditor } from "@/components/array-field-editor";
import {
  Award,
  Languages,
  Brain,
  User,
  Briefcase,
  GraduationCap,
  Building2,
  FileText,
} from "lucide-react";
import { useAuth, getUserUid } from "@/hooks/useAuth";
import {
  getMyProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/profiles";
import type { ProfessionalProfile } from "@/lib/profiles";
import { professionalProfileSchema, type ProfessionalProfileFormData } from "@/lib/validations";

export default function ProfessionalProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const methods = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  const loadProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const proProfile = await getMyProfessionalProfile();
      if (proProfile) {
        setProfile(proProfile);

        // Reset form with all data at once
        const formData: ProfessionalProfileFormData = {
          fullName: proProfile.full_name || "",
          phone: proProfile.phone || "",
          licenseNumber: proProfile.license_number || "",
          yearsExperience: proProfile.years_experience || 0,
          bio: proProfile.bio || "",
          academicExperience: (proProfile.academic_experience as any) || [],
          workExperience: (proProfile.work_experience as any) || [],
          certifications:
            (proProfile.certifications as any)?.map((cert: any) => {
              const documentUrl = typeof cert === "object" ? cert.documentUrl || "" : "";
              // Use fileName from database if available, otherwise extract from URL
              const fileName =
                typeof cert === "object" && cert.fileName
                  ? cert.fileName
                  : documentUrl
                    ? documentUrl.split("/").pop() || "Archivo adjunto"
                    : "";

              return {
                name: typeof cert === "string" ? cert : cert.name || "",
                document: undefined,
                documentUrl: documentUrl,
                fileName: fileName,
              };
            }) || [],
          languages: proProfile.languages || [],
          therapyApproaches: proProfile.therapy_approaches || [],
          timezone: proProfile.timezone || "America/Bogota",
        };

        reset(formData);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [user, reset]);

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [user, isLoading, router, loadProfile]);

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let profilePictureUrl = profile?.profile_picture || null;

      // Upload profile picture if a new one was selected
      if (photoFile) {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const token = localStorage.getItem("access_token");

          // Delete old profile picture if it exists
          if (profile?.profile_picture) {
            try {
              // Extract user_id and filename from the existing profile picture URL
              const urlParts = profile.profile_picture.split("/");
              const userId = urlParts[urlParts.length - 2]; // user_id is second to last
              const filename = urlParts[urlParts.length - 1]; // filename is last

              await fetch(`${API_BASE_URL}/api/v1/files/profile-picture/${userId}/${filename}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              console.log("Old profile picture deleted successfully");
            } catch (deleteError) {
              console.warn("Error deleting old profile picture:", deleteError);
              // Don't fail the upload if deletion fails
            }
          }

          const formData = new FormData();
          formData.append("file", photoFile);

          const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/profile-picture`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(
              `Error uploading profile picture: ${errorData.detail || response.statusText}`,
            );
          }

          const result = await response.json();
          profilePictureUrl = result.file_url;
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          setError("Error al subir la foto de perfil. Inténtalo de nuevo.");
          setIsSubmitting(false);
          return;
        }
      }

      if (profile) {
        // Update existing profile
        await updateProfessionalProfile({
          full_name: data.fullName,
          phone: data.phone,
          license_number: data.licenseNumber,
          years_experience: data.yearsExperience,
          bio: data.bio,
          academic_experience: data.academicExperience,
          work_experience: data.workExperience,
          certifications: data.certifications?.map((cert) => ({
            name: cert.name,
            documentUrl: cert.documentUrl,
            fileName: cert.fileName,
          })),
          languages: data.languages,
          therapy_approaches: data.therapyApproaches,
          timezone: data.timezone,
          profile_picture: profilePictureUrl || undefined,
        });
      } else {
        // Create new profile
        await createProfessionalProfile({
          full_name: data.fullName,
          phone: data.phone,
          license_number: data.licenseNumber,
          years_experience: data.yearsExperience,
          bio: data.bio,
          academic_experience: data.academicExperience,
          work_experience: data.workExperience,
          certifications: data.certifications?.map((cert) => ({
            name: cert.name,
            documentUrl: cert.documentUrl,
            fileName: cert.fileName,
          })),
          languages: data.languages,
          therapy_approaches: data.therapyApproaches,
          timezone: data.timezone,
          profile_picture: profilePictureUrl || undefined,
        });
      }

      setSuccess(true);
      setPhotoFile(null);
      await loadProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el perfil";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo Section */}
      <div className="flex flex-col items-center space-y-4">
        {/* Photo Preview/Upload Area */}
        <div className="relative">
          {photoFile || profile?.profile_picture ? (
            <div className="group relative">
              <img
                src={
                  photoFile
                    ? URL.createObjectURL(photoFile)
                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${profile?.profile_picture}`
                }
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-blue-200 object-cover dark:border-blue-800"
              />
              <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className="group flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">
              <svg
                className="h-12 w-12 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPhotoFile(file);
              }
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            disabled={isSubmitting}
          />
        </div>

        {/* File Info */}
        {photoFile && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{photoFile.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(photoFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Haz clic para seleccionar una foto profesional
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            JPG, PNG, GIF • Máximo 2MB
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <FormProvider {...methods}>
          <form
            id="professional-profile-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                Perfil actualizado exitosamente
              </div>
            )}

            {/* Personal and Professional Information */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Nombre Completo
                    </label>
                    <Input
                      id="fullName"
                      {...register("fullName")}
                      className="mt-1"
                      placeholder="Dr. Juan Pérez"
                      disabled={isSubmitting}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="mt-1"
                      placeholder="+573001234567"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Biografía
                    </label>
                    <textarea
                      id="bio"
                      {...register("bio")}
                      className="focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder-neutral-400 focus:ring-1 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                      rows={4}
                      placeholder="Cuéntanos sobre tu experiencia y enfoque terapéutico..."
                      disabled={isSubmitting}
                    />
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Información Profesional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Especialidad y precio se manejan en el componente SpecialtiesEditor */}

                  <div>
                    <label
                      htmlFor="licenseNumber"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Número de Licencia
                    </label>
                    <Input
                      id="licenseNumber"
                      {...register("licenseNumber")}
                      className="mt-1"
                      placeholder="P-12345"
                      disabled={isSubmitting}
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.licenseNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="yearsExperience"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Años de Experiencia
                    </label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      {...register("yearsExperience", { valueAsNumber: true })}
                      className="mt-1"
                      placeholder="5"
                      disabled={isSubmitting}
                    />
                    {errors.yearsExperience && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.yearsExperience.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Specialties and Pricing */}
            <SpecialtiesEditor disabled={isSubmitting} />

            {/* Experience Sections */}
            <div className="space-y-6">
              <AcademicExperienceEditor disabled={isSubmitting} />
              <WorkExperienceEditor disabled={isSubmitting} />
              <CertificationsEditor disabled={isSubmitting} />
            </div>

            {/* Additional Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <ArrayFieldEditor
                name="languages"
                title="Idiomas"
                placeholder="Agregar idioma..."
                icon={<Languages className="h-5 w-5 text-blue-600" />}
                disabled={isSubmitting}
              />
              <ArrayFieldEditor
                name="therapyApproaches"
                title="Enfoques Terapéuticos"
                placeholder="Agregar enfoque..."
                icon={<Brain className="h-5 w-5 text-green-600" />}
                disabled={isSubmitting}
              />
            </div>
          </form>
        </FormProvider>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          form="professional-profile-form"
        >
          {isSubmitting ? "Actualizando..." : profile ? "Actualizar Perfil" : "Crear Perfil"}
        </Button>
      </div>
    </div>
  );
}
