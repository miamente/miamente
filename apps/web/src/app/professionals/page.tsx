"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { ProfessionalCardSkeleton } from "@/components/professional-card-skeleton";
import { queryProfessionals, type ProfessionalsQueryResult } from "@/lib/profiles";
import { useSpecialtyNames } from "@/hooks/useSpecialtyNames";

// Helper function to construct full image URLs
const getImageUrl = (imagePath: string | undefined): string | undefined => {
  if (!imagePath) return undefined;

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${API_BASE_URL}${imagePath}`;
};

const SPECIALTY_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas las especialidades" },
  { value: "Psicología Clínica", label: "Psicología Clínica" },
  { value: "Psiquiatría", label: "Psiquiatría" },
  { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
  { value: "Trabajo Social", label: "Trabajo Social" },
  { value: "Coaching", label: "Coaching" },
  { value: "Otra", label: "Otra" },
];

export default function ProfessionalsPage() {
  const [specialty, setSpecialty] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProfessionalsQueryResult["professionals"]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const lastSnapshotRef = useRef<ProfessionalsQueryResult["lastSnapshot"]>(null);

  // Generate stable skeleton keys once
  const skeletonKeys = useMemo(
    () => Array.from({ length: 6 }).map((_, index) => `skeleton-${crypto.randomUUID()}-${index}`),
    [],
  );

  // Get specialty names for all professionals
  const { getNames: getSpecialtyNames, loading: specialtiesLoading } = useSpecialtyNames();

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
  };

  const parsedMin = useMemo(
    () => (minPrice ? Math.max(0, Number(minPrice)) : undefined),
    [minPrice],
  );
  const parsedMax = useMemo(
    () => (maxPrice ? Math.max(0, Number(maxPrice)) : undefined),
    [maxPrice],
  );

  const canLoadMore = Boolean(lastSnapshotRef.current);

  const fetchPage = useCallback(
    async (isFirstPage: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const { professionals, lastSnapshot } = await queryProfessionals({
          specialty: specialty || undefined,
          minRateCents: parsedMin,
          maxRateCents: parsedMax,
          limit: 9,
          startAfterSnapshot: isFirstPage ? null : lastSnapshotRef.current,
        });
        lastSnapshotRef.current = lastSnapshot;
        setItems((prev) => (isFirstPage ? professionals : [...prev, ...professionals]));
        if (isFirstPage) {
          setIsInitialLoad(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar profesionales");
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    },
    [specialty, parsedMin, parsedMax],
  );

  useEffect(() => {
    // Prefetch first page on mount and whenever filters change
    lastSnapshotRef.current = null;
    fetchPage(true);
  }, [fetchPage]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    lastSnapshotRef.current = null;
    fetchPage(true);
  };

  const handleLoadMore = () => {
    fetchPage(false);
  };

  const renderSpecialtyInfo = (pro: any) => {
    if (specialtiesLoading) {
      return (
        <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
      );
    }

    if (pro.specialty_ids && pro.specialty_ids.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {getSpecialtyNames(pro.specialty_ids).map((specialty: string, index: number) => (
            <span
              key={`${pro.id}-specialty-${specialty}-${index}`}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {specialty}
            </span>
          ))}
        </div>
      );
    }

    return "Especialidad no especificada";
  };

  // Determine what content to render
  const renderContent = () => {
    if (loading && isInitialLoad) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonKeys.map((key) => (
            <ProfessionalCardSkeleton key={key} />
          ))}
        </div>
      );
    }

    if (!loading && !isInitialLoad && items.length === 0) {
      return (
        <div role="status" aria-live="polite" className="rounded-md border p-6 text-center">
          <p className="text-neutral-700 dark:text-neutral-300">
            No encontramos profesionales con los filtros seleccionados.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Intenta ajustar los filtros.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((pro) => (
          <Link key={pro.id} href={`/professionals/${pro.id}`}>
            <Card className="flex cursor-pointer flex-col transition-shadow duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{pro.full_name}</CardTitle>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {renderSpecialtyInfo(pro)}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {(pro.rate_cents / 100).toLocaleString("es-CO", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  / hora
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                {getImageUrl(pro.profile_picture) ? (
                  <Image
                    src={getImageUrl(pro.profile_picture)!}
                    alt={`Foto del profesional ${pro.full_name}`}
                    width={400}
                    height={160}
                    className="h-40 w-full rounded-md object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                    Sin foto
                  </div>
                )}
                <p className="line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {pro.bio}
                </p>
                <div className="mt-auto">
                  <Button
                    className="w-full"
                    variant="outline"
                    aria-label={`Ver perfil de ${pro.full_name}`}
                  >
                    Ver perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Profesionales</h1>

      <form
        className="mb-6 grid gap-4 sm:grid-cols-4"
        aria-label="Filtros"
        onSubmit={handleApplyFilters}
      >
        <div className="sm:col-span-2">
          <label htmlFor="specialty" className="mb-1 block text-sm font-medium">
            Especialidad
          </label>
          <Select
            id="specialty"
            options={SPECIALTY_OPTIONS}
            value={specialty}
            onValueChange={handleSpecialtyChange}
            placeholder="Selecciona una especialidad"
            aria-describedby="specialty-help"
          />
          <p id="specialty-help" className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Filtra por especialidad
          </p>
        </div>

        <div>
          <label htmlFor="minPrice" className="mb-1 block text-sm font-medium">
            Precio mínimo (COP)
          </label>
          <Input
            id="minPrice"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium">
            Precio máximo (COP)
          </label>
          <Input
            id="maxPrice"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="flex gap-3 sm:col-span-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Aplicando..." : "Aplicar filtros"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSpecialty("");
              setMinPrice("");
              setMaxPrice("");
              lastSnapshotRef.current = null;
              fetchPage(true);
            }}
            disabled={loading}
          >
            Limpiar
          </Button>
        </div>
      </form>

      {error && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {renderContent()}

      {items.length > 0 && !isInitialLoad && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} disabled={loading || !canLoadMore}>
            {loading ? "Cargando..." : canLoadMore ? "Cargar más" : "No hay más resultados"}
          </Button>
        </div>
      )}
    </div>
  );
}
