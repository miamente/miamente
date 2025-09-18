"use client";
import React, { useEffect, useState } from "react";

import { AdminGate } from "@/components/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointmentsSummary, type AppointmentSummary } from "@/lib/admin";
import { formatBogotaDateTime, formatBogotaDate } from "@/lib/timezone";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAppointmentsSummary(); // Load appointments
        setAppointments(data);
      } catch (err) {
        console.error("Error loading appointments:", err);
        setError("Error al cargar las citas");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    if (filter === "pending") return appointment.status === "pending_payment";
    if (filter === "paid") return appointment.status === "paid";
    if (filter === "confirmed") return appointment.status === "confirmed";
    if (filter === "completed") return appointment.status === "completed";
    if (filter === "cancelled") return appointment.status === "cancelled";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pendiente Pago";
      case "paid":
        return "Pagado";
      case "confirmed":
        return "Confirmado";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
      return;
    }

    try {
      // TODO: Implement cancel appointment function
      alert(`Cancelar cita ${appointmentId} - Por implementar`);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setError("Error al cancelar la cita");
    }
  };

  const handleResendEmail = async (appointmentId: string) => {
    try {
      // TODO: Implement resend email function
      alert(`Reenviar email para cita ${appointmentId} - Por implementar`);
    } catch (err) {
      console.error("Error resending email:", err);
      setError("Error al reenviar el email");
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Usuario", "Profesional", "Especialidad", "Fecha", "Hora", "Estado", "Pagado"],
      ...filteredAppointments.map((appointment) => [
        appointment.id,
        appointment.user_full_name || "N/A",
        appointment.professional_full_name || "N/A",
        appointment.professional_specialty || "N/A",
        formatBogotaDate(new Date(appointment.start), {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        formatBogotaDate(new Date(appointment.start), { hour: "2-digit", minute: "2-digit" }),
        getStatusText(appointment.status),
        appointment.paid ? "Sí" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `citas_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Gestión de Citas</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Administrar y monitorear todas las citas
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              Exportar CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: "all", label: "Todas" },
              { key: "pending", label: "Pendientes" },
              { key: "paid", label: "Pagadas" },
              { key: "confirmed", label: "Confirmadas" },
              { key: "completed", label: "Completadas" },
              { key: "cancelled", label: "Canceladas" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Citas ({filteredAppointments.length} de {appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                No hay citas que coincidan con el filtro seleccionado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">ID</th>
                      <th className="p-4 text-left font-medium">Usuario</th>
                      <th className="p-4 text-left font-medium">Profesional</th>
                      <th className="p-4 text-left font-medium">Especialidad</th>
                      <th className="p-4 text-left font-medium">Fecha y Hora</th>
                      <th className="p-4 text-left font-medium">Estado</th>
                      <th className="p-4 text-left font-medium">Pagado</th>
                      <th className="p-4 text-left font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm">{appointment.id.slice(0, 8)}...</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{appointment.user_full_name}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{appointment.professional_full_name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{appointment.professional_specialty}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {formatBogotaDateTime(new Date(appointment.start))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              appointment.paid
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {appointment.paid ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {appointment.status === "pending_payment" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancelar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendEmail(appointment.id)}
                            >
                              Reenviar Email
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
