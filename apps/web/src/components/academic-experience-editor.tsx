"use client";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import type { ProfessionalProfileFormData } from "@/lib/validations";

interface AcademicExperienceEditorProps {
  disabled?: boolean;
}

export function AcademicExperienceEditor({ disabled = false }: AcademicExperienceEditorProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<ProfessionalProfileFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "academicExperience",
  });

  // Watch the academic experience data
  const academicExperience = watch("academicExperience");

  // Initialize fields when data is loaded
  useEffect(() => {
    if (academicExperience && academicExperience.length > 0 && fields.length === 0) {
      // Clear existing fields and add the loaded data
      academicExperience.forEach((exp: any) => {
        append(exp);
      });
    }
  }, [academicExperience, fields.length, append]);

  const addExperience = () => {
    append({
      institution: "",
      degree: "",
      field: "",
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
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Formación Académica
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
                  Institución *
                </label>
                <Input
                  {...control.register(`academicExperience.${index}.institution`)}
                  placeholder="Universidad del Rosario"
                  disabled={disabled}
                />
                {errors.academicExperience?.[index]?.institution && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicExperience[index]?.institution?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título/Degree *
                </label>
                <Input
                  {...control.register(`academicExperience.${index}.degree`)}
                  placeholder="Medicina"
                  disabled={disabled}
                />
                {errors.academicExperience?.[index]?.degree && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicExperience[index]?.degree?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campo de Estudio *
                </label>
                <Input
                  {...control.register(`academicExperience.${index}.field`)}
                  placeholder="Medicina General"
                  disabled={disabled}
                />
                {errors.academicExperience?.[index]?.field && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicExperience[index]?.field?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Inicio *
                </label>
                <Input
                  type="date"
                  {...control.register(`academicExperience.${index}.startDate`)}
                  disabled={disabled}
                />
                {errors.academicExperience?.[index]?.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicExperience[index]?.startDate?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Finalización
                </label>
                <Input
                  type="date"
                  {...control.register(`academicExperience.${index}.endDate`)}
                  disabled={disabled}
                />
                {errors.academicExperience?.[index]?.endDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicExperience[index]?.endDate?.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <Textarea
                {...control.register(`academicExperience.${index}.description`)}
                placeholder="Formación médica general con enfoque en..."
                rows={3}
                disabled={disabled}
              />
              {errors.academicExperience?.[index]?.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.academicExperience[index]?.description?.message}
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
          Agregar Experiencia Académica
        </Button>
      </CardContent>
    </Card>
  );
}
