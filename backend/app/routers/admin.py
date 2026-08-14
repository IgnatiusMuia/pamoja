from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (Booking, CompanionProfile, Conversation, Message, Report,
                      Review, User)
from ..schemas import AdminStatsOut
from ..security import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


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
    return [
        {
            "id": u.id, "name": u.name, "email": u.email, "city": u.city,
            "is_approved": u.is_approved, "status": u.status,
            "created_at": u.created_at.isoformat(),
            "rate": (
                db.query(CompanionProfile.hourly_rate_kes)
                .filter(CompanionProfile.user_id == u.id).scalar()
            ),
        }
        for u in users
    ]


@router.post("/companions/{user_id}/approve")
def approve_companion(user_id: int, db: Session = Depends(get_db),
                      _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user or user.role != "companion":
        raise HTTPException(status_code=404, detail="Companion not found")
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
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "suspended"
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
    revenue = {
        "bookings": len(paid),
        "total_kes": sum(b.total_kes for b in paid),
        "commission_kes": sum(b.commission_kes for b in paid),
        "payouts_kes": sum(b.payout_kes for b in paid),
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
        "companions_by_city": companions_by_city,
        "avg_rating": round(float(rating or 0), 2),
    }