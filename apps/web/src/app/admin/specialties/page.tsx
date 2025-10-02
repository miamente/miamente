"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Stethoscope, Eye, EyeOff, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import type { Specialty, SpecialtyCreate, SpecialtyUpdate } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";

export default function AdminSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1); // Reset to first page when clearing search
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [togglingSpecialty, setTogglingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllSpecialtiesAdmin(currentPage, pageSize, appliedSearch);
        setSpecialties(response.items);
        setTotalItems(response.total);
      } catch (err) {
        console.error("Error loading specialties:", err);
        setError("Error al cargar las especialidades");
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, [currentPage, pageSize, appliedSearch]);

  // Server-side pagination - no client-side filtering needed
  const pagedSpecialties = specialties;

  const handleCreateSpecialty = () => {
    setEditingSpecialty(null);
    setFormData({
      name: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveSpecialty = async () => {
    try {
      if (editingSpecialty) {
        const updateData: SpecialtyUpdate = {
          name: formData.name,
          description: formData.description || undefined,
        };
        await apiClient.updateSpecialty(editingSpecialty.id, updateData);
      } else {
        const createData: SpecialtyCreate = {
          name: formData.name,
          description: formData.description || undefined,
        };
        await apiClient.createSpecialty(createData);
      }
      
      // Reload data from server since we're using server-side pagination
      const response = await apiClient.getAllSpecialtiesAdmin(currentPage, pageSize, appliedSearch);
      setSpecialties(response.items);
      setTotalItems(response.total);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving specialty:", err);
      setError("Error al guardar la especialidad");
    }
  };

  const confirmDeleteSpecialty = (specialty: Specialty) => {
    setDeletingSpecialty(specialty);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSpecialty) return;
    try {
      await apiClient.deleteSpecialty(deletingSpecialty.id);
      // Reload data from server since we're using server-side pagination
      const response = await apiClient.getAllSpecialtiesAdmin(currentPage, pageSize, appliedSearch);
      setSpecialties(response.items);
      setTotalItems(response.total);
      setIsDeleteDialogOpen(false);
      setDeletingSpecialty(null);
      } catch (err) {
        console.error("Error deleting specialty:", err);
      const message = err instanceof Error ? err.message : "Error al eliminar la especialidad";
      setError(message);
      setIsDeleteDialogOpen(false);
      setDeletingSpecialty(null);
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
          <div className="flex gap-2">
            <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                placeholder="Buscar por nombre de especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              className="pl-10"
            />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Info */}
      {appliedSearch && (
        <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {totalItems === 0 
                ? `No se encontraron especialidades que coincidan con "${appliedSearch}"`
                : `Se encontraron ${totalItems} especialidad${totalItems === 1 ? '' : 'es'} que coinciden con "${appliedSearch}"`
              }
            </span>
                </div>
          <Button variant="outline" size="sm" onClick={handleClearSearch}>
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
              </div>
      )}

      {/* Specialties Table */}
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesionales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedSpecialties.map((specialty) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">
                      <div className="truncate">
                        {specialty.description || "-"}
                </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {specialty.professional_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        specialty.is_active !== false ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {specialty.is_active !== false ? "Activa" : "Inactiva"}
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
                          aria-label={specialty.is_active !== false ? "Deshabilitar especialidad" : "Habilitar especialidad"}
                          onClick={() => {
                            setTogglingSpecialty(specialty);
                            setIsToggleDialogOpen(true);
                          }}
                          className="hover:bg-gray-50"
                        >
                          {specialty.is_active !== false ? (
                            // Show current state icon (enabled)
                            <Eye className="h-4 w-4" />
                          ) : (
                            // Show current state icon (disabled)
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmDeleteSpecialty(specialty)}
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
          <Pagination
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            compact
          />
            </CardContent>
          </Card>

      {totalItems === 0 && (
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
            <div>
              <Label htmlFor="description">Descripción corta</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción breve de la especialidad"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que quieres eliminar la especialidad
                {" "}
                <span className="font-semibold">{deletingSpecialty?.name}</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleConfirmDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle Active Confirmation Dialog */}
      <Dialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {togglingSpecialty?.is_active !== false ? "Confirmar deshabilitación" : "Confirmar habilitación"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-gray-700">
                {togglingSpecialty?.is_active !== false
                  ? "¿Estás seguro de que quieres deshabilitar la especialidad "
                  : "¿Estás seguro de que quieres habilitar la especialidad "}
                <span className="font-semibold">{togglingSpecialty?.name}</span>?
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsToggleDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!togglingSpecialty) return;
                  try {
                    await apiClient.updateSpecialty(togglingSpecialty.id, {
                      is_active: !(togglingSpecialty.is_active !== false),
                    });
                    // Reload data from server since we're using server-side pagination
                    const response = await apiClient.getAllSpecialtiesAdmin(currentPage, pageSize, appliedSearch);
                    setSpecialties(response.items);
                    setTotalItems(response.total);
                  } catch (e) {
                    console.error("Error toggling specialty status", e);
                    setError("Error al actualizar el estado de la especialidad");
                  } finally {
                    setIsToggleDialogOpen(false);
                    setTogglingSpecialty(null);
                  }
                }}
              >
                {togglingSpecialty?.is_active !== false ? "Deshabilitar" : "Habilitar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
