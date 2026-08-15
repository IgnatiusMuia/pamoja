from datetime import date, timedelta

from .conftest import login, new_traveler


def _next_weekday() -> str:
    d = date.today()
    for _ in range(14):
        d = d + timedelta(days=1)
        if d.weekday() < 5:
            return d.isoformat()
    return d.isoformat()


def _next_weekday_following_week() -> str:
    return (date.fromisoformat(_next_weekday()) + timedelta(days=7)).isoformat()


def test_booking_events_create_notifications(client):
    _, t_headers = new_traveler(client)
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")

    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 3,
            "activity": "City Tours",
            "booking_date": _next_weekday_following_week(),
            "start_time": "12:00",
            "hours": 2,
        },
    ).json()

    comp_inbox = client.get("/notifications?limit=10", headers=c_headers).json()
    assert any(n["title"].startswith("New booking request") for n in comp_inbox)

    client.post(f"/bookings/{b['id']}/accept", headers=c_headers)
    trav_inbox = client.get("/notifications?limit=10", headers=t_headers).json()
    assert any("accepted your booking" in n["title"] for n in trav_inbox)
    assert any(n["link"] == f"/dashboard/bookings/{b['id']}" for n in trav_inbox)


def test_mark_all_read(client):
    _, headers = new_traveler(client)
    client.post("/favorites/3", headers=headers)  # does not notify, just sanity
    client.post("/notifications/read-all", headers=headers)
    inbox = client.get("/notifications?limit=10", headers=headers).json()
    assert all(n["read_at"] for n in inbox)


def test_notifications_require_auth(client):
    assert client.get("/notifications").status_code == 401
    assert client.post("/notifications/read-all").status_code == 401