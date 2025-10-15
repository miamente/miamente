"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Stethoscope, Eye, EyeOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { SearchResultsInfo } from "@/components/admin/SearchResultsInfo";
import { SearchCard } from "@/components/admin/SearchCard";
import { ProfessionalCreateDialog, type ProfessionalCreateData } from "@/components/admin/ProfessionalCreateDialog";
import { apiClient } from "@/lib/api";
import type { AccountWithRole, ProfessionalCreate } from "@/lib/types";

interface AdminProfessional extends AccountWithRole {
  last_login?: string;
  specialties_count?: number;
  modalities_count?: number;
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProfessional, setDeletingProfessional] = useState<AdminProfessional | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [togglingProfessional, setTogglingProfessional] = useState<AdminProfessional | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllAccountsAdmin(currentPage, pageSize, "professional", appliedSearch || undefined);
      
      if (response.items) {
        const convertedProfessionals: AdminProfessional[] = response.items.map((account: AccountWithRole) => ({
          id: account.id,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          is_active: account.is_active,
          is_verified: account.is_verified,
          profile_picture: account.profile_picture,
          created_at: account.created_at,
          updated_at: account.updated_at,
          role_id: account.role_id,
          role_name: account.role_name,
          last_login: account.last_login,
          specialties_count: 0, // TODO: Get actual count from profile
          modalities_count: 0, // TODO: Get actual count from profile
        }));
        
        setProfessionals(convertedProfessionals);
        setTotalItems(response.total || 0);
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
      setError("Error al cargar los profesionales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [currentPage, pageSize, appliedSearch]);

  const handleToggleActive = (professional: AdminProfessional) => {
    setTogglingProfessional(professional);
    setIsToggleDialogOpen(true);
  };

  const handleDeleteProfessional = (professional: AdminProfessional) => {
    setDeletingProfessional(professional);
    setIsDeleteDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!togglingProfessional) return;
    
    try {
      const updatedAccount = await apiClient.toggleUserStatus(togglingProfessional.id, !togglingProfessional.is_active);
      setProfessionals(prev => prev.map(professional => 
        professional.id === togglingProfessional.id 
          ? { ...professional, is_active: updatedAccount.is_active }
          : professional
      ));
      setIsToggleDialogOpen(false);
      setTogglingProfessional(null);
    } catch (err) {
      console.error("Error updating professional status:", err);
      setError("Error al actualizar el estado del profesional");
    }
  };

  const confirmDelete = async () => {
    if (!deletingProfessional) return;
    
    try {
      await apiClient.deleteUser(deletingProfessional.id);
      setProfessionals(prev => prev.filter(professional => professional.id !== deletingProfessional.id));
      setTotalItems(prev => prev - 1);
      setIsDeleteDialogOpen(false);
      setDeletingProfessional(null);
    } catch (err) {
      console.error("Error deleting professional:", err);
      setError("Error al eliminar el profesional");
    }
  };

  const handleCreateProfessional = async (data: ProfessionalCreateData) => {
    try {
      const professionalData: ProfessionalCreate = {
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        password: data.password,
        phone_country_code: "+57",
        phone_number: data.phone || "",
        license_number: "",
        years_experience: 0,
        short_description: "",
        academic_experience: [],
        work_experience: [],
        certifications: [],
        languages: ["es"],
        timezone: "America/Bogota",
      };

      await apiClient.registerProfessional(professionalData);
      setIsCreateDialogOpen(false);
      fetchProfessionals(); // Reload the list
    } catch (err) {
      console.error("Error creating professional:", err);
      setError("Error al crear el profesional");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const pagedProfessionals = professionals;

  if (loading && professionals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Profesionales</h1>
            <p className="mt-2 text-gray-600">Administrar profesionales de la salud</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Profesionales</h1>
          <p className="mt-2 text-gray-600">Administrar profesionales de la salud</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Agregar Profesional</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <SearchCard
        title="Buscar Profesionales"
        placeholder="Buscar profesionales por nombre o email..."
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        entityName="profesional"
      />

      <SearchResultsInfo
        appliedSearch={appliedSearch}
        totalItems={totalItems}
        entityName="profesional"
        entityNamePlural="profesionales"
        showClearButton={true}
        onClearSearch={handleClearSearch}
      />

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
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedProfessionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {professional.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {professional.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {professional.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {professional.specialties_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {professional.modalities_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          professional.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {professional.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(professional.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(professional)}
                          title={professional.is_active ? "Desactivar profesional" : "Activar profesional"}
                        >
                          {professional.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProfessional(professional)}
                          title="Eliminar profesional"
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
          
          {pagedProfessionals.length === 0 && !loading && (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay profesionales registrados</p>
            </div>
          )}
          
          {totalItems > pageSize && (
            <div className="border-t px-6 py-4">
              <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingProfessional(null);
        }}
        onConfirm={confirmDelete}
        entityName="profesional"
        entityDisplayName={deletingProfessional?.full_name || ""}
      />

      <ToggleStatusDialog
        isOpen={isToggleDialogOpen}
        onClose={() => {
          setIsToggleDialogOpen(false);
          setTogglingProfessional(null);
        }}
        onConfirm={confirmToggleStatus}
        entityName="profesional"
        entityDisplayName={togglingProfessional?.full_name || ""}
        isCurrentlyActive={togglingProfessional?.is_active || false}
      />

      <ProfessionalCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={handleCreateProfessional}
      />
    </div>
  );
}