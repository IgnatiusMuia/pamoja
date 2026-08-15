from .conftest import admin_headers, new_traveler

COMPANION_ID = 3


def test_report_user_flow(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/reports",
        headers=headers,
        json={"reported_id": COMPANION_ID, "reason": "Harassment", "details": "Unwanted messages"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["ok"] is True
    report_id = body["report_id"]

    open_reports = client.get("/admin/reports?status=open", headers=admin_headers(client)).json()
    mine = [r for r in open_reports if r["id"] == report_id]
    assert len(mine) == 1
    assert mine[0]["reason"] == "Harassment"
    assert mine[0]["reported_name"] == "Wanjiru Kamau"
    assert mine[0]["details"] == "Unwanted messages"


def test_cannot_report_self(client):
    data, headers = new_traveler(client)
    resp = client.post(
        "/reports",
        headers=headers,
        json={"reported_id": data["user"]["id"], "reason": "Test", "details": "x"},
    )
    assert resp.status_code == 400


def test_report_unknown_user_404(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/reports",
        headers=headers,
        json={"reported_id": 999999, "reason": "Test", "details": "x"},
    )
    assert resp.status_code == 404


def test_report_requires_auth(client):
    assert client.post("/reports", json={"reported_id": 3, "reason": "x"}).status_code == 401


def test_block_unblock_flow_restores_messaging(client):
    _, headers = new_traveler(client)

    blocked = client.post("/blocks", headers=headers, json={"blocked_id": COMPANION_ID})
    assert blocked.status_code == 200
    assert blocked.json()["blocked"] is True

    again = client.post("/blocks", headers=headers, json={"blocked_id": COMPANION_ID})
    assert again.json()["blocked"] is True

    my_blocks = client.get("/blocks", headers=headers).json()
    assert {"id": COMPANION_ID, "name": "Wanjiru Kamau"} in my_blocks

    assert client.post(
        "/conversations", headers=headers, json={"user_b_id": COMPANION_ID}
    ).status_code == 403

    unblocked = client.delete(f"/blocks/{COMPANION_ID}", headers=headers)
    assert unblocked.status_code == 200
    assert unblocked.json()["blocked"] is False
    assert client.get("/blocks", headers=headers).json() == []

    conv = client.post(
        "/conversations", headers=headers, json={"user_b_id": COMPANION_ID}
    )
    assert conv.status_code == 200
    assert conv.json()["id"]


def test_cannot_block_self(client):
    data, headers = new_traveler(client)
    resp = client.post(
        "/blocks", headers=headers, json={"blocked_id": data["user"]["id"]}
    )
    assert resp.status_code == 400


def test_blocks_require_auth(client):
    assert client.post("/blocks", json={"blocked_id": 3}).status_code == 401
    assert client.get("/blocks").status_code == 401


def test_emergency_contact_roundtrip(client):
    data, headers = new_traveler(client)
    resp = client.post(
        "/emergency",
        headers=headers,
        json={"emergency_name": "Mum", "emergency_phone": "+254700000000"},
    )
    assert resp.status_code == 200
    assert resp.json()["emergency_name"] == "Mum"
    assert resp.json()["emergency_phone"] == "+254700000000"

    me = client.get("/auth/me", headers=headers).json()
    assert me["emergency_name"] == "Mum"
    assert me["emergency_phone"] == "+254700000000"

    updated = client.put(
        "/auth/me",
        headers=headers,
        json={"emergency_name": "Dad", "emergency_phone": "+254711111111", "phone": "+254722222222"},
    )
    assert updated.status_code == 200
    me = client.get("/auth/me", headers=headers).json()
    assert me["emergency_name"] == "Dad"
    assert me["emergency_phone"] == "+254711111111"
    assert me["phone"] == "+254722222222"