"use client";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNext14DaysFreeSlots, type AvailabilitySlot } from "@/lib/availability";
import { formatBogotaDateTime, formatBogotaDate } from "@/lib/timezone";

export default function ProfessionalAvailabilityPage() {
  const params = useParams();
  const proId = params.proId as string;

  const [slots, setSlots] = useState<Array<AvailabilitySlot & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (!proId) return;

    setLoading(true);
    setError(null);

    try {
      const availableSlots = await getNext14DaysFreeSlots(proId);
      setSlots(availableSlots);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar disponibilidad";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [proId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleBookSlot = (slotId: string) => {
    // TODO: Implement booking functionality
    console.log("Booking slot:", slotId);
  };

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      const dateKey = formatBogotaDate(slot.start, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    },
    {} as Record<string, Array<AvailabilitySlot & { id: string }>>,
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={loadSlots} className="mt-4" variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Disponibilidad</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Horarios disponibles para los próximos 14 días
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-md border p-6 text-center">
          <p className="text-neutral-700 dark:text-neutral-300">
            No hay horarios disponibles en los próximos 14 días.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Intenta contactar al profesional directamente.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {formatBogotaDateTime(slot.start, {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {Math.round((slot.end.getTime() - slot.start.getTime()) / (1000 * 60))}{" "}
                          minutos
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleBookSlot(slot.id)}
                        aria-label={`Reservar cita el ${date} a las ${formatBogotaDateTime(
                          slot.start,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}`}
                      >
                        Reservar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
