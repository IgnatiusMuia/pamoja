from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (Booking, CompanionProfile, Conversation, Message, Payment,
                      Report, Review, User)
from ..schemas import AdminStatsOut
from ..security import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/payments")
def list_payments(status: str = "all", method: str = "all", db: Session = Depends(get_db),
                  _: User = Depends(require_admin)):
    q = db.query(Payment)
    if status != "all":
        q = q.filter(Payment.status == status)
    if method != "all":
        q = q.filter(Payment.method == method)
    rows = q.order_by(Payment.created_at.desc()).limit(200).all()
    names = {u.id: u.name for u in db.query(User).filter(User.id.in_({p.user_id for p in rows})).all()}
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "user_name": names.get(p.user_id, "—"),
            "amount_kes": p.amount_kes,
            "method": p.method,
            "status": p.status,
            "reference": p.reference,
            "created_at": p.created_at.isoformat(),
        }
        for p in rows
    ]


@router.post("/payments/{payment_id}/settle")
def settle_payment(payment_id: int, db: Session = Depends(get_db),
                   _: User = Depends(require_admin)):
    p = db.get(Payment, payment_id)
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    if p.method != "commission":
        raise HTTPException(status_code=400, detail="Only commissions can be settled here")
    if p.status != "due":
        raise HTTPException(status_code=400, detail=f"Payment is already '{p.status}'")
    p.status = "paid"
    db.commit()
    return {"ok": True, "id": p.id, "status": p.status}


@router.get("/stats", response_model=AdminStatsOut)
def stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return AdminStatsOut(
        travelers=db.query(User).filter(User.role == "traveler").count(),
        companions=db.query(User).filter(User.role == "companion").count(),
        pending_approvals=db.query(User).filter(
            User.role == "companion", User.is_approved.is_(False), User.status == "active"
        ).count(),
        open_reports=db.query(Report).filter(Report.status == "open").count(),
        bookings=db.query(Booking).count(),
    )


@router.get("/bookings")
def list_all_bookings(status: str = "all", db: Session = Depends(get_db),
                      _: User = Depends(require_admin)):
    q = db.query(Booking)
    if status != "all":
        q = q.filter(Booking.status == status)
    rows = q.order_by(Booking.created_at.desc()).limit(200).all()
    return [
        {
            "id": b.id,
            "activity": b.activity,
            "booking_date": b.booking_date.isoformat(),
            "start_time": b.start_time,
            "hours": b.hours,
            "total_kes": b.total_kes,
            "commission_kes": b.commission_kes,
            "status": b.status,
            "created_at": b.created_at.isoformat(),
            "traveler": {"id": b.traveler_id, "name": b.traveler.name},
            "companion": {"id": b.companion_id, "name": b.companion.name},
        }
        for b in rows
    ]


@router.get("/companions")
def list_companions(status: str = "all", db: Session = Depends(get_db),
                    _: User = Depends(require_admin)):
    q = db.query(User).filter(User.role == "companion")
    if status == "pending":
        q = q.filter(User.is_approved.is_(False), User.status == "active")
    elif status == "approved":
        q = q.filter(User.is_approved.is_(True), User.status == "active")
    elif status == "suspended":
        q = q.filter(User.status == "suspended")
    elif status == "rejected":
        q = q.filter(User.status == "rejected")
    users = q.order_by(User.created_at.desc()).all()
    rows = []
    for u in users:
        cp = db.query(CompanionProfile).filter(CompanionProfile.user_id == u.id).first()
        rows.append(
            {
                "id": u.id, "name": u.name, "email": u.email, "city": u.city,
                "is_approved": u.is_approved, "status": u.status,
                "created_at": u.created_at.isoformat(),
                "rate": cp.hourly_rate_kes if cp else None,
                "verified_id": bool(cp and cp.verified_id),
                "id_document_url": cp.id_document_url if cp else None,
                "id_verified_at": cp.id_verified_at.isoformat() if cp and cp.id_verified_at else None,
            }
        )
    return rows


