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

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  role: "user" | "professional" | "admin";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API call
        // const data = await getUsers();
        // setUsers(data);

        // Mock data for now
        const mockUsers: User[] = [
          {
            id: "1",
            full_name: "Juan Pérez",
            email: "juan@example.com",
            phone: "+57 300 123 4567",
            is_verified: true,
            is_active: true,
            created_at: "2024-01-15T10:30:00Z",
            last_login: "2024-01-20T14:22:00Z",
            role: "user",
          },
          {
            id: "2",
            full_name: "María García",
            email: "maria@example.com",
            phone: "+57 300 987 6543",
            is_verified: false,
            is_active: true,
            created_at: "2024-01-18T09:15:00Z",
            last_login: "2024-01-19T16:45:00Z",
            role: "user",
          },
          {
            id: "3",
            full_name: "Dr. Carlos López",
            email: "carlos@example.com",
            phone: "+57 300 555 1234",
            is_verified: true,
            is_active: true,
            created_at: "2024-01-10T08:00:00Z",
            last_login: "2024-01-20T11:30:00Z",
            role: "professional",
          },
        ];
        setUsers(mockUsers);
      } catch (err) {
        console.error("Error loading users:", err);
        setError("Error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "verified" && user.is_verified) ||
      (filterStatus === "unverified" && !user.is_verified);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      // TODO: Implement API call to toggle user status
      console.log(`Toggle active status for user ${userId} to ${!currentStatus}`);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, is_active: !currentStatus } : user)),
      );
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        // TODO: Implement API call to delete user
        console.log(`Delete user ${userId}`);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err);
      }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Administrar usuarios, profesionales y administradores
          </p>
        </div>
        <Button>Agregar Usuario</Button>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                Rol
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los roles</option>
                <option value="user">Usuarios</option>
                <option value="professional">Profesionales</option>
                <option value="admin">Administradores</option>
              </select>
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
            Usuarios ({filteredUsers.length} de {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay usuarios que coincidan con los filtros seleccionados
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
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id.slice(0, 8)}...
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
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "professional"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {user.role === "admin"
                            ? "Administrador"
                            : user.role === "professional"
                              ? "Profesional"
                              : "Usuario"}
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
