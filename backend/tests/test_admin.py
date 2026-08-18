from datetime import date, timedelta

from .conftest import admin_headers, new_companion_user, new_traveler, register


def test_admin_stats(client):
    headers = admin_headers(client)
    stats = client.get("/admin/stats", headers=headers).json()
    assert set(stats) == {"travelers", "companions", "pending_approvals", "open_reports", "bookings"}
    assert stats["companions"] >= 10


def test_admin_commission_settle_flow(client):
    from .conftest import login

    headers = admin_headers(client)
    _, t_headers = new_traveler(client)
    c_headers = login(client, "brian.otieno@pamoja.ke")  # companion 4

    d = date.today() + timedelta(days=30)
    while d.weekday() not in (0, 1, 2, 4, 5):  # Brian: mon/tue/wed/fri/sat
        d += timedelta(days=1)
    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 4,
            "activity": "Hiking",
            "booking_date": d.isoformat(),
            "start_time": "10:00",
            "hours": 2,
        },
    ).json()
    client.post(f"/bookings/{b['id']}/accept", headers=c_headers)
    client.post(f"/bookings/{b['id']}/complete", headers=t_headers)

    rows = client.get("/admin/payments?method=commission", headers=headers).json()
    due = [p for p in rows if p["reference"] == f"BK-{b['id']}"]
    assert len(due) == 1 and due[0]["status"] == "due"
    assert due[0]["user_name"] == "Brian Otieno"

    resp = client.post(f"/admin/payments/{due[0]['id']}/settle", headers=headers)
    assert resp.status_code == 200 and resp.json()["status"] == "paid"

    settled = client.get("/admin/payments?status=paid&method=commission", headers=headers).json()
    assert any(p["id"] == due[0]["id"] for p in settled)

    # non-admins cannot settle
    assert client.post(f"/admin/payments/{due[0]['id']}/settle", headers=t_headers).status_code == 403
    # settling twice fails
    assert client.post(f"/admin/payments/{due[0]['id']}/settle", headers=headers).status_code == 400

    # listing fees can be listed but not settled here
    _, comp_headers = new_companion_user(client)
    fee = client.post("/billing/mpesa/stk-push", headers=comp_headers).json()
    fee_rows = client.get("/admin/payments?method=mpesa", headers=headers).json()
    assert any(x["id"] == fee["id"] for x in fee_rows)
    assert client.post(f"/admin/payments/{fee['id']}/settle", headers=headers).status_code == 400


def test_listing_expiry_reminders(client):
    from datetime import datetime, timedelta

    from app.database import SessionLocal
    from app.main import _listing_expiry_reminders
    from app.models import CompanionProfile

    from .conftest import login, register

    data = register(client, role="companion", name="Expiring Comp")
    headers = login(client, data["user"]["email"])
    client.post("/billing/mpesa/stk-push", headers=headers)
    client.put(
        "/profile/companion", headers=headers,
        json={"id_document_url": "https://example.com/id.png"},
    )
    client.post(f"/admin/companions/{data['user']['id']}/verify-id", headers=admin_headers(client))

    db = SessionLocal()
    try:
        cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == data["user"]["id"]).one()
        cp.paid_until = datetime.utcnow() + timedelta(days=2)
        db.commit()
    finally:
        db.close()

    assert _listing_expiry_reminders(SessionLocal()) == 1
    # deduped — running again the same day creates nothing
    assert _listing_expiry_reminders(SessionLocal()) == 0

    notifs = client.get("/notifications", headers=headers).json()
    assert any(
        n["type"] == "listing" and "expires soon" in n["title"] for n in notifs
    )

    # lapsed listings (paid_until in the past) do not get reminders
    db = SessionLocal()
    try:
        cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == data["user"]["id"]).one()
        cp.paid_until = datetime.utcnow() - timedelta(days=1)
        db.commit()
    finally:
        db.close()
    assert _listing_expiry_reminders(SessionLocal()) == 0


def test_booking_reminders_for_tomorrow(client):
    from datetime import timedelta

    from sqlalchemy import delete, update

    from app.database import SessionLocal
    from app.main import _booking_reminders
    from app.models import Booking

    from .conftest import login

    _, t_headers = new_traveler(client)
    c_headers = login(client, "brian.otieno@pamoja.ke")  # companion 4

    d = date.today() + timedelta(days=21)
    while d.weekday() != 2:  # Brian, Wednesday 10:00-18:00
        d += timedelta(days=1)
    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 4,
            "activity": "Park & Chill",
            "booking_date": d.isoformat(),
            "start_time": "14:00",
            "hours": 2,
        },
    ).json()
    client.post(f"/bookings/{b['id']}/accept", headers=c_headers)

    db = SessionLocal()
    db.execute(
        update(Booking)
        .where(Booking.id == b["id"])
        .values(booking_date=date.today() + timedelta(days=1))
    )
    db.commit()

    assert _booking_reminders(db) == 2
    # deduped within the same day
    assert _booking_reminders(db) == 0

    for headers in (t_headers, c_headers):
        notifs = client.get("/notifications", headers=headers).json()
        assert any("tomorrow" in n["title"] for n in notifs)

    db.execute(delete(Booking).where(Booking.id == b["id"]))
    db.commit()
    db.close()


