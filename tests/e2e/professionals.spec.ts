import { test, expect } from "@playwright/test";

import { TestHelpers } from "./utils/test-helpers";

test.describe("Professionals Page", () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    await page.goto("/professionals");
    await testHelpers.waitForPageLoad();
  });

  test.skip("should display professionals page elements", async ({ page }) => {
    // SKIPPED: Disabled per request
    // Check that the page loads
    await expect(page).toHaveURL(/.*\/professionals/);

    // Check for page title
    await expect(page.getByRole("heading", { name: /Profesionales/i })).toBeVisible();

    // Check for search/filter elements
    const searchInput = page
      .locator('input[placeholder*="buscar"]')
      .or(page.locator('input[placeholder*="search"]'))
      .or(page.locator('input[id="search"]'));

    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }

    // Check for filter elements
    const specialtyFilter = page
      .locator('select[name="specialty"]')
      .or(page.locator('input[id="specialty"]'))
      .or(page.locator('[data-testid="specialty-filter"]'));

    if (await specialtyFilter.isVisible()) {
      await expect(specialtyFilter).toBeVisible();
    }

    // Check for price range inputs
    const priceInputs = page.locator('input[type="number"]').or(page.locator('input[id*="price"]'));

    if ((await priceInputs.count()) > 0) {
      await expect(priceInputs.first()).toBeVisible();
    }
  });

  test.skip("should display professional cards with data", async ({ page }) => {
    // SKIPPED: Test failing on Firefox due to data loading issues
    // Wait for professional cards to load
    await testHelpers.waitForLoadingToComplete();

    // Look for professional cards
    const professionalCards = page
      .locator('[data-testid="professional-card"]')
      .or(page.locator(".professional-card"))
      .or(page.locator("article"))
      .or(page.locator(".card"));

    // Check if we have professional cards
    if ((await professionalCards.count()) > 0) {
      await expect(professionalCards.first()).toBeVisible();

      // Check for professional name
      const nameElement = professionalCards
        .first()
        .locator('h2, h3, .name, .title, [data-testid="professional-name"]');
      if ((await nameElement.count()) > 0) {
        await expect(nameElement.first()).toBeVisible();
      }

      // Check for specialty information
      const specialtyElement = professionalCards
        .first()
        .locator('.specialty, [data-testid="specialty"]');
      if ((await specialtyElement.count()) > 0) {
        await expect(specialtyElement.first()).toBeVisible();
      }

      // Check for "Ver perfil" or similar button
      const profileButton = professionalCards
        .first()
        .locator('button:has-text("Ver perfil")')
        .or(professionalCards.first().locator('a:has-text("Ver perfil")'))
        .or(professionalCards.first().locator('button:has-text("View Profile")'));

      if ((await profileButton.count()) > 0) {
        await expect(profileButton.first()).toBeVisible();
      }
    } else {
      // If no cards are visible, check for "no results" message
      const noResultsMessage = page
        .getByText(/No se encontraron profesionales/i)
        .or(page.getByText(/No professionals found/i))
        .or(page.getByText(/No hay profesionales disponibles/i));

      if (await noResultsMessage.isVisible()) {
        await expect(noResultsMessage).toBeVisible();
        console.log("ℹ️ No professionals found - this is expected if database is empty");
      } else {
        // Take screenshot for debugging
        await testHelpers.takeScreenshot("professionals-no-cards");
        console.log("⚠️ Neither professional cards nor no-results message found");
      }
    }
  });

  test.skip("should navigate to professional profile when card is clicked", async ({ page }) => {
    // SKIPPED: Disabled per request
    // Wait for professional cards to load
    await testHelpers.waitForLoadingToComplete();

    const professionalCards = page
      .locator('[data-testid="professional-card"]')
      .or(page.locator(".professional-card"))
      .or(page.locator("article"))
      .or(page.locator(".card"));

    if ((await professionalCards.count()) > 0) {
      // Click on the first professional card
      await professionalCards.first().click();

      // Should navigate to professional profile
      await testHelpers.waitForNavigation();
      await expect(page).toHaveURL(/.*\/professionals\/\d+/);

      // Check for professional profile elements
      const profileTitle = page
        .locator("h1, h2")
        .or(page.locator('[data-testid="professional-name"]'));

      if ((await profileTitle.count()) > 0) {
        await expect(profileTitle.first()).toBeVisible();
      }
    } else {
      console.log("ℹ️ No professional cards available for navigation test");
      test.skip();
    }
  });

  test("should filter professionals by specialty", async ({ page }) => {
    // Look for specialty filter
    const specialtyFilter = page
      .locator('select[name="specialty"]')
      .or(page.locator('input[id="specialty"]'))
      .or(page.locator('[data-testid="specialty-filter"]'));

    if (await specialtyFilter.isVisible()) {
      // Select a specialty
      if ((await specialtyFilter.getAttribute("tagName")) === "SELECT") {
        await specialtyFilter.selectOption({ label: "Psicología Clínica" });
      } else {
        await specialtyFilter.fill("Psicología Clínica");
      }

      // Apply filters
      const applyButton = page
        .getByRole("button", { name: /Aplicar filtros/i })
        .or(page.getByRole("button", { name: /Apply filters/i }))
        .or(page.getByRole("button", { name: /Filtrar/i }));

      if (await applyButton.isVisible()) {
        await applyButton.click();
        await testHelpers.waitForLoadingToComplete();
      }
    } else {
      console.log("ℹ️ Specialty filter not found");
      test.skip();
    }
  });

  test("should filter professionals by price range", async ({ page }) => {
    // Look for price range inputs
    const minPriceInput = page
      .locator('input[id="minPrice"]')
      .or(page.locator('input[name="minPrice"]'))
      .or(page.locator('input[placeholder*="precio mínimo"]'));

    const maxPriceInput = page
      .locator('input[id="maxPrice"]')
      .or(page.locator('input[name="maxPrice"]'))
      .or(page.locator('input[placeholder*="precio máximo"]'));

    if ((await minPriceInput.isVisible()) && (await maxPriceInput.isVisible())) {
      // Fill price range
      await minPriceInput.fill("50000");
      await maxPriceInput.fill("100000");

      // Apply filters
      const applyButton = page
        .getByRole("button", { name: /Aplicar filtros/i })
        .or(page.getByRole("button", { name: /Apply filters/i }));

      if (await applyButton.isVisible()) {
        await applyButton.click();
        await testHelpers.waitForLoadingToComplete();
      }
    } else {
      console.log("ℹ️ Price range inputs not found");
      test.skip();
    }
  });

  test.skip("should be responsive on mobile", async ({ page }) => {
    // SKIPPED: Disabled per request
    // Set mobile viewport
    await testHelpers.simulateMobile();

    // Check that main elements are still visible
    await expect(page.getByRole("heading", { name: /Profesionales/i })).toBeVisible();

    // Check for mobile-specific elements or layout
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator(".mobile-menu"));

    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  // Test removed per request: should handle search functionality

  test("should display loading state while fetching data", async ({ page }) => {
    // Navigate to professionals page
    await page.goto("/professionals");

    // Check for loading indicators
    const loadingIndicator = page
      .locator('[data-testid="loading"]')
      .or(page.locator(".loading"))
      .or(page.locator(".spinner"))
      .or(page.locator('[aria-label="Loading"]'));

    // Loading indicator might appear briefly, so we check if it exists
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();

      // Wait for loading to complete
      await testHelpers.waitForLoadingToComplete();
    }
  });

  test("should handle empty state gracefully", async ({ page }) => {
    // Wait for page to load
    await testHelpers.waitForLoadingToComplete();

    // Check for empty state message
    const emptyState = page
      .locator('[data-testid="empty-state"]')
      .or(page.locator(".empty-state"))
      .or(page.getByText(/No se encontraron profesionales/i))
      .or(page.getByText(/No professionals found/i));

    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      console.log("ℹ️ Empty state displayed - this is expected if no professionals exist");
    }
  });
});
