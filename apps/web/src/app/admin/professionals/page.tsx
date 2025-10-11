"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, User, Eye, EyeOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Input import removed: not used after refactor
import { Pagination } from "@/components/ui/pagination";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { SearchResultsInfo } from "@/components/admin/SearchResultsInfo";
import { SearchCard } from "@/components/admin/SearchCard";
import { ProfessionalCreateDialog, ProfessionalCreateData } from "@/components/admin/ProfessionalCreateDialog";
import { apiClient } from "@/lib/api";
import type { ProfessionalWithCountResponse, PaginatedProfessionalsResponse } from "@/lib/types";

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<ProfessionalWithCountResponse[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [deleting, setDeleting] = useState<ProfessionalWithCountResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const [toggling, setToggling] = useState<ProfessionalWithCountResponse | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState<boolean>(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  const fetchProfessionals = async () => {
    setLoading(true);
    setError("");
    try {
      const response: PaginatedProfessionalsResponse = await apiClient.getAllProfessionalsAdmin(
        currentPage,
        pageSize,
        appliedSearch || undefined
      );
      setProfessionals(response.items);
      setTotalItems(response.total);
    } catch (e) {
      console.error("Error loading professionals", e);
      setError("Error al cargar profesionales");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProfessionals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, appliedSearch]);

  const handleSearch = () => {
    setAppliedSearch(search.trim());
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const openDelete = (p: ProfessionalWithCountResponse) => {
    setDeleting(p);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiClient.deleteProfessional(deleting.id);
      await fetchProfessionals();
    } catch (e) {
      console.error("Error deleting professional", e);
      setError("Error al eliminar el profesional");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleting(null);
    }
  };

  const openToggle = (p: ProfessionalWithCountResponse) => {
    setToggling(p);
    setIsToggleDialogOpen(true);
  };

  const confirmToggle = async () => {
    if (!toggling) return;
    try {
      await apiClient.toggleProfessionalStatus(toggling.id, !toggling.is_active);
      await fetchProfessionals();
    } catch (e) {
      console.error("Error toggling professional status", e);
      setError("Error al actualizar el estado del profesional");
    } finally {
      setIsToggleDialogOpen(false);
      setToggling(null);
    }
  };

  const handleCreateProfessional = async (data: ProfessionalCreateData) => {
    try {
      await apiClient.registerProfessional({
        email: data.email,
        password: data.password,
        full_name: `${data.first_name} ${data.last_name}`,
        phone_number: data.phone || undefined,
      });
      await fetchProfessionals();
      setCurrentPage(1);
    } catch (e) {
      console.error("Error creating professional", e);
      throw new Error("Error al crear el profesional. Verifica que el email no esté en uso.");
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
          <p className="mt-2 text-gray-600">Administrar profesionales registrados en la plataforma</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Agregar Profesional
            </Button>
          </div>

          {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* Search */}
      <SearchCard
        title="Buscar Profesionales"
        placeholder="Buscar por nombre o email..."
        searchTerm={search}
        onSearchTermChange={setSearch}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        showClearButton={true}
        loading={loading}
        entityName="profesional"
      />

      {/* Search Results Info */}
      <SearchResultsInfo
        appliedSearch={appliedSearch}
        totalItems={totalItems}
        entityName="profesional"
        entityNamePlural="profesionales"
        showClearButton={true}
        onClearSearch={clearSearch}
      />

      {/* Professionals Table */}
      <Card className="p-0">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professionals.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {p.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.is_active === true ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                      }`}>
                        {p.is_active === true ? "Activo" : "Inactivo"}
                          </span>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.last_login ? (
                          new Date(p.last_login).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                          <Button 
                          size="sm"
                            variant="outline" 
                            onClick={() => openToggle(p)}
                          className="hover:bg-gray-50"
                          >
                            {p.is_active === true ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                          size="sm"
                            variant="outline" 
                            onClick={() => openDelete(p)} 
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
            {search ? "No hay profesionales que coincidan con la búsqueda" : "No hay profesionales registrados"}
          </CardContent>
        </Card>
      )}

      {/* Delete dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        entityName="profesional"
        entityDisplayName={deleting?.full_name || ""}
      />

      {/* Toggle dialog */}
      <ToggleStatusDialog
        isOpen={isToggleDialogOpen}
        onClose={() => setIsToggleDialogOpen(false)}
        onConfirm={confirmToggle}
        entityName="Profesional"
        entityDisplayName={toggling?.full_name || ""}
        isCurrentlyActive={toggling?.is_active === true}
      />

      {/* Create dialog */}
      <ProfessionalCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={handleCreateProfessional}
      />
    </div>
  );
}
