"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, getUserUid } from "@/hooks/useAuth";
import { createReview, type CreateReviewRequest } from "@/lib/reviews";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "La calificación debe ser al menos 1")
    .max(5, "La calificación debe ser máximo 5"),
  comment: z.string().max(500, "El comentario no puede exceder 500 caracteres").optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  proId: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  appointmentId,
  proId,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      setError("Debes estar autenticado para calificar");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData: CreateReviewRequest = {
        appointmentId,
        rating: data.rating,
        comment: data.comment || "",
      };

      const userUid = getUserUid(user);
      if (!userUid) return;
      const result = await createReview(userUid, proId, reviewData);

      if (result.success) {
        setSuccess(true);
        reset();
        setTimeout(() => {
          onReviewSubmitted?.();
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Error al enviar la calificación");
      }
    } catch {
      setError("Error inesperado al enviar la calificación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Califica tu sesión</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Tu opinión nos ayuda a mejorar el servicio
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
              ¡Gracias por tu calificación!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Tu opinión ha sido registrada exitosamente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Calificación (1-5 estrellas)</label>
              <div className="flex items-center space-x-4">
                <StarRating
                  rating={rating}
                  interactive={true}
                  onRatingChange={(newRating) => setValue("rating", newRating)}
                  disabled={isSubmitting}
                />
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...register("rating", { valueAsNumber: true })}
                  disabled={isSubmitting}
                  className="w-16"
                />
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.rating.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                Comentario (opcional)
              </label>
              <textarea
                id="comment"
                {...register("comment")}
                disabled={isSubmitting}
                rows={3}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="Comparte tu experiencia con esta sesión..."
              />
              {errors.comment && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.comment.message}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Enviando..." : "Enviar Calificación"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
