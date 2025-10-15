"use client";
import React from "react";
import { UserCheck, ArrowLeft, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { SearchResultsInfo } from "@/components/admin/SearchResultsInfo";
import { SearchCard } from "@/components/admin/SearchCard";
import { ProfessionalCreateDialog, ProfessionalCreateData } from "@/components/admin/ProfessionalCreateDialog";
import { apiClient } from "@/lib/api";
import type { AccountWithRole } from "@/lib/types";

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = React.useState<AccountWithRole[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>("");

  const [search, setSearch] = React.useState<string>("");
  const [appliedSearch, setAppliedSearch] = React.useState<string>("");

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const [deleting, setDeleting] = React.useState<AccountWithRole | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<boolean>(false);

  const [toggling, setToggling] = React.useState<AccountWithRole | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = React.useState<boolean>(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState<boolean>(false);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Use new unified accounts endpoint
      const response = await apiClient.getAllAccountsAdmin(
        currentPage,
        pageSize,
        "professional",
        appliedSearch || undefined
      );
      
      setProfessionals(response.items);
      setTotalItems(response.total);
    } catch (err) {
      console.error("Error loading professionals:", err);
      setError("Error cargando profesionales");
      setProfessionals([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadProfessionals();
  }, [currentPage, pageSize, appliedSearch]);

  const handleSearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handleDelete = async (professional: AccountWithRole) => {
    try {
      await apiClient.deleteAccount(professional.id);
      setProfessionals(prev => prev.filter(p => p.id !== professional.id));
      setTotalItems(prev => prev - 1);
      setIsDeleteDialogOpen(false);
      setDeleting(null);
    } catch (err) {
      console.error("Error deleting professional:", err);
      setError("Error al eliminar el profesional");
    }
  };

  const handleToggleStatus = async (professional: AccountWithRole) => {
    try {
      // For now, we'll need to implement this functionality
      // This would require a backend endpoint to toggle account status
      setError("Funcionalidad de toggle de estado no implementada aún");
      setIsToggleDialogOpen(false);
      setToggling(null);
    } catch (err) {
      console.error("Error updating professional status:", err);
      setError("Error al actualizar el estado del profesional");
    }
  };

  const handleCreateProfessional = async (data: ProfessionalCreateData) => {
    try {
      // Convert ProfessionalCreateData to ProfessionalCreate format
      const professionalData = {
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        password: data.password,
        phone_number: data.phone,
      };
      
      await apiClient.registerProfessional(professionalData);
      setIsCreateDialogOpen(false);
      await loadProfessionals(); // Reload to show new professional
    } catch (err) {
      console.error("Error creating professional:", err);
      setError("Error al crear el profesional");
      throw err; // Re-throw so dialog can handle it
    }
  };

  if (loading && professionals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/accounts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Cuentas
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Profesionales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando profesionales...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cuentas
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Profesionales ({totalItems})</span>
            </CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Profesional
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <SearchCard
              title="Buscar Profesionales"
              placeholder="Buscar profesionales por nombre, email o especialidad..."
              searchTerm={search}
              onSearchTermChange={setSearch}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
              entityName="profesional"
            />

            {appliedSearch && (
              <SearchResultsInfo
                appliedSearch={appliedSearch}
                totalItems={totalItems}
                entityName="profesional"
                entityNamePlural="profesionales"
                onClearSearch={handleClearSearch}
              />
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando...</p>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {appliedSearch 
                    ? `No se encontraron profesionales para "${appliedSearch}"`
                    : "No hay profesionales registrados"
                  }
                </p>
                {!appliedSearch && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)} 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear el primer profesional
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {professionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {professional.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">{professional.email}</p>
                          <p className="text-xs text-gray-500">
                            Profesional verificado
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            professional.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {professional.is_active ? "Activo" : "Inactivo"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setToggling(professional);
                            setIsToggleDialogOpen(true);
                          }}
                        >
                          {professional.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {professional.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleting(professional);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalItems > pageSize && (
                  <div className="mt-6">
                    <Pagination
                      totalItems={totalItems}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleting(null);
        }}
        onConfirm={() => deleting && handleDelete(deleting)}
        entityName="profesional"
        entityDisplayName={deleting?.full_name || ""}
      />

      <ToggleStatusDialog
        isOpen={isToggleDialogOpen}
        onClose={() => {
          setIsToggleDialogOpen(false);
          setToggling(null);
        }}
        onConfirm={() => toggling && handleToggleStatus(toggling)}
        entityName="profesional"
        entityDisplayName={toggling?.full_name || ""}
        isCurrentlyActive={toggling?.is_active || false}
      />

      <ProfessionalCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={handleCreateProfessional}
      />
    </div>
  );
}
