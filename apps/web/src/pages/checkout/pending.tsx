import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ClockIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface CheckoutPendingPageProps {}

const CheckoutPendingPage: React.FC<CheckoutPendingPageProps> = () => {
  const router = useRouter();
  const { appt, session } = router.query;
  
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appt && typeof appt === 'string') {
      setAppointmentId(appt);
    }
    if (session && typeof session === 'string') {
      setSessionId(session);
    }
    setLoading(false);
  }, [appt, session]);

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const handleCheckStatus = () => {
    if (appointmentId) {
      router.push(`/appointment/${appointmentId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago Pendiente de Confirmación
          </h1>
          <p className="text-lg text-gray-600">
            Tu pago está siendo procesado y será confirmado pronto
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Status Information */}
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <ClockIcon className="h-4 w-4 mr-2" />
                Procesando Pago
              </div>
            </div>

            {/* What's Happening */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué está pasando?
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Pago Enviado:</strong> Tu pago ha sido enviado al procesador de pagos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100">
                      <span className="text-xs font-medium text-yellow-600">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Verificación:</strong> Estamos verificando los detalles de tu pago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
                      <span className="text-xs font-medium text-gray-600">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Confirmación:</strong> Recibirás un email cuando el pago sea confirmado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Notificación por Email
                  </h3>
                  <p className="text-sm text-blue-700">
                    Te enviaremos un email de confirmación tan pronto como tu pago sea procesado. 
                    Por favor, revisa tu bandeja de entrada y la carpeta de spam.
                  </p>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Tiempo Estimado de Procesamiento
              </h3>
              <p className="text-sm text-gray-600">
                La mayoría de los pagos se procesan en <strong>2-5 minutos</strong>. 
                En casos excepcionales, puede tomar hasta 24 horas.
              </p>
            </div>

            {/* Session Information */}
            {sessionId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Información de la Sesión
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  ID de Sesión: {sessionId}
                </p>
                {appointmentId && (
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    ID de Cita: {appointmentId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCheckStatus}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Verificar Estado
              </div>
            </button>
            
            <button
              onClick={handleGoBack}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center justify-center">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver al Dashboard
              </div>
            </button>
          </div>
        </div>

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

export default CheckoutPendingPage;
