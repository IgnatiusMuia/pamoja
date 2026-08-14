from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Booking, CompanionProfile, User
from ..routers.companions import is_available_on
from ..schemas import BookingCreateIn, BookingOut, ReviewCreateIn, ReviewOut
from ..security import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

TIME_RE = "^([01]\\d|2[0-3]):[0-5]\\d$"


def _parse_time(t: str) -> int:
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def _booking_out(b: Booking) -> BookingOut:
    return BookingOut(
        id=b.id,
        activity=b.activity,
        booking_date=b.booking_date,
        start_time=b.start_time,
        hours=b.hours,
        rate_kes=b.rate_kes,
        total_kes=b.total_kes,
        commission_kes=b.commission_kes,
        payout_kes=b.payout_kes,
        status=b.status,
        notes=b.notes,
        created_at=b.created_at,
        traveler=b.traveler,
        companion=b.companion,
    )


def _validate_slot(db: Session, cp: CompanionProfile, booking_date: date,
                   start_time: str | None, hours: float) -> None:
    import re

    if start_time and not re.match(TIME_RE, start_time):
        raise HTTPException(status_code=400, detail="start_time must be HH:MM")
    if not start_time:
        return

    start = _parse_time(start_time)
    end = start + int(hours * 60)

    window = (cp.availability or {}).get(booking_date.strftime("%a").lower())
    if window:
        try:
            w_start_s, w_end_s = window.split("-")
            w_start, w_end = _parse_time(w_start_s.strip()), _parse_time(w_end_s.strip())
        except Exception:
            w_start, w_end = None, None
        if w_start is not None and (start < w_start or end > w_end):
            raise HTTPException(
                status_code=400,
                detail=f"Companion availability is {window} — pick a start time within this window",
            )

    overlap = (
        db.query(Booking)
        .filter(
            Booking.companion_id == cp.user_id,
            Booking.booking_date == booking_date,
            Booking.status.in_(["pending", "accepted"]),
        )
        .all()
    )
    for other in overlap:
        if not other.start_time:
            continue
        o_start = _parse_time(other.start_time)
        o_end = o_start + int(other.hours * 60)
        if start < o_end and o_start < end:
            raise HTTPException(
                status_code=400,
                detail=f"Companion already has a booking at {other.start_time} on this date",
            )


@router.post("", response_model=BookingOut)
def create_booking(body: BookingCreateIn, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    if user.role != "traveler":
        raise HTTPException(status_code=403, detail="Only travelers can create bookings")

    companion = db.get(User, body.companion_id)
    cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == body.companion_id).first()
    if not companion or not cp or not companion.is_approved or companion.status != "active":
        raise HTTPException(status_code=400, detail="Companion not available")
    if body.booking_date < date.today():
        raise HTTPException(status_code=400, detail="Booking date cannot be in the past")
    if not is_available_on(cp.availability, body.booking_date):
        raise HTTPException(status_code=400, detail="Companion is not available on this date")
    _validate_slot(db, cp, body.booking_date, body.start_time, body.hours)

    total = int(cp.hourly_rate_kes * body.hours)
    commission = int(total * settings.COMMISSION_RATE)
    booking = Booking(
        traveler_id=user.id,
        companion_id=body.companion_id,
        activity=body.activity,
        booking_date=body.booking_date,
        start_time=body.start_time,
        hours=body.hours,
        rate_kes=cp.hourly_rate_kes,
        total_kes=total,
        commission_kes=commission,
        payout_kes=total - commission,
        notes=body.notes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _booking_out(booking)


@router.get("", response_model=list[BookingOut])
def my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Booking)
    if user.role == "traveler":
        q = q.filter(Booking.traveler_id == user.id)
    else:
        q = q.filter(Booking.companion_id == user.id)
    bookings = q.order_by(Booking.created_at.desc()).all()
    return [_booking_out(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    b = db.get(Booking, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.id not in (b.traveler_id, b.companion_id) and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not your booking")
    return _booking_out(b)


def _participant_booking(booking_id: int, user: User, db: Session,
                         roles: tuple[str, ...], statuses: tuple[str, ...]) -> Booking:
    b = db.get(Booking, booking_id)
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if user.role not in roles and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    if b.status not in statuses:
        raise HTTPException(status_code=400, detail=f"Cannot update booking in status '{b.status}'")
    return b


@router.post("/{booking_id}/accept", response_model=BookingOut)
def accept_booking(booking_id: int, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    b = _participant_booking(booking_id, user, db, ("companion",), ("pending",))
    b.status = "accepted"
    db.commit()
    return _booking_out(b)


@router.post("/{booking_id}/decline", response_model=BookingOut)
def decline_booking(booking_id: int, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    b = _participant_booking(booking_id, user, db, ("companion",), ("pending",))
    b.status = "declined"
    db.commit()
    return _booking_out(b)


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    b = _participant_booking(booking_id, user, db, ("traveler",), ("pending", "accepted"))
    b.status = "cancelled"
    db.commit()
    return _booking_out(b)


@router.post("/{booking_id}/complete", response_model=BookingOut)
def complete_booking(booking_id: int, user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    b = _participant_booking(booking_id, user, db, ("traveler", "companion"), ("accepted",))
    b.status = "completed"
    db.commit()
    return _booking_out(b)


@router.post("/reviews", response_model=ReviewOut)
def create_review(body: ReviewCreateIn, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    b = db.get(Booking, body.booking_id)
    if not b or user.id not in (b.traveler_id, b.companion_id):
        raise HTTPException(status_code=403, detail="Only booking participants can review")
    if b.status != "completed":
        raise HTTPException(status_code=400, detail="Bookings can only be reviewed after completion")
    return _create_review_logic(db, body, user, b)


def _create_review_logic(db, body, user, b):
    from sqlalchemy import select
    from ..models import Review
    existing = db.execute(
        select(Review).where(Review.booking_id == b.id, Review.reviewer_id == user.id)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this booking")

    reviewee_id = b.companion_id if user.id == b.traveler_id else b.traveler_id
    review = Review(
        booking_id=b.id,
        reviewer_id=user.id,
        reviewee_id=reviewee_id,
        rating=body.rating,
        comment=body.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    if reviewee_id == b.companion_id:
        cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == reviewee_id).first()
        if cp:
            reviews = db.query(Review).filter(Review.reviewee_id == reviewee_id).all()
            cp.rating_count = len(reviews)
            cp.rating_avg = round(sum(r.rating for r in reviews) / len(reviews), 1)
            db.commit()

    return ReviewOut(
        id=review.id, booking_id=review.booking_id, reviewer_id=review.reviewer_id,
        reviewee_id=review.reviewee_id, rating=review.rating, comment=review.comment,
        created_at=review.created_at,
    )