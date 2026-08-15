from datetime import date, timedelta

from .conftest import admin_headers, new_companion_user, new_traveler, register


def test_admin_stats(client):
    headers = admin_headers(client)
    stats = client.get("/admin/stats", headers=headers).json()
    assert set(stats) == {"travelers", "companions", "pending_approvals", "open_reports", "bookings"}
    assert stats["companions"] >= 10


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

    approve = client.post(f"/admin/companions/{data['user']['id']}/approve", headers=headers)
    assert approve.status_code == 200
    approved = client.get("/admin/companions?status=approved", headers=headers).json()
    assert any(c["id"] == data["user"]["id"] for c in approved)

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
    assert set(data["revenue"]) == {"bookings", "total_kes", "commission_kes", "payouts_kes"}
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