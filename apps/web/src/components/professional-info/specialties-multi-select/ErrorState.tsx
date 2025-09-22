import React from "react";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { ErrorStateProps } from "./types";

export const ErrorState: React.FC<ErrorStateProps> = ({ label, error }) => (
  <div className="space-y-2" role="alert" aria-live="assertive">
    <Label className="flex items-center gap-2">
      {label}
      <AlertCircle className="h-4 w-4 text-red-500" />
    </Label>
    <div className="text-sm text-red-500">Error: {error}</div>
  </div>
);
