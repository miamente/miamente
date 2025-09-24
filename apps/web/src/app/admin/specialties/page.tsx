"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Specialty {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  professional_count?: number;
}

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        // const data = await getSpecialties();
        // setSpecialties(data);

        // Mock data for now
        const mockSpecialties: Specialty[] = [
          {
            id: "1",
            name: "Psicología Clínica",
            description: "Tratamiento de trastornos mentales y emocionales",
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            professional_count: 12,
          },
          {
            id: "2",
            name: "Terapia Cognitivo-Conductual",
            description: "Enfoque terapéutico basado en cogniciones y comportamientos",
            is_active: true,
            created_at: "2024-01-16T09:15:00Z",
            updated_at: "2024-01-16T09:15:00Z",
            professional_count: 8,
          },
          {
            id: "3",
            name: "Psiquiatría",
            description: "Especialidad médica en salud mental",
            is_active: false,
            created_at: "2024-01-17T14:20:00Z",
            updated_at: "2024-01-17T14:20:00Z",
            professional_count: 5,
          },
        ];
        setSpecialties(mockSpecialties);
      } catch (err) {
        console.error("Error loading specialties:", err);
        setError("Error al cargar las especialidades");
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  const filteredSpecialties = specialties.filter(
    (specialty) =>
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateSpecialty = () => {
    setEditingSpecialty(null);
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
      is_active: specialty.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSpecialty = async () => {
    try {
      if (editingSpecialty) {
        // TODO: Implement API call to update specialty
        console.log("Update specialty:", { id: editingSpecialty.id, ...formData });
        setSpecialties((prev) =>
          prev.map((s) =>
            s.id === editingSpecialty.id
              ? { ...s, ...formData, updated_at: new Date().toISOString() }
              : s,
          ),
        );
      } else {
        // TODO: Implement API call to create specialty
        console.log("Create specialty:", formData);
        const newSpecialty: Specialty = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          professional_count: 0,
        };
        setSpecialties((prev) => [...prev, newSpecialty]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving specialty:", err);
    }
  };

  const handleDeleteSpecialty = async (specialtyId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta especialidad?")) {
      try {
        // TODO: Implement API call to delete specialty
        console.log("Delete specialty:", specialtyId);
        setSpecialties((prev) => prev.filter((s) => s.id !== specialtyId));
      } catch (err) {
        console.error("Error deleting specialty:", err);
      }
    }
  };

  const handleToggleActive = async (specialtyId: string, currentStatus: boolean) => {
    try {
      // TODO: Implement API call to toggle specialty status
      console.log(`Toggle active status for specialty ${specialtyId} to ${!currentStatus}`);
      setSpecialties((prev) =>
        prev.map((s) =>
          s.id === specialtyId
            ? { ...s, is_active: !currentStatus, updated_at: new Date().toISOString() }
            : s,
        ),
      );
    } catch (err) {
      console.error("Error updating specialty status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Especialidades
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administrar especialidades médicas y terapéuticas
          </p>
        </div>
        <Button onClick={handleCreateSpecialty}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Especialidad
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Specialties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSpecialties.map((specialty) => (
          <Card key={specialty.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">{specialty.name}</CardTitle>
                </div>
                <Badge variant={specialty.is_active ? "default" : "secondary"}>
                  {specialty.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialty.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {specialty.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Profesionales: {specialty.professional_count || 0}</span>
                  <span>Creada: {new Date(specialty.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSpecialty(specialty)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(specialty.id, specialty.is_active)}
                  >
                    {specialty.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSpecialty(specialty.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpecialties.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay especialidades que coincidan con la búsqueda
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? "Editar Especialidad" : "Agregar Especialidad"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la especialidad"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la especialidad"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Especialidad activa</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSaveSpecialty}>
                <Save className="mr-2 h-4 w-4" />
                {editingSpecialty ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
