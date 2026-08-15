from datetime import date, timedelta

from .conftest import new_traveler

COMPANION_ID = 3  # seeded: Wanjiru, Nairobi, weekdays 09:00-17:00, KSH 1500/hr


def _next_weekday() -> str:
    d = date.today()
    for _ in range(14):
        d = d + timedelta(days=1)
        if d.weekday() < 5:  # mon-fri
            return d.isoformat()
    return d.isoformat()


_WEEKDAYS = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}


def _next_available(*days: str) -> str:
    d = date.today()
    for _ in range(14):
        d = d + timedelta(days=1)
        if _WEEKDAYS[d.weekday()] in days:
            return d.isoformat()
    return d.isoformat()


def test_companion_cannot_create_booking(client):
    from .conftest import new_companion_user

    _, headers = new_companion_user(client)
    resp = client.post(
        "/bookings",
        headers=headers,
        json={
            "companion_id": 4,
            "activity": "Coffee House Hangouts",
            "booking_date": _next_weekday(),
            "hours": 2,
        },
    )
    assert resp.status_code == 403


def test_valid_booking_and_commission_math(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/bookings",
        headers=headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "Coffee House Hangouts",
            "booking_date": _next_weekday(),
            "start_time": "10:00",
            "hours": 3,
        },
    )
    assert resp.status_code == 200, resp.text
    b = resp.json()
    assert b["status"] == "pending"
    assert b["rate_kes"] == 1500
    assert b["total_kes"] == 4500
    assert b["commission_kes"] == 675  # 15%
    assert b["payout_kes"] == 3825


def test_booking_date_in_past(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/bookings",
        headers=headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "City Tours",
            "booking_date": (date.today() - timedelta(days=1)).isoformat(),
            "hours": 2,
        },
    )
    assert resp.status_code == 400
    assert "past" in resp.json()["detail"].lower()


def test_booking_out_of_availability_window(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/bookings",
        headers=headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "City Tours",
            "booking_date": _next_weekday(),
            "start_time": "20:00",
            "hours": 2,
        },
    )
    assert resp.status_code == 400
    assert "availability" in resp.json()["detail"].lower()


def test_booking_bad_time_format(client):
    _, headers = new_traveler(client)
    resp = client.post(
        "/bookings",
        headers=headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "City Tours",
            "booking_date": _next_weekday(),
            "start_time": "25:99",
            "hours": 2,
        },
    )
    assert resp.status_code == 400
    assert "HH:MM" in resp.json()["detail"]


def test_booking_conflict_guard(client):
    _, headers = new_traveler(client)
    payload = {
        "companion_id": COMPANION_ID,
        "activity": "Museums & Art",
        "booking_date": _next_weekday(),
        "start_time": "14:00",
        "hours": 2,
    }
    first = client.post("/bookings", headers=headers, json=payload)
    assert first.status_code == 200, first.text
    conflict = client.post(
        "/bookings",
        headers=headers,
        json={**payload, "activity": "Dining Out", "start_time": "15:00", "hours": 1},
    )
    assert conflict.status_code == 400
    assert "already has a booking" in conflict.json()["detail"]


def test_booking_state_machine_and_reviews(client):
    from .conftest import login

    traveler_data, t_headers = new_traveler(client)
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")

    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "City Tours",
            "booking_date": _next_weekday(),
            "start_time": "13:00",
            "hours": 1,
        },
    ).json()

    # only companion can accept
    assert client.post(f"/bookings/{b['id']}/accept", headers=t_headers).status_code == 403
    assert client.post(f"/bookings/{b['id']}/accept", headers=c_headers).json()["status"] == "accepted"

    # traveler cancels an accepted booking
    assert client.post(f"/bookings/{b['id']}/cancel", headers=t_headers).json()["status"] == "cancelled"
    # cannot complete a cancelled booking
    assert client.post(f"/bookings/{b['id']}/complete", headers=c_headers).status_code == 400


def test_two_way_reviews_and_duplicate_guard(client):
    from .conftest import login

    traveler_data, t_headers = new_traveler(client)
    c_headers = login(client, "brian.otieno@pamoja.ke")  # companion 4

    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 4,
            "activity": "Wildlife & Safari Days",
            "booking_date": _next_available("mon", "tue", "wed", "fri", "sat", "sun"),
            "start_time": "11:00",
            "hours": 2,
        },
    ).json()
    client.post(f"/bookings/{b['id']}/accept", headers=c_headers)
    client.post(f"/bookings/{b['id']}/complete", headers=t_headers)

    trav_review = client.post(
        "/bookings/reviews", headers=t_headers,
        json={"booking_id": b["id"], "rating": 5, "comment": "Amazing host"},
    )
    assert trav_review.status_code == 200, trav_review.text

    comp_review = client.post(
        "/bookings/reviews", headers=c_headers,
        json={"booking_id": b["id"], "rating": 4, "comment": "Great guest"},
    )
    assert comp_review.status_code == 200, comp_review.text

    dup = client.post(
        "/bookings/reviews", headers=t_headers,
        json={"booking_id": b["id"], "rating": 3, "comment": "again"},
    )
    assert dup.status_code == 400

    detail = client.get(f"/bookings/{b['id']}", headers=t_headers).json()
    assert detail["status"] == "completed"
    # ratings recalculated for companion 4
    profile = client.get("/companions/4").json()
    assert profile["rating_count"] >= 1


def test_cannot_review_pending_booking(client):
    _, t_headers = new_traveler(client)
    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": COMPANION_ID,
            "activity": "City Tours",
            "booking_date": _next_weekday(),
            "hours": 2,
        },
    ).json()
    resp = client.post(
        "/bookings/reviews", headers=t_headers,
        json={"booking_id": b["id"], "rating": 5},
    )
    assert resp.status_code == 400