"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProfessionalCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ProfessionalCreateData) => Promise<void>;
}

export interface ProfessionalCreateData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export function ProfessionalCreateDialog({ isOpen, onClose, onConfirm }: ProfessionalCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<ProfessionalCreateData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  const handleChange = (field: keyof ProfessionalCreateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(formData);
      // Reset form
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
      });
      onClose();
    } catch (err) {
      console.error("Error creating professional:", err);
      setError(err instanceof Error ? err.message : "Error al crear el profesional");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Profesional</DialogTitle>
            <DialogDescription>
              Completa la información básica del profesional. Podrá completar su perfil después de iniciar sesión.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  placeholder="Ej: Juan"
                  disabled={loading}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  placeholder="Ej: Pérez"
                  disabled={loading}
                  required
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="profesional@example.com"
                disabled={loading}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
                required
                minLength={8}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Ej: +56912345678"
                disabled={loading}
                className="bg-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Profesional
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

