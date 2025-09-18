"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthContext, isUserVerified } from "@/contexts/AuthContext";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loginUser, loginProfessional } = useAuthContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (isUserVerified(user)) {
        // Redirect to unified dashboard
        router.push("/dashboard");
      } else {
        router.push("/verify");
      }
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the unified login approach - try professional first, then user
      try {
        await loginProfessional(data);
      } catch (professionalError) {
        console.log("Professional login failed, trying as user:", professionalError);
        await loginUser(data);
      }
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <div className="flex min-h-[50vh] items-center justify-center">Redirigiendo...</div>;
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">¿No tienes cuenta? </span>
            <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
