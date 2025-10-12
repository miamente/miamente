"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUnifiedAuth, getAccountId, getAccountEmail, getAccountFullName } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { uploadFile } from "@/lib/storage";
import type { UserProfile, AccountUpdate } from "@/lib/types";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations";

export default function UserProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [currentPhotoUrl] = useState<string | null>(null);

  const { account, isLoading, isAuthenticated } = useUnifiedAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const loadProfile = useCallback(async () => {
    if (!account) return;

    try {
      const accountId = getAccountId(account);
      if (!accountId) return;
      
      const accountData = await apiClient.getAccountById(accountId);
      if (accountData) {
        setProfile(accountData.profile as UserProfile);
        setValue("fullName", accountData.account.full_name || "");
        setValue("phoneCountryCode", accountData.account.phone_country_code || "");
        setValue("phoneNumber", accountData.account.phone_number || "");
        setValue("email", accountData.account.email || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [account, setValue]);

  useEffect(() => {
    if (isLoading) return; // Wait for auth to finish loading

    if (!isAuthenticated || !account) {
      router.push("/login");
      return;
    }

    loadProfile();
  }, [account, isLoading, isAuthenticated, router, loadProfile]);

  const onSubmit = async (data: UserProfileFormData) => {
    console.log("onSubmit called with data:", data);
    if (!account) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Upload new photo if selected
      if (photoFile) {
        await uploadFile(photoFile);
      }

      // Update account using new endpoint
      const accountId = getAccountId(account);
      if (!accountId) return;
      
      const accountUpdate: AccountUpdate = {
        full_name: data.fullName,
        phone_country_code: data.phoneCountryCode,
        phone_number: data.phoneNumber,
      };
      
      await apiClient.updateAccount(accountId, accountUpdate);

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        <p className="text-neutral-600">Actualiza tu información personal</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log("Form validation errors:", errors);
              })}
              className="space-y-4"
            >
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                  Perfil actualizado exitosamente
                </div>
              )}

              <div>
                <Input
                  {...register("fullName")}
                  placeholder="Nombre completo"
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register("email")}
                  placeholder="Email"
                  type="email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Input
                  {...register("phoneCountryCode")}
                  placeholder="Teléfono (opcional)"
                  disabled={isSubmitting}
                />
                {errors.phoneCountryCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneCountryCode.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
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
              disabled={isSubmitting}
              currentFile={currentPhotoUrl || undefined}
            />
            {photoFile && (
              <p className="mt-2 text-sm text-blue-600">Archivo seleccionado: {photoFile.name}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {account && (
        <Card>
          <CardHeader>
            <CardTitle>Información Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {getAccountEmail(account) || "No disponible"}
              </p>
              <p>
                <strong>Nombre:</strong> {getAccountFullName(account)}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {account.phone_country_code && account.phone_number
                  ? `${account.phone_country_code} ${account.phone_number}`
                  : "No especificado"}
              </p>
              <p>
                <strong>Rol:</strong> {account.role_name}
              </p>
              <p>
                <strong>Miembro desde:</strong>{" "}
                {account.created_at ? new Date(account.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
