import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/landing");
  });

  test("should display the main hero section", async ({ page }) => {
    // Check main heading
    await expect(
      page.getByRole("heading", { name: /Cuidamos tu bienestar mental/i }),
    ).toBeVisible();

    // Check subtitle
    await expect(
      page.getByText(/Conecta con profesionales de la salud mental certificados/i),
    ).toBeVisible();

    // Check CTA buttons (use first() to avoid strict mode violations)
    await expect(page.getByRole("link", { name: /Crear cuenta gratis/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver profesionales/i }).first()).toBeVisible();
  });

  test("should display value proposition section", async ({ page }) => {
    // Check section heading
    await expect(page.getByRole("heading", { name: /¿Por qué elegir Miamente?/i })).toBeVisible();

    // Check value proposition cards (use more specific selectors)
    await expect(
      page.locator("h3").filter({ hasText: /Profesionales Certificados/i }),
    ).toBeVisible();
    await expect(
      page.locator("h3").filter({ hasText: /100% Seguro y Confidencial/i }),
    ).toBeVisible();
    await expect(page.locator("h3").filter({ hasText: /Acceso Inmediato/i })).toBeVisible();
  });

  test("should display how it works section", async ({ page }) => {
    // Check section heading (use more specific selector to avoid FAQ conflict)
    await expect(page.locator("h2").filter({ hasText: /¿Cómo funciona?/i })).toBeVisible();

    // Check steps
    await expect(page.getByText(/Crea tu cuenta/i)).toBeVisible();
    await expect(page.getByText(/Encuentra tu profesional/i)).toBeVisible();
    await expect(page.getByText(/Reserva y conéctate/i)).toBeVisible();
  });

  test("should display statistics section", async ({ page }) => {
    // Check statistics
    await expect(page.getByText(/500\+/)).toBeVisible();
    await expect(page.getByText(/10,000\+/)).toBeVisible();
    await expect(page.getByText(/4\.8\/5/)).toBeVisible();
    await expect(page.getByText(/24\/7/)).toBeVisible();
  });

  test("should display FAQ section", async ({ page }) => {
    // Check FAQ heading
    await expect(page.getByRole("heading", { name: /Preguntas Frecuentes/i })).toBeVisible();

    // Check FAQ questions
    await expect(page.getByText(/¿Cómo funciona Miamente?/i)).toBeVisible();
    await expect(page.getByText(/¿Los profesionales están certificados?/i)).toBeVisible();
    await expect(page.getByText(/¿Es seguro y confidencial?/i)).toBeVisible();
  });

  test("should expand FAQ items when clicked", async ({ page }) => {
    // Click on first FAQ
    await page.getByRole("button", { name: /¿Cómo funciona Miamente?/i }).click();

    // Check that answer is visible
    await expect(
      page.getByText(
        /Miamente conecta usuarios con profesionales de la salud mental certificados/i,
      ),
    ).toBeVisible();

    // Click on second FAQ
    await page.getByRole("button", { name: /¿Los profesionales están certificados?/i }).click();

    // Check that answer is visible
    await expect(
      page.getByText(/Sí, todos nuestros profesionales están debidamente certificados/i),
    ).toBeVisible();
  });

  test("should display final CTA section", async ({ page }) => {
    // Check CTA heading
    await expect(
      page.getByRole("heading", { name: /¿Listo para comenzar tu bienestar mental?/i }),
    ).toBeVisible();

    // Check CTA buttons (use nth(1) for the second set of buttons)
    await expect(page.getByRole("link", { name: /Crear cuenta gratis/i }).nth(1)).toBeVisible();
    await expect(page.getByRole("link", { name: /Explorar profesionales/i })).toBeVisible();
  });

  test("should navigate to register page when clicking register button", async ({ page }) => {
    // Click register button in hero section
    await page
      .getByRole("link", { name: /Crear cuenta gratis/i })
      .first()
      .click();

    // Wait for navigation and check that we're on register page
    await page.waitForURL(/.*\/register/);
    await expect(page).toHaveURL(/.*\/register/);
  });

  test("should navigate to professionals page when clicking browse button", async ({ page }) => {
    // Click browse professionals button in hero section
    await page
      .getByRole("link", { name: /Ver profesionales/i })
      .first()
      .click();

    // Wait for navigation and check that we're on professionals page
    await page.waitForURL(/.*\/professionals/);
    await expect(page).toHaveURL(/.*\/professionals/);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    await expect(
      page.getByRole("heading", { name: /Cuidamos tu bienestar mental/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Crear cuenta gratis/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Ver profesionales/i }).first()).toBeVisible();
  });

  test("should support dark mode toggle", async ({ page }) => {
    // Check if theme toggle button exists (if implemented)
    const themeToggle = page
      .locator('[data-testid="theme-toggle"]')
      .or(page.locator('button[aria-label*="theme"]'));

    if (await themeToggle.isVisible()) {
      // Click theme toggle
      await themeToggle.click();

      // Check that page still displays correctly in dark mode
      await expect(
        page.getByRole("heading", { name: /Cuidamos tu bienestar mental/i }),
      ).toBeVisible();
    } else {
      // Skip test if theme toggle is not implemented
      test.skip();
    }
  });
});
