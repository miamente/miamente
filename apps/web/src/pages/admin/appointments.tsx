import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  userId: string;
  professionalId: string;
  slotId: string;
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed';
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
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: any;
  updatedAt: any;
}

interface AdminAppointmentsPageProps {}

const AdminAppointmentsPage: React.FC<AdminAppointmentsPageProps> = () => {
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const adminConfirmPayment = httpsCallable(functions, 'adminConfirmPayment');
  const adminFailPayment = httpsCallable(functions, 'adminFailPayment');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call a Firebase function
      // For now, we'll simulate the data
      const mockAppointments: Appointment[] = [
        {
          id: 'appt-1',
          userId: 'user-1',
          professionalId: 'pro-1',
          slotId: 'slot-1',
          status: 'pending_confirmation',
          paid: false,
          payment: {
            provider: 'mock',
            amountCents: 80000,
            currency: 'COP',
            status: 'pending'
          },
          slot: {
            date: '2024-01-15',
            time: '10:00',
            duration: 60,
            timezone: 'America/Bogota'
          },
          professional: {
            id: 'pro-1',
            fullName: 'Dr. María González',
            specialty: 'Psicología Clínica',
            rateCents: 80000
          },
          user: {
            id: 'user-1',
            fullName: 'Juan Pérez',
            email: 'juan@example.com'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'appt-2',
          userId: 'user-2',
          professionalId: 'pro-2',
          slotId: 'slot-2',
          status: 'confirmed',
          paid: true,
          payment: {
            provider: 'mock',
            amountCents: 100000,
            currency: 'COP',
            status: 'approved'
          },
          slot: {
            date: '2024-01-16',
            time: '14:00',
            duration: 60,
            timezone: 'America/Bogota'
          },
          professional: {
            id: 'pro-2',
            fullName: 'Dr. Carlos Rodríguez',
            specialty: 'Psicología Organizacional',
            rateCents: 100000
          },
          user: {
            id: 'user-2',
            fullName: 'Ana García',
            email: 'ana@example.com'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setAppointments(mockAppointments);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (appointmentId: string) => {
    try {
      setProcessingAction(appointmentId);
      
      const result = await adminConfirmPayment({ appointmentId });
      
      if (result.data.success) {
        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed', paid: true }
            : apt
        ));
        
        // Show success message
        alert('Pago confirmado exitosamente');
      }
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      alert(err.message || 'Error al confirmar el pago');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleFailPayment = async (appointmentId: string) => {
    try {
      setProcessingAction(appointmentId);
      
      const result = await adminFailPayment({ appointmentId });
      
      if (result.data.success) {
        // Update local state
        setAppointments(prev => prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'payment_failed' }
            : apt
        ));
        
        // Show success message
        alert('Pago marcado como fallido');
      }
    } catch (err: any) {
      console.error('Error failing payment:', err);
      alert(err.message || 'Error al marcar el pago como fallido');
    } finally {
      setProcessingAction(null);
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
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_confirmation':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pendiente de Pago';
      case 'pending_confirmation':
        return 'Pendiente de Confirmación';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      case 'payment_failed':
        return 'Pago Fallido';
      default:
        return 'Desconocido';
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      appointment.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === '' || appointment.slot.date === dateFilter;
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
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
            onClick={fetchAppointments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="mt-2 text-gray-600">Administra y confirma pagos de citas</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, profesional o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending_payment">Pendiente de Pago</option>
                <option value="pending_confirmation">Pendiente de Confirmación</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
                <option value="payment_failed">Pago Fallido</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh Button */}
            <div>
              <button
                onClick={fetchAppointments}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.createdAt.toDate?.() || appointment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.professional.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.professional.specialty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.slot.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.slot.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(appointment.payment.amountCents)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.payment.provider}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* View Details */}
                        <button
                          onClick={() => router.push(`/appointment/${appointment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {/* Confirm Payment */}
                        {['pending_payment', 'pending_confirmation'].includes(appointment.status) && (
                          <button
                            onClick={() => handleConfirmPayment(appointment.id)}
                            disabled={processingAction === appointment.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Confirmar pago"
                          >
                            {processingAction === appointment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Fail Payment */}
                        {['pending_payment', 'pending_confirmation'].includes(appointment.status) && (
                          <button
                            onClick={() => handleFailPayment(appointment.id)}
                            disabled={processingAction === appointment.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Marcar como fallido"
                          >
                            {processingAction === appointment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <XCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
              <p className="text-gray-500">No se encontraron citas con los filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Total Citas</div>
            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Pendientes</div>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => ['pending_payment', 'pending_confirmation'].includes(a.status)).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Confirmadas</div>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Fallidas</div>
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => a.status === 'payment_failed').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;
