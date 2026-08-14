from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Booking, CompanionProfile, Photo, Review, User
from ..moderation import scan
from ..schemas import (CompanionOut, CompanionProfileUpdateIn, PhotoIn, PhotoOut,
                       ReviewOut)
from ..security import get_current_user

router = APIRouter(tags=["companions"])

CITIES = [
    "Nairobi", "Mombasa", "Diani", "Kisumu", "Nakuru", "Eldoret",
    "Nyeri", "Malindi", "Lamu", "Naivasha", "Machakos", "Thika",
    "Nyahururu",
]

ACTIVITY_TYPES = [
    "city_tours", "resident_tours", "coffee", "dining", "home_cooking",
    "picnic", "parks", "beaches", "museums", "history", "wildlife",
    "zoo", "hot_air_balloon", "boat_rides", "hiking", "camping", "fishing",
    "biking", "swimming", "sports", "gym", "yoga", "dancing", "bowling",
    "golf", "video_games", "amusement", "movies", "music", "comedy",
    "night_out", "shopping", "books", "photography", "art_classes",
    "language_exchange", "mentoring", "seniors", "care_support",
    "wingman", "business_events", "family_events", "event_dates",
    "drivers", "parties",
]

AVAILABLE_ACTIVITY_LABELS = {
    "city_tours": "City Tours",
    "resident_tours": "Local Resident Tours",
    "coffee": "Coffee House Hangouts",
    "dining": "Dining Out",
    "home_cooking": "Cooking & Baking Together",
    "picnic": "Picnics",
    "parks": "Park Strolls",
    "beaches": "Beach Days",
    "museums": "Museums & Art",
    "history": "History & Heritage",
    "wildlife": "Wildlife & Safari Days",
    "zoo": "Animal Sanctuaries & Rescues",
    "hot_air_balloon": "Hot Air Balloon Rides",
    "boat_rides": "Boat Rides & Sunset Cruises",
    "hiking": "Hiking & Nature Walks",
    "camping": "Camping Weekends",
    "fishing": "Fishing Trips",
    "biking": "Biking Rides",
    "swimming": "Swimming",
    "sports": "Playing Sports Together",
    "gym": "Gym & Workout Partner",
    "yoga": "Yoga & Wellness",
    "dancing": "Dance Lessons",
    "bowling": "Bowling",
    "golf": "Golf & Mini Golf",
    "video_games": "Arcades & Video Games",
    "amusement": "Amusement Parks & Fun Fairs",
    "movies": "Cinema & Movies",
    "music": "Music & Live Events",
    "comedy": "Comedy & Laughs",
    "night_out": "Safe Nightlife",
    "shopping": "Shopping Trips",
    "books": "Bookstores & Book Clubs",
    "photography": "Photography Sessions",
    "art_classes": "Pottery & Art Classes",
    "language_exchange": "Language Exchange",
    "mentoring": "Personal Advice & Mentoring",
    "seniors": "Companionship for Seniors",
    "care_support": "Friendly Support (Accessibility)",
    "wingman": "Wingman / Wingwoman for Events",
    "business_events": "Business Event Plus-One",
    "family_events": "Family Function Companion",
    "event_dates": "Platonic Event Dates",
    "drivers": "Driving Companion (Licensed)",
    "parties": "Parties & Social Gatherings",
}


def weekday_name(d: date) -> str:
    return d.strftime("%a").lower()


def is_available_on(availability: dict, d: date) -> bool:
    return weekday_name(d) in (availability or {})


def _companion_out(cp: CompanionProfile) -> CompanionOut:
    return CompanionOut(
        id=cp.user.id,
        name=cp.user.name,
        email=cp.user.email,
        gender=cp.user.gender,
        city=cp.user.city,
        avatar_url=cp.user.avatar_url,
        is_approved=cp.user.is_approved,
        status=cp.user.status,
        created_at=cp.user.created_at,
        tagline=cp.tagline,
        hourly_rate_kes=cp.hourly_rate_kes,
        description=cp.description,
        activity_types=cp.activity_types or [],
        availability=cp.availability or {},
        rating_avg=cp.rating_avg,
        rating_count=cp.rating_count,
        verified_id=cp.verified_id,
        is_featured=cp.is_featured,
        interests=cp.user.interests or [],
        languages=cp.user.languages or [],
        photos=[PhotoOut.model_validate(p) for p in cp.user.photos],
    )


@router.get("/cities")
def list_cities():
    return CITIES


