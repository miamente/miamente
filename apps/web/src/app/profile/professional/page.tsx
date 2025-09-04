"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  getProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
} from "@/lib/profiles";
import type { ProfessionalProfile } from "@/lib/types";
import { professionalProfileSchema, type ProfessionalProfileFormData } from "@/lib/validations";

export default function ProfessionalProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [credentialsFile, setCredentialsFile] = useState<File | null>(null);
  const [currentPhotoUrl] = useState<string | null>(null);
  const [currentCredentialsUrl, setCurrentCredentialsUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const proProfile = await getProfessionalProfile(user.uid);
      if (proProfile) {
        setProfile(proProfile);
        setValue("specialty", proProfile.specialty);
        setValue("rateCents", proProfile.rateCents);
        setValue("bio", proProfile.bio);
        setCurrentCredentialsUrl(proProfile.credentials || null);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [user, router, loadProfile]);

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (profile) {
        // Update existing profile
        await updateProfessionalProfile(
          user.uid,
          {
            specialty: data.specialty,
            rateCents: data.rateCents,
            bio: data.bio,
            updatedAt: new Date(),
          },
          photoFile || undefined,
          credentialsFile || undefined,
        );
      } else {
        // Create new profile
        await createProfessionalProfile(
          user.uid,
          {
            specialty: data.specialty,
            rateCents: data.rateCents,
            bio: data.bio,
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          photoFile || undefined,
          credentialsFile || undefined,
        );
      }

      setSuccess(true);
      setPhotoFile(null);
      setCredentialsFile(null);
      await loadProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el perfil";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
          </CardHeader>
          <CardContent>
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

              <div>
                <Input
                  {...register("specialty")}
                  placeholder="Especialidad (ej: Psicología Clínica)"
                  disabled={isLoading}
                />
                {errors.specialty && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.specialty.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  {...register("rateCents", { valueAsNumber: true })}
                  type="number"
                  placeholder="Tarifa por hora (en centavos, ej: 50000 = $500)"
                  disabled={isLoading}
                />
                {errors.rateCents && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.rateCents.message}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  {...register("bio")}
                  placeholder="Biografía profesional (mínimo 50 caracteres)"
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  rows={4}
                  disabled={isLoading}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Actualizando..." : profile ? "Actualizar Perfil" : "Crear Perfil"}
              </Button>
            </form>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                <strong>Tarifa:</strong> ${(profile.rateCents / 100).toFixed(2)} por hora
              </p>
              <p>
                <strong>Verificado:</strong> {profile.isVerified ? "✅ Sí" : "❌ No"}
              </p>
              <p>
                <strong>Biografía:</strong> {profile.bio}
              </p>
              <p>
                <strong>Actualizado:</strong> {profile.updatedAt.toLocaleDateString()}
              </p>
            </div>
            {!profile.isVerified && (
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
