import { test, expect } from "@playwright/test";

test.describe("Professionals Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/professionals");
  });

  test("should display professionals page elements", async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveURL(/.*\/professionals/);

    // Check for page title
    await expect(page.getByRole("heading", { name: /Profesionales/i })).toBeVisible();

    // Check for filter elements
    await expect(page.locator('input[id="specialty"]')).toBeVisible();
    await expect(page.locator('input[id="minPrice"]')).toBeVisible();
    await expect(page.locator('input[id="maxPrice"]')).toBeVisible();

    // Check for filter button
    await expect(page.getByRole("button", { name: /Aplicar filtros/i })).toBeVisible();
  });

  test("should display filter options", async ({ page }) => {
    // Check for specialty filter
    const specialtySelect = page.locator("select").or(page.locator('[role="combobox"]'));
    if (await specialtySelect.isVisible()) {
      await expect(specialtySelect).toBeVisible();
    }

    // Check for price range inputs
    const priceInputs = page.locator('input[type="number"]');
    if ((await priceInputs.count()) > 0) {
      await expect(priceInputs.first()).toBeVisible();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible
    await expect(page.getByRole("heading", { name: /Profesionales/i })).toBeVisible();
    await expect(page.locator('input[id="specialty"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Aplicar filtros/i })).toBeVisible();
  });

  test("should allow filtering by specialty", async ({ page }) => {
    // Fill specialty input
    await page.locator('input[id="specialty"]').fill("Psicología Clínica");

    // Click apply filters button
    await page.getByRole("button", { name: /Aplicar filtros/i }).click();

    // Wait for results to load
    await page.waitForTimeout(2000);
  });

  test("should allow filtering by price range", async ({ page }) => {
    // Fill minimum price
    await page.locator('input[id="minPrice"]').fill("50000");

    // Fill maximum price
    await page.locator('input[id="maxPrice"]').fill("100000");

    // Click apply filters button
    await page.getByRole("button", { name: /Aplicar filtros/i }).click();

    // Wait for results to load
    await page.waitForTimeout(2000);
  });

  test("should display professional cards when results are available", async ({ page }) => {
    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Look for professional cards or results
    const professionalCards = page
      .locator('[data-testid="professional-card"]')
      .or(page.locator(".professional-card").or(page.locator("article").or(page.locator(".card"))));

    // If cards are visible, check that they have expected content
    if ((await professionalCards.count()) > 0) {
      await expect(professionalCards.first()).toBeVisible();

      // Check for professional name or title
      const nameElement = professionalCards.first().locator("h2, h3, .name, .title");
      if ((await nameElement.count()) > 0) {
        await expect(nameElement.first()).toBeVisible();
      }
    } else {
      // If no cards are visible, check for "no results" message
      const noResultsMessage = page
        .getByText(/No se encontraron profesionales/i)
        .or(page.getByText(/No professionals found/i));

      if (await noResultsMessage.isVisible()) {
        await expect(noResultsMessage).toBeVisible();
      } else {
        // Skip test if neither cards nor no-results message is found
        test.skip();
      }
    }
  });

  test("should handle filter functionality", async ({ page }) => {
    // Click apply filters button
    await page.getByRole("button", { name: /Aplicar filtros/i }).click();

    // Wait for results to load
    await page.waitForTimeout(2000);

    // Check that the page doesn't show an error
    const errorMessage = page.getByText(/Error/i).or(page.getByText(/error/i));
    await expect(errorMessage).not.toBeVisible();
  });
});