def test_suspend_cancels_open_bookings_and_notifies(client):
    from .conftest import login

    headers = admin_headers(client)
    _, t_headers = new_traveler(client)
    c_headers = login(client, "wanjiru.kamau@pamoja.ke")  # companion 3

    d = date.today() + timedelta(days=30)
    while d.weekday() >= 5:
        d += timedelta(days=1)
    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 3,
            "activity": "Coffee House Hangouts",
            "booking_date": d.isoformat(),
            "start_time": "10:00",
            "hours": 2,
        },
    ).json()
    client.post(f"/bookings/{b['id']}/accept", headers=c_headers)

    companion_id = client.get("/auth/me", headers=c_headers).json()["id"]
    res = client.post(f"/admin/users/{companion_id}/suspend", headers=headers)
    assert res.json()["suspended"] is True

    # the accepted booking is auto-cancelled and the traveler is told why
    booking = client.get(f"/bookings/{b['id']}", headers=t_headers).json()
    assert booking["status"] == "cancelled"
    notifs = client.get("/notifications", headers=t_headers).json()
    assert any("suspended" in n["body"] for n in notifs)

    # the suspended companion can no longer use or extend their account
    assert client.get("/auth/me", headers=c_headers).status_code == 403
    assert client.post("/bookings", headers=c_headers, json={
        "companion_id": 3, "activity": "Hiking",
        "booking_date": d.isoformat(), "start_time": "10:00", "hours": 1,
    }).status_code in (400, 403)

    # unsuspend restores access
    assert client.post(f"/admin/users/{companion_id}/unsuspend", headers=headers).json()["unsuspended"] is True
    assert client.get("/auth/me", headers=c_headers).json()["status"] == "active"


def test_admin_bookings_list(client):
    headers = admin_headers(client)
    _, t_headers = new_traveler(client)

    d = date.today() + timedelta(days=30)
    while d.weekday() >= 5:
        d += timedelta(days=1)
    b = client.post(
        "/bookings",
        headers=t_headers,
        json={
            "companion_id": 3,
            "activity": "Coffee House Hangouts",
            "booking_date": d.isoformat(),
            "start_time": "09:00",
            "hours": 2,
        },
    ).json()

    rows = client.get("/admin/bookings", headers=headers).json()
    assert any(x["id"] == b["id"] for x in rows)
    booking = next(x for x in rows if x["id"] == b["id"])
    assert booking["traveler"]["name"] == "Test User"
    assert booking["commission_kes"] == b["commission_kes"]

    pending = client.get("/admin/bookings?status=pending", headers=headers).json()
    assert all(x["status"] == "pending" for x in pending)
    assert client.get("/admin/bookings", headers=t_headers).status_code == 403


def test_admin_requires_admin(client):
    _, headers = new_traveler(client)
    assert client.get("/admin/stats", headers=headers).status_code == 403
    assert client.get("/admin/stats").status_code in (401, 403)


def test_admin_approve_reject_and_suspend(client):
    from .conftest import login

    headers = admin_headers(client)
    data = register(client, role="companion")  # needs approval
    p_headers = login(client, data["user"]["email"])

    pending = client.get("/admin/companions?status=pending", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in pending)

    # recruitment policy: approval requires ID verification first
    approve = client.post(f"/admin/companions/{data['user']['id']}/approve", headers=headers)
    assert approve.status_code == 400
    assert "ID verification is mandatory" in approve.json()["detail"]

    # verify without an ID document on file fails
    verify = client.post(f"/admin/companions/{data['user']['id']}/verify-id", headers=headers)
    assert verify.status_code == 400

    # companion submits their ID document, admin verifies, then approves
    client.put(
        "/profile/companion", headers=p_headers,
        json={"id_document_url": "https://example.com/id.png"},
    )
    assert client.post(f"/admin/companions/{data['user']['id']}/verify-id", headers=headers).status_code == 200

    approve = client.post(f"/admin/companions/{data['user']['id']}/approve", headers=headers)
    assert approve.status_code == 200
    approved = client.get("/admin/companions?status=approved", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in approved)
    row = next(c for c in approved if c["id"] == data["user"]["id"])
    assert row["verified_id"] is True and row["id_verified_at"]

    suspend = client.post(f"/admin/users/{data['user']['id']}/suspend", headers=headers)
    assert suspend.status_code == 200
    assert client.get("/auth/me", headers=p_headers).status_code == 403


