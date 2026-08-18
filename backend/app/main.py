from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine
from .seed import _seed_demo_reviews, seed
from .routers import (admin, auth, billing, bookings, companions, favorites,
                      messaging, notifications, safety)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate()
    db = SessionLocal()
    try:
        seed(db)
        _seed_demo_reviews(db)
        _listing_expiry_reminders(db)
        _booking_reminders(db)
    finally:
        db.close()
    yield


def _booking_reminders(db: Session) -> int:
    """Notify both participants the day before an accepted booking happens
    (deduped once per day per user)."""
    from datetime import date, datetime, timedelta

    from .models import Booking, Notification

    tomorrow = date.today() + timedelta(days=1)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    upcoming = (
        db.query(Booking)
        .filter(Booking.booking_date == tomorrow, Booking.status == "accepted")
        .all()
    )
    created = 0
    for b in upcoming:
        for uid, slot in ((b.traveler_id, "your companion"), (b.companion_id, "your traveller")):
            last = (
                db.query(Notification)
                .filter(Notification.user_id == uid,
                        Notification.type == "booking_reminder")
                .order_by(Notification.created_at.desc())
                .first()
            )
            if last and last.created_at >= today_start:
                continue
            db.add(
                Notification(
                    user_id=uid,
                    type="booking_reminder",
                    title=f"Your {b.activity} is tomorrow",
                    body=(
                        f"You're meeting {slot} tomorrow at {b.start_time or 'an agreed time'} "
                        f"({b.booking_date}). Meet in a public place, share your plans with "
                        f"someone you trust, and have a great time!"
                    ),
                    link=f"/dashboard/bookings/{b.id}",
                )
            )
            created += 1
    if created:
        db.commit()
        print(f"Booking reminders sent: {created}")
    return created


def _listing_expiry_reminders(db: Session, days_before: int = 3) -> int:
    """Notify companions whose listing is about to lapse (deduped once per day)."""
    from datetime import datetime, timedelta

    from .models import CompanionProfile, Notification, User

    soon = datetime.utcnow() + timedelta(days=days_before)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    expiring = (
        db.query(User)
        .join(CompanionProfile, CompanionProfile.user_id == User.id)
        .filter(CompanionProfile.paid_until.isnot(None),
                CompanionProfile.paid_until <= soon,
                CompanionProfile.paid_until > datetime.utcnow())
        .all()
    )
    created = 0
    for u in expiring:
        last = (
            db.query(Notification)
            .filter(Notification.user_id == u.id, Notification.type == "listing")
            .order_by(Notification.created_at.desc())
            .first()
        )
        if last and last.created_at >= today_start:
            continue
        db.add(
            Notification(
                user_id=u.id,
                type="listing",
                title="Your listing expires soon",
                body=(
                    f"Your companion listing lapses on "
                    f"{u.companion_profile.paid_until.strftime('%d %b %Y')}. "
                    f"Renew the monthly fee to stay visible in search."
                ),
                link="/dashboard/billing",
            )
        )
        created += 1
    if created:
        db.commit()
        print(f"Listing expiry reminders sent: {created}")
    return created


def _migrate():
    """Lightweight schema migrations for existing SQLite databases."""
    import sqlalchemy as sa

    with engine.begin() as conn:
        booking_cols = [c["name"] for c in sa.inspect(conn).get_columns("bookings")]
        if "completed_at" not in booking_cols:
            conn.execute(sa.text("ALTER TABLE bookings ADD COLUMN completed_at DATETIME"))
            print("Migration: added bookings.completed_at")
        profile_cols = [c["name"] for c in sa.inspect(conn).get_columns("companion_profiles")]
        if "id_document_url" not in profile_cols:
            conn.execute(sa.text("ALTER TABLE companion_profiles ADD COLUMN id_document_url VARCHAR"))
            print("Migration: added companion_profiles.id_document_url")
        if "id_verified_at" not in profile_cols:
            conn.execute(sa.text("ALTER TABLE companion_profiles ADD COLUMN id_verified_at DATETIME"))
            print("Migration: added companion_profiles.id_verified_at")


app = FastAPI(
    title="Pamoja API",
    description="Kenya's platonic travel companionship platform — strictly platonic, purely social.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(billing.router)
app.include_router(companions.router)
app.include_router(bookings.router)
app.include_router(messaging.router)
app.include_router(safety.router)
app.include_router(favorites.router)
app.include_router(notifications.router)
app.include_router(admin.router)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok", "app": "Pamoja API"}