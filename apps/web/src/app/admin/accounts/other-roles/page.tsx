"use client";
import React from "react";
import { Shield, ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useAdminData } from "@/hooks/useAdminData";
import type { AccountWithRole } from "@/lib/types";

interface AdminUser extends AccountWithRole {
  last_login?: string;
}

export default function AdminOtherRolesPage() {
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
          (user) => user.role_name !== "user" && user.role_name !== "professional",
        );
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
    const variant = user.role_name === "admin" ? "destructive" : "outline";
    const label =
      user.role_name === "admin"
        ? "Administrador"
        : user.role_name === "moderator"
        ? "Moderador"
        : user.role_name;

    return {
      variant,
      label,
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  if (loading) {
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
              <Shield className="h-5 w-5" />
              <span>Otros Roles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
              <Shield className="h-5 w-5" />
              <span>Otros Roles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Reintentar
              </Button>
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
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Otros Roles ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay usuarios con roles administrativos registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const roleBadge = getRoleBadge(user);
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role_name)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Último acceso: {formatDate(user.last_login)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          roleBadge.variant === "destructive"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {roleBadge.label}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.is_active ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
