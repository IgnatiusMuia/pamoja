from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, CompanionProfile, Report, User
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