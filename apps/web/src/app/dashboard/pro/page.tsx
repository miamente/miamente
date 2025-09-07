"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserEmail, getUserFullName, isUserVerified } from "@/hooks/useAuth";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ProDashboard() {
  const { user, isLoading } = useAuthGuard({ requiredRole: "pro" });

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Profesional</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Bienvenido, {getUserFullName(user)}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {getUserEmail(user)}
              </p>
              <p>
                <strong>Rol:</strong> {user?.type}
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

        <Card>
          <CardHeader>
            <CardTitle>Gestión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Configurar Disponibilidad
            </Button>
            <Button className="w-full" variant="outline">
              Ver Citas Programadas
            </Button>
            <Button className="w-full" variant="outline">
              Gestionar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
