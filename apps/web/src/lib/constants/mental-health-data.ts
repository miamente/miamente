/**
 * Constants for mental health specialties, therapeutic approaches, and intervention modalities
 */

// 🧠 Especialidades en salud mental (Formación académica o campo profesional regulado)
export const MENTAL_HEALTH_SPECIALTIES = [
  "Psiquiatría",
  "Psicología clínica",
  "Psicología educativa",
  "Psicología organizacional/ocupacional",
  "Psicología de la salud",
  "Psicología del deporte",
  "Neuropsicología",
  "Psicopedagogía",
  "Trabajo social clínico",
  "Consejería/Orientación psicológica",
] as const;

// 🔎 Enfoques terapéuticos (Corrientes teóricas y metodológicas; un profesional puede combinar varios)
export const THERAPEUTIC_APPROACHES = [
  "Cognitivo-conductual (TCC)",
  "Terapias de tercera generación (ACT, DBT, Mindfulness, etc.)",
  "Psicoanalítico / Psicodinámico",
  "Humanista (Rogers, Gestalt, Logoterapia, etc.)",
  "Sistémico / Familiar",
  "Integrativo (combinación de enfoques)",
  "Conductual puro",
  "Analítico-existencial",
  "Psicoterapia breve",
  "Narrativa",
  "Coaching psicológico (en algunos contextos, como acompañamiento no clínico)",
] as const;

// 👥 Modalidades de intervención (Definen el formato, destinatario o contexto de la terapia)
export interface InterventionModality {
  name: string;
  description: string;
  category: string;
  defaultPriceCents: number;
}

export const INTERVENTION_MODALITIES: InterventionModality[] = [
  {
    name: "Individual",
    description: "Sesiones de terapia uno a uno con el profesional",
    category: "Formato",
    defaultPriceCents: 80000, // $800 COP
  },
  {
    name: "Pareja",
    description: "Terapia dirigida a parejas y relaciones",
    category: "Formato",
    defaultPriceCents: 120000, // $1,200 COP
  },
  {
    name: "Familiar",
    description: "Terapia familiar para dinámicas y conflictos familiares",
    category: "Formato",
    defaultPriceCents: 100000, // $1,000 COP
  },
  {
    name: "Infantil",
    description: "Terapia especializada para niños y niñas",
    category: "Población",
    defaultPriceCents: 90000, // $900 COP
  },
  {
    name: "Adolescente",
    description: "Terapia especializada para adolescentes",
    category: "Población",
    defaultPriceCents: 85000, // $850 COP
  },
  {
    name: "Adultos mayores",
    description: "Terapia especializada para adultos mayores",
    category: "Población",
    defaultPriceCents: 90000, // $900 COP
  },
  {
    name: "Grupal",
    description: "Terapia en grupo con múltiples participantes",
    category: "Formato",
    defaultPriceCents: 60000, // $600 COP
  },
  {
    name: "Online / Teleterapia",
    description: "Sesiones de terapia realizadas de forma virtual",
    category: "Modalidad",
    defaultPriceCents: 70000, // $700 COP
  },
  {
    name: "Presencial",
    description: "Sesiones de terapia realizadas en persona",
    category: "Modalidad",
    defaultPriceCents: 80000, // $800 COP
  },
  {
    name: "Intervenciones breves / de crisis",
    description: "Intervenciones de corta duración para situaciones de crisis",
    category: "Contexto",
    defaultPriceCents: 100000, // $1,000 COP
  },
  {
    name: "Psicoeducación (charlas, talleres, acompañamiento no clínico)",
    description: "Actividades educativas y de acompañamiento no terapéutico",
    category: "Contexto",
    defaultPriceCents: 50000, // $500 COP
  },
];

// Type definitions
export type MentalHealthSpecialty = (typeof MENTAL_HEALTH_SPECIALTIES)[number];
export type TherapeuticApproach = (typeof THERAPEUTIC_APPROACHES)[number];
