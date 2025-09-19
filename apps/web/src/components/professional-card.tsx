import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";

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

interface ProfessionalCardData {
  id: string;
  full_name: string;
  bio?: string;
  profile_picture?: string;
  specialties?: Array<{ id: string; name: string }>;
  rating?: number;
  total_reviews?: number;
}

interface ProfessionalCardProps {
  professional: ProfessionalCardData;
  onViewProfile?: (professionalId: string) => void;
}

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(professional.id);
    }
  };

  return (
    <Card className="h-full" data-testid="professional-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{professional.full_name}</CardTitle>
        {professional.bio && (
          <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {professional.bio}
          </p>
        )}
        {professional.rating && professional.total_reviews && (
          <div className="flex items-center gap-2">
            <StarRating rating={professional.rating} maxRating={5} interactive={false} size="sm" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {professional.rating} ({professional.total_reviews} reseñas)
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {professional.profile_picture ? (
          <Image
            src={getImageUrl(professional.profile_picture)!}
            alt={`Foto del profesional ${professional.full_name}`}
            width={400}
            height={160}
            className="h-40 w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            Sin foto
          </div>
        )}

        {professional.specialties && professional.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {professional.specialties.map((specialty: { id: string; name: string }) => (
              <Badge key={specialty.id} variant="secondary" className="text-xs">
                {specialty.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleViewProfile}
            aria-label={`Ver perfil de ${professional.full_name}`}
          >
            Ver perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
