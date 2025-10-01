"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Stethoscope } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import type { Specialty, SpecialtyCreate, SpecialtyUpdate } from "@/lib/types";

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getAllSpecialtiesAdmin();
        // The API now returns professional_count directly
        setSpecialties(data);
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
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateSpecialty = () => {
    setEditingSpecialty(null);
    setFormData({
      name: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSpecialty = async () => {
    try {
      if (editingSpecialty) {
        const updateData: SpecialtyUpdate = {
          name: formData.name,
        };
        const updatedSpecialty = await apiClient.updateSpecialty(editingSpecialty.id, updateData);
        setSpecialties((prev) =>
          prev.map((s) =>
            s.id === editingSpecialty.id
              ? { ...updatedSpecialty, professional_count: s.professional_count }
              : s,
          ),
        );
      } else {
        const createData: SpecialtyCreate = {
          name: formData.name,
        };
        const newSpecialty = await apiClient.createSpecialty(createData);
        setSpecialties((prev) => [...prev, newSpecialty]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving specialty:", err);
      setError("Error al guardar la especialidad");
    }
  };

  const handleDeleteSpecialty = async (specialtyId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta especialidad?")) {
      try {
        await apiClient.deleteSpecialty(specialtyId);
        setSpecialties((prev) => prev.filter((s) => s.id !== specialtyId));
      } catch (err) {
        console.error("Error deleting specialty:", err);
        setError("Error al eliminar la especialidad");
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Especialidades</h1>
          <p className="mt-2 text-gray-600">Administrar especialidades médicas y terapéuticas</p>
        </div>
        <Button onClick={handleCreateSpecialty}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Especialidad
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
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

      {/* Specialties Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesionales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {specialty.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {specialty.professional_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSpecialty(specialty)}
                          className="hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSpecialty(specialty.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredSpecialties.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            {searchTerm ? "No hay especialidades que coincidan con la búsqueda" : "No hay especialidades registradas"}
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