def test_admin_reports_resolution(client):
    from .conftest import login

    headers = admin_headers(client)
    _, t_headers = new_traveler(client)
    client.post("/reports", headers=t_headers, json={
        "reported_id": 3, "reason": "Made me uncomfortable", "details": "Test report",
    })

    open_reports = client.get("/admin/reports?status=open", headers=headers).json()
    report = next(r for r in open_reports if r["reason"] == "Made me uncomfortable")
    assert report["reported_name"] == "Wanjiru Kamau"

    resolve = client.post(f"/admin/reports/{report['id']}/resolve", headers=headers)
    assert resolve.status_code == 200
    resolved = client.get("/admin/reports?status=resolved", headers=headers).json()
    assert any(r["id"] == report["id"] for r in resolved)


def test_admin_analytics_shape(client):
    headers = admin_headers(client)
    data = client.get("/admin/analytics", headers=headers).json()
    assert set(data["bookings_by_status"]) == {"pending", "accepted", "declined", "cancelled", "completed"}
    assert set(data["revenue"]) == {"bookings", "total_kes", "commission_kes", "payouts_kes", "listing_fees_kes", "listing_payments", "commission_due_kes"}
    assert {"date", "count"} == set(data["signups_by_day"][0])
    assert {"date", "count"} == set(data["bookings_by_day"][0])
    assert len(data["bookings_by_day"]) == 14
    assert len(data["signups_by_day"]) == 14
    assert isinstance(data["top_companions"], list)
    assert data["companions_by_city"]
    assert 0 <= data["avg_rating"] <= 5


def test_admin_reject_and_status_filters(client):
    headers = admin_headers(client)
    data = register(client, role="companion")

    listed = client.get("/admin/companions?status=pending", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in listed)

    reject = client.post(f"/admin/companions/{data['user']['id']}/reject", headers=headers)
    assert reject.status_code == 200
    assert reject.json()["rejected"] is True

    rejected = client.get("/admin/companions?status=rejected", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] and c["status"] == "rejected" for c in rejected)
    not_approved = client.get("/admin/companions?status=approved", headers=headers).json()
    assert not any(c["id"] == data["user"]["id"] for c in not_approved)

    assert client.post("/admin/companions/999999/reject", headers=headers).status_code == 404


def test_admin_suspend_unsuspend_companion(client):
    headers = admin_headers(client)
    data = register(client, role="companion")

    sus = client.post(f"/admin/users/{data['user']['id']}/suspend", headers=headers)
    assert sus.json()["suspended"] is True

    suspended = client.get("/admin/companions?status=suspended", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in suspended)

    assert client.post("/admin/users/999999/suspend", headers=headers).status_code == 404

    unsus = client.post(f"/admin/users/{data['user']['id']}/unsuspend", headers=headers)
    assert unsus.json()["unsuspended"] is True
    assert client.post("/admin/users/999999/unsuspend", headers=headers).status_code == 404

    approved = client.get("/admin/companions?status=approved", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in approved)


def test_admin_approve_non_companion_404(client):
    data, _ = new_traveler(client)
    headers = admin_headers(client)
    assert client.post(f"/admin/companions/{data['user']['id']}/approve", headers=headers).status_code == 404


def test_admin_report_dismiss_and_404s(client):
    headers = admin_headers(client)
    _, t_headers = new_traveler(client)
    report = client.post(
        "/reports", headers=t_headers,
        json={"reported_id": 3, "reason": "Spam", "details": "Spammy"},
    ).json()

    dismiss = client.post(f"/admin/reports/{report['report_id']}/dismiss", headers=headers)
    assert dismiss.status_code == 200
    dismissed = client.get("/admin/reports?status=dismissed", headers=headers).json()
    assert any(r["id"] == report["report_id"] for r in dismissed)

    assert client.post("/admin/reports/999999/dismiss", headers=headers).status_code == 404
    assert client.post("/admin/reports/999999/resolve", headers=headers).status_code == 404


def test_admin_flagged_messages(client):
    from .conftest import new_companion_user

    headers = admin_headers(client)
    _, t_headers = new_traveler(client)
    conv = client.post("/conversations", headers=t_headers, json={"user_b_id": 3}).json()
    client.post(
        f"/conversations/{conv['id']}/messages",
        headers=t_headers,
        json={"body": "Do you offer escort services?"},
    )
    flagged = client.get("/admin/flagged-messages", headers=headers).json()
    assert any("escort" in m["body"] or "***" in m["body"] for m in flagged)
    assert any("sender_name" in m for m in flagged)