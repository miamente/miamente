"use client";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Briefcase } from "lucide-react";
import type { ProfessionalProfileFormData } from "@/lib/validations";

interface WorkExperienceEditorProps {
  disabled?: boolean;
}

export function WorkExperienceEditor({ disabled = false }: WorkExperienceEditorProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<ProfessionalProfileFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workExperience",
  });

  // Watch the work experience data
  const workExperience = watch("workExperience");

  // Initialize fields when data is loaded
  useEffect(() => {
    if (workExperience && workExperience.length > 0 && fields.length === 0) {
      // Clear existing fields and add the loaded data
      workExperience.forEach((exp: any) => {
        append(exp);
      });
    }
  }, [workExperience, fields.length, append]);

  const addExperience = () => {
    append({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const removeExperience = (index: number) => {
    remove(index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-green-600" />
          Experiencia Laboral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Experiencia {index + 1}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeExperience(index)}
                disabled={disabled}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Empresa/Institución *
                </label>
                <Input
                  {...control.register(`workExperience.${index}.company`)}
                  placeholder="Hospital Universitario"
                  disabled={disabled}
                />
                {errors.workExperience?.[index]?.company && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.workExperience[index]?.company?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cargo/Posición *
                </label>
                <Input
                  {...control.register(`workExperience.${index}.position`)}
                  placeholder="Psiquiatra"
                  disabled={disabled}
                />
                {errors.workExperience?.[index]?.position && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.workExperience[index]?.position?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Inicio *
                </label>
                <Input
                  type="date"
                  {...control.register(`workExperience.${index}.startDate`)}
                  disabled={disabled}
                />
                {errors.workExperience?.[index]?.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.workExperience[index]?.startDate?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Finalización
                </label>
                <Input
                  type="date"
                  {...control.register(`workExperience.${index}.endDate`)}
                  disabled={disabled}
                />
                {errors.workExperience?.[index]?.endDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.workExperience[index]?.endDate?.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <Textarea
                {...control.register(`workExperience.${index}.description`)}
                placeholder="Tratamiento de pacientes con trastornos mentales severos..."
                rows={3}
                disabled={disabled}
              />
              {errors.workExperience?.[index]?.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.workExperience[index]?.description?.message}
                </p>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addExperience}
          disabled={disabled}
          className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Experiencia Laboral
        </Button>
      </CardContent>
    </Card>
  );
}
