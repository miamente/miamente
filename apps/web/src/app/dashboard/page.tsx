"use client";
import { useAuth, isUserVerified, getUserEmail, getUserFullName } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.push("/login");
        return;
      }

      if (!isUserVerified(user)) {
        // User not verified, redirect to verification
        router.push("/verify");
        return;
      }

      // User is authenticated and verified, show unified dashboard
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  if (!isUserVerified(user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo a verificación...</p>
        </div>
      </div>
    );
  }

  // Check user role
  const isProfessional = user.type === "professional";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isProfessional ? "Dashboard Profesional" : "Dashboard Usuario"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Bienvenido, {getUserFullName(user)}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Rol: {user.type === "professional" ? "Profesional" : "Usuario"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {getUserEmail(user)}
              </p>
              <p>
                <strong>Rol:</strong> {user.type === "professional" ? "Profesional" : "Usuario"}
              </p>
              <p>
                <strong>Email Verificado:</strong> {isUserVerified(user) ? "Sí" : "No"}
              </p>
              <p>
                <strong>Nombre:</strong> {getUserFullName(user)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isProfessional ? "Gestión Profesional" : "Acciones de Usuario"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isProfessional ? (
              <>
                <Button className="w-full" variant="outline">
                  Configurar Disponibilidad
                </Button>
                <Button className="w-full" variant="outline">
                  Ver Citas Programadas
                </Button>
                <Button className="w-full" variant="outline">
                  Gestionar Perfil
                </Button>
                <Button className="w-full" variant="outline">
                  Ver Estadísticas
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" variant="outline">
                  Completar Perfil
                </Button>
                <Button className="w-full" variant="outline">
                  Buscar Profesionales
                </Button>
                <Button className="w-full" variant="outline">
                  Mis Citas
                </Button>
                <Button className="w-full" variant="outline">
                  Historial de Sesiones
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Features Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isProfessional
                ? "Gestiona las notificaciones de tus citas y pacientes"
                : "Revisa tus notificaciones y recordatorios"}
            </p>
            <Button className="mt-2 w-full" variant="outline" size="sm">
              Ver Notificaciones
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isProfessional
                ? "Configura tu perfil profesional y preferencias"
                : "Personaliza tu experiencia de usuario"}
            </p>
            <Button className="mt-2 w-full" variant="outline" size="sm">
              Configurar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soporte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              ¿Necesitas ayuda? Contacta con nuestro equipo de soporte
            </p>
            <Button className="mt-2 w-full" variant="outline" size="sm">
              Contactar Soporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
