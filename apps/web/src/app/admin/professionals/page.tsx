"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProfessionals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Profesionales
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Administra los profesionales de la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Profesionales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            Funcionalidad de gestión de profesionales en desarrollo
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
