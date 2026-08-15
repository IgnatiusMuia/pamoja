from .conftest import new_traveler


def test_message_moderation_censors_and_flags(client):
    _, headers = new_traveler(client)
    conv = client.post(
        "/conversations", headers=headers, json={"user_b_id": 3}
    ).json()
    assert conv["id"]

    clean = client.post(
        f"/conversations/{conv['id']}/messages",
        headers=headers,
        json={"body": "Shall we get coffee at the mall tomorrow?"},
    )
    assert clean.status_code == 200
    assert clean.json()["flagged"] is False

    dirty = client.post(
        f"/conversations/{conv['id']}/messages",
        headers=headers,
        json={"body": "Are you available for escort services tonight?"},
    )
    assert dirty.status_code == 200
    assert dirty.json()["flagged"] is True
    assert "***" in dirty.json()["body"]
    assert "escort" not in dirty.json()["body"].lower()


def test_moderation_auto_creates_report(client):
    import uuid

    from .conftest import admin_headers, new_companion_user

    _, headers = new_traveler(client)
    conv = client.post("/conversations", headers=headers, json={"user_b_id": 3}).json()
    client.post(
        f"/conversations/{conv['id']}/messages",
        headers=headers,
        json={"body": f"p4p {uuid.uuid4().hex[:4]} and gfe too"},
    )

    reports = client.get("/admin/reports?status=open", headers=admin_headers(client)).json()
    auto = [r for r in reports if r["reason"] == "auto-flagged content"]
    assert auto
    newest = max(auto, key=lambda r: r["id"])
    assert "p4p" in newest["details"]


def test_profile_scan_rejects_disallowed_content(client):
    from .conftest import login

    c_headers = login(client, "wanjiru.kamau@pamoja.ke")
    ok = client.put(
        "/profile/companion",
        headers=c_headers,
        json={"tagline": "Friendly city tours and coffee buddy"},
    )
    assert ok.status_code == 200

    bad = client.put(
        "/profile/companion",
        headers=c_headers,
        json={"description": "Full service massage and one night stand welcome"},
    )
    assert bad.status_code == 400
    assert "strictly platonic" in bad.json()["detail"]


def test_scan_utility_units():
    from app.moderation import scan

    assert scan("Let's find escort services") == ["escort"]
    assert scan("mpango wa kando, malaya")  # Swahili/Sheng terms caught
    assert scan("Great coffee and a museum walk") == []
    assert scan("I love the opposite sex conversation topic good food") == []


def test_block_prevents_messaging(client):
    _, headers = new_traveler(client)
    resp = client.post("/blocks", headers=headers, json={"blocked_id": 3})
    assert resp.status_code in (200, 201)

    conv = client.post("/conversations", headers=headers, json={"user_b_id": 3})
    assert conv.status_code == 403