"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCog,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBogotaDate } from "@/lib/timezone";
import { apiClient } from "@/lib/api";
import type { User } from "@/lib/types";

// Extended User interface for admin users with role and last_login
interface AdminUser extends User {
  role: string;
  last_login?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all users and filter for admin/non-user roles
        const response = await apiClient.getUsers();
        console.log("All Users API response:", response);

        // Backend returns array directly
        if (Array.isArray(response)) {
          // Filter to show only admin users and other non-user/non-professional roles
          const adminUsers = (response as AdminUser[]).filter(
            (user) => user.role !== "user" && user.role !== "professional",
          );
          setUsers(adminUsers);
        } else {
          console.error("Unexpected response format:", response);
          setUsers([]);
          setError("Formato de respuesta inesperado del servidor");
        }
      } catch (err) {
        console.error("Error loading admin users:", err);
        setError("Error al cargar los usuarios administrativos. Por favor, inténtalo de nuevo.");
        setUsers([]); // Ensure users is always an array
      } finally {
        setLoading(false);
      }
    };

    loadAdminUsers();
  }, []);

  const filteredUsers = (users || []).filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "verified" && user.is_verified) ||
      (filterStatus === "unverified" && !user.is_verified);

    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const updatedUser = await apiClient.toggleUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? (updatedUser as AdminUser) : user)),
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Error al actualizar el estado del usuario");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario administrativo?")) {
      try {
        await apiClient.deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Error al eliminar el usuario");
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <UserCog className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
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
            Gestión de Usuarios Administrativos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administrar usuarios con roles administrativos y especiales
          </p>
        </div>
        <Button>Agregar Usuario Administrativo</Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar
              </label>
              <div className="relative mt-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="verified">Verificados</option>
                <option value="unverified">No verificados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuarios Administrativos ({filteredUsers.length} de {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {users.length === 0
                ? "No hay usuarios administrativos en el sistema"
                : "No hay usuarios que coincidan con los filtros seleccionados"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Usuario</th>
                    <th className="p-4 text-left font-medium">Contacto</th>
                    <th className="p-4 text-left font-medium">Rol</th>
                    <th className="p-4 text-left font-medium">Estado</th>
                    <th className="p-4 text-left font-medium">Registro</th>
                    <th className="p-4 text-left font-medium">Último Acceso</th>
                    <th className="p-4 text-left font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                          <br />
                          <Badge variant={user.is_verified ? "default" : "outline"}>
                            {user.is_verified ? "Verificado" : "No verificado"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatBogotaDate(new Date(user.created_at), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {user.last_login
                            ? formatBogotaDate(new Date(user.last_login), {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Nunca"}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(user.id, user.is_active)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
