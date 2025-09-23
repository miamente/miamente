"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Settings, DollarSign, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Modality {
  id: string;
  name: string;
  description?: string;
  virtual_price: number;
  presencial_price: number;
  offers_presencial: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  professional_count?: number;
}

export default function AdminModalities() {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<Modality | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    virtual_price: 0,
    presencial_price: 0,
    offers_presencial: true,
    is_active: true,
  });

  useEffect(() => {
    const loadModalities = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        // const data = await getModalities();
        // setModalities(data);

        // Mock data for now
        const mockModalities: Modality[] = [
          {
            id: "1",
            name: "Consulta Individual",
            description: "Sesión individual de terapia o consulta médica",
            virtual_price: 80000,
            presencial_price: 100000,
            offers_presencial: true,
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            professional_count: 15,
          },
          {
            id: "2",
            name: "Terapia de Pareja",
            description: "Sesión de terapia para parejas",
            virtual_price: 120000,
            presencial_price: 150000,
            offers_presencial: true,
            is_active: true,
            created_at: "2024-01-16T09:15:00Z",
            updated_at: "2024-01-16T09:15:00Z",
            professional_count: 8,
          },
          {
            id: "3",
            name: "Grupo de Apoyo",
            description: "Sesión grupal de apoyo terapéutico",
            virtual_price: 50000,
            presencial_price: 60000,
            offers_presencial: false,
            is_active: false,
            created_at: "2024-01-17T14:20:00Z",
            updated_at: "2024-01-17T14:20:00Z",
            professional_count: 3,
          },
        ];
        setModalities(mockModalities);
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
      (modality.description &&
        modality.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const formatPrice = (price: number) => {
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
      virtual_price: 0,
      presencial_price: 0,
      offers_presencial: true,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditModality = (modality: Modality) => {
    setEditingModality(modality);
    setFormData({
      name: modality.name,
      description: modality.description || "",
      virtual_price: modality.virtual_price,
      presencial_price: modality.presencial_price,
      offers_presencial: modality.offers_presencial,
      is_active: modality.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSaveModality = async () => {
    try {
      if (editingModality) {
        // TODO: Implement API call to update modality
        console.log("Update modality:", { id: editingModality.id, ...formData });
        setModalities((prev) =>
          prev.map((m) =>
            m.id === editingModality.id
              ? { ...m, ...formData, updated_at: new Date().toISOString() }
              : m,
          ),
        );
      } else {
        // TODO: Implement API call to create modality
        console.log("Create modality:", formData);
        const newModality: Modality = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          professional_count: 0,
        };
        setModalities((prev) => [...prev, newModality]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving modality:", err);
    }
  };

  const handleDeleteModality = async (modalityId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta modalidad?")) {
      try {
        // TODO: Implement API call to delete modality
        console.log("Delete modality:", modalityId);
        setModalities((prev) => prev.filter((m) => m.id !== modalityId));
      } catch (err) {
        console.error("Error deleting modality:", err);
      }
    }
  };

  const handleToggleActive = async (modalityId: string, currentStatus: boolean) => {
    try {
      // TODO: Implement API call to toggle modality status
      console.log(`Toggle active status for modality ${modalityId} to ${!currentStatus}`);
      setModalities((prev) =>
        prev.map((m) =>
          m.id === modalityId
            ? { ...m, is_active: !currentStatus, updated_at: new Date().toISOString() }
            : m,
        ),
      );
    } catch (err) {
      console.error("Error updating modality status:", err);
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
            Gestión de Modalidades
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administrar modalidades de consulta y precios
          </p>
        </div>
        <Button onClick={handleCreateModality}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Modalidad
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{modality.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Virtual:</span>
                    </span>
                    <span className="font-medium">{formatPrice(modality.virtual_price)}</span>
                  </div>

                  {modality.offers_presencial && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Presencial:</span>
                      </span>
                      <span className="font-medium">{formatPrice(modality.presencial_price)}</span>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="virtual_price">Precio Virtual (COP) *</Label>
                <Input
                  id="virtual_price"
                  type="number"
                  value={formData.virtual_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, virtual_price: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="presencial_price">Precio Presencial (COP) *</Label>
                <Input
                  id="presencial_price"
                  type="number"
                  value={formData.presencial_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, presencial_price: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="offers_presencial"
                  checked={formData.offers_presencial}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, offers_presencial: !!checked }))
                  }
                />
                <Label htmlFor="offers_presencial">Ofrece consultas presenciales</Label>
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
