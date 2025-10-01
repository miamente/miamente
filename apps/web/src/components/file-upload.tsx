"use client";
import React, { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  readonly onFileSelect: (file: File) => void;
  readonly accept?: string;
  readonly maxSize?: number; // in bytes
  readonly label?: string;
  readonly disabled?: boolean;
  readonly currentFile?: string; // URL of current file
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,.pdf",
  maxSize = 5 * 1024 * 1024, // 5MB
  label = "Seleccionar archivo",
  disabled = false,
  currentFile,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB`;
    }

    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    const isAllowed = allowedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }
      const regex = new RegExp(type.replace("*", ".*"));
      return regex.exec(fileType) !== null;
    });

    if (!isAllowed) {
      return `Tipo de archivo no permitido. Tipos permitidos: ${accept}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <Card
        className={`cursor-pointer transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : ""
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleButtonClick}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl">📁</div>
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                {dragActive
                  ? "Suelta el archivo aquí"
                  : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-neutral-500">
                Máximo {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled={disabled}>
              Seleccionar archivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {currentFile && (
        <div className="text-sm text-green-600">
          ✅ Archivo actual: {currentFile.split("/").pop()}
        </div>
      )}
    </div>
  );
}
