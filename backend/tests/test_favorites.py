from .conftest import new_traveler


def test_favorite_flow(client):
    _, headers = new_traveler(client)
    assert client.get("/favorites/ids", headers=headers).json() == []

    add = client.post("/favorites/3", headers=headers)
    assert add.status_code == 200
    add2 = client.post("/favorites/14", headers=headers)
    assert add2.status_code == 200

    ids = client.get("/favorites/ids", headers=headers).json()
    assert sorted(ids) == [3, 14]

    favs = client.get("/favorites", headers=headers).json()
    assert {c["id"] for c in favs} == {3, 14}
    assert all(c["hourly_rate_kes"] > 0 for c in favs)

    removed = client.delete("/favorites/3", headers=headers)
    assert removed.status_code == 200
    assert client.get("/favorites/ids", headers=headers).json() == [14]

    # idempotent remove
    assert client.delete("/favorites/3", headers=headers).status_code == 200


def test_favorites_require_auth(client):
    assert client.get("/favorites/ids").status_code == 401
    assert client.post("/favorites/3").status_code == 401


def test_cannot_favorite_self(client):
    data, headers = new_traveler(client)
    me_id = data["user"]["id"]
    resp = client.post(f"/favorites/{me_id}", headers=headers)
    assert resp.status_code == 400


def test_favorite_unknown_companion_404(client):
    _, headers = new_traveler(client)
    assert client.post("/favorites/99999", headers=headers).status_code == 404