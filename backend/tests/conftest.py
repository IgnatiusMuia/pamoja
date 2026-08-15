import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET"] = "test-only-secret-key-that-is-long-enough"
os.environ["ADMIN_EMAIL"] = "admin@pamoja.ke"
os.environ["ADMIN_PASSWORD"] = "admin123"

import pytest
from fastapi.testclient import TestClient

TEST_DB = "test.db"


@pytest.fixture(scope="session")
def client():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

    from app.main import app

    with TestClient(app) as c:
        yield c


def _unique(prefix: str) -> str:
    import uuid

    return f"{prefix}-{uuid.uuid4().hex[:8]}@example.com"


def register(client, email=None, password="password123", role="traveler", name="Test User"):
    resp = client.post(
        "/auth/register",
        json={
            "email": email or _unique("trav"),
            "password": password,
            "name": name,
            "role": role,
            "city": "Nairobi",
            "gender": "female",
        },
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


def login(client, email, password="password123"):
    resp = client.post("/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    return {"Authorization": f"Bearer {data['access_token']}"}


def new_traveler(client) -> tuple[dict, dict]:
    data = register(client)
    return data, login(client, data["user"]["email"])


def new_companion_user(client) -> tuple[dict, dict]:
    import uuid

    email = f"comp-{uuid.uuid4().hex[:8]}@example.com"
    name = "Test Companion"
    register(client, email=email, role="companion", name=name)
    return {"email": email}, login(client, email)


def admin_headers(client) -> dict:
    return login(client, "admin@pamoja.ke", "admin123")


@pytest.fixture
def traveler(client):
    _, headers = new_traveler(client)
    return headers


@pytest.fixture
def companion(client):
    _, headers = new_companion_user(client)
    return headers