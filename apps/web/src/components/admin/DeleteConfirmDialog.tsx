"use client";

import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityDisplayName: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityDisplayName,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Confirmar Eliminación
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
          <div className="flex items-start space-x-3">
                   <p className="text-sm text-gray-700 break-words">
                     ¿Estás seguro de que quieres eliminar el {entityName.toLowerCase()}{" "}
                     <span className="font-semibold break-all">&ldquo;{entityDisplayName}&rdquo;</span>? Esta acción no se puede deshacer.
                   </p>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm} 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
