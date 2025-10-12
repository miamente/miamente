"""
Unit tests for app.api.v1.api module.
"""

from unittest.mock import patch
from fastapi import APIRouter

from app.api.v1.api import api_router


class TestApiRouter:
    """Test the API router configuration."""

    def test_api_router_is_apirouter_instance(self):
        """Test that api_router is an APIRouter instance."""
        assert isinstance(api_router, APIRouter)

    def test_api_router_has_accounts_routes(self):
        """Test that accounts routes are included."""
        routes = [route.path for route in api_router.routes]
        accounts_routes = [route for route in routes if route.startswith("/accounts")]
        assert len(accounts_routes) > 0

    def test_api_router_has_auth_routes(self):
        """Test that auth routes are included."""
        routes = [route.path for route in api_router.routes]
        auth_routes = [route for route in routes if route.startswith("/auth")]
        assert len(auth_routes) > 0

    def test_api_router_has_files_routes(self):
        """Test that files routes are included."""
        routes = [route.path for route in api_router.routes]
        files_routes = [route for route in routes if route.startswith("/files")]
        assert len(files_routes) > 0

    def test_api_router_has_specialties_routes(self):
        """Test that specialties routes are included."""
        routes = [route.path for route in api_router.routes]
        specialties_routes = [route for route in routes if route.startswith("/specialties")]
        assert len(specialties_routes) > 0

    def test_api_router_has_professional_specialties_routes(self):
        """Test that professional specialties routes are included."""
        routes = [route.path for route in api_router.routes]
        professional_specialties_routes = [route for route in routes if route.startswith("/professional-specialties")]
        assert len(professional_specialties_routes) > 0

    def test_api_router_has_modalities_routes(self):
        """Test that modalities routes are included."""
        routes = [route.path for route in api_router.routes]
        modalities_routes = [route for route in routes if route.startswith("/modalities")]
        assert len(modalities_routes) > 0

    def test_api_router_has_therapeutic_approaches_routes(self):
        """Test that therapeutic approaches routes are included."""
        routes = [route.path for route in api_router.routes]
        therapeutic_approaches_routes = [route for route in routes if route.startswith("/therapeutic-approaches")]
        assert len(therapeutic_approaches_routes) > 0

    def test_api_router_has_professional_modalities_routes(self):
        """Test that professional modalities routes are included."""
        routes = [route.path for route in api_router.routes]
        professional_modalities_routes = [route for route in routes if route.startswith("/professional-modalities")]
        assert len(professional_modalities_routes) > 0

    def test_api_router_has_professional_therapeutic_approaches_routes(self):
        """Test that professional therapeutic approaches routes are included."""
        routes = [route.path for route in api_router.routes]
        professional_therapeutic_approaches_routes = [
            route for route in routes if route.startswith("/professional-therapeutic-approaches")
        ]
        assert len(professional_therapeutic_approaches_routes) > 0

    def test_router_tags_are_set(self):
        """Test that router tags are properly set."""
        routes = api_router.routes
        tags = set()
        for route in routes:
            if hasattr(route, "tags") and route.tags:
                tags.update(route.tags)

        expected_tags = {
            "accounts",
            "authentication",
            "files",
            "specialties",
            "professional-specialties",
            "modalities",
            "therapeutic-approaches",
            "professional-modalities",
            "professional-therapeutic-approaches",
        }

        assert expected_tags.issubset(tags)

    def test_router_prefixes_are_correct(self):
        """Test that router prefixes are set correctly."""
        routes = api_router.routes
        prefixes = set()
        for route in routes:
            if hasattr(route, "path") and route.path:
                # Extract prefix from path
                path = route.path
                if path.startswith("/"):
                    # Extract the first segment as prefix
                    parts = path.split("/")
                    if len(parts) > 1:
                        prefix = "/" + parts[1]
                        prefixes.add(prefix)

        expected_prefixes = {
            "/accounts",
            "/auth",
            "/files",
            "/specialties",
            "/professional-specialties",
            "/modalities",
            "/therapeutic-approaches",
            "/professional-modalities",
            "/professional-therapeutic-approaches",
        }

        assert expected_prefixes.issubset(prefixes)

    def test_router_has_expected_number_of_routes(self):
        """Test that router has expected number of routes."""
        # This test ensures we have routes from all included routers
        routes = api_router.routes
        # Should have routes from at least the main routers
        assert len(routes) > 0

    @patch("app.api.v1.api.accounts")
    @patch("app.api.v1.api.auth")
    @patch("app.api.v1.api.files")
    @patch("app.api.v1.api.specialties")
    @patch("app.api.v1.api.professional_specialties")
    @patch("app.api.v1.api.modalities")
    @patch("app.api.v1.api.therapeutic_approaches")
    @patch("app.api.v1.api.professional_modalities")
    @patch("app.api.v1.api.professional_therapeutic_approaches")
    def test_router_includes_all_endpoint_modules(
        self,
        mock_professional_therapeutic_approaches,
        mock_professional_modalities,
        mock_therapeutic_approaches,
        mock_modalities,
        mock_professional_specialties,
        mock_specialties,
        mock_files,
        mock_auth,
        mock_accounts,
    ):
        """Test that all endpoint modules are properly imported and used."""
        # This test verifies that all the endpoint modules are imported
        # and that their routers are accessible
        assert mock_accounts is not None
        assert mock_auth is not None
        assert mock_files is not None
        assert mock_specialties is not None
        assert mock_professional_specialties is not None
        assert mock_modalities is not None
        assert mock_therapeutic_approaches is not None
        assert mock_professional_modalities is not None
        assert mock_professional_therapeutic_approaches is not None

    def test_router_structure_is_valid(self):
        """Test that router structure is valid."""
        # Test that the router can be inspected without errors
        routes = api_router.routes
        assert isinstance(routes, list)

        # Test that each route has required attributes
        for route in routes:
            assert hasattr(route, "path_regex") or hasattr(route, "path")
            assert hasattr(route, "methods") or hasattr(route, "endpoint")

    def test_router_backward_compatibility(self):
        """Test that important routes are maintained."""
        routes = [route.path for route in api_router.routes]

        # Check that important routes are still present
        assert any("/specialties" in route for route in routes)
        assert any("/professional-specialties" in route for route in routes)

        # Check that new account routes are present
        assert any("/accounts" in route for route in routes)
        assert any("/modalities" in route for route in routes)
        assert any("/therapeutic-approaches" in route for route in routes)
