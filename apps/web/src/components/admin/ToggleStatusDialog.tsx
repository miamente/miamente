"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ToggleStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityDisplayName: string;
  isCurrentlyActive: boolean;
  isLoading?: boolean;
}

export function ToggleStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityDisplayName,
  isCurrentlyActive,
  isLoading = false,
}: ToggleStatusDialogProps) {
  const actionText = isCurrentlyActive ? "desactivar" : "activar";
  const Icon = isCurrentlyActive ? EyeOff : Eye;
  const iconColor = isCurrentlyActive ? "text-orange-600" : "text-green-600";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {isCurrentlyActive ? `Desactivar ${entityName}` : `Activar ${entityName}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
               <p className="text-gray-600 break-words">
                 ¿Estás seguro de que quieres {actionText} el {entityName.toLowerCase()}{" "}
                 <strong className="break-all">&ldquo;{entityDisplayName}&rdquo;</strong>?
               </p>
          {isCurrentlyActive && (
            <p className="text-sm text-orange-600 break-words">
              Al desactivarlo, no estará disponible para nuevos profesionales.
            </p>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={onConfirm}
              className={isCurrentlyActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
              disabled={isLoading}
            >
              {isCurrentlyActive ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Activar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
