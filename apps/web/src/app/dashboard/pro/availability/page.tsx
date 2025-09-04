"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  generateSlots,
  getNext14DaysFreeSlots,
  deleteSlot,
  type AvailabilitySlot,
} from "@/lib/availability";
import { formatBogotaDateTime, getBogotaNow } from "@/lib/timezone";

const slotGenerationSchema = z.object({
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().min(1, "Fecha de fin requerida"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  durationMinutes: z
    .number()
    .min(15, "Duración mínima 15 minutos")
    .max(480, "Duración máxima 8 horas"),
  daysOfWeek: z.array(z.number().min(0).max(6)).min(1, "Selecciona al menos un día"),
});

type SlotGenerationFormData = z.infer<typeof slotGenerationSchema>;

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function ProAvailabilityPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingSlots, setExistingSlots] = useState<Array<AvailabilitySlot & { id: string }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SlotGenerationFormData>({
    resolver: zodResolver(slotGenerationSchema),
    defaultValues: {
      startDate: getBogotaNow().toISOString().split("T")[0],
      endDate: new Date(getBogotaNow().getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      durationMinutes: 30,
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    },
  });

  const selectedDays = watch("daysOfWeek") || [];

  const loadExistingSlots = useCallback(async () => {
    if (!user) return;

    setIsLoadingSlots(true);
    try {
      const slots = await getNext14DaysFreeSlots(user.uid);
      setExistingSlots(slots);
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [user]);

  useEffect(() => {
    loadExistingSlots();
  }, [loadExistingSlots]);

  const onSubmit = async (data: SlotGenerationFormData) => {
    if (!user) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      const result = await generateSlots(user.uid, {
        startDate,
        endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        daysOfWeek: data.daysOfWeek,
      });

      setSuccess(
        `Creados ${result.created} slots. ${result.skipped} slots omitidos por solapamiento.`,
      );
      await loadExistingSlots();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar slots";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!user) return;

    try {
      await deleteSlot(user.uid, slotId);
      await loadExistingSlots();
    } catch (err) {
      console.error("Error deleting slot:", err);
    }
  };

  const toggleDay = (dayValue: number) => {
    const currentDays = selectedDays;
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter((d) => d !== dayValue)
      : [...currentDays, dayValue];
    setValue("daysOfWeek", newDays);
  };

  if (!user) {
    return <div className="flex min-h-[50vh] items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Disponibilidad</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Genera y gestiona tus horarios de disponibilidad
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generar Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {success}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
                    Fecha de inicio
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    disabled={isGenerating}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
                    Fecha de fin
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    disabled={isGenerating}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className="mb-1 block text-sm font-medium">
                    Hora de inicio
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime")}
                    disabled={isGenerating}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endTime" className="mb-1 block text-sm font-medium">
                    Hora de fin
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime")}
                    disabled={isGenerating}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="durationMinutes" className="mb-1 block text-sm font-medium">
                  Duración (minutos)
                </label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  {...register("durationMinutes", { valueAsNumber: true })}
                  disabled={isGenerating}
                />
                {errors.durationMinutes && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.durationMinutes.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Días de la semana</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day.value)}
                        onChange={() => toggleDay(day.value)}
                        disabled={isGenerating}
                        className="rounded border-neutral-300"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.daysOfWeek && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.daysOfWeek.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? "Generando slots..." : "Generar Slots"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slots Existentes (Próximos 14 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400">Cargando slots...</p>
              </div>
            ) : existingSlots.length === 0 ? (
              <div className="rounded-md border p-6 text-center">
                <p className="text-neutral-700 dark:text-neutral-300">
                  No tienes slots disponibles en los próximos 14 días.
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Genera algunos slots usando el formulario.
                </p>
              </div>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {existingSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{formatBogotaDateTime(slot.start)}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Duración:{" "}
                        {Math.round((slot.end.getTime() - slot.start.getTime()) / (1000 * 60))} min
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteSlot(slot.id)}>
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
