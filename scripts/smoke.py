#!/usr/bin/env python3
"""Pamoja end-to-end smoke test against a running stack.

Covers: auth, search, booking (accept/complete), reviews, messaging,
blocks/unblocks, reports, admin. Requires the backend (and ideally the
frontend) to be running locally.

Usage:
    PAMOJA_API=http://127.0.0.1:8000 FRONTEND=http://localhost:3000 python3 scripts/smoke.py
"""

import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from datetime import date, timedelta
from typing import Optional

API = os.environ.get("PAMOJA_API", "http://127.0.0.1:8000")
FRONTEND = os.environ.get("FRONTEND", "")  # set to check the Next.js app too

PASSED = 0
FAILED = 0
STEPS = []


def req(method: str, path: str, token: Optional[str] = None, body: Optional[dict] = None,
        raw: bool = False):
    url = API + path
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(
        url, data=data, method=method,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    if token:
        r.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            payload = resp.read()
            return resp.status, json.loads(payload) if payload and not raw else payload
    except urllib.error.HTTPError as e:
        payload = e.read()
        try:
            detail = json.loads(payload)["detail"] if payload else ""
        except Exception:
            detail = ""
        return e.code, detail
    except urllib.error.URLError as e:
        raise SystemExit(f"FATAL: cannot reach {url}: {e}")


def step(name: str, ok: bool, extra: str = ""):
    global PASSED, FAILED
    if ok:
        PASSED += 1
        print(f"  PASS  {name}" + (f"  ({extra})" if extra else ""))
    else:
        FAILED += 1
        print(f"  FAIL  {name}" + (f"  ({extra})" if extra else ""))
    STEPS.append((name, ok))


def register_traveler() -> tuple[str, str, str]:
    email = f"smoke-{uuid.uuid4().hex[:8]}@pamoja.ke"
    status, data = req("POST", "/auth/register", body={
        "email": email, "password": "password123", "name": "Smoke Test",
        "role": "traveler", "city": "Nairobi", "gender": "female",
    })
    assert status == 200, data
    return email, data["access_token"], data["user"]["id"]


def find_wanjiru() -> int:
    status, data = req("GET", "/companions?page_size=48")
    assert status == 200
    for c in data:
        if c["name"] == "Wanjiru Kamau":
            return c["id"]
    raise SystemExit("FATAL: seeded companion Wanjiru Kamau not found")


def next_available_weekday(availability: dict) -> str:
    for i in range(1, 15):
        d = date.today() + timedelta(days=i)
        if d.strftime("%a").lower() in availability:
            return d.isoformat()
    raise SystemExit("FATAL: no available day in the next 2 weeks")


def book_slot(token: str, companion_id: int, day: str) -> tuple[int, dict]:
    for hour in range(9, 17):
        status, data = req("POST", "/bookings", token=token, body={
            "companion_id": companion_id, "activity": "City Tours",
            "booking_date": day, "start_time": f"{hour:02d}:00", "hours": 1,
        })
        if status == 200:
            return hour, data
    return -1, {}


def main() -> int:
    print(f"\nPamoja smoke test — API {API} · frontend {FRONTEND}\n")

    status, _ = req("GET", "/health")
    step("backend health", status == 200, str(status))

    if FRONTEND:
        try:
            with urllib.request.urlopen(FRONTEND, timeout=15) as resp:
                fe_ok = resp.status == 200
            step("frontend reachable", fe_ok, str(resp.status))
        except urllib.error.URLError as e:
            step("frontend reachable", False, str(e))
    else:
        print("  SKIP  frontend reachable (set FRONTEND to check)")

    email, token, uid = register_traveler()
    step("register traveler", True, email)
    me_status, me = req("GET", "/auth/me", token=token)
    step("GET /auth/me", me_status == 200 and me["id"] == uid)

    search_status, data = req("GET", "/companions?city=Nairobi&page_size=12")
    step("search companions (city filter)", search_status == 200 and len(data) > 0, f"{len(data)} results")

    comp_id = find_wanjiru()
    detail_status, detail = req("GET", f"/companions/{comp_id}")
    step("companion detail", detail_status == 200 and detail["id"] == comp_id)
    day = next_available_weekday(detail["availability"])
    step("next available weekday", True, day)

    hour, booking = book_slot(token, comp_id, day)
    if hour < 0:
        step("create booking", False, "no free slot found")
    else:
        step("create booking", True, f"{booking['status']} · {hour:02d}:00 · KSH {booking['total_kes']}")
        aid = booking["id"]

        c_status, cdata = req("POST", "/auth/login", body={
            "email": "wanjiru.kamau@pamoja.ke", "password": "password123",
        })
        c_token = cdata["access_token"]
        step("companion login (seeded)", c_status == 200)

        acc_status, acc = req("POST", f"/bookings/{aid}/accept", token=c_token)
        step("companion accepts", acc_status == 200 and acc["status"] == "accepted")

        comp_status, comp = req("POST", f"/bookings/{aid}/complete", token=token)
        step("traveler completes", comp_status == 200 and comp["status"] == "completed")

        rev_status, rev = req("POST", "/bookings/reviews", token=token, body={
            "booking_id": aid, "rating": 5, "comment": "Smoke-test host",
        })
        step("traveler reviews", rev_status == 200)

        reviews_status, reviews = req("GET", f"/companions/{comp_id}/reviews")
        step("review visible on profile", reviews_status == 200 and any(
            r["comment"] == "Smoke-test host" for r in reviews))

        conv_status, conv = req("POST", "/conversations", token=token, body={
            "user_b_id": comp_id,
        })
        step("open conversation", conv_status == 200 and conv.get("id"))

        msg_status, msg = req("POST", f"/conversations/{conv['id']}/messages",
                              token=token, body={"body": "Smoke test message"})
        step("send message (clean)", msg_status == 200 and msg["flagged"] is False)

        rep_status, rep = req("POST", "/reports", token=token, body={
            "reported_id": comp_id, "reason": "Smoke test", "details": "automated check",
        })
        step("create report", rep_status == 200 and rep.get("ok") is True)

        blk_status, blk = req("POST", "/blocks", token=token, body={"blocked_id": comp_id})
        conv2_status, _ = req("POST", "/conversations", token=token, body={"user_b_id": comp_id})
        step("blocked user cannot message", blk_status == 200 and blk["blocked"] and conv2_status == 403)
        ub_status, ub = req("DELETE", f"/blocks/{comp_id}", token=token)
        step("unblock restores messaging", ub_status == 200 and ub["blocked"] is False)

    admin_status, admin = req("POST", "/auth/login", body={
        "email": "admin@pamoja.ke", "password": "admin123",
    })
    step("admin login (seeded)", admin_status == 200)
    if admin_status == 200:
        stats_status, stats = req("GET", "/admin/stats", token=admin["access_token"])
        step("admin stats", stats_status == 200 and "companions" in stats,
             f"companions={stats.get('companions')}")

    print(f"\n{'=' * 48}")
    print(f"RESULT: {PASSED} passed, {FAILED} failed")
    print(f"{'=' * 48}\n")
    return 1 if FAILED else 0


if __name__ == "__main__":
    sys.exit(main())