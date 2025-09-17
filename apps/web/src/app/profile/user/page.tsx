"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth, getUserUid, getUserEmail } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/profiles";
import { uploadFile } from "@/lib/storage";
import type { UserProfile } from "@/lib/types";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations";

export default function UserProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const { trackProfileComplete } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userUid = getUserUid(user);
      if (!userUid) return;
      const userProfile = await getUserProfile(userUid);
      if (userProfile) {
        setProfile(userProfile as unknown as UserProfile);
        setValue("fullName", (userProfile as { fullName?: string }).fullName || "");
        setValue(
          "phoneCountryCode",
          (userProfile as { phone_country_code?: string }).phone_country_code || "",
        );
        setValue("phoneNumber", (userProfile as { phone_number?: string }).phone_number || "");
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

  const onSubmit = async (data: UserProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Upload new photo if selected
      if (photoFile) {
        // const photoPath = getStoragePath(generateUniqueFilename(photoFile.name));
        await uploadFile(photoFile);
      }

      // Update profile
      const userUid = getUserUid(user);
      if (!userUid) return;
      await updateUserProfile(userUid, {
        fullName: data.fullName,
        phone_country_code: data.phoneCountryCode,
        phone_number: data.phoneNumber,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setPhotoFile(null);
      await loadProfile();

      // Track profile completion event
      await trackProfileComplete({
        hasPhoto: !!photoFile,
        hasPhone: !!(data.phoneCountryCode && data.phoneNumber),
        timestamp: new Date().toISOString(),
      });
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
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Actualiza tu información personal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
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
                  {...register("fullName")}
                  placeholder="Nombre completo"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  {...register("phoneCountryCode")}
                  placeholder="Teléfono (opcional)"
                  disabled={isLoading}
                />
                {errors.phoneCountryCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.phoneCountryCode.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar Perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={setPhotoFile}
              accept="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              label="Foto de perfil"
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
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {getUserEmail(user)}
              </p>
              <p>
                <strong>Nombre:</strong> {(profile as { fullName?: string }).fullName}
              </p>
              <p>
                <strong>Teléfono:</strong> {profile.phone || "No especificado"}
              </p>
              <p>
                <strong>Rol:</strong> {profile.role}
              </p>
              <p>
                <strong>Miembro desde:</strong>{" "}
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
