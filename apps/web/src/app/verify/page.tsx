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
      if (user.emailVerified) {
        router.push("/dashboard/user");
        return;
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

            <Button onClick={() => router.push("/dashboard/user")} className="w-full">
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
