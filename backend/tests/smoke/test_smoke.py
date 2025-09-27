import os
from selenium.webdriver.common.by import By
from selenium import webdriver
import pytest

"""Smoke tests for the Miamente frontend application.

This module contains a smoke test to verify the basic loading and key elements
of the Miamente landing page using Selenium and pytest.
"""


@pytest.fixture
def browser():
    """Fixture to set up the Chrome browser for Selenium tests.

    The browser runs in headless mode with necessary arguments for CI/CD environments.
    It yields a WebDriver instance and ensures it's quit after the test.
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()


def test_smoke_test(browser):
    """Verifica la carga básica y los elementos clave de la página de aterrizaje.

    Este test navega a la URL de la aplicación (página de aterrizaje) y verifica:
    1. Que el título de la página contenga "Miamente".
    2. Que el elemento `<h1>` contenga el texto "Cuidamos tu bienestar mental".
    3. Que el botón "Crear cuenta gratis" sea visible.
    """
    app_url = os.environ.get("APP_BASE_URL", "http://localhost:3000")
    print(f"Smoke test ejecutándose contra: {app_url}/landing")
    try:
        browser.get(app_url + "/landing")
        print(f"Título de la página: {browser.title}")
        assert "Miamente" in browser.title

        h1_element = browser.find_element(By.TAG_NAME, "h1")
        print(f"Texto H1: {h1_element.text}")
        assert "Cuidamos tu bienestar mental" in h1_element.text

        create_account_button = browser.find_element(By.XPATH, "//a[./button[contains(., 'Crear cuenta gratis')]]")
        print(f"Botón 'Crear cuenta gratis' encontrado: {create_account_button.text}")
        assert create_account_button.is_displayed()

        print("Smoke test pasado exitosamente.")
    except Exception as e:
        print(f"Smoke test falló: {e}")
        raise
