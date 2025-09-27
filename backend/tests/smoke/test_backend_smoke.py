"""Backend smoke tests for the Miamente API.

This module contains smoke tests to verify the basic functionality and availability
of the Miamente backend API endpoints. These tests are designed to run against
deployed environments (staging/production) to ensure the API is responding correctly.

The tests verify:
- API health endpoint is accessible and returns 200
- OpenAPI documentation endpoint is accessible
- Backend service is properly deployed and responding

These tests are lightweight and designed to run quickly in CI/CD pipelines
to catch basic deployment or configuration issues.
"""

import os
import time
import requests
import pytest


def wait_for_healthy(base_url: str, timeout_seconds: int = 120) -> None:
    """Wait for the backend API to become healthy by polling the /health endpoint.

    This function continuously polls the health endpoint until it returns a successful
    response or the timeout is reached. This is useful for waiting for a newly deployed
    service to become ready before running smoke tests.

    Args:
        base_url: The base URL of the API (e.g., "http://api.example.com")
        timeout_seconds: Maximum time to wait for the service to become healthy

    Raises:
        AssertionError: If the service doesn't become healthy within the timeout period
    """
    deadline = time.time() + timeout_seconds
    health_url = f"{base_url}/health"
    last_error = None
    while time.time() < deadline:
        try:
            resp = requests.get(health_url, timeout=5)
            if resp.ok:
                return
            last_error = f"status={resp.status_code} body={resp.text[:200]}"
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
        time.sleep(5)
    raise AssertionError(f"/health did not become healthy: {last_error}")


@pytest.mark.smoke
def test_backend_smoke_health_and_docs():
    """Test basic backend API functionality and availability.

    This smoke test verifies that the deployed backend API is responding correctly
    by checking essential endpoints. It ensures the service is healthy and accessible
    before considering the deployment successful.

    The test performs the following checks:
    1. Waits for the API to become healthy (polling /health endpoint)
    2. Verifies /health endpoint returns 200 status
    3. Verifies /docs endpoint is accessible (200, 401, or 403 are acceptable)

    Environment Variables:
        APP_BASE_URL: The base URL of the deployed API (set by CI/CD workflow)

    Raises:
        AssertionError: If any of the health checks fail
        requests.RequestException: If network requests fail
    """
    base_url = os.environ.get("APP_BASE_URL")
    assert base_url, "APP_BASE_URL env var must be set by the workflow"

    wait_for_healthy(base_url)

    health = requests.get(f"{base_url}/health", timeout=10)
    assert health.status_code == 200

    docs = requests.get(f"{base_url}/docs", timeout=10)
    assert docs.status_code in (200, 401, 403)
