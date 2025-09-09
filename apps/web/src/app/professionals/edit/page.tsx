"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Save, Plus, Trash2, GraduationCap, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  type ProfessionalProfile,
  type AcademicExperience,
  type WorkExperience,
} from "@/lib/profiles";

interface ProfessionalFormData {
  full_name: string;
  specialty: string;
  bio: string;
  hourly_rate_cents: number;
  phone: string;
  email: string;
  location: string;
  academic_experience: AcademicExperience[];
  work_experience: WorkExperience[];
}

export default function EditProfessionalProfilePage() {
  const router = useRouter();
  const [, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfessionalFormData>({
    defaultValues: {
      academic_experience: [],
      work_experience: [],
    },
  });

  const {
    fields: academicFields,
    append: appendAcademic,
    remove: removeAcademic,
  } = useFieldArray({
    control,
    name: "academic_experience",
  });

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: "work_experience",
  });

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const data = await getMyProfessionalProfile();
        setProfessional(data);

        if (!data) {
          setError("No se pudo cargar el perfil del profesional");
          return;
        }

        // Transform data for form
        const formData: ProfessionalFormData = {
          full_name: data.full_name || "",
          specialty: data.specialty || "",
          bio: data.bio || "",
          hourly_rate_cents: data.rate_cents || 0,
          phone: data.phone || "",
          email: data.email || "",
          location: "",
          academic_experience: data.academic_experience || [],
          work_experience: data.work_experience || [],
        };

        reset(formData);
      } catch (err) {
        setError("Error al cargar el perfil del profesional");
        console.error("Error fetching professional:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [reset]);

  const onSubmit = async (data: ProfessionalFormData) => {
    setSaving(true);
    setError(null);

    try {
      await updateProfessionalProfile(data);
      router.push("/professionals");
    } catch (err) {
      setError("Error al guardar los cambios");
      console.error("Error updating professional:", err);
    } finally {
      setSaving(false);
    }
  };

  const addAcademicExperience = () => {
    appendAcademic({
      degree: "",
      institution: "",
      start_year: new Date().getFullYear(),
      end_year: new Date().getFullYear(),
      description: "",
    });
  };

  const addWorkExperience = () => {
    appendWork({
      position: "",
      company: "",
      start_date: "",
      end_date: "",
      description: "",
      achievements: [],
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Profesionales", href: "/professionals" }, { label: "Editar Perfil" }]}
          className="mb-4"
        />
        <div className="py-12 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Error</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={() => router.push("/professionals")}>Volver a Profesionales</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[{ label: "Profesionales", href: "/professionals" }, { label: "Editar Perfil" }]}
        className="mb-4"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Editar Perfil Profesional
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Actualiza tu información profesional y experiencia
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  {...register("full_name", { required: "El nombre es requerido" })}
                  className="mt-1"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  {...register("specialty", { required: "La especialidad es requerida" })}
                  className="mt-1"
                />
                {errors.specialty && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                rows={4}
                className="mt-1"
                placeholder="Describe tu experiencia y enfoque profesional..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="hourly_rate_cents">Tarifa por Hora (COP)</Label>
                <Input
                  id="hourly_rate_cents"
                  type="number"
                  {...register("hourly_rate_cents", {
                    required: "La tarifa es requerida",
                    min: { value: 0, message: "La tarifa debe ser positiva" },
                  })}
                  className="mt-1"
                />
                {errors.hourly_rate_cents && (
                  <p className="mt-1 text-sm text-red-600">{errors.hourly_rate_cents.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" {...register("phone")} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "El email es requerido" })}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" {...register("location")} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiencia Académica */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Formación Académica
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addAcademicExperience}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicFields.map((field, index) => (
              <Card key={field.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium">Experiencia Académica {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAcademic(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`academic_experience.${index}.degree`}>Título</Label>
                      <Input
                        {...register(`academic_experience.${index}.degree`)}
                        className="mt-1"
                        placeholder="Ej: Psicología"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`academic_experience.${index}.institution`}>
                        Institución
                      </Label>
                      <Input
                        {...register(`academic_experience.${index}.institution`)}
                        className="mt-1"
                        placeholder="Ej: Universidad Nacional"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`academic_experience.${index}.start_year`}>
                        Año de Inicio
                      </Label>
                      <Input
                        {...register(`academic_experience.${index}.start_year`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        className="mt-1"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`academic_experience.${index}.end_year`}>
                        Año de Finalización
                      </Label>
                      <Input
                        {...register(`academic_experience.${index}.end_year`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        className="mt-1"
                        placeholder="2024 (dejar vacío si está en curso)"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`academic_experience.${index}.description`}>Descripción</Label>
                    <Textarea
                      {...register(`academic_experience.${index}.description`)}
                      className="mt-1"
                      rows={2}
                      placeholder="Descripción adicional del programa o logros..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {academicFields.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No hay experiencia académica agregada</p>
                <p className="text-sm">Haz clic en &quot;Agregar&quot; para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experiencia Laboral */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Experiencia Laboral
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {workFields.map((field, index) => (
              <Card key={field.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium">Experiencia Laboral {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWork(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`work_experience.${index}.position`}>Cargo</Label>
                      <Input
                        {...register(`work_experience.${index}.position`)}
                        className="mt-1"
                        placeholder="Ej: Psicóloga Clínica"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`work_experience.${index}.company`}>Empresa</Label>
                      <Input
                        {...register(`work_experience.${index}.company`)}
                        className="mt-1"
                        placeholder="Ej: Hospital General"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`work_experience.${index}.start_date`}>Fecha de Inicio</Label>
                      <Input
                        type="date"
                        {...register(`work_experience.${index}.start_date`)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`work_experience.${index}.end_date`}>
                        Fecha de Finalización
                      </Label>
                      <Input
                        type="date"
                        {...register(`work_experience.${index}.end_date`)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`work_experience.${index}.description`}>Descripción</Label>
                    <Textarea
                      {...register(`work_experience.${index}.description`)}
                      className="mt-1"
                      rows={3}
                      placeholder="Describe tus responsabilidades y logros en este puesto..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {workFields.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No hay experiencia laboral agregada</p>
                <p className="text-sm">Haz clic en &quot;Agregar&quot; para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/professionals")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !isDirty} className="min-w-[120px]">
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
