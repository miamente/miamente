"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Award, Plus, Trash2, Upload, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Certification } from "@/lib/types";

interface CertificationsEditorProps {
  disabled?: boolean;
}

export function CertificationsEditor({ disabled = false }: CertificationsEditorProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Watch all certification names to update titles dynamically
  const watchedCertifications = watch("certifications", []);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certifications",
  });

  // Watch the certifications data
  const certifications = watch("certifications");

  // Initialize fields when data is loaded
  useEffect(() => {
    if (certifications && certifications.length > 0 && fields.length === 0) {
      // Clear existing fields and add the loaded data
      certifications.forEach((cert: Certification) => {
        append(cert);
      });
    }
  }, [certifications, fields.length, append]);

  const addCertification = () => {
    append({
      name: "",
      document: undefined,
      documentUrl: "",
      fileName: "",
    });
  };

  const removeCertification = async (index: number) => {
    const certificationToRemove = certifications?.[index];

    // If there's a file associated, delete it from the server
    if (certificationToRemove?.documentUrl) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("access_token");

        // Extract filename and user_id from the URL
        const urlParts = certificationToRemove.documentUrl.split("/");
        const filename = urlParts.pop();
        const userId = urlParts[urlParts.length - 1]; // Get the user_id from the URL

        if (filename && userId) {
          const deleteResponse = await fetch(
            `${API_BASE_URL}/api/v1/files/certification/${userId}/${filename}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (deleteResponse.ok) {
            console.log("File deleted successfully");
          } else {
            console.warn("Could not delete file from server");
          }
        }
      } catch (error) {
        console.warn("Error deleting file:", error);
        // Continue with removal even if file deletion fails
      }
    }

    // Remove the certification from the form
    remove(index);
  };

  const handleFileUpload = async (file: File, index: number) => {
    if (!isAuthenticated) {
      alert("Debes estar autenticado para subir archivos");
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("access_token");
      console.log("Upload token exists:", !!token);

      // Check if there's an existing file to delete
      const currentCertification = certifications?.[index];
      if (currentCertification?.documentUrl) {
        try {
          // Extract filename and user_id from the existing URL
          const urlParts = currentCertification.documentUrl.split("/");
          const existingFilename = urlParts.pop();
          const userId = urlParts[urlParts.length - 1]; // Get the user_id from the URL

          if (existingFilename && userId) {
            // Delete the existing file
            const deleteResponse = await fetch(
              `${API_BASE_URL}/api/v1/files/certification/${userId}/${existingFilename}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (deleteResponse.ok) {
              console.log("Previous file deleted successfully");
            } else {
              console.warn("Could not delete previous file, but continuing with upload");
            }
          }
        } catch (deleteError) {
          console.warn("Error deleting previous file:", deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Upload new file to backend
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/v1/files/upload/certification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        console.error("Upload error:", response.status, errorData);
        throw new Error(`Error uploading file: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();

      // Update the certification with the file URL
      const currentCertifications = certifications || [];
      const updatedCertifications = [...currentCertifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        document: file,
        documentUrl: result.file_url,
        fileName: result.filename || file.name, // Use filename from server response
      };

      // Update the form field using setValue
      setValue(`certifications.${index}`, updatedCertifications[index]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir el archivo. Inténtalo de nuevo.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, index);
    }
  };

  return (
    <Card className={isOpen ? "pt-0" : "p-0"}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="group cursor-pointer py-6 transition-colors duration-200 hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600 transition-colors group-hover:text-purple-700" />
                Certificaciones
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <Award className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p>No hay certificaciones agregadas</p>
                <p className="text-sm">Haz clic en el botón + para agregar una certificación</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {watchedCertifications?.[index]?.name || `Certificación ${index + 1}`}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertification(index)}
                        disabled={disabled}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nombre de la Certificación *
                        </label>
                        <Input
                          {...control.register(`certifications.${index}.name`)}
                          placeholder="Certificación en Terapia Cognitivo-Conductual"
                          disabled={disabled}
                        />
                        {errors.certifications &&
                          Array.isArray(errors.certifications) &&
                          errors.certifications[index]?.name && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.certifications[index].name.message}
                            </p>
                          )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Documento de Certificación *
                        </label>
                        <div className="mt-1">
                          <div
                            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                              disabled
                                ? "cursor-not-allowed border-gray-300 bg-gray-100 dark:bg-gray-700"
                                : !isAuthenticated
                                  ? "cursor-not-allowed border-red-300 bg-red-50 dark:bg-red-900/20"
                                  : certifications?.[index]?.documentUrl
                                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                                    : "cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                            } `}
                          >
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, index)}
                              disabled={disabled || !isAuthenticated}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                            />

                            {!certifications?.[index]?.documentUrl ? (
                              <>
                                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {!isAuthenticated
                                    ? "Debes estar autenticado para subir archivos"
                                    : "Haz clic para seleccionar un archivo"}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                  PDF, JPG, PNG • Máximo 5MB
                                </p>
                              </>
                            ) : certifications?.[index]?.documentUrl ? (
                              <>
                                <FileText className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                  Documento adjunto
                                </p>
                                <p className="text-xs text-green-500 dark:text-green-500">
                                  {certifications[index]?.fileName ||
                                    certifications[index]?.document?.name ||
                                    "Archivo adjunto"}
                                </p>
                              </>
                            ) : null}
                          </div>
                        </div>
                        {errors.certifications &&
                          Array.isArray(errors.certifications) &&
                          errors.certifications[index]?.documentUrl && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.certifications[index].documentUrl.message}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addCertification}
              disabled={disabled}
              className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Certificación
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
