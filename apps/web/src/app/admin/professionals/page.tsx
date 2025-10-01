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
  Stethoscope,
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
import type { Professional } from "@/lib/types";

// Extended Professional interface for admin with last_login
interface AdminProfessional extends Professional {
  last_login?: string;
}

export default function AdminProfessionals() {
  const [professionals, setProfessionals] = useState<AdminProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all professionals
        const response = await apiClient.getProfessionals();
        console.log("Professionals API response:", response);

        // Backend returns array directly
        if (Array.isArray(response)) {
          setProfessionals(response);
        } else {
          console.error("Unexpected response format:", response);
          setProfessionals([]);
          setError("Formato de respuesta inesperado del servidor");
        }
      } catch (err) {
        console.error("Error loading professionals:", err);
        setError("Error al cargar los profesionales. Por favor, inténtalo de nuevo.");
        setProfessionals([]); // Ensure professionals is always an array
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const filteredProfessionals = (professionals || []).filter((professional) => {
    if (!professional) return false;

    const matchesSearch =
      professional.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && professional.is_active) ||
      (filterStatus === "inactive" && !professional.is_active) ||
      (filterStatus === "verified" && professional.is_verified) ||
      (filterStatus === "unverified" && !professional.is_verified);

    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (professionalId: string, currentStatus: boolean) => {
    try {
      const updatedProfessional = await apiClient.toggleProfessionalStatus(
        professionalId,
        !currentStatus,
      );
      setProfessionals((prev) =>
        prev.map((professional) =>
          professional.id === professionalId ? updatedProfessional : professional,
        ),
      );
    } catch (err) {
      console.error("Error updating professional status:", err);
      setError("Error al actualizar el estado del profesional");
    }
  };

  const handleDeleteProfessional = async (professionalId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este profesional?")) {
      try {
        await apiClient.deleteProfessional(professionalId);
        setProfessionals((prev) =>
          prev.filter((professional) => professional.id !== professionalId),
        );
      } catch (err) {
        console.error("Error deleting professional:", err);
        setError("Error al eliminar el profesional");
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
          <p className="mt-2 text-gray-600">Administrar profesionales de la plataforma</p>
        </div>
        <Button>Agregar Profesional</Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="search-professionals"
                className="block text-sm font-medium text-gray-700"
              >
                Buscar
              </label>
              <div className="relative mt-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search-professionals"
                  placeholder="Buscar por nombre, email o biografía..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
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

      {/* Professionals Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Profesionales ({filteredProfessionals.length} de {professionals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProfessionals.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay profesionales que coincidan con los filtros seleccionados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Profesional</th>
                    <th className="p-4 text-left font-medium">Contacto</th>
                    <th className="p-4 text-left font-medium">Especialidad</th>
                    <th className="p-4 text-left font-medium">Estado</th>
                    <th className="p-4 text-left font-medium">Registro</th>
                    <th className="p-4 text-left font-medium">Último Acceso</th>
                    <th className="p-4 text-left font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessionals.map((professional) => (
                    <tr key={professional.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{professional.full_name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {professional.id.slice(0, 8)}...
                        </div>
                        {professional.license_number && (
                          <div className="text-sm text-gray-500">
                            Licencia: {professional.license_number}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{professional.email}</span>
                        </div>
                        {professional.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{professional.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {professional.specialty_ids?.length > 0
                              ? `${professional.specialty_ids.length} especialidad(es)`
                              : "Sin especialidades"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {professional.years_experience} años de experiencia
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant={professional.is_active ? "default" : "secondary"}>
                            {professional.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                          <br />
                          <Badge variant={professional.is_verified ? "default" : "outline"}>
                            {professional.is_verified ? "Verificado" : "No verificado"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatBogotaDate(new Date(professional.created_at), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {professional.last_login
                            ? formatBogotaDate(new Date(professional.last_login), {
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
                              onClick={() =>
                                handleToggleActive(professional.id, professional.is_active)
                              }
                            >
                              {professional.is_active ? (
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
                              onClick={() => handleDeleteProfessional(professional.id)}
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
