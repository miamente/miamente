"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, User, Eye, EyeOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { ToggleStatusDialog } from "@/components/admin/ToggleStatusDialog";
import { SearchResultsInfo } from "@/components/admin/SearchResultsInfo";
import { SearchCard } from "@/components/admin/SearchCard";
import { apiClient } from "@/lib/api";
import type { AccountWithRole } from "@/lib/types";

interface AdminUser extends AccountWithRole {
  last_login?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [togglingUser, setTogglingUser] = useState<AdminUser | null>(null);

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllAccountsAdmin(currentPage, pageSize, "user", appliedSearch || undefined);
      
      if (response.items) {
        const convertedUsers: AdminUser[] = response.items.map((account: AccountWithRole) => ({
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
        }));
        
        setUsers(convertedUsers);
        setTotalItems(response.total || 0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, appliedSearch]);

  const handleToggleActive = (user: AdminUser) => {
    setTogglingUser(user);
    setIsToggleDialogOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!togglingUser) return;
    
    try {
      const updatedAccount = await apiClient.toggleUserStatus(togglingUser.id, !togglingUser.is_active);
      setUsers(prev => prev.map(user => 
        user.id === togglingUser.id 
          ? { ...user, is_active: updatedAccount.is_active }
          : user
      ));
      setIsToggleDialogOpen(false);
      setTogglingUser(null);
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Error al actualizar el estado del usuario");
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      await apiClient.deleteUser(deletingUser.id);
      setUsers(prev => prev.filter(user => user.id !== deletingUser.id));
      setTotalItems(prev => prev - 1);
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error al eliminar el usuario");
    }
  };

  const handleAddUser = () => {
    // TODO: Implementar lógica para agregar usuario
    console.log("Agregar usuario");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const pagedUsers = users;

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios Regulares</h1>
            <p className="mt-2 text-gray-600">Administrar usuarios regulares de la plataforma</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios Regulares</h1>
          <p className="mt-2 text-gray-600">Administrar usuarios regulares de la plataforma</p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Agregar Usuario</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <SearchCard
        title="Buscar Usuarios"
        placeholder="Buscar usuarios por nombre o email..."
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        entityName="usuario"
      />

      <SearchResultsInfo
        appliedSearch={appliedSearch}
        totalItems={totalItems}
        entityName="usuario"
        entityNamePlural="usuarios"
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
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verificado
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
                {pagedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.is_verified ? (
                        <span className="text-green-500">Sí</span>
                      ) : (
                        <span className="text-red-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          title={user.is_active ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
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
          
          {pagedUsers.length === 0 && !loading && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios regulares registrados</p>
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
          setDeletingUser(null);
        }}
        onConfirm={confirmDelete}
        entityName="usuario"
        entityDisplayName={deletingUser?.full_name || ""}
      />

      <ToggleStatusDialog
        isOpen={isToggleDialogOpen}
        onClose={() => {
          setIsToggleDialogOpen(false);
          setTogglingUser(null);
        }}
        onConfirm={confirmToggleStatus}
        entityName="usuario"
        entityDisplayName={togglingUser?.full_name || ""}
        isCurrentlyActive={togglingUser?.is_active || false}
      />
    </div>
  );
}