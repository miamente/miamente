"use client";
import React, { useEffect, useState } from "react";

import { AdminGate } from "@/components/role-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getFeatureFlags,
  createFeatureFlag,
  toggleFeatureFlag,
  type FeatureFlag,
  type CreateFeatureFlagRequest,
} from "@/lib/feature-flags";
import { initializeFeatureFlags } from "@/lib/init-feature-flags";
import { formatBogotaDateTime } from "@/lib/timezone";

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFlag, setNewFlag] = useState<CreateFeatureFlagRequest>({
    key: "",
    name: "",
    enabled: false,
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize feature flags if they don't exist
        await initializeFeatureFlags();

        const data = await getFeatureFlags();
        setFlags(data);
      } catch (err) {
        console.error("Error loading feature flags:", err);
        setError("Error al cargar los feature flags");
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFlag.key.trim() || !newFlag.name.trim() || !newFlag.description.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const result = await createFeatureFlag(newFlag);
      if (result.success) {
        setNewFlag({ key: "", name: "", enabled: false, description: "" });
        setShowCreateForm(false);
        const updatedFlags = await getFeatureFlags();
        setFlags(updatedFlags);
      } else {
        setError(result.error || "Error al crear el feature flag");
      }
    } catch (err) {
      console.error("Error creating feature flag:", err);
      setError("Error al crear el feature flag");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleFlag = async (flagId: string) => {
    try {
      setToggling(flagId);
      setError(null);

      const result = await toggleFeatureFlag(flagId);
      if (result.success && result.data) {
        // TypeScript type assertion after explicit check
        const updatedFlag: FeatureFlag = result.data;
        setFlags((prev) => prev.map((flag) => (flag.id === flagId ? updatedFlag : flag)));
      } else {
        setError(result.error || "Error al cambiar el estado del flag");
      }
    } catch (err) {
      console.error("Error toggling feature flag:", err);
      setError("Error al cambiar el estado del flag");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGate
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Acceso Denegado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      }
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Feature Flags</h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Gestionar funcionalidades de la plataforma
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline">
              {showCreateForm ? "Cancelar" : "Nuevo Flag"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Crear Nuevo Feature Flag</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateFlag} className="space-y-4">
                <div>
                  <label htmlFor="key" className="mb-2 block text-sm font-medium">
                    Clave del Flag
                  </label>
                  <Input
                    id="key"
                    type="text"
                    value={newFlag.key}
                    onChange={(e) => setNewFlag((prev) => ({ ...prev, key: e.target.value }))}
                    placeholder="ej. enable_new_ui"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium">
                    Descripción
                  </label>
                  <Input
                    id="description"
                    type="text"
                    value={newFlag.description}
                    onChange={(e) =>
                      setNewFlag((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Descripción del feature flag"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={newFlag.enabled}
                    onChange={(e) => setNewFlag((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium">
                    Habilitado por defecto
                  </label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creando..." : "Crear Flag"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Flags List */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags ({flags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                No hay feature flags configurados
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{flag.key}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            flag.enabled
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {flag.enabled ? "Habilitado" : "Deshabilitado"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {flag.description}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Creado: {formatBogotaDateTime(new Date(flag.createdAt))} | Actualizado:{" "}
                        {formatBogotaDateTime(new Date(flag.updatedAt))}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={flag.enabled ? "destructive" : "default"}
                        onClick={() => handleToggleFlag(flag.id)}
                        disabled={toggling === flag.id}
                      >
                        {toggling === flag.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        ) : flag.enabled ? (
                          "Deshabilitar"
                        ) : (
                          "Habilitar"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGate>
  );
}
