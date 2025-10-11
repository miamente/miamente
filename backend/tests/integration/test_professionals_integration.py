import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


pytestmark = pytest.mark.integration


class TestProfessionalsAdminIntegration:
    def _create_admin_headers(self, client: TestClient, db_session: Session, test_data_factory):
        from app.models.user import User, UserRole

        user_data = test_data_factory["user"]("admin_prof")
        r = client.post("/api/v1/auth/register/user", json=user_data)
        assert r.status_code == 201
        user_id = r.json()["user"]["id"]
        user = db_session.query(User).filter(User.id == user_id).first()
        user.role = UserRole.ADMIN
        db_session.commit()
        r = client.post("/api/v1/auth/login", json={"email": user_data["email"], "password": user_data["password"]})
        assert r.status_code == 200
        token = r.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_admin_list_pagination_and_search(self, client: TestClient, db_session: Session, test_data_factory):
        headers = self._create_admin_headers(client, db_session, test_data_factory)
        # call list endpoint (exists in professionals admin)
        r = client.get("/api/v1/professionals/admin/all?page=1&page_size=5&search=test", headers=headers)
        assert r.status_code in [200, 204]
        if r.status_code == 200:
            data = r.json()
            assert "items" in data and "total" in data and "page" in data

    def test_admin_toggle_and_delete_guards(self, client: TestClient, db_session: Session, test_data_factory):
        headers = self._create_admin_headers(client, db_session, test_data_factory)
        # non-existing professional operations should be handled
        fake_id = str(uuid.uuid4())
        # delete
        resp = client.delete(f"/api/v1/professionals/{fake_id}", headers=headers)
        assert resp.status_code in [404, 400]

