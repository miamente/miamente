"use client";
import React from "react";
import { Shield, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable, type Column, commonRenderers } from "@/components/admin/AdminDataTable";
import { useAdminData } from "@/hooks/useAdminData";
import { apiClient } from "@/lib/api";
import type { User } from "@/lib/types";

// Extended User interface for admin users with role and last_login
interface AdminUser extends User {
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
      const response = await apiClient.getUsers();
      console.log("All Users API response:", response);

      if (Array.isArray(response)) {
        // Filter to show only admin users and other non-user/non-professional roles
        return (response as AdminUser[]).filter(
          (user) => user.role !== "user" && user.role !== "professional",
        );
      }
      return [];
    },
  });

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const updatedUser = await apiClient.toggleUserStatus(user.id, !user.is_active);
      updateItem(user.id, {
        ...updatedUser,
        role: updatedUser.role_name,
      } as AdminUser);
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Error al actualizar el estado del usuario");
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario administrativo?")) {
      try {
        await apiClient.deleteUser(user.id);
        removeItem(user.id);
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Error al eliminar el usuario");
      }
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") {
      return <Shield className="h-4 w-4" />;
    }
    return <UserCog className="h-4 w-4" />;
  };

  const getRoleBadge = (user: AdminUser) => {
    const variant = user.role === "admin" ? "destructive" : "outline";
    const label =
      user.role === "admin"
        ? "Administrador"
        : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Usuario";
    return { variant, label };
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "full_name",
      label: "Usuario",
      render: (user) => (
        <div className="flex items-center space-x-2">
          {getRoleIcon(user.role)}
          <div>
            <div className="font-medium">{user.full_name}</div>
            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contacto",
      render: commonRenderers.contact,
    },
    {
      key: "role",
      label: "Rol",
      render: (user) => {
        const { variant, label } = getRoleBadge(user);
        return (
          <Badge variant={variant as "default" | "destructive" | "outline" | "secondary"}>
            {label}
          </Badge>
        );
      },
    },
    {
      key: "is_active",
      label: "Estado",
      render: commonRenderers.status,
    },
    {
      key: "created_at",
      label: "Registro",
      render: (user) =>
        commonRenderers.date(user as unknown as Record<string, unknown>, "created_at"),
    },
    {
      key: "last_login",
      label: "Último Acceso",
      render: commonRenderers.lastLogin,
    },
    {
      key: "actions",
      label: "Acciones",
    },
  ];

  const handleAddUser = () => {
    // TODO: Implementar lógica para agregar usuario administrativo
    console.log("Agregar usuario administrativo");
  };

  return (
    <AdminDataTable
      title="Gestión de Usuarios Administrativos"
      description="Administrar usuarios con roles administrativos y especiales"
      addButtonText="Agregar Usuario Administrativo"
      onAdd={handleAddUser}
      data={users}
      loading={loading}
      error={error}
      columns={columns}
      onToggleActive={handleToggleActive}
      onDelete={handleDeleteUser}
      emptyMessage="No hay usuarios administrativos en el sistema"
    />
  );
}
