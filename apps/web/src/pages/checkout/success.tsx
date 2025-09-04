import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  userId: string;
  professionalId: string;
  slotId: string;
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed';
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
  createdAt: any;
  updatedAt: any;
}

interface CheckoutSuccessPageProps {}

const CheckoutSuccessPage: React.FC<CheckoutSuccessPageProps> = () => {
  const router = useRouter();
  const { appt, session } = router.query;
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const getAppointment = httpsCallable(functions, 'getAppointment');

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appt || typeof appt !== 'string') {
        setError('ID de cita no válido');
        setLoading(false);
        return;
      }

      if (session && typeof session === 'string') {
        setSessionId(session);
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getAppointment({ appointmentId: appt });
        setAppointment(result.data as Appointment);
      } catch (err: any) {
        console.error('Error fetching appointment:', err);
        setError(err.message || 'Error al cargar la cita');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appt, session]);

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

  const handleViewAppointment = () => {
    if (appointment) {
      router.push(`/appointment/${appointment.id}`);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartVideoCall = () => {
    // In a real app, this would open the video call
    alert('Funcionalidad de videollamada en desarrollo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoToDashboard}
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
          <CheckCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cita no encontrada</h2>
          <p className="text-gray-600 mb-4">La cita solicitada no existe.</p>
          <button
            onClick={handleGoToDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'confirmed' || appointment.status === 'pending_confirmation';
  const isPaid = appointment.paid;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-gray-600">
            Tu cita ha sido confirmada y está lista
          </p>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-6">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isConfirmed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {isConfirmed ? 'Cita Confirmada' : 'Pendiente de Confirmación'}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de tu Cita
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date and Time */}
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
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Duración</p>
                  <p className="text-sm text-gray-600">{appointment.slot.duration} minutos</p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
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
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Pago
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Estado del Pago</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {isPaid ? 'Pagado' : 'Procesado'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Proveedor de Pago</span>
              <span className="text-sm text-gray-600 capitalize">{appointment.payment.provider}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Pagado</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(appointment.payment.amountCents)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Próximos Pasos
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Email de Confirmación:</strong> Recibirás un email con todos los detalles de tu cita
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Recordatorio:</strong> Te enviaremos un recordatorio 24 horas antes de tu cita
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Videollamada:</strong> Podrás acceder a tu sesión 5 minutos antes de la hora programada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {isConfirmed && (
              <button
                onClick={handleStartVideoCall}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <div className="flex items-center justify-center">
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Iniciar Videollamada
                </div>
              </button>
            )}
            
            <button
              onClick={handleViewAppointment}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center justify-center">
                <ArrowRightIcon className="h-5 w-5 mr-2" />
                Ver Detalles de la Cita
              </div>
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center justify-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Ir al Dashboard
              </div>
            </button>
          </div>
        </div>

        {/* Session Information */}
        {sessionId && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Información de la Sesión
            </h3>
            <p className="text-xs text-gray-500 font-mono">
              ID de Sesión: {sessionId}
            </p>
            <p className="text-xs text-gray-500 font-mono mt-1">
              ID de Cita: {appointment.id}
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a 
              href="mailto:support@miamente.com" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
