"use client";

import React from "react";
import { X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface EntityFormData {
  name: string;
  description: string;
}

export interface EntityFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  formData: EntityFormData;
  onFormDataChange: (data: EntityFormData) => void;
  entityName: string;
  entityNamePlural: string;
  isLoading?: boolean;
  useTextarea?: boolean;
}

export function EntityFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  onFormDataChange,
  entityName,
  isLoading = false,
  useTextarea = false,
}: EntityFormDialogProps) {
  const handleInputChange = (field: keyof EntityFormData, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const isFormValid = formData.name.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="break-words">
            {isEditing ? `Editar ${entityName}` : `Agregar ${entityName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={`Nombre del ${entityName.toLowerCase()}`}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="description">
              {useTextarea ? "Descripción" : "Descripción corta"}
            </Label>
            {useTextarea ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={`Descripción del ${entityName.toLowerCase()}`}
                rows={3}
                disabled={isLoading}
                className="resize-none"
              />
            ) : (
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={`Descripción breve del ${entityName.toLowerCase()}`}
                disabled={isLoading}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={!isFormValid || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
