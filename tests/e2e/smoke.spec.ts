import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Production
 * 
 * Estos tests verifican que la aplicación está funcionando básicamente
 * en producción. Son rápidos y no hacen cambios en la base de datos.
 */

test.describe('Smoke Tests', () => {
  
  test('smoke: Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/Miamente/);
    
    // Verificar elementos críticos
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('smoke: Health check endpoint responds', async ({ page }) => {
    // Hacer una llamada directa al health check del backend
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
  });

  test('smoke: Login page loads', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('smoke: API connection works', async ({ page }) => {
    // Verificar que el frontend puede conectarse al backend
    const response = await page.request.get('/api/v1/specialties');
    
    // No importa si devuelve datos o no, solo que responda
    expect([200, 404, 401]).toContain(response.status());
  });

  test('critical: Registration page loads', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('critical: Navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Test que los links principales funcionan
    const aboutLink = page.locator('a[href*="about"], a[href*="acerca"]');
    if (await aboutLink.count() > 0) {
      await aboutLink.first().click();
      await expect(page.url()).toContain('about');
    }
  });

  test('smoke: CSS and assets load', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que no hay errores 404 en recursos
    const responses: any[] = [];
    page.on('response', response => responses.push(response));
    
    await page.waitForLoadState('networkidle');
    
    // No debería haber muchos 404s
    const failedRequests = responses.filter(r => r.status() >= 400);
    expect(failedRequests.length).toBeLessThan(3);
  });

});

test.describe('Critical Path Tests', () => {
  
  test('critical: User can reach professional search', async ({ page }) => {
    await page.goto('/');
    
    // Intentar llegar a la búsqueda de profesionales
    const searchLink = page.locator('a[href*="professional"], a[href*="search"], button:has-text("Buscar")');
    
    if (await searchLink.count() > 0) {
      await searchLink.first().click();
      
      // Verificar que llegamos a alguna página de búsqueda
      await expect(page.url()).toMatch(/(professional|search|buscar)/i);
    }
  });

  test('critical: Admin panel loads (if accessible)', async ({ page }) => {
    await page.goto('/admin');
    
    // Puede redirigir a login o mostrar panel
    await expect(page.url()).toMatch(/(admin|login)/);
  });

});
