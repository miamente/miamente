import { Page, Locator, expect } from "@playwright/test";

export class AdminPage {
  readonly page: Page;
  readonly dashboard: Locator;
  readonly metricsCards: Locator;
  readonly professionalsTable: Locator;
  readonly verifyButton: Locator;
  readonly appointmentsTable: Locator;
  readonly paymentsTable: Locator;
  readonly featureFlagsSection: Locator;
  readonly toggleFlagButton: Locator;
  readonly analyticsChart: Locator;
  readonly conversionFunnel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard elements
    this.dashboard = page.locator('[data-testid="admin-dashboard"]');
    this.metricsCards = page.locator('[data-testid="metrics-card"]');
    this.analyticsChart = page.locator('[data-testid="appointment-chart"]');
    this.conversionFunnel = page.locator('[data-testid="conversion-funnel"]');

    // Professionals management
    this.professionalsTable = page.locator('[data-testid="professionals-table"]');
    this.verifyButton = page.locator('button:has-text("Verificar")').first();

    // Appointments and payments
    this.appointmentsTable = page.locator('[data-testid="appointments-table"]');
    this.paymentsTable = page.locator('[data-testid="payments-table"]');

    // Feature flags
    this.featureFlagsSection = page.locator('[data-testid="feature-flags"]');
    this.toggleFlagButton = page.locator('button:has-text("Toggle")').first();
  }

  async gotoDashboard(): Promise<void> {
    await this.page.goto("/admin");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoProfessionals(): Promise<void> {
    await this.page.goto("/admin/professionals");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoAppointments(): Promise<void> {
    await this.page.goto("/admin/appointments");
    await this.page.waitForLoadState("networkidle");
  }

  async gotoPayments(): Promise<void> {
    await this.page.goto("/admin/payments");
    await this.page.waitForLoadState("networkidle");
  }

  async verifyProfessional(): Promise<void> {
    await this.verifyButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async toggleFeatureFlag(): Promise<void> {
    await this.toggleFlagButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectDashboardLoaded(): Promise<void> {
    await expect(this.dashboard).toBeVisible();
    await expect(this.metricsCards).toHaveCount(4); // Expected number of metrics cards
  }

  async expectMetricsVisible(): Promise<void> {
    await expect(this.metricsCards.first()).toBeVisible();
    await expect(this.analyticsChart).toBeVisible();
    await expect(this.conversionFunnel).toBeVisible();
  }

  async expectProfessionalVerified(): Promise<void> {
    await expect(this.page.locator("text=Profesional verificado exitosamente")).toBeVisible();
  }

  async expectFeatureFlagToggled(): Promise<void> {
    await expect(this.page.locator("text=Feature flag actualizado")).toBeVisible();
  }

  async expectTableLoaded(tableType: "professionals" | "appointments" | "payments"): Promise<void> {
    const table =
      tableType === "professionals"
        ? this.professionalsTable
        : tableType === "appointments"
          ? this.appointmentsTable
          : this.paymentsTable;

    await expect(table).toBeVisible();
    await expect(table.locator("tbody tr")).toHaveCount.greaterThan(0);
  }

  async expectValidationError(field: string): Promise<void> {
    const fieldError = this.page.locator(`[data-testid="${field}-error"], #${field}-error`);
    await expect(fieldError).toBeVisible();
  }
}
