import React from "react";
import { render, screen } from "@testing-library/react";
import { WorkExperienceSection } from "./work-experience";
import { WorkExperience } from "@/lib/profiles";

// Mock the icons
vi.mock("lucide-react", () => ({
  Briefcase: () => <div data-testid="briefcase-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Award: () => <div data-testid="award-icon" />,
}));

describe("WorkExperienceSection", () => {
  const mockExperiences: WorkExperience[] = [
    {
      company: "Centro de Salud Mental ABC",
      position: "Psicóloga Clínica",
      start_date: "2020-01-01",
      end_date: "2022-12-31",
      description: "Atención psicológica individual y grupal",
      achievements: ["Implementé programa de terapia grupal", "Reduje tiempo de espera en 30%"],
    },
    {
      company: "Consultorio Privado",
      position: "Psicóloga Independiente",
      start_date: "2023-01-01",
      description: "Práctica privada especializada en terapia cognitivo-conductual",
      achievements: ["Atendí más de 200 pacientes", "Desarrollé protocolo de evaluación"],
    },
  ];

  it("renders work experience section with experiences", () => {
    render(<WorkExperienceSection experiences={mockExperiences} />);

    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    expect(screen.getByText("Psicóloga Clínica")).toBeInTheDocument();
    expect(screen.getByText("Centro de Salud Mental ABC")).toBeInTheDocument();
    expect(screen.getByText("Atención psicológica individual y grupal")).toBeInTheDocument();
    expect(screen.getAllByText("Logros destacados:")).toHaveLength(2);
    expect(screen.getByText("Implementé programa de terapia grupal")).toBeInTheDocument();
    expect(screen.getByText("Reduje tiempo de espera en 30%")).toBeInTheDocument();

    expect(screen.getByText("Psicóloga Independiente")).toBeInTheDocument();
    expect(screen.getByText("Consultorio Privado")).toBeInTheDocument();
    expect(
      screen.getByText("Práctica privada especializada en terapia cognitivo-conductual"),
    ).toBeInTheDocument();
    expect(screen.getByText("Atendí más de 200 pacientes")).toBeInTheDocument();
    expect(screen.getByText("Desarrollé protocolo de evaluación")).toBeInTheDocument();
  });

  it("renders experience without end date as 'Presente'", () => {
    const ongoingExperience: WorkExperience[] = [
      {
        company: "Hospital San Rafael",
        position: "Psicóloga Senior",
        start_date: "2023-06-01",
        description: "Trabajo actual",
      },
    ];

    render(<WorkExperienceSection experiences={ongoingExperience} />);

    expect(screen.getByText("may de 2023 - Presente")).toBeInTheDocument();
  });

  it("renders experience without description", () => {
    const experienceWithoutDescription: WorkExperience[] = [
      {
        company: "Clínica XYZ",
        position: "Psicóloga",
        start_date: "2018-01-01",
        end_date: "2020-12-31",
      },
    ];

    render(<WorkExperienceSection experiences={experienceWithoutDescription} />);

    expect(screen.getByText("Psicóloga")).toBeInTheDocument();
    expect(screen.getByText("Clínica XYZ")).toBeInTheDocument();
    expect(screen.getByText("dic de 2017 - dic de 2020")).toBeInTheDocument();
  });

  it("renders experience without achievements", () => {
    const experienceWithoutAchievements: WorkExperience[] = [
      {
        company: "Centro de Salud",
        position: "Psicóloga",
        start_date: "2020-01-01",
        end_date: "2021-12-31",
        description: "Trabajo en centro de salud",
      },
    ];

    render(<WorkExperienceSection experiences={experienceWithoutAchievements} />);

    expect(screen.getByText("Psicóloga")).toBeInTheDocument();
    expect(screen.getByText("Centro de Salud")).toBeInTheDocument();
    expect(screen.getByText("Trabajo en centro de salud")).toBeInTheDocument();
    expect(screen.queryByText("Logros destacados:")).not.toBeInTheDocument();
  });

  it("does not render when experiences array is empty", () => {
    const { container } = render(<WorkExperienceSection experiences={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when experiences is null", () => {
    const { container } = render(<WorkExperienceSection experiences={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not render when experiences is undefined", () => {
    const { container } = render(<WorkExperienceSection experiences={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders multiple experiences in correct order", () => {
    render(<WorkExperienceSection experiences={mockExperiences} />);

    const positionElements = screen.getAllByText(/Psicóloga/);
    expect(positionElements).toHaveLength(2);
    expect(positionElements[0]).toHaveTextContent("Psicóloga Clínica");
    expect(positionElements[1]).toHaveTextContent("Psicóloga Independiente");
  });

  it("formats dates correctly", () => {
    const experienceWithDates: WorkExperience[] = [
      {
        company: "Test Company",
        position: "Test Position",
        start_date: "2020-03-15",
        end_date: "2022-11-30",
        description: "Test description",
      },
    ];

    render(<WorkExperienceSection experiences={experienceWithDates} />);

    expect(screen.getByText("mar de 2020 - nov de 2022")).toBeInTheDocument();
  });

  it("renders with proper accessibility attributes", () => {
    render(<WorkExperienceSection experiences={mockExperiences} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Experiencia Laboral");

    // Check that cards are properly structured
    const cards = screen.getAllByTestId("work-experience-card");
    expect(cards).toHaveLength(2);
  });

  it("renders achievements as list items", () => {
    render(<WorkExperienceSection experiences={mockExperiences} />);

    const achievementLists = screen.getAllByRole("list");
    expect(achievementLists).toHaveLength(2);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(4); // 2 achievements per experience
  });
});
