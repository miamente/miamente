"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Settings, DollarSign } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api";
import type { Modality, ModalityCreate, ModalityUpdate } from "@/lib/types";

interface ModalityWithCount extends Modality {
  professional_count?: number;
}

export default function AdminModalities() {
  const [modalities, setModalities] = useState<ModalityWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<ModalityWithCount | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    currency: "COP",
    default_price_cents: 0,
    is_active: true,
  });

  useEffect(() => {
    const loadModalities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getAllModalitiesAdmin();
        // Use API data directly; professional_count should come from backend when available
        setModalities(data as ModalityWithCount[]);
      } catch (err) {
        console.error("Error loading modalities:", err);
        setError("Error al cargar las modalidades");
      } finally {
        setLoading(false);
      }
    };

    loadModalities();
  }, []);

  const filteredModalities = modalities.filter(
    (modality) =>
      modality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modality.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatPrice = (priceCents: number) => {
    const price = priceCents / 100; // Convert cents to currency units
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCreateModality = () => {
    setEditingModality(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      currency: "COP",
      default_price_cents: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditModality = (modality: ModalityWithCount) => {
    setEditingModality(modality);
    setFormData({
      name: modality.name,
      description: modality.description || "",
      category: modality.category || "",
      currency: modality.currency,
      default_price_cents: modality.default_price_cents,
      is_active: modality.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSaveModality = async () => {
    try {
      if (editingModality) {
        const updateData: ModalityUpdate = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          currency: formData.currency,
          default_price_cents: formData.default_price_cents,
          is_active: formData.is_active,
        };
        const updatedModality = await apiClient.updateModality(editingModality.id, updateData);
        setModalities((prev) =>
          prev.map((m) =>
            m.id === editingModality.id
              ? { ...updatedModality, professional_count: m.professional_count }
              : m,
          ),
        );
      } else {
        const createData: ModalityCreate = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          currency: formData.currency,
          default_price_cents: formData.default_price_cents,
          is_active: formData.is_active,
        };
        const newModality = await apiClient.createModality(createData);
        setModalities((prev) => [...prev, { ...newModality, professional_count: 0 }]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving modality:", err);
      setError("Error al guardar la modalidad");
    }
  };

  const handleDeleteModality = async (modalityId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta modalidad?")) {
      try {
        await apiClient.deleteModality(modalityId);
        setModalities((prev) => prev.filter((m) => m.id !== modalityId));
      } catch (err) {
        console.error("Error deleting modality:", err);
        setError("Error al eliminar la modalidad");
      }
    }
  };

  const handleToggleActive = async (modalityId: string, currentStatus: boolean) => {
    try {
      const updateData: ModalityUpdate = {
        is_active: !currentStatus,
      };
      const updatedModality = await apiClient.updateModality(modalityId, updateData);
      setModalities((prev) =>
        prev.map((m) =>
          m.id === modalityId
            ? { ...updatedModality, professional_count: m.professional_count }
            : m,
        ),
      );
    } catch (err) {
      console.error("Error updating modality status:", err);
      setError("Error al actualizar el estado de la modalidad");
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Modalidades</h1>
          <p className="mt-2 text-gray-600">Administrar modalidades de consulta y precios</p>
        </div>
        <Button onClick={handleCreateModality}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Modalidad
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Modalidades</CardTitle>
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

      {/* Modalities Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredModalities.map((modality) => (
          <Card key={modality.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">{modality.name}</CardTitle>
                </div>
                <Badge variant={modality.is_active ? "default" : "secondary"}>
                  {modality.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modality.description && (
                  <p className="text-sm text-gray-600">{modality.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Precio por defecto:</span>
                    </span>
                    <span className="font-medium">{formatPrice(modality.default_price_cents)}</span>
                  </div>

                  {modality.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span>Categoría:</span>
                      </span>
                      <span className="font-medium">{modality.category}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Profesionales: {modality.professional_count || 0}</span>
                  <span>Creada: {new Date(modality.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditModality(modality)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(modality.id, modality.is_active)}
                  >
                    {modality.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteModality(modality.id)}
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

      {filteredModalities.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay modalidades que coincidan con la búsqueda
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModality ? "Editar Modalidad" : "Agregar Modalidad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la modalidad"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la modalidad"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Categoría de la modalidad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                  placeholder="COP"
                />
              </div>
              <div>
                <Label htmlFor="default_price_cents">Precio por Defecto (centavos) *</Label>
                <Input
                  id="default_price_cents"
                  type="number"
                  value={formData.default_price_cents}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, default_price_cents: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: !!checked }))
                }
              />
              <Label htmlFor="is_active">Modalidad activa</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSaveModality}>
                <Save className="mr-2 h-4 w-4" />
                {editingModality ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
