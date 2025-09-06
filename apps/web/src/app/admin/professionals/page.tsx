"use client";
import React, { useEffect, useState } from "react";

import { AdminGate } from "@/components/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getProfessionalsSummary,
  updateProfessionalVerification,
  type ProfessionalSummary,
} from "@/lib/admin";
import { formatBogotaDate } from "@/lib/timezone";

export default function AdminProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProfessionalsSummary();
        setProfessionals(data);
      } catch (err) {
        console.error("Error loading professionals:", err);
        setError("Error al cargar los profesionales");
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const handleVerificationToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdating(userId);
      const result = await updateProfessionalVerification(userId, !currentStatus);

      if (result.success) {
        setProfessionals((prev) =>
          prev.map((pro) => (pro.id === userId ? { ...pro, isVerified: !currentStatus } : pro)),
        );
      } else {
        setError(result.error || "Error al actualizar la verificación");
      }
    } catch (err) {
      console.error("Error updating verification:", err);
      setError("Error al actualizar la verificación");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGate
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Gestión de Profesionales</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Administrar y verificar profesionales
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Lista de Profesionales</CardTitle>
          </CardHeader>
          <CardContent>
            {professionals.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                No hay profesionales registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Nombre</th>
                      <th className="p-4 text-left font-medium">Email</th>
                      <th className="p-4 text-left font-medium">Especialidad</th>
                      <th className="p-4 text-left font-medium">Estado</th>
                      <th className="p-4 text-left font-medium">Citas</th>
                      <th className="p-4 text-left font-medium">Rating</th>
                      <th className="p-4 text-left font-medium">Registro</th>
                      <th className="p-4 text-left font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.map((pro) => (
                      <tr
                        key={pro.id}
                        className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <td className="p-4">
                          <div className="font-medium">{pro.fullName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {pro.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{pro.specialty}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              pro.isVerified
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {pro.isVerified ? "Verificado" : "Pendiente"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{pro.appointmentCount}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {pro.averageRating > 0 ? (
                              <span className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1">{pro.averageRating}</span>
                              </span>
                            ) : (
                              <span className="text-neutral-400">Sin calificaciones</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {formatBogotaDate(new Date(pro.createdAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant={pro.isVerified ? "destructive" : "default"}
                              onClick={() => handleVerificationToggle(pro.id, pro.isVerified)}
                              disabled={updating === pro.id}
                            >
                              {updating === pro.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                              ) : pro.isVerified ? (
                                "Revocar"
                              ) : (
                                "Verificar"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Implement view credentials modal
                                alert("Ver credenciales - Por implementar");
                              }}
                            >
                              Ver Credenciales
                            </Button>
                          </div>
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
    </AdminGate>
  );
}
