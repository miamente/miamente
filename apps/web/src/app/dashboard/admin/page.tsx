"use client";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { logout } from "@/lib/auth";

export default function AdminDashboard() {
  const { user, loading } = useAuthGuard({ requiredRole: "admin" });
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrador</h1>
          <p className="text-neutral-600 dark:text-neutral-300">Bienvenido, {user?.email}</p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Ver Todos los Usuarios
            </Button>
            <Button className="w-full" variant="outline">
              Verificar Profesionales
            </Button>
            <Button className="w-full" variant="outline">
              Gestionar Roles
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas y Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Ver Todas las Citas
            </Button>
            <Button className="w-full" variant="outline">
              Gestionar Pagos
            </Button>
            <Button className="w-full" variant="outline">
              Reportes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Configuración
            </Button>
            <Button className="w-full" variant="outline">
              Logs del Sistema
            </Button>
            <Button className="w-full" variant="outline">
              Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
