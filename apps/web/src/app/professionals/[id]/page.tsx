"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Star,
  User,
  Award,
  GraduationCap,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { apiClient } from "@/lib/api";
import { useUnifiedAuth, getAccountId } from "@/hooks/useAuth";
import { useTherapyApproachNames } from "@/hooks/useTherapyApproachNames";
import { useSpecialtyNames } from "@/hooks/useSpecialtyNames";
import { useProfessionalSpecialties } from "@/hooks/useProfessionalSpecialties";
import type { AccountWithProfile, ProfessionalProfile } from "@/lib/types";

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

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { account, isLoading: authLoading } = useUnifiedAuth();
  const [professionalAccount, setProfessionalAccount] = useState<AccountWithProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const professionalId = params.id as string;

  // Get therapy approach names (will fetch them separately)
  const { getNames: getTherapyApproachNames, loading: therapyApproachesLoading } =
    useTherapyApproachNames([]);

  // Get specialty names
  const { getNames: getSpecialtyNames, loading: specialtiesLoading } = useSpecialtyNames();
  
  // Get professional specialties
  const { specialties: professionalSpecialties, loading: specialtiesDataLoading } = useProfessionalSpecialties(professionalId);

  // Check if the logged-in user is the same as the professional being viewed
  const isOwnProfile = account && professionalAccount && getAccountId(account) === professionalAccount.account.id;

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!professionalId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.getAccountById(professionalId);
        setProfessionalAccount(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [professionalId]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="mb-4 h-48 w-full rounded-md" />
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-1 h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="mb-4 h-6 w-1/3" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !professionalAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Profesionales", href: "/professionals" },
              { label: "Profesional no encontrado" },
            ]}
            className="mb-4"
          />
        </div>

        <div className="py-12 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Profesional no encontrado</h1>
          <p className="mb-6 text-gray-600">
            {error || "El profesional que buscas no existe o no está disponible."}
          </p>
          <Button onClick={() => router.push("/professionals")}>Ver todos los profesionales</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Extract account and profile data if professional account is loaded
  if (!professionalAccount) {
    return null;
  }
  
  const professional = professionalAccount.account;
  const professionalProfile = professionalAccount.profile as ProfessionalProfile | null;

  const renderSpecialtyInfo = () => {
    if (specialtiesLoading || specialtiesDataLoading) {
      return <Skeleton className="h-4 w-32" />;
    }

    if (professionalSpecialties && professionalSpecialties.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {professionalSpecialties.map((specialty) => (
            <span
              key={specialty.id}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
            >
              {specialty.name}
            </span>
          ))}
        </div>
      );
    }

    return "Especialidad no especificada";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Profesionales", href: "/professionals" },
            { label: professional.full_name },
          ]}
          className="mb-4"
        />

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Perfil del Profesional</h1>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/profile/professional">
                <User className="mr-2 h-4 w-4" />
                Editar Perfil
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              {getImageUrl(professional.profile_picture) ? (
                <Image
                  src={getImageUrl(professional.profile_picture)!}
                  alt={`Foto de ${professional.full_name}`}
                  width={200}
                  height={200}
                  className="mx-auto mb-4 h-48 w-48 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-24 w-24 text-gray-400" data-testid="user-icon" />
                </div>
              )}

              <CardTitle className="text-xl">{professional.full_name}</CardTitle>
              <div className="text-sm text-gray-600">{renderSpecialtyInfo()}</div>

              {professional.is_verified && (
                <div className="mt-2 flex items-center justify-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Verificado</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatPrice(professionalProfile?.rate_cents || 0)} / hora</span>
              </div>

              {professional.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm">{professional.phone}</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{professionalProfile?.years_experience || 0} años de experiencia</span>
              </div>

              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{professionalProfile?.timezone || "America/Bogota"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          {professionalProfile?.short_description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Sobre mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-gray-700">{professionalProfile.short_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {professionalProfile?.academic_experience && (() => {
            const academicExp = typeof professionalProfile.academic_experience === 'string' 
              ? JSON.parse(professionalProfile.academic_experience)
              : professionalProfile.academic_experience;
            return academicExp && academicExp.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Formación Académica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academicExp.map((education: any) => (
                      <div
                        key={`${education.degree}-${education.institution}`}
                        className="border-l-4 border-blue-200 pl-4"
                      >
                        <h4 className="font-semibold text-gray-900">{education.degree}</h4>
                        <p className="text-sm text-gray-600">
                          {education.institution} - {education.field}
                        </p>
                        <p className="text-xs text-gray-500">
                          {education.start_date} - {education.end_date || "Presente"}
                        </p>
                        {education.description && (
                          <p className="mt-2 text-sm text-gray-700">{education.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Certifications */}
          {professionalProfile?.certifications && (() => {
            const certs = typeof professionalProfile.certifications === 'string'
              ? JSON.parse(professionalProfile.certifications)
              : professionalProfile.certifications;
            return certs && certs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {certs.map((cert: any) => (
                      <li key={cert.name} className="flex items-center">
                        <span className="mr-3 h-2 w-2 rounded-full bg-blue-500"></span>
                        <span className="text-gray-700">{cert.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })()}

          {/* Languages */}
          {professionalProfile?.languages && professionalProfile.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professionalProfile.languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Therapy Approaches - TODO: Fetch from junction table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Enfoques Terapéuticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Los enfoques terapéuticos estarán disponibles próximamente
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Cita
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
