import React from "react";
import { AcademicExperience } from "@/lib/profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar, MapPin } from "lucide-react";

interface AcademicExperienceProps {
  experiences: AcademicExperience[];
}

export function AcademicExperienceSection({ experiences }: AcademicExperienceProps) {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Formación Académica</h2>
      </div>

      <div className="space-y-2">
        {experiences.map((experience, index) => (
          <Card
            key={index}
            className="border-l-4 border-l-blue-500"
            data-testid="academic-experience-card"
          >
            <CardHeader className="px-4 pt-4 pb-1">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {experience.degree}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{experience.institution}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {experience.start_year}
                    {experience.end_year ? ` - ${experience.end_year}` : " - Presente"}
                  </span>
                </div>
              </div>
            </CardHeader>
            {experience.description && (
              <CardContent className="px-4 pt-0 pb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{experience.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
