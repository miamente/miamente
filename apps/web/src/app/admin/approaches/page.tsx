"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Brain, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TherapeuticApproach {
  id: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  professional_count?: number;
}

export default function AdminApproaches() {
  const [approaches, setApproaches] = useState<TherapeuticApproach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApproach, setEditingApproach] = useState<TherapeuticApproach | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    is_active: true,
  });

  const categories = [
    "Cognitivo-Conductual",
    "Psicoanalítica",
    "Humanista",
    "Sistémica",
    "Gestalt",
    "EMDR",
    "Mindfulness",
    "Otro",
  ];

  useEffect(() => {
    const loadApproaches = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        // const data = await getTherapeuticApproaches();
        // setApproaches(data);

        // Mock data for now
        const mockApproaches: TherapeuticApproach[] = [
          {
            id: "1",
            name: "Terapia Cognitivo-Conductual",
            description:
              "Enfoque terapéutico que se centra en identificar y cambiar patrones de pensamiento negativos",
            category: "Cognitivo-Conductual",
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            professional_count: 25,
          },
          {
            id: "2",
            name: "EMDR",
            description:
              "Desensibilización y reprocesamiento por movimientos oculares para el tratamiento del trauma",
            category: "EMDR",
            is_active: true,
            created_at: "2024-01-16T09:15:00Z",
            updated_at: "2024-01-16T09:15:00Z",
            professional_count: 12,
          },
          {
            id: "3",
            name: "Terapia Gestalt",
            description: "Enfoque humanista que se centra en el aquí y ahora",
            category: "Gestalt",
            is_active: false,
            created_at: "2024-01-17T14:20:00Z",
            updated_at: "2024-01-17T14:20:00Z",
            professional_count: 5,
          },
          {
            id: "4",
            name: "Mindfulness",
            description: "Práctica de atención plena para el bienestar mental",
            category: "Mindfulness",
            is_active: true,
            created_at: "2024-01-18T11:45:00Z",
            updated_at: "2024-01-18T11:45:00Z",
            professional_count: 18,
          },
        ];
        setApproaches(mockApproaches);
      } catch (err) {
        console.error("Error loading approaches:", err);
        setError("Error al cargar los enfoques terapéuticos");
      } finally {
        setLoading(false);
      }
    };

    loadApproaches();
  }, []);

  const filteredApproaches = approaches.filter(
    (approach) =>
      approach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (approach.description &&
        approach.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (approach.category && approach.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleCreateApproach = () => {
    setEditingApproach(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditApproach = (approach: TherapeuticApproach) => {
    setEditingApproach(approach);
    setFormData({
      name: approach.name,
      description: approach.description || "",
      category: approach.category || "",
      is_active: approach.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSaveApproach = async () => {
    try {
      if (editingApproach) {
        // TODO: Implement API call to update approach
        console.log("Update approach:", { id: editingApproach.id, ...formData });
        setApproaches((prev) =>
          prev.map((a) =>
            a.id === editingApproach.id
              ? { ...a, ...formData, updated_at: new Date().toISOString() }
              : a,
          ),
        );
      } else {
        // TODO: Implement API call to create approach
        console.log("Create approach:", formData);
        const newApproach: TherapeuticApproach = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          professional_count: 0,
        };
        setApproaches((prev) => [...prev, newApproach]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving approach:", err);
    }
  };

  const handleDeleteApproach = async (approachId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este enfoque terapéutico?")) {
      try {
        // TODO: Implement API call to delete approach
        console.log("Delete approach:", approachId);
        setApproaches((prev) => prev.filter((a) => a.id !== approachId));
      } catch (err) {
        console.error("Error deleting approach:", err);
      }
    }
  };

  const handleToggleActive = async (approachId: string, currentStatus: boolean) => {
    try {
      // TODO: Implement API call to toggle approach status
      console.log(`Toggle active status for approach ${approachId} to ${!currentStatus}`);
      setApproaches((prev) =>
        prev.map((a) =>
          a.id === approachId
            ? { ...a, is_active: !currentStatus, updated_at: new Date().toISOString() }
            : a,
        ),
      );
    } catch (err) {
      console.error("Error updating approach status:", err);
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
            Gestión de Enfoques Terapéuticos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administrar enfoques y metodologías terapéuticas
          </p>
        </div>
        <Button onClick={handleCreateApproach}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Enfoque
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
          <CardTitle>Buscar Enfoques Terapéuticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Approaches Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredApproaches.map((approach) => (
          <Card key={approach.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">{approach.name}</CardTitle>
                </div>
                <Badge variant={approach.is_active ? "default" : "secondary"}>
                  {approach.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approach.category && (
                  <Badge variant="outline" className="text-xs">
                    {approach.category}
                  </Badge>
                )}

                {approach.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{approach.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Profesionales: {approach.professional_count || 0}</span>
                  </span>
                  <span>Creado: {new Date(approach.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditApproach(approach)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(approach.id, approach.is_active)}
                  >
                    {approach.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteApproach(approach.id)}
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

      {filteredApproaches.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay enfoques terapéuticos que coincidan con la búsqueda
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingApproach ? "Editar Enfoque Terapéutico" : "Agregar Enfoque Terapéutico"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del enfoque terapéutico"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del enfoque terapéutico"
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
              <Label htmlFor="is_active">Enfoque activo</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSaveApproach}>
                <Save className="mr-2 h-4 w-4" />
                {editingApproach ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
