"use client";

import { useState } from "react";
import { ProfessionalInfoForm } from "@/components/professional-info/ProfessionalInfoForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export default function ProfessionalProfilePage() {
  const [professionalId] = useState("test-professional-id"); // En una app real, esto vendría del contexto de autenticación

  const handleSave = (data: Record<string, unknown>) => {
    console.log("Datos guardados:", data);
    // Aquí se enviarían los datos al backend
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCheck className="h-6 w-6" />
              Perfil Profesional
            </CardTitle>
            <p className="text-gray-600">
              Actualiza tu información profesional, especialidades, enfoques terapéuticos y
              modalidades de intervención.
            </p>
          </CardHeader>
        </Card>

        <ProfessionalInfoForm professionalId={professionalId} onSave={handleSave} />
      </div>
    </div>
  );
}