@router.get("/activities")
def list_activities():
    return [{"value": k, "label": v} for k, v in AVAILABLE_ACTIVITY_LABELS.items()]


@router.get("/companions", response_model=list[CompanionOut])
def search_companions(
    city: str | None = None,
    gender: str | None = None,
    interests: str | None = None,
    languages: str | None = None,
    date: date | None = None,
    max_rate: int | None = None,
    min_rating: float | None = None,
    activity: str | None = None,
    sort: str = "rating",  # rating | price_asc | price_desc | newest
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    q = (
        db.query(CompanionProfile)
        .join(User)
        .options(joinedload(CompanionProfile.user).joinedload(User.photos))
        .filter(User.is_approved.is_(True), User.status == "active")
    )
    if city:
        q = q.filter(User.city == city)
    if gender:
        q = q.filter(User.gender == gender)
    if interests:
        want = [i.strip() for i in interests.split(",") if i.strip()]
        for w in want:
            q = q.filter(User.interests.astype("text").ilike(f"%{w}%"))
    if languages:
        want = [l.strip() for l in languages.split(",") if l.strip()]
        for w in want:
            q = q.filter(User.languages.astype("text").ilike(f"%{w}%"))
    if max_rate:
        q = q.filter(CompanionProfile.hourly_rate_kes <= max_rate)
    if min_rating:
        q = q.filter(CompanionProfile.rating_avg >= min_rating)
    if activity:
        q = q.filter(CompanionProfile.activity_types.astype("text").ilike(f"%{activity}%"))

    results = q.all()
    if date:
        results = [r for r in results if is_available_on(r.availability, date)]

    if sort == "price_asc":
        results.sort(key=lambda r: r.hourly_rate_kes)
    elif sort == "price_desc":
        results.sort(key=lambda r: r.hourly_rate_kes, reverse=True)
    elif sort == "newest":
        results.sort(key=lambda r: r.user.created_at, reverse=True)
    else:
        results.sort(key=lambda r: r.rating_avg, reverse=True)

    start = (page - 1) * page_size
    return [_companion_out(r) for r in results[start : start + page_size]]


@router.get("/companions/{companion_id}", response_model=CompanionOut)
def get_companion(companion_id: int, db: Session = Depends(get_db)):
    cp = (
        db.query(CompanionProfile)
        .options(joinedload(CompanionProfile.user).joinedload(User.photos))
        .filter(CompanionProfile.user_id == companion_id)
        .first()
    )
    if not cp or not cp.user.is_approved or cp.user.status != "active":
        raise HTTPException(status_code=404, detail="Companion not found")
    return _companion_out(cp)


@router.get("/companions/{companion_id}/reviews", response_model=list[ReviewOut])
def companion_reviews(companion_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.reviewee_id == companion_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    out = []
    for r in reviews:
        o = ReviewOut.model_validate(r)
        reviewer = db.get(User, r.reviewer_id)
        o.reviewer_name = reviewer.name if reviewer else None
        out.append(o)
    return out


@router.put("/profile/companion", response_model=CompanionOut)
def update_companion_profile(
    body: CompanionProfileUpdateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != "companion":
        raise HTTPException(status_code=403, detail="Only companions can edit this profile")
    cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == user.id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Companion profile not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(cp, field, value)

    combined = " ".join(filter(None, [cp.tagline or "", cp.description or ""]))
    found = scan(combined)
    if found:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=(
                "Your profile mentions content that isn't allowed on Pamoja — we're a strictly "
                "platonic platform. Remove the disallowed wording and save again."
            ),
        )
    db.commit()
    db.refresh(cp)
    return _companion_out(cp)


@router.post("/profile/photos", response_model=list[PhotoOut])
def add_photo(body: PhotoIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.is_primary:
        for p in user.photos:
            p.is_primary = False
    photo = Photo(user_id=user.id, url=body.url, is_primary=body.is_primary,
                  position=len(user.photos))
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return [PhotoOut.model_validate(p) for p in sorted(
        db.query(Photo).filter(Photo.user_id == user.id).all(), key=lambda p: p.position)]


@router.get("/me/companion", response_model=CompanionOut)
def my_companion_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cp = (
        db.query(CompanionProfile)
        .options(joinedload(CompanionProfile.user).joinedload(User.photos))
        .filter(CompanionProfile.user_id == user.id)
        .first()
    )
    if not cp:
        raise HTTPException(status_code=404, detail="Not a companion")
    return _companion_out(cp)