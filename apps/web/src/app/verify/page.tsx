"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { resendEmailVerification, logout } from "@/lib/auth";

export default function VerifyPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      // In development mode (emulator), allow bypassing email verification
      const isDevelopment = window.location.hostname === "localhost";

      if (user.is_verified || isDevelopment) {
        // Only auto-redirect if email is actually verified
        // In development, we let the user manually proceed
        if (user.is_verified) {
          router.push("/dashboard/user");
          return;
        }
      }
    }
  }, [user, loading, router]);

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await resendEmailVerification();
      setResendSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al reenviar el email";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleSimulateVerification = async () => {
    try {
      // Check if we're running in development
      const isDevelopment = window.location.hostname === "localhost";

      if (isDevelopment) {
        // In development mode, we can simulate email verification
        console.log("Development mode: Simulating email verification");
        router.push("/dashboard/user");
      } else {
        // In production, we would need actual email verification
        if (user?.is_verified) {
          router.push("/dashboard/user");
        } else {
          setError("El email aún no ha sido verificado. Por favor revisa tu bandeja de entrada.");
        }
      }
    } catch (err) {
      console.error("Error checking verification:", err);
      setError("Error al verificar el estado del email");
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <div className="flex min-h-[50vh] items-center justify-center">Redirigiendo...</div>;
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificar Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Te hemos enviado un email de verificación a <strong>{user.email}</strong>. Por favor
            revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
          </p>

          {window.location.hostname === "localhost" && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <strong>Modo Desarrollo:</strong> En el emulador, puedes simular la verificación
              haciendo clic en &quot;Ya verifiqué mi email&quot;.
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              Email de verificación reenviado exitosamente
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? "Reenviando..." : "Reenviar Email de Verificación"}
            </Button>

            <Button onClick={handleSimulateVerification} className="w-full">
              Ya verifiqué mi email
            </Button>

            <Button onClick={handleLogout} variant="ghost" className="w-full">
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
