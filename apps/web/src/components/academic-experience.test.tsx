import React from "react";
import { render, screen } from "@testing-library/react";
import { AcademicExperienceSection } from "./academic-experience";
import { AcademicExperience } from "@/lib/profiles";

// Mock the icons
vi.mock("lucide-react", () => ({
  GraduationCap: () => <div data-testid="graduation-cap-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
}));

describe("AcademicExperienceSection", () => {
  const mockExperiences: AcademicExperience[] = [
    {
      institution: "Universidad Nacional de Colombia",
      degree: "Psicología",
      field: "Psicología Clínica",
      startDate: "2015-01-01",
      endDate: "2020-12-31",
      description: "Licenciatura en Psicología con énfasis en clínica",
    },
    {
      institution: "Universidad de los Andes",
      degree: "Especialización en Terapia Cognitivo-Conductual",
      field: "Terapia Cognitivo-Conductual",
      startDate: "2021-01-01",
      endDate: "2022-12-31",
      description: "Especialización en TCC",
    },
  ];

  it("renders academic experience section with experiences", () => {
    render(<AcademicExperienceSection experiences={mockExperiences} />);

    expect(screen.getByText("Formación Académica")).toBeInTheDocument();
    expect(screen.getByText("Psicología")).toBeInTheDocument();
    expect(screen.getByText("Universidad Nacional de Colombia")).toBeInTheDocument();
    expect(screen.getByText("dic de 2014 - dic de 2020")).toBeInTheDocument();
    expect(
      screen.getByText("Licenciatura en Psicología con énfasis en clínica"),
    ).toBeInTheDocument();

    expect(screen.getByText("Especialización en Terapia Cognitivo-Conductual")).toBeInTheDocument();
    expect(screen.getByText("Universidad de los Andes")).toBeInTheDocument();
    expect(screen.getByText("dic de 2020 - dic de 2022")).toBeInTheDocument();
    expect(screen.getByText("Especialización en TCC")).toBeInTheDocument();
  });

  it("renders experience without end year as 'Presente'", () => {
    const ongoingExperience: AcademicExperience[] = [
      {
        institution: "Universidad Javeriana",
        degree: "Maestría en Psicología Clínica",
        field: "Psicología Clínica",
        startDate: "2023-01-01",
        description: "Maestría en curso",
      },
    ];

    render(<AcademicExperienceSection experiences={ongoingExperience} />);

    expect(screen.getByText("dic de 2022 - Presente")).toBeInTheDocument();
  });

  it("renders experience without description", () => {
    const experienceWithoutDescription: AcademicExperience[] = [
      {
        institution: "Universidad Externado",
        degree: "Psicología",
        field: "Psicología",
        startDate: "2010-01-01",
        endDate: "2015-12-31",
      },
    ];

    render(<AcademicExperienceSection experiences={experienceWithoutDescription} />);

    expect(screen.getByText("Psicología")).toBeInTheDocument();
    expect(screen.getByText("Universidad Externado")).toBeInTheDocument();
    expect(screen.getByText("dic de 2009 - dic de 2015")).toBeInTheDocument();
  });

  it("does not render when experiences array is empty", () => {
    const { container } = render(<AcademicExperienceSection experiences={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when experiences is null", () => {
    const { container } = render(<AcademicExperienceSection experiences={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when experiences is undefined", () => {
    const { container } = render(<AcademicExperienceSection experiences={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders multiple experiences in correct order", () => {
    render(<AcademicExperienceSection experiences={mockExperiences} />);

    const degreeElements = screen.getAllByText(
      /^Psicología$|^Especialización en Terapia Cognitivo-Conductual$/,
    );
    expect(degreeElements).toHaveLength(2);
    expect(degreeElements[0]).toHaveTextContent("Psicología");
    expect(degreeElements[1]).toHaveTextContent("Especialización en Terapia Cognitivo-Conductual");
  });

  it("renders with proper accessibility attributes", () => {
    render(<AcademicExperienceSection experiences={mockExperiences} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Formación Académica");

    // Check that cards are properly structured
    const cards = screen.getAllByTestId("academic-experience-card");
    expect(cards).toHaveLength(2);
  });
});
