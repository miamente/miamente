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
import { ArrayFieldEditor } from "@/components/array-field-editor";
import { Award, Languages, Brain } from "lucide-react";
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
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [currentPhotoUrl] = useState<string | null>(null);
  const [currentCredentialsUrl, setCurrentCredentialsUrl] = useState<string | null>(null);

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
    console.log("loadProfile called - user:", user);
    if (!user) {
      console.log("loadProfile: No user, returning");
      return;
    }

    try {
      console.log("loadProfile: Calling getMyProfessionalProfile");
      const proProfile = await getMyProfessionalProfile();
      console.log("loadProfile: Profile loaded:", proProfile);
      if (proProfile) {
        setProfile(proProfile);

        // Reset form with all data at once
        const formData: ProfessionalProfileFormData = {
          fullName: proProfile.full_name || "",
          phone: proProfile.phone || "",
          specialty: proProfile.specialty || "",
          licenseNumber: proProfile.license_number || "",
          yearsExperience: proProfile.years_experience || 0,
          rateCents: proProfile.rate_cents || 0,
          currency: proProfile.currency || "COP",
          bio: proProfile.bio || "",
          academicExperience: (proProfile.academic_experience as any) || [],
          workExperience: (proProfile.work_experience as any) || [],
          certifications: proProfile.certifications || [],
          languages: proProfile.languages || [],
          therapyApproaches: proProfile.therapy_approaches || [],
          timezone: proProfile.timezone || "America/Bogota",
          emergencyContact: proProfile.emergency_contact || "",
          emergencyPhone: proProfile.emergency_phone || "",
        };

        reset(formData);
        setCurrentCredentialsUrl(null); // credentials field doesn't exist in current schema
        console.log("loadProfile: Profile set successfully");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [user, reset]);

  useEffect(() => {
    console.log("ProfessionalProfilePage useEffect - user:", user);
    console.log("ProfessionalProfilePage useEffect - isLoading:", isLoading);
    console.log("ProfessionalProfilePage useEffect - user type:", user?.type);
    console.log("ProfessionalProfilePage useEffect - user data:", user?.data);

    // Don't redirect if still loading
    if (isLoading) {
      console.log("ProfessionalProfilePage: Still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("ProfessionalProfilePage: No user after loading, redirecting to login");
      router.push("/login");
      return;
    }

    console.log("ProfessionalProfilePage: User exists, loading profile");
    loadProfile();
  }, [user, isLoading, router, loadProfile]);

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      if (profile) {
        // Update existing profile
        await updateProfessionalProfile({
          full_name: data.fullName,
          phone: data.phone,
          specialty: data.specialty,
          license_number: data.licenseNumber,
          years_experience: data.yearsExperience,
          rate_cents: data.rateCents,
          currency: data.currency,
          bio: data.bio,
          academic_experience: data.academicExperience,
          work_experience: data.workExperience,
          certifications: data.certifications,
          languages: data.languages,
          therapy_approaches: data.therapyApproaches,
          timezone: data.timezone,
          emergency_contact: data.emergencyContact,
          emergency_phone: data.emergencyPhone,
        });
      } else {
        // Create new profile
        await createProfessionalProfile({
          full_name: data.fullName,
          phone: data.phone,
          specialty: data.specialty,
          license_number: data.licenseNumber,
          years_experience: data.yearsExperience,
          rate_cents: data.rateCents,
          currency: data.currency,
          bio: data.bio,
          academic_experience: data.academicExperience,
          work_experience: data.workExperience,
          certifications: data.certifications,
          languages: data.languages,
          therapy_approaches: data.therapyApproaches,
          timezone: data.timezone,
          emergency_contact: data.emergencyContact,
          emergency_phone: data.emergencyPhone,
        });
      }

      setSuccess(true);
      setPhotoFile(null);
      setCredentialsFile(null);
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
      <div>
        <h1 className="text-3xl font-bold">Perfil Profesional</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Configura tu perfil como profesional de la salud mental
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Información Básica
                  </h3>

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
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Información Profesional
                  </h3>

                  <div>
                    <label
                      htmlFor="specialty"
                      className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      Especialidad
                    </label>
                    <Input
                      id="specialty"
                      {...register("specialty")}
                      className="mt-1"
                      placeholder="Psicología Clínica"
                      disabled={isSubmitting}
                    />
                    {errors.specialty && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.specialty.message}
                      </p>
                    )}
                  </div>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rateCents"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Tarifa por Hora (centavos)
                      </label>
                      <Input
                        id="rateCents"
                        type="number"
                        {...register("rateCents", { valueAsNumber: true })}
                        className="mt-1"
                        placeholder="50000"
                        disabled={isSubmitting}
                      />
                      {errors.rateCents && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.rateCents.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Moneda
                      </label>
                      <Input
                        id="currency"
                        {...register("currency")}
                        className="mt-1"
                        placeholder="COP"
                        disabled={isSubmitting}
                      />
                      {errors.currency && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.currency.message}
                        </p>
                      )}
                    </div>
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
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Contacto de Emergencia
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="emergencyContact"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Nombre del Contacto
                      </label>
                      <Input
                        id="emergencyContact"
                        {...register("emergencyContact")}
                        className="mt-1"
                        placeholder="María Pérez"
                        disabled={isSubmitting}
                      />
                      {errors.emergencyContact && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.emergencyContact.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="emergencyPhone"
                        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                      >
                        Teléfono de Emergencia
                      </label>
                      <Input
                        id="emergencyPhone"
                        {...register("emergencyPhone")}
                        className="mt-1"
                        placeholder="+573001234567"
                        disabled={isSubmitting}
                      />
                      {errors.emergencyPhone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.emergencyPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Actualizando..."
                    : profile
                      ? "Actualizar Perfil"
                      : "Crear Perfil"}
                </Button>

                {/* Experience Sections */}
                <div className="grid gap-6 md:grid-cols-2">
                  <AcademicExperienceEditor disabled={isSubmitting} />
                  <WorkExperienceEditor disabled={isSubmitting} />
                </div>

                {/* Additional Information */}
                <div className="grid gap-6 md:grid-cols-3">
                  <ArrayFieldEditor
                    name="certifications"
                    title="Certificaciones"
                    placeholder="Agregar certificación..."
                    icon={<Award className="h-5 w-5 text-purple-600" />}
                    disabled={isSubmitting}
                  />
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setPhotoFile}
                accept="image/*"
                maxSize={2 * 1024 * 1024} // 2MB
                label="Foto profesional"
                disabled={isSubmitting}
                currentFile={currentPhotoUrl || undefined}
              />
              {photoFile && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Archivo seleccionado: {photoFile.name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenciales</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setCredentialsFile}
                accept=".pdf"
                maxSize={10 * 1024 * 1024} // 10MB
                label="Documentos de credenciales (PDF)"
                disabled={isSubmitting}
                currentFile={currentCredentialsUrl || undefined}
              />
              {credentialsFile && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Archivo seleccionado: {credentialsFile.name}
                </p>
              )}
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Sube tu título profesional, certificaciones o licencias en formato PDF. Estos
                documentos son privados y solo los administradores pueden verlos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Estado del Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Especialidad:</strong> {profile.specialty}
              </p>
              <p>
                <strong>Tarifa:</strong> ${(profile.rate_cents / 100).toFixed(2)} por hora
              </p>
              <p>
                <strong>Verificado:</strong> {profile.is_verified ? "✅ Sí" : "❌ No"}
              </p>
              <p>
                <strong>Biografía:</strong> {profile.bio}
              </p>
              <p>
                <strong>Actualizado:</strong>{" "}
                {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
            {!profile.is_verified && (
              <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                ⏳ Tu perfil está pendiente de verificación. Los administradores revisarán tu
                información y credenciales.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
