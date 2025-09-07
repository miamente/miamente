import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import { apiClient } from "@/lib/api";
import { PaymentManager } from "@/lib/payments/PaymentService";

// Global gtag interface for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface Appointment {
  id: string;
  userId: string;
  professionalId: string;
  slotId: string;
  status: "pending_payment" | "confirmed" | "cancelled" | "completed";
  paid: boolean;
  payment: {
    provider: string;
    amountCents: number;
    currency: string;
    status: string;
  };
  slot: {
    date: string;
    time: string;
    duration: number;
    timezone: string;
  };
  professional: {
    id: string;
    fullName: string;
    specialty: string;
    rateCents: number;
  };
  createdAt: unknown;
  updatedAt: unknown;
}

interface AppointmentDetailProps {
  appointmentId: string;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({ appointmentId }) => {
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointment = await apiClient.get(`/appointments/${appointmentId}`);
        setAppointment((appointment as any).data);
      } catch (err: unknown) {
        console.error("Error fetching appointment:", err);
        setError(err instanceof Error ? err.message : "Error al cargar la cita");
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!appointment) return;

    try {
      setProcessingPayment(true);
      setError(null);

      // Track payment attempt analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "payment_attempt", {
          event_category: "payment",
          event_label: appointment.id,
          value: appointment.payment.amountCents,
          currency: appointment.payment.currency,
          payment_provider: appointment.payment.provider,
        });
      }

      // Initialize payment manager and start checkout
      const paymentManager = new PaymentManager();
      await paymentManager.initialize(appointment.id);

      const checkoutResult = await paymentManager.startCheckout(appointment.id);

      if (checkoutResult.redirectUrl) {
        // Redirect to the payment provider or success/pending page
        router.push(checkoutResult.redirectUrl);
      } else {
        throw new Error("No redirect URL received from payment service");
      }
    } catch (err: unknown) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pendiente de Pago";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return "Desconocido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la cita...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Cita no encontrada</h2>
          <p className="mb-4 text-gray-600">
            La cita solicitada no existe o no tienes permisos para verla.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Detalles de la Cita</h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}
            >
              {getStatusIcon(appointment.status)}
              <span className="ml-2">{getStatusText(appointment.status)}</span>
            </span>
          </div>
          <p className="text-gray-600">ID: {appointment.id}</p>
        </div>

        {/* Appointment Details */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información de la Cita</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Date and Time */}
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {formatDate(appointment.slot.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <ClockIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hora</p>
                  <p className="text-sm text-gray-600">{appointment.slot.time}</p>
                </div>
              </div>

              <div className="flex items-center">
                <ClockIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duración</p>
                  <p className="text-sm text-gray-600">{appointment.slot.duration} minutos</p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Profesional</p>
                  <p className="text-sm text-gray-600">{appointment.professional.fullName}</p>
                </div>
              </div>

              <div className="flex items-center">
                <UserIcon className="mr-3 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Especialidad</p>
                  <p className="text-sm text-gray-600">{appointment.professional.specialty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Información de Pago</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Estado del Pago</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  appointment.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {appointment.paid ? "Pagado" : "Pendiente"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Proveedor de Pago</span>
              <span className="text-sm text-gray-600 capitalize">
                {appointment.payment.provider}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total a Pagar</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(appointment.payment.amountCents)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            {appointment.status === "pending_payment" && !appointment.paid && (
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <CreditCardIcon className="mr-2 h-5 w-5" />
                    Pagar {formatCurrency(appointment.payment.amountCents)}
                  </div>
                )}
              </button>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
