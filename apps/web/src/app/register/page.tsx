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
import { useAuth, isUserVerified } from "@/hooks/useAuth";
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
      if (isUserVerified(user)) {
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
      await registerWithEmail({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
      });
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
              <Input
                {...register("fullName")}
                type="text"
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

            {/* Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                {...register("consent")}
                type="checkbox"
                id="consent"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="consent" className="text-sm text-gray-600 dark:text-gray-400">
                Acepto los{" "}
                <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">
                  Política de Privacidad
                </Link>
                . Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012.
              </label>
            </div>
            {errors.consent && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.consent.message}
              </p>
            )}

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
