import React from "react";
import { Label } from "@/components/ui/label";
import { LoadingStateProps } from "./types";

export const LoadingState: React.FC<LoadingStateProps> = ({ label }) => (
  <div className="space-y-2" role="status" aria-live="polite">
    <Label>{label}</Label>
    <div className="text-sm text-gray-500">Cargando especialidades...</div>
  </div>
);