@router.post("/companions/{user_id}/verify-id")
def verify_companion_id(user_id: int, db: Session = Depends(get_db),
                        _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    cp = user.companion_profile if user else None
    if not user or user.role != "companion" or not cp:
        raise HTTPException(status_code=404, detail="Companion not found")
    if not cp.id_document_url:
        raise HTTPException(status_code=400, detail="Companion has not submitted an ID document yet")
    cp.verified_id = True
    cp.id_verified_at = datetime.utcnow()
    db.commit()
    return {"ok": True, "verified": True}


@router.post("/companions/{user_id}/approve")
def approve_companion(user_id: int, db: Session = Depends(get_db),
                      _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user or user.role != "companion":
        raise HTTPException(status_code=404, detail="Companion not found")
    cp = user.companion_profile
    if not cp or not cp.verified_id:
        raise HTTPException(
            status_code=400,
            detail="ID verification is mandatory before approval — verify the companion's ID document first",
        )
    user.is_approved = True
    user.status = "active"
    db.commit()
    return {"ok": True, "approved": True}


@router.post("/companions/{user_id}/reject")
def reject_companion(user_id: int, db: Session = Depends(get_db),
                     _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user or user.role != "companion":
        raise HTTPException(status_code=404, detail="Companion not found")
    user.is_approved = False
    user.status = "rejected"
    db.commit()
    return {"ok": True, "rejected": True}


@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: int, db: Session = Depends(get_db),
                 _: User = Depends(require_admin)):
    from datetime import date, datetime, timedelta

    from ..models import Booking, Notification

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "suspended"

    # Automatically cancel the suspended member's open bookings and tell the
    # other side why.
    tomorrow = date.today() + timedelta(days=1)
    open_bookings = db.query(Booking).filter(
        Booking.status.in_(["pending", "accepted"]),
        or_(Booking.traveler_id == user_id, Booking.companion_id == user_id),
    ).all()
    for b in open_bookings:
        b.status = "cancelled"
        other_id = b.companion_id if b.traveler_id == user_id else b.traveler_id
        if other_id != user_id:
            db.add(
                Notification(
                    user_id=other_id,
                    type="booking",
                    title="A booking was cancelled",
                    body=(
                        f"Your booking #{b.id} ({b.activity}) was cancelled because "
                        f"{user.name}'s account was suspended by our team. "
                        "You have not been charged."
                    ),
                    link=f"/dashboard/bookings/{b.id}",
                )
            )
    db.commit()
    return {"ok": True, "suspended": True}


@router.post("/users/{user_id}/unsuspend")
def unsuspend_user(user_id: int, db: Session = Depends(get_db),
                   _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "active"
    if user.role == "companion" and not user.is_approved:
        user.is_approved = True
    db.commit()
    return {"ok": True, "unsuspended": True}


@router.get("/reports")
def list_reports(status: str = "open", db: Session = Depends(get_db),
                 _: User = Depends(require_admin)):
    q = db.query(Report).filter(Report.status == status)
    reports = q.order_by(Report.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "reporter_id": r.reporter_id,
            "reporter_name": db.get(User, r.reporter_id).name,
            "reported_id": r.reported_id,
            "reported_name": db.get(User, r.reported_id).name,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.get("/flagged-messages")
def flagged_messages(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = (
        db.query(Message, Conversation, User)
        .join(Conversation, Message.conversation_id == Conversation.id)
        .join(User, Message.sender_id == User.id)
        .filter(Message.flagged.is_(True))
        .order_by(Message.created_at.desc())
        .all()
    )
    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": u.name,
            "body": m.body,
            "conversation_partner": (
                c.user_b.name if c.user_a_id == m.sender_id else c.user_a.name
            ),
            "created_at": m.created_at.isoformat(),
        }
        for m, c, u in rows
    ]


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(get_db),
                   _: User = Depends(require_admin)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "resolved"
    db.commit()
    return {"ok": True}


@router.post("/reports/{report_id}/dismiss")
def dismiss_report(report_id: int, db: Session = Depends(get_db),
                   _: User = Depends(require_admin)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "dismissed"
    db.commit()
    return {"ok": True}


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    STATUSES = ["pending", "accepted", "declined", "cancelled", "completed"]
    bookings_by_status = {
        s: db.query(Booking).filter(Booking.status == s).count() for s in STATUSES
    }

    paid = db.query(Booking).filter(Booking.status == "completed").all()
    listing_fees = (
        db.query(func.sum(Payment.amount_kes), func.count(Payment.id))
        .filter(Payment.status == "paid")
        .first()
    )
    due_commissions = (
        db.query(func.sum(Payment.amount_kes))
        .filter(Payment.method == "commission", Payment.status == "due")
        .scalar()
    )
    revenue = {
        "bookings": len(paid),
        "total_kes": sum(b.total_kes for b in paid),
        "commission_kes": sum(b.commission_kes for b in paid),
        "payouts_kes": sum(b.payout_kes for b in paid),
        "listing_fees_kes": int(listing_fees[0] or 0),
        "listing_payments": int(listing_fees[1] or 0),
        "commission_due_kes": int(due_commissions or 0),
    }

    top_rows = (
        db.query(User.name, func.count(Booking.id), func.sum(Booking.commission_kes))
        .join(Booking, Booking.companion_id == User.id)
        .filter(Booking.status == "completed")
        .group_by(User.id)
        .order_by(func.sum(Booking.commission_kes).desc())
        .limit(5)
        .all()
    )
    top_companions = [
        {"name": name, "bookings": int(cnt), "commission_kes": int(comm or 0)}
        for name, cnt, comm in top_rows
    ]

    since = date.today() - timedelta(days=13)
    signup_rows = (
        db.query(func.date(User.created_at), func.count(User.id))
        .filter(func.date(User.created_at) >= since)
        .group_by(func.date(User.created_at))
        .all()
    )
    by_day = {str(d): c for d, c in signup_rows}
    signups_by_day = [
        {"date": (since + timedelta(days=i)).isoformat(),
         "count": by_day.get((since + timedelta(days=i)).isoformat(), 0)}
        for i in range(14)
    ]

    booking_dates = (
        db.query(func.date(Booking.created_at), func.count(Booking.id))
        .filter(func.date(Booking.created_at) >= since)
        .group_by(func.date(Booking.created_at))
        .all()
    )
    bday = {str(d): c for d, c in booking_dates}
    bookings_by_day = [
        {"date": (since + timedelta(days=i)).isoformat(),
         "count": bday.get((since + timedelta(days=i)).isoformat(), 0)}
        for i in range(14)
    ]

    city_rows = (
        db.query(User.city, func.count(User.id))
        .filter(User.role == "companion", User.city.isnot(None))
        .group_by(User.city)
        .order_by(func.count(User.id).desc())
        .all()
    )
    companions_by_city = [{"city": c or "—", "count": n} for c, n in city_rows]

    rating = db.query(func.avg(CompanionProfile.rating_avg)).scalar()
    return {
        "bookings_by_status": bookings_by_status,
        "revenue": revenue,
        "top_companions": top_companions,
        "signups_by_day": signups_by_day,
        "bookings_by_day": bookings_by_day,
        "companions_by_city": companions_by_city,
        "avg_rating": round(float(rating or 0), 2),
    }