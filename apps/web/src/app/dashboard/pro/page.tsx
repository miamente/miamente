"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ProDashboard() {
  const { user, profile, loading } = useAuthGuard({ requiredRole: "pro" });

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Profesional</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Bienvenido, {user?.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perfil Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Rol:</strong> {profile?.role}
              </p>
              <p>
                <strong>Email Verificado:</strong> {user?.emailVerified ? "Sí" : "No"}
              </p>
              {profile?.fullName && (
                <p>
                  <strong>Nombre:</strong> {profile.fullName}
                </p>
              )}
              {profile?.phone && (
                <p>
                  <strong>Teléfono:</strong> {profile.phone}
                </p>
              )}
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
