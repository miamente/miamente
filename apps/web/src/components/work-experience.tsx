import React from "react";
import { WorkExperience } from "@/lib/profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, MapPin, Award } from "lucide-react";

interface WorkExperienceProps {
  experiences: WorkExperience[];
}

export function WorkExperienceSection({ experiences }: WorkExperienceProps) {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Experiencia Laboral</h2>
      </div>

      <div className="space-y-2">
        {experiences.map((experience, index) => (
          <Card
            key={index}
            className="border-l-4 border-l-green-500"
            data-testid="work-experience-card"
          >
            <CardHeader className="px-4 pt-4 pb-1">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    {experience.position}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{experience.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(experience.start_date).toLocaleDateString("es-CO", {
                      month: "short",
                      year: "numeric",
                    })}
                    {experience.end_date
                      ? ` - ${new Date(experience.end_date).toLocaleDateString("es-CO", {
                          month: "short",
                          year: "numeric",
                        })}`
                      : " - Presente"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4 pt-0 pb-3">
              {experience.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">{experience.description}</p>
              )}
              {experience.achievements && experience.achievements.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Logros destacados:
                    </span>
                  </div>
                  <ul className="ml-6 list-inside list-disc space-y-0.5">
                    {experience.achievements.map((achievement, achievementIndex) => (
                      <li
                        key={achievementIndex}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
