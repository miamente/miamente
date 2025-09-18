/**
 * Hook for managing appointments.
 */
import { useState, useCallback } from "react";

import { apiClient, type Appointment } from "@/lib/api";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getUserAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookAppointment = useCallback(
    async (professionalId: string, startTime: string, endTime: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiClient.bookAppointmentDirect(professionalId, startTime, endTime);
        // Refresh appointments after booking
        await fetchAppointments();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to book appointment");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAppointments],
  );

  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.cancelAppointment(appointmentId);
        // Refresh appointments after cancellation
        await fetchAppointments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to cancel appointment");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAppointments],
  );

  const updateAppointment = useCallback(
    async (appointmentId: string, updates: Partial<Appointment>) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedAppointment = await apiClient.updateAppointment(appointmentId, updates);
        // Update the appointment in the local state
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === appointmentId ? updatedAppointment : apt)),
        );
        return updatedAppointment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update appointment");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    bookAppointment,
    cancelAppointment,
    updateAppointment,
  };
}

export function useAppointment(appointmentId: string) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getAppointment(appointmentId);
      setAppointment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch appointment");
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  return {
    appointment,
    isLoading,
    error,
    fetchAppointment,
  };
}
