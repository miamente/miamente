"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { registerWithEmail } from "@/lib/auth";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { trackSignup } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.emailVerified) {
        router.push("/dashboard/user");
      } else {
        router.push("/verify");
      }
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerWithEmail(data.email, data.password);
      setSuccess(true);

      // Track signup event
      await trackSignup({
        email: data.email,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear la cuenta";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <div className="flex min-h-[50vh] items-center justify-center">Redirigiendo...</div>;
  }

  if (success) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>¡Cuenta Creada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Te hemos enviado un email de verificación. Por favor revisa tu bandeja de entrada y
              haz clic en el enlace para verificar tu cuenta.
            </p>
            <Button onClick={() => router.push("/verify")} className="w-full">
              Ir a Verificación
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Input {...register("email")} type="email" placeholder="Email" disabled={isLoading} />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                {...register("password")}
                type="password"
                placeholder="Contraseña"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirmar Contraseña"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
