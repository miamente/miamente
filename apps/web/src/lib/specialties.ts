/**
 * Especialidades médicas y precios predeterminados
 */

export interface Specialty {
  id: string;
  name: string;
  description: string;
  defaultPriceCents: number; // Precio en centavos
  currency: string;
  category: string;
}

export const DEFAULT_SPECIALTIES: Specialty[] = [
  {
    id: "psychology",
    name: "Psicología Clínica",
    description: "Tratamiento de trastornos mentales y emocionales",
    defaultPriceCents: 80000, // $800 COP
    currency: "COP",
    category: "Salud Mental",
  },
  {
    id: "psychiatry",
    name: "Psiquiatría",
    description: "Diagnóstico y tratamiento médico de trastornos mentales",
    defaultPriceCents: 120000, // $1,200 COP
    currency: "COP",
    category: "Salud Mental",
  },
  {
    id: "therapy",
    name: "Terapia Individual",
    description: "Sesiones de terapia psicológica individual",
    defaultPriceCents: 60000, // $600 COP
    currency: "COP",
    category: "Terapia",
  },
  {
    id: "couples_therapy",
    name: "Terapia de Pareja",
    description: "Terapia para parejas y relaciones",
    defaultPriceCents: 100000, // $1,000 COP
    currency: "COP",
    category: "Terapia",
  },
  {
    id: "family_therapy",
    name: "Terapia Familiar",
    description: "Terapia para familias y dinámicas familiares",
    defaultPriceCents: 90000, // $900 COP
    currency: "COP",
    category: "Terapia",
  },
  {
    id: "child_psychology",
    name: "Psicología Infantil",
    description: "Tratamiento psicológico para niños y adolescentes",
    defaultPriceCents: 70000, // $700 COP
    currency: "COP",
    category: "Psicología",
  },
  {
    id: "neuropsychology",
    name: "Neuropsicología",
    description: "Evaluación y tratamiento de funciones cognitivas",
    defaultPriceCents: 150000, // $1,500 COP
    currency: "COP",
    category: "Psicología",
  },
  {
    id: "addiction_therapy",
    name: "Terapia de Adicciones",
    description: "Tratamiento especializado en adicciones",
    defaultPriceCents: 100000, // $1,000 COP
    currency: "COP",
    category: "Especializada",
  },
  {
    id: "trauma_therapy",
    name: "Terapia de Trauma",
    description: "Tratamiento especializado en trauma y PTSD",
    defaultPriceCents: 120000, // $1,200 COP
    currency: "COP",
    category: "Especializada",
  },
  {
    id: "eating_disorders",
    name: "Trastornos Alimentarios",
    description: "Tratamiento de anorexia, bulimia y otros trastornos alimentarios",
    defaultPriceCents: 110000, // $1,100 COP
    currency: "COP",
    category: "Especializada",
  },
];

export function getSpecialtyById(id: string): Specialty | undefined {
  return DEFAULT_SPECIALTIES.find((specialty) => specialty.id === id);
}

export function getSpecialtiesByCategory(): Record<string, Specialty[]> {
  return DEFAULT_SPECIALTIES.reduce(
    (acc, specialty) => {
      if (!acc[specialty.category]) {
        acc[specialty.category] = [];
      }
      acc[specialty.category].push(specialty);
      return acc;
    },
    {} as Record<string, Specialty[]>,
  );
}

export function formatPrice(cents: number, currency: string = "COP"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
