import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PaymentManager } from '@/lib/payments/PaymentService';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  userId: string;
  professionalId: string;
  slotId: string;
  status: string;
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
}

interface CheckoutPageProps {}

const CheckoutPage: React.FC<CheckoutPageProps> = () => {
  const router = useRouter();
  const { appointmentId } = router.query;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const getAppointment = httpsCallable(functions, 'getAppointment');

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId || typeof appointmentId !== 'string') return;

      try {
        setLoading(true);
        setError(null);

        const result = await getAppointment({ appointmentId });
        setAppointment(result.data as Appointment);
      } catch (err: any) {
        console.error('Error fetching appointment:', err);
        setError(err.message || 'Error al cargar la cita');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!appointment) return;

    try {
      setProcessingPayment(true);
      setPaymentError(null);
      
      // Initialize payment manager
      const paymentManager = new PaymentManager();
      await paymentManager.initialize(appointment.id);
      
      // Start checkout process
      const checkoutResult = await paymentManager.startCheckout(appointment.id);
      
      if (checkoutResult.redirectUrl) {
        // Redirect to the payment provider or success/pending page
        router.push(checkoutResult.redirectUrl);
      } else if (checkoutResult.clientSecret) {
        // Handle client-side payment confirmation (e.g., Stripe)
        // For now, simulate success
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/appointment/${appointment.id}?payment=success`);
        }, 2000);
      } else {
        throw new Error('No redirect URL or client secret received');
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setPaymentError(err.message || 'Error al procesar el pago. Por favor, intenta nuevamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(cents);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cita no encontrada</h2>
          <p className="text-gray-600 mb-4">La cita solicitada no existe.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
          <p className="text-gray-600 mb-6">
            Tu cita ha sido confirmada. Recibirás un email de confirmación con los detalles.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Completa tu pago para confirmar la cita</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointment Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Cita</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha</p>
                  <p className="text-sm text-gray-600 capitalize">{formatDate(appointment.slot.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hora</p>
                  <p className="text-sm text-gray-600">{appointment.slot.time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Profesional</p>
                  <p className="text-sm text-gray-600">{appointment.professional.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Especialidad</p>
                  <p className="text-sm text-gray-600">{appointment.professional.specialty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h2>
            
            {/* Mock Payment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Modo de prueba - Usa cualquier número</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Titular
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{paymentError}</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total a Pagar</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(appointment.payment.amountCents)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {processingPayment ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando Pago...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Pagar {formatCurrency(appointment.payment.amountCents)}
                </div>
              )}
            </button>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Modo de Prueba</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Este es un entorno de prueba. No se realizará ningún cargo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
