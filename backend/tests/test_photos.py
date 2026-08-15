import uuid

from .conftest import login, new_companion_user

JPEG = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9"


def _upload(client, headers, content=JPEG, filename="photo.jpg"):
    return client.post(
        "/profile/photos/upload",
        headers=headers,
        files={"file": (filename, content, "image/jpeg")},
    )


def test_upload_photo(client):
    _, headers = new_companion_user(client)
    resp = _upload(client, headers)
    assert resp.status_code == 200, resp.text
    photos = resp.json()
    assert len(photos) == 1
    assert photos[0]["url"].startswith("/uploads/")
    assert photos[0]["is_primary"] is True

    # file is served
    url = photos[0]["url"]
    served = client.get(url)
    assert served.status_code == 200
    assert served.headers["content-type"].startswith("image/")


def test_upload_rejects_bad_extension(client):
    _, headers = new_companion_user(client)
    resp = _upload(client, headers, filename="notes.txt")
    assert resp.status_code == 400
    assert "JPG, PNG or WEBP" in resp.json()["detail"]


def test_set_primary_and_delete(client):
    _, headers = new_companion_user(client)
    photos = _upload(client, headers).json()
    second = _upload(client, headers).json()
    assert len(second) == 2
    assert second[0]["is_primary"] is True

    target = next(p for p in second if not p["is_primary"])
    resp = client.post(f"/profile/photos/{target['id']}/primary", headers=headers)
    assert resp.status_code == 200
    promoted = next(p for p in resp.json() if p["id"] == target["id"])
    assert promoted["is_primary"] is True

    me = client.get("/auth/me", headers=headers).json()
    assert me["avatar_url"] == target["url"]

    gone = client.delete(f"/profile/photos/{target['id']}", headers=headers)
    assert gone.status_code == 200
    assert len(gone.json()) == 1

    # deleting the last photo clears the avatar
    remaining = gone.json()[0]
    client.delete(f"/profile/photos/{remaining['id']}", headers=headers)
    me = client.get("/auth/me", headers=headers).json()
    assert me["avatar_url"] is None or me["avatar_url"].startswith("http")


def test_upload_requires_auth(client):
    resp = _upload(client, {})
    assert resp.status_code in (401, 403)


def test_upload_rejects_oversize(client):
    _, headers = new_companion_user(client)
    big = b"x" * (6 * 1024 * 1024)
    resp = _upload(client, headers, content=big)
    assert resp.status_code == 400
    assert "5MB" in resp.json()["detail"]