from datetime import date, timedelta


def _days_from_today(delta: int) -> str:
    return (date.today() + timedelta(days=delta)).isoformat()


def test_list_companions_returns_seeded(client):
    resp = client.get("/companions?page_size=48")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 10
    assert all("hourly_rate_kes" in c for c in data)


def test_filter_by_city(client):
    data = client.get("/companions?city=Nairobi").json()
    assert data and all(c["city"] == "Nairobi" for c in data)


def test_filter_by_activity(client):
    data = client.get("/companions?activity=beaches").json()
    assert all("beaches" in (c["activity_types"] or []) for c in data)


def test_filter_max_rate(client):
    data = client.get("/companions?max_rate=1000").json()
    assert all(c["hourly_rate_kes"] <= 1000 for c in data)


def test_filter_min_rating(client):
    data = client.get("/companions?min_rating=4.6").json()
    assert all(c["rating_avg"] >= 4.6 for c in data)


def test_filter_available_on_date(client):
    future = _days_from_today(7)  # +7 days = +1 week = same weekday
    data = client.get(f"/companions?date={future}").json()
    for c in data:
        wkday = date.fromisoformat(future).strftime("%a").lower()
        assert wkday in (c["availability"] or {}), f"{c['name']} should work on {wkday}"


def test_sort_price_asc(client):
    data = client.get("/companions?sort=price_asc&page_size=48").json()
    rates = [c["hourly_rate_kes"] for c in data]
    assert rates == sorted(rates)


def test_page_size_capped_at_48(client):
    resp = client.get("/companions?page_size=100")
    assert resp.status_code == 422


def test_pagination(client):
    page1 = client.get("/companions?page=1&page_size=6").json()
    page2 = client.get("/companions?page=2&page_size=6").json()
    assert len(page1) == 6 and len(page2) > 0
    assert page1[0]["id"] != page2[0]["id"]


def test_companion_detail(client):
    resp = client.get("/companions/3")
    assert resp.status_code == 200
    assert resp.json()["id"] == 3


def test_companion_detail_not_found(client):
    assert client.get("/companions/999999").status_code == 404


def test_activities_catalogue(client):
    data = client.get("/activities").json()
    assert len(data) == 45
    assert {"value": "coffee", "label": "Coffee House Hangouts"} in data


def test_cities_list(client):
    data = client.get("/cities").json()
    assert "Nairobi" in data and "Nyahururu" in data


def test_reviews_endpoint(client):
    resp = client.get("/companions/3/reviews")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)