"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save } from "lucide-react";
import { SpecialtiesMultiSelect } from "./SpecialtiesMultiSelect";
import { TherapeuticApproachesSelector } from "./TherapeuticApproachesSelector";
import { ModalitiesEditor } from "./ModalitiesEditor";
import { useProfessionalSpecialties } from "@/hooks/useProfessionalSpecialties";
import { useProfessionalTherapeuticApproaches } from "@/hooks/useProfessionalTherapeuticApproaches";

interface ProfessionalInfoFormProps {
  professionalId: string;
  initialData?: {
    fullName?: string;
    bio?: string;
    licenseNumber?: string;
    yearsExperience?: number;
    specialtyIds?: string[];
    therapeuticApproachIds?: string[];
  };
  onSave?: (data: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function ProfessionalInfoForm({
  professionalId,
  initialData,
  onSave,
  disabled = false,
}: ProfessionalInfoFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    bio: initialData?.bio || "",
    licenseNumber: initialData?.licenseNumber || "",
    yearsExperience: initialData?.yearsExperience || 0,
    specialtyIds: initialData?.specialtyIds || [],
    therapeuticApproachIds: initialData?.therapeuticApproachIds || [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateSpecialties } = useProfessionalSpecialties(professionalId);
  const { updateApproaches } = useProfessionalTherapeuticApproaches(professionalId);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update specialties and therapeutic approaches
      await Promise.all([
        updateSpecialties(formData.specialtyIds),
        updateApproaches(formData.therapeuticApproachIds),
      ]);

      // Call the parent save handler with the form data
      if (onSave) {
        onSave(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="licenseNumber">Número de Licencia</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="yearsExperience">Años de Experiencia</Label>
            <Input
              id="yearsExperience"
              type="number"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange("yearsExperience", parseInt(e.target.value) || 0)}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia y enfoque profesional..."
              rows={4}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Especialidades */}
      <SpecialtiesMultiSelect
        value={formData.specialtyIds || []}
        onChange={(specialtyIds) => handleInputChange("specialtyIds", specialtyIds)}
        disabled={disabled}
      />

      {/* Enfoques Terapéuticos */}
      <TherapeuticApproachesSelector
        selectedApproaches={formData.therapeuticApproachIds}
        onApproachesChange={(approaches) => handleInputChange("therapeuticApproachIds", approaches)}
        disabled={disabled}
      />

      {/* Modalidades */}
      <ModalitiesEditor disabled={disabled} />

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={disabled || saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Información"}
        </Button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
