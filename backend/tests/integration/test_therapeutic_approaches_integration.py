import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


pytestmark = pytest.mark.integration


class TestTherapeuticApproachesAdminIntegration:
    def _admin_headers(self, client: TestClient, db_session: Session, test_data_factory):
        from app.models.user import User, UserRole

        data = test_data_factory["user"]("admin_approach")
        r = client.post("/api/v1/auth/register/user", json=data)
        assert r.status_code == 201
        user_id = r.json()["user"]["id"]
        user = db_session.query(User).filter(User.id == user_id).first()
        user.role = UserRole.ADMIN
        db_session.commit()
        r = client.post("/api/v1/auth/login", json={"email": data["email"], "password": data["password"]})
        assert r.status_code == 200
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    def test_admin_list_and_pagination(self, client: TestClient, db_session: Session, test_data_factory):
        headers = self._admin_headers(client, db_session, test_data_factory)
        r = client.get("/api/v1/therapeutic-approaches/admin/all?page=1&page_size=5", headers=headers)
        assert r.status_code in [200, 204]
        if r.status_code == 200:
            payload = r.json()
            assert "items" in payload

    def test_admin_get_nonexistent(self, client: TestClient, db_session: Session, test_data_factory):
        headers = self._admin_headers(client, db_session, test_data_factory)
        fake_id = str(uuid.uuid4())
        # delete should 404
        resp = client.delete(f"/api/v1/therapeutic-approaches/{fake_id}", headers=headers)
        assert resp.status_code in [404, 400]

