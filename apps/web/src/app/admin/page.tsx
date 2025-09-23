"use client";
import React from "react";
import { Users, UserCheck, Shield, Stethoscope, Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard de Administración
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Panel de control para administrar la plataforma
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Acciones Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/users">
                <Users className="h-6 w-6" />
                <span>Gestionar Usuarios</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/professionals">
                <UserCheck className="h-6 w-6" />
                <span>Gestionar Profesionales</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/specialties">
                <Stethoscope className="h-6 w-6" />
                <span>Gestionar Especialidades</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link href="/admin/modalities">
                <Settings className="h-6 w-6" />
                <span>Gestionar Modalidades</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
