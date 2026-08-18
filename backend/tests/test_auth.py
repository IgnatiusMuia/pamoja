import uuid

from .conftest import login, register


def test_register_and_me(client):
    email = f"auth-{uuid.uuid4().hex[:8]}@pamoja.ke"
    data = register(client, email=email)
    assert data["user"]["email"] == email
    assert data["access_token"]

    headers = login(client, email)
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_register_duplicate_email(client):
    email = f"dup-{uuid.uuid4().hex[:8]}@pamoja.ke"
    register(client, email=email)
    resp = client.post(
        "/auth/register",
        json={"email": email, "password": "password123", "name": "Other", "role": "traveler", "over_18": True},
    )
    assert resp.status_code == 400
    assert "already" in resp.json()["detail"].lower()


def test_register_requires_18_plus_consent(client):
    email = f"minor-{uuid.uuid4().hex[:8]}@pamoja.ke"
    resp = client.post(
        "/auth/register",
        json={
            "email": email, "password": "password123", "name": "Minor",
            "role": "traveler", "over_18": False,
        },
    )
    assert resp.status_code == 400
    assert "18" in resp.json()["detail"]

    # missing consent is rejected too
    resp = client.post(
        "/auth/register",
        json={
            "email": email, "password": "password123", "name": "Minor",
            "role": "traveler",
        },
    )
    assert resp.status_code == 400
    assert "18" in resp.json()["detail"]

    # birth_year under 18 is rejected even with consent
    resp = client.post(
        "/auth/register",
        json={
            "email": email, "password": "password123", "name": "Minor",
            "role": "traveler", "over_18": True, "birth_year": 2015,
        },
    )
    assert resp.status_code == 400
    assert "18" in resp.json()["detail"]

    # consent confirmed and age fine → success
    resp = client.post(
        "/auth/register",
        json={
            "email": email, "password": "password123", "name": "Adult",
            "role": "traveler", "over_18": True, "birth_year": 1995,
        },
    )
    assert resp.status_code == 200


def test_login_wrong_password(client):
    email = f"bad-{uuid.uuid4().hex[:8]}@pamoja.ke"
    register(client, email=email)
    resp = client.post("/auth/login", json={"email": email, "password": "nope"})
    assert resp.status_code == 401


def test_me_requires_token(client):
    assert client.get("/auth/me").status_code == 401


def test_me_rejects_bad_token(client):
    resp = client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401


def test_companion_registration_creates_profile_and_needs_approval(client):
    email = f"cbe-{uuid.uuid4().hex[:8]}@pamoja.ke"
    data = register(client, email=email, role="companion")
    assert data["user"]["is_approved"] is False
    headers = login(client, email)
    profile = client.get("/me/companion", headers=headers)
    assert profile.status_code == 200
    assert profile.json()["hourly_rate_kes"] == 1000


def test_refresh_flow(client):
    email = f"ref-{uuid.uuid4().hex[:8]}@pamoja.ke"
    data = register(client, email=email)
    tokens = client.post(
        "/auth/refresh", json={"refresh_token": data["refresh_token"]}
    )
    assert tokens.status_code == 200
    assert tokens.json()["access_token"]


def test_refresh_rejects_access_token(client):
    email = f"refb-{uuid.uuid4().hex[:8]}@pamoja.ke"
    data = register(client, email=email)
    resp = client.post("/auth/refresh", json={"refresh_token": data["access_token"]})
    assert resp.status_code == 401


def test_refresh_rejects_suspended_account(client):
    from .conftest import admin_headers

    email = f"refs-{uuid.uuid4().hex[:8]}@pamoja.ke"
    data = register(client, email=email)
    client.post(f"/admin/users/{data['user']['id']}/suspend", headers=admin_headers(client))
    resp = client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert resp.status_code == 401