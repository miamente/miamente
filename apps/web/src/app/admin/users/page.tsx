"use client";
import React from "react";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable, type Column, commonRenderers } from "@/components/admin/AdminDataTable";
import { useAdminData } from "@/hooks/useAdminData";
import { apiClient } from "@/lib/api";
import type { User as UserType } from "@/lib/types";

// Extended User interface for admin users with role and last_login
interface AdminUser extends UserType {
  role: string;
  last_login?: string;
}

export default function AdminUsers() {
  const {
    data: users,
    loading,
    error,
    updateItem,
    removeItem,
    setError,
  } = useAdminData<AdminUser>({
    loadFunction: async () => {
        const response = await apiClient.getUsers({ role: "user" });
        console.log("Users API response:", response);

        if (Array.isArray(response)) {
        return response as AdminUser[];
      }
      return [];
    },
  });

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const updatedUser = await apiClient.toggleUserStatus(user.id, !user.is_active);
      updateItem(user.id, updatedUser as AdminUser);
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Error al actualizar el estado del usuario");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await apiClient.deleteUser(user.id);
        removeItem(user.id);
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Error al eliminar el usuario");
      }
    }
  };

  const handleAddUser = () => {
    // TODO: Implementar lógica para agregar usuario
    console.log("Agregar usuario");
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name',
      label: 'Usuario',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
            <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                        </div>
                          </div>
      ),
    },
    {
      key: 'email',
      label: 'Contacto',
      render: commonRenderers.contact,
    },
    {
      key: 'role',
      label: 'Rol',
      render: () => <Badge variant="secondary">Usuario</Badge>,
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: commonRenderers.status,
    },
    {
      key: 'created_at',
      label: 'Registro',
      render: (user) => commonRenderers.date(user as unknown as Record<string, unknown>, 'created_at'),
    },
    {
      key: 'last_login',
      label: 'Último Acceso',
      render: commonRenderers.lastLogin,
    },
    {
      key: 'actions',
      label: 'Acciones',
    },
  ];

  return (
    <AdminDataTable
      title="Gestión de Usuarios Regulares"
      description="Administrar usuarios regulares de la plataforma"
      addButtonText="Agregar Usuario"
      onAdd={handleAddUser}
      data={users}
      loading={loading}
      error={error}
      columns={columns}
      onToggleActive={handleToggleActive}
      onDelete={handleDeleteUser}
      emptyMessage="No hay usuarios regulares en el sistema"
    />
  );
}
