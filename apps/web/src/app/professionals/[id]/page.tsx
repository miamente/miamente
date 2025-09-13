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
import { AcademicExperienceSection } from "@/components/academic-experience";
import { WorkExperienceSection } from "@/components/work-experience";
import { getProfessionalProfile, type ProfessionalProfile } from "@/lib/profiles";
import { useAuth, getUserUid } from "@/hooks/useAuth";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const professionalId = params.id as string;

  // Check if the logged-in user is the same as the professional being viewed
  const isOwnProfile = user && professional && getUserUid(user) === professional.id;

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!professionalId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getProfessionalProfile(professionalId);
        setProfessional(data);
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

  if (error || !professional) {
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Profesional no encontrado
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error || "El profesional que buscas no existe o no está disponible."}
          </p>
          <Button onClick={() => router.push("/professionals")}>Ver todos los profesionales</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
    });
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Perfil del Profesional
          </h1>
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
              {professional.profile_picture ? (
                <Image
                  src={professional.profile_picture}
                  alt={`Foto de ${professional.full_name}`}
                  width={200}
                  height={200}
                  className="mx-auto mb-4 h-48 w-48 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <User className="h-24 w-24 text-gray-400" />
                </div>
              )}

              <CardTitle className="text-xl">{professional.full_name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">{professional.specialty}</p>

              {professional.is_verified && (
                <div className="mt-2 flex items-center justify-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">Verificado</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatPrice(professional.rate_cents)} / hora</span>
              </div>

              {professional.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-sm">{professional.phone}</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{professional.years_experience} años de experiencia</span>
              </div>

              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm">{professional.timezone}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          {professional.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Sobre mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {professional.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {professional.academic_experience && professional.academic_experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Formación Académica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professional.academic_experience.map((education, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {education.degree}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {education.institution} - {education.field}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {education.startDate} - {education.endDate || "Presente"}
                      </p>
                      {education.description && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          {education.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {professional.certifications && professional.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {professional.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-3 h-2 w-2 rounded-full bg-blue-500"></span>
                      <span className="text-gray-700 dark:text-gray-300">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {professional.languages && professional.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professional.languages.map((language, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Therapy Approaches */}
          {professional.therapy_approaches && professional.therapy_approaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Enfoques Terapéuticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {professional.therapy_approaches.map((approach, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {approach}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Experience */}
          {professional.academic_experience && professional.academic_experience.length > 0 && (
            <AcademicExperienceSection experiences={professional.academic_experience} />
          )}

          {/* Work Experience */}
          {professional.work_experience && professional.work_experience.length > 0 && (
            <WorkExperienceSection experiences={professional.work_experience} />
          )}

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
