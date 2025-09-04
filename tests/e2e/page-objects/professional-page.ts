import { Page, Locator, expect } from "@playwright/test";

export class ProfessionalPage {
  readonly page: Page;
  readonly profileForm: Locator;
  readonly fullNameInput: Locator;
  readonly phoneInput: Locator;
  readonly specialtySelect: Locator;
  readonly rateInput: Locator;
  readonly bioTextarea: Locator;
  readonly submitButton: Locator;
  readonly availabilityButton: Locator;
  readonly createSlotButton: Locator;
  readonly slotDateInput: Locator;
  readonly slotTimeInput: Locator;
  readonly slotDurationSelect: Locator;

  constructor(page: Page) {
    this.page = page;

    // Profile form elements
    this.profileForm = page.locator("form");
    this.fullNameInput = page.locator('input[name="fullName"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.specialtySelect = page.locator('select[name="specialty"]');
    this.rateInput = page.locator('input[name="rateCents"]');
    this.bioTextarea = page.locator('textarea[name="bio"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Availability elements
    this.availabilityButton = page.locator('button:has-text("Disponibilidad")');
    this.createSlotButton = page.locator('button:has-text("Crear Horario")');
    this.slotDateInput = page.locator('input[type="date"]');
    this.slotTimeInput = page.locator('input[type="time"]');
    this.slotDurationSelect = page.locator('select[name="duration"]');
  }

  async gotoProfile(): Promise<void> {
    await this.page.goto("/profile/professional");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoAvailability(): Promise<void> {
    await this.page.goto("/dashboard/pro/availability");
    await this.page.waitForLoadState("networkidle");
  }

  async fillProfessionalProfile(profileData: {
    fullName: string;
    phone: string;
    specialty: string;
    rateCents: number;
    bio: string;
  }): Promise<void> {
    await this.fullNameInput.fill(profileData.fullName);
    await this.phoneInput.fill(profileData.phone);
    await this.specialtySelect.selectOption(profileData.specialty);
    await this.rateInput.fill(profileData.rateCents.toString());
    await this.bioTextarea.fill(profileData.bio);
  }

  async submitProfile(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async createAvailabilitySlot(slotData: {
    date: string;
    time: string;
    duration: number;
  }): Promise<void> {
    await this.slotDateInput.fill(slotData.date);
    await this.slotTimeInput.fill(slotData.time);
    await this.slotDurationSelect.selectOption(slotData.duration.toString());
    await this.createSlotButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectProfileSaved(): Promise<void> {
    await expect(this.page.locator("text=Perfil actualizado exitosamente")).toBeVisible();
  }

  async expectSlotCreated(): Promise<void> {
    await expect(this.page.locator("text=Horario creado exitosamente")).toBeVisible();
  }

  async expectValidationError(field: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="${field}-error"], #${field}-error`);
    await expect(fieldError).toBeVisible();
  }
}
