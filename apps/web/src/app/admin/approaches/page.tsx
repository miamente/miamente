"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, X, Brain, Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityFormDialog, EntityFormData } from "@/components/admin/EntityFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { apiClient } from "@/lib/api";
import type { TherapeuticApproach, TherapeuticApproachCreate, TherapeuticApproachUpdate } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";

export default function AdminTherapeuticApproaches() {
  const [approaches, setApproaches] = useState<TherapeuticApproach[]>([]);
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
  const [editingApproach, setEditingApproach] = useState<TherapeuticApproach | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingApproach, setDeletingApproach] = useState<TherapeuticApproach | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [togglingApproach, setTogglingApproach] = useState<TherapeuticApproach | null>(null);
  const [formData, setFormData] = useState<EntityFormData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    const loadApproaches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllTherapeuticApproachesAdmin(currentPage, pageSize, appliedSearch);
        setApproaches(response.items);
        setTotalItems(response.total);
      } catch (err) {
        console.error("Error loading therapeutic approaches:", err);
        setError("Error al cargar los enfoques terapéuticos");
      } finally {
        setLoading(false);
      }
    };

    loadApproaches();
  }, [currentPage, pageSize, appliedSearch]);

  // Server-side pagination - no client-side filtering needed
  const pagedApproaches = approaches;

  const handleCreateApproach = () => {
    setEditingApproach(null);
    setFormData({
      name: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditApproach = (approach: TherapeuticApproach) => {
    setEditingApproach(approach);
    setFormData({
      name: approach.name,
      description: approach.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveApproach = async () => {
    try {
      if (editingApproach) {
        const updateData: TherapeuticApproachUpdate = {
          name: formData.name,
          description: formData.description || undefined,
        };
        await apiClient.updateTherapeuticApproach(editingApproach.id, updateData);
      } else {
        const createData: TherapeuticApproachCreate = {
          name: formData.name,
          description: formData.description || undefined,
        };
        await apiClient.createTherapeuticApproach(createData);
      }
      setIsDialogOpen(false);
      // Reload data
      const response = await apiClient.getAllTherapeuticApproachesAdmin(currentPage, pageSize, appliedSearch);
      setApproaches(response.items);
      setTotalItems(response.total);
    } catch (err) {
      console.error("Error saving therapeutic approach:", err);
      setError("Error al guardar el enfoque terapéutico");
    }
  };

  const handleDeleteApproach = (approach: TherapeuticApproach) => {
    setDeletingApproach(approach);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteApproach = async () => {
    if (!deletingApproach) return;
    
    try {
      await apiClient.deleteTherapeuticApproach(deletingApproach.id);
      setIsDeleteDialogOpen(false);
      setDeletingApproach(null);
      // Reload data
      const response = await apiClient.getAllTherapeuticApproachesAdmin(currentPage, pageSize, appliedSearch);
      setApproaches(response.items);
      setTotalItems(response.total);
      } catch (err) {
      console.error("Error deleting therapeutic approach:", err);
      setError("Error al eliminar el enfoque terapéutico");
    }
  };


  const confirmToggleApproach = async () => {
    if (!togglingApproach) return;
    
    try {
      const updateData: TherapeuticApproachUpdate = {
        is_active: !togglingApproach.is_active,
      };
      await apiClient.updateTherapeuticApproach(togglingApproach.id, updateData);
      setIsToggleDialogOpen(false);
      setTogglingApproach(null);
      // Reload data
      const response = await apiClient.getAllTherapeuticApproachesAdmin(currentPage, pageSize, appliedSearch);
      setApproaches(response.items);
      setTotalItems(response.total);
    } catch (err) {
      console.error("Error toggling therapeutic approach:", err);
      setError("Error al cambiar el estado del enfoque terapéutico");
    }
  };


  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-red-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Enfoques Terapéuticos</h1>
          <p className="mt-2 text-gray-600">Administrar enfoques y metodologías terapéuticas</p>
        </div>
        <Button onClick={handleCreateApproach}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Enfoque
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Enfoques Terapéuticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              className="pl-10"
            />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            {appliedSearch && (
              <Button onClick={handleClearSearch} variant="outline">
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results Summary */}
      {appliedSearch && (
        <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {pagedApproaches.length === 0
                ? `No se encontraron enfoques terapéuticos que coincidan con "${appliedSearch}"`
                : `Se encontraron ${totalItems} enfoque${totalItems === 1 ? '' : 's'} que coinciden con "${appliedSearch}"`
              }
            </span>
                </div>
          <Button variant="outline" size="sm" onClick={handleClearSearch}>
            <X className="mr-1 h-3 w-3" />
            Limpiar
          </Button>
              </div>
      )}

      {/* Approaches Table */}
      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enfoque Terapéutico
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
                {pagedApproaches.map((approach) => (
                  <tr key={approach.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {approach.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs">
                      <div className="truncate">
                        {approach.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {approach.professional_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        approach.is_active !== false ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {approach.is_active !== false ? "Activo" : "Inactivo"}
                  </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditApproach(approach)}
                          className="hover:bg-gray-50"
                        >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                          aria-label={approach.is_active !== false ? "Deshabilitar enfoque terapéutico" : "Habilitar enfoque terapéutico"}
                          onClick={() => {
                            setTogglingApproach(approach);
                            setIsToggleDialogOpen(true);
                          }}
                          className="hover:bg-gray-50"
                        >
                          {approach.is_active !== false ? (
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
                          onClick={() => handleDeleteApproach(approach)}
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
          
          {pagedApproaches.length === 0 && !loading && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {appliedSearch 
                  ? `No hay enfoques terapéuticos que coincidan con "${appliedSearch}"`
                  : "No hay enfoques terapéuticos registrados"
                }
              </p>
            </div>
          )}
          
          {totalItems > pageSize && (
            <div className="border-t px-6 py-4">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <EntityFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSaveApproach}
        isEditing={!!editingApproach}
        formData={formData}
        onFormDataChange={setFormData}
        entityName="Enfoque Terapéutico"
        entityNamePlural="Enfoques Terapéuticos"
        useTextarea={true}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteApproach}
        entityName="enfoque terapéutico"
        entityDisplayName={deletingApproach?.name || ""}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ToggleStatusDialog
        isOpen={isToggleDialogOpen}
        onClose={() => setIsToggleDialogOpen(false)}
        onConfirm={confirmToggleApproach}
        entityName="Enfoque Terapéutico"
        entityDisplayName={togglingApproach?.name || ""}
        isCurrentlyActive={togglingApproach?.is_active !== false}
      />
    </div>
  );
}