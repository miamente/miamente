"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, Plus, ChevronDown, ChevronRight, Edit, Trash2, Star } from "lucide-react";
import {
  useProfessionalSpecialties,
  ProfessionalSpecialty,
  DefaultSpecialty,
} from "@/hooks/useProfessionalSpecialties";
import { formatPrice } from "@/lib/specialties";

interface SpecialtiesEditorProps {
  disabled?: boolean;
}

export function SpecialtiesEditor({ disabled = false }: SpecialtiesEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [customDescription, setCustomDescription] = useState<string>("");
  const [editingSpecialty, setEditingSpecialty] = useState<ProfessionalSpecialty | null>(null);
  const [isDefaultSpecialty, setIsDefaultSpecialty] = useState<boolean>(false);

  const {
    specialties,
    availableDefaults,
    loading,
    error,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
  } = useProfessionalSpecialties();

  const selectedDefaultSpecialty = availableDefaults.find((s) => s.id === selectedSpecialty);

  // Check if there are any default specialties currently assigned
  const hasDefaultSpecialty = specialties.some((s) => s.is_default);
  const shouldShowDefaultCheckbox = !hasDefaultSpecialty && !editingSpecialty;

  const handleAddSpecialty = async () => {
    if (!selectedSpecialty || !customPrice || !customDescription) return;

    try {
      // Si se va a marcar como predeterminada, primero quitar la marca de las existentes
      if (isDefaultSpecialty) {
        const existingDefaultSpecialties = specialties.filter((s) => s.is_default);
        for (const existingSpecialty of existingDefaultSpecialties) {
          await updateSpecialty(existingSpecialty.id, {
            is_default: false,
          });
        }
      }

      await createSpecialty({
        name: selectedDefaultSpecialty?.name || "Especialidad Personalizada",
        description: customDescription,
        price_cents: parseInt(customPrice),
        specialty_id: selectedSpecialty,
        is_default: isDefaultSpecialty,
      });

      // Reset form
      setSelectedSpecialty("");
      setCustomPrice("");
      setCustomDescription("");
      setIsDefaultSpecialty(false);
    } catch (error) {
      console.error("Error al agregar especialidad:", error);
    }
  };

  const handleEditSpecialty = (specialty: ProfessionalSpecialty) => {
    setEditingSpecialty(specialty);
    setSelectedSpecialty(specialty.specialty_id || "");
    setCustomPrice(specialty.price_cents.toString());
    setCustomDescription(specialty.description);
  };

  const handleUpdateSpecialty = async () => {
    if (!editingSpecialty || !customPrice || !customDescription) return;

    try {
      await updateSpecialty(editingSpecialty.id, {
        price_cents: parseInt(customPrice),
        description: customDescription,
      });

      // Reset form
      setEditingSpecialty(null);
      setSelectedSpecialty("");
      setCustomPrice("");
      setCustomDescription("");
    } catch (error) {
      console.error("Error al actualizar especialidad:", error);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta especialidad?")) {
      try {
        await deleteSpecialty(id);
      } catch (error) {
        console.error("Error al eliminar especialidad:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSpecialty(null);
    setSelectedSpecialty("");
    setCustomPrice("");
    setCustomDescription("");
    setIsDefaultSpecialty(false);
  };

  const handleToggleDefault = async (specialty: ProfessionalSpecialty) => {
    try {
      if (specialty.is_default) {
        // Si ya es predeterminada, quitarla
        await updateSpecialty(specialty.id, {
          is_default: false,
        });
      } else {
        // Si no es predeterminada, marcarla como predeterminada
        // Primero quitar la marca de predeterminada de todas las otras especialidades
        const otherSpecialties = specialties.filter((s) => s.id !== specialty.id && s.is_default);
        for (const otherSpecialty of otherSpecialties) {
          await updateSpecialty(otherSpecialty.id, {
            is_default: false,
          });
        }

        // Luego marcar esta como predeterminada
        await updateSpecialty(specialty.id, {
          is_default: true,
        });
      }
    } catch (error) {
      console.error("Error al cambiar especialidad predeterminada:", error);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={isOpen ? "pt-0" : "p-0"}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer py-6 transition-colors hover:bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              Especialidades y Precios
              {isOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 overflow-visible">
            {/* Lista de especialidades actuales */}
            {specialties.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Mis Especialidades</h4>
                <div className="space-y-3">
                  {specialties.map((specialty) => (
                    <div key={specialty.id} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{specialty.name}</h5>
                            {specialty.is_default && (
                              <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{specialty.description}</p>
                          <p className="mt-1 text-sm font-semibold text-green-600">
                            {formatPrice(specialty.price_cents)} {specialty.currency}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDefault(specialty)}
                            disabled={disabled}
                            className={
                              specialty.is_default
                                ? "text-yellow-600 hover:text-yellow-700"
                                : "text-gray-600 hover:text-yellow-600"
                            }
                            title={
                              specialty.is_default
                                ? "Quitar como predeterminada"
                                : "Marcar como predeterminada"
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${specialty.is_default ? "fill-current" : ""}`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSpecialty(specialty)}
                            disabled={disabled}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSpecialty(specialty.id)}
                            disabled={disabled}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formulario para agregar/editar especialidad */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {editingSpecialty ? "Editar Especialidad" : "Agregar Nueva Especialidad"}
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative overflow-visible">
                  <Label htmlFor="specialty-select">Especialidad</Label>
                  {editingSpecialty ? (
                    <div className="border-input flex h-9 w-full min-w-0 items-center rounded-md border bg-gray-50 bg-transparent px-3 py-1 text-base text-gray-700 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                      {editingSpecialty.name}
                    </div>
                  ) : (
                    <Select
                      options={availableDefaults.map((s) => ({ value: s.id, label: s.name }))}
                      value={selectedSpecialty}
                      onValueChange={setSelectedSpecialty}
                      placeholder="Selecciona una especialidad"
                      disabled={disabled}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="custom-price">Precio Personalizado (COP)</Label>
                  <Input
                    id="custom-price"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Ej: 80000"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción Personalizada</Label>
                <Input
                  id="description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Descripción de la especialidad"
                  disabled={disabled}
                />
                {selectedDefaultSpecialty && (
                  <p className="mt-1 text-xs text-gray-500">
                    Descripción predeterminada: {selectedDefaultSpecialty.description}
                  </p>
                )}
              </div>

              {/* Checkbox para marcar como especialidad predeterminada */}
              {shouldShowDefaultCheckbox && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-default-specialty"
                    checked={isDefaultSpecialty}
                    onCheckedChange={(checked) => setIsDefaultSpecialty(checked as boolean)}
                    disabled={disabled}
                  />
                  <Label htmlFor="is-default-specialty" className="text-sm font-medium">
                    Marcar como especialidad predeterminada
                  </Label>
                </div>
              )}

              <div className="flex gap-2">
                {editingSpecialty ? (
                  <>
                    <Button
                      onClick={handleUpdateSpecialty}
                      disabled={disabled || !customPrice || !customDescription}
                      className="flex-1"
                    >
                      Actualizar Especialidad
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} disabled={disabled}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAddSpecialty}
                    disabled={disabled || !selectedSpecialty || !customPrice || !customDescription}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Especialidad
                  </Button>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Mensaje de carga */}
            {loading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-600">Cargando especialidades...</p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">Error: {error}</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
